// Client for the Custom LLM Node (https://llm.ahmadgill.com/docs), called
// directly from the browser; the server allows all origins.
const BASE_URL = (process.env.REACT_APP_LLM_API_URL || "https://llm.ahmadgill.com").replace(/\/+$/, "");

// Used when the visitor doesn't enter their own key. Shared on purpose so
// anyone can try the model; it is never shown on the page.
const TEST_API_KEY = process.env.REACT_APP_LLM_TEST_API_KEY || "";

export const DEFAULT_MODEL = "qwen3.6-35b-a3b";

// The first request after a server restart loads the model (~1 minute) and
// the server answers one request at a time, so allow plenty of time.
const TIMEOUT_MS = 5 * 60 * 1000;

const FRIENDLY_MESSAGES = {
  401: "This API key is invalid or has expired.",
  404: "That model isn't available on the server.",
  422: "The request is missing a field or has a wrong value.",
  429: "This API key has used all its requests.",
  503: "The model isn't available on the server right now. Please try again later.",
};

// `detail` is a string, or a list of field errors for 422.
function describeDetail(detail, status) {
  if (Array.isArray(detail)) {
    return detail
      .map((d) => `${(d.loc || []).filter((part) => part !== "body").join(".")}: ${d.msg}`)
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  return `Request failed (${status})`;
}

// `message` is meant for visitors; `detail` is the server's own wording.
export class LlmApiError extends Error {
  constructor(status, detail, { friendly = true } = {}) {
    const text = describeDetail(detail, status);
    super((friendly && FRIENDLY_MESSAGES[status]) || text);
    this.status = status;
    this.detail = text;
  }
}

// Runs fetch with the long timeout, still honouring the caller's own signal.
async function send(path, options = {}, errorOptions) {
  const controller = new AbortController();
  const { signal } = options;
  const forwardAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", forwardAbort);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  const cleanup = () => {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  };

  const fail = (err) => {
    cleanup();
    if (timedOut) throw new LlmApiError(0, "The LLM server took too long to answer. Please try again.");
    if (err.name === "AbortError") throw err;
    throw new LlmApiError(0, "Could not reach the LLM server. It may be offline right now.");
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, signal: controller.signal });
  } catch (err) {
    fail(err);
  }

  if (!response.ok) {
    cleanup();
    const data = await response.json().catch(() => null);
    throw new LlmApiError(response.status, data?.detail, errorOptions);
  }

  return { response, cleanup, fail };
}

async function sendJson(path, options, errorOptions) {
  const { response, cleanup, fail } = await send(path, options, errorOptions);
  try {
    return await response.json();
  } catch (err) {
    return fail(err);
  } finally {
    cleanup();
  }
}

const generateBody = (prompt, apiKey, model, stream) =>
  JSON.stringify({ prompt, "api-key": apiKey || TEST_API_KEY, model_name: model || DEFAULT_MODEL, stream });

// --- User endpoints ---

export async function listModels() {
  const data = await sendJson("/models");
  return data?.models || [];
}

// Calls onChunk(text) for each piece as it arrives and resolves with the full
// answer. With no apiKey the public test key is used.
export async function generateStream(prompt, { apiKey, model, onChunk, signal } = {}) {
  const { response, cleanup, fail } = await send("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: generateBody(prompt, apiKey, model, true),
    signal,
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return answer;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop(); // keep an unfinished event for the next read
      for (const event of events) {
        const data = event.replace(/^data: ?/, "").trim();
        if (!data) continue;
        if (data === "[DONE]") return answer;
        const { text } = JSON.parse(data);
        if (text) {
          answer += text;
          onChunk?.(text);
        }
      }
    }
  } catch (err) {
    return fail(err);
  } finally {
    cleanup();
  }
}

export async function generate(prompt, { apiKey, model, signal } = {}) {
  const data = await sendJson("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: generateBody(prompt, apiKey, model, false),
    signal,
  });
  return data?.output || "";
}

// --- Admin endpoints ---
// `admin` is { token, password }, typed in by the admin on the admin page and
// never part of the site's code. The password goes in the body for POST and
// PATCH, and in the X-Password header for GET and DELETE.

const ADMIN_ERRORS = { friendly: false };

function adminSend(path, { token, password }, method, body) {
  const headers = { Authorization: `Bearer ${token}` };
  const options = { method, headers };
  if (body) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify({ ...body, password });
  } else {
    headers["X-Password"] = password;
  }
  return sendJson(path, options, ADMIN_ERRORS);
}

export const listKeys = (admin) => adminSend("/keys", admin, "GET");

export const createKey = (admin, { daysValid = 30, requestLimit = 100 } = {}) =>
  adminSend("/keys", admin, "POST", { days_valid: daysValid, request_limit: requestLimit });

// requestLimit null means unlimited
export const updateKeyLimit = (admin, id, requestLimit) =>
  adminSend(`/keys/${id}/limit`, admin, "PATCH", { request_limit: requestLimit });

export const deleteKey = (admin, id) => adminSend(`/keys/${id}`, admin, "DELETE");
