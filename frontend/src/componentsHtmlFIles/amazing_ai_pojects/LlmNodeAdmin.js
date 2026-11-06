import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../componentCssFiles/aimythbuster.css";
import "../../componentCssFiles/storywriter.css";
import "../../componentCssFiles/llmnode.css";
import { createKey, deleteKey, listKeys, updateKeyLimit } from "../../utils/llmNodeApi";

const ADMIN_KEY = "ag_llm_admin";

// The admin credentials are kept for this browser tab only, so a closed tab
// logs out. They are never part of the site's code.
function readCredentials() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(ADMIN_KEY) || "null");
    return saved?.token && saved?.password ? saved : null;
  } catch {
    return null;
  }
}

function saveCredentials(credentials) {
  try {
    if (credentials) sessionStorage.setItem(ADMIN_KEY, JSON.stringify(credentials));
    else sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    // Storage can be blocked; the login still works until the page reloads
  }
}

const formatDate = (value) => {
  if (!value) return " ";
  // created_at is UTC without a zone ("YYYY-MM-DD HH:MM:SS")
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const maskKey = (key) => (key.length > 12 ? `${key.slice(0, 7)}…${key.slice(-4)}` : key);

function LoginForm({ onLogin }) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !password) return;
    setChecking(true);
    setError(null);
    try {
      await onLogin({ token: token.trim(), password });
    } catch (err) {
      // 401 says whether the token or the password is wrong
      setError(err.status === 401 ? `${err.detail}.` : err.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <form className="llm-section llm-login" onSubmit={handleSubmit}>
      <h2>Admin sign in</h2>
      <p className="llm-muted">Only the admin can create and manage API keys.</p>
      <input
        className="llm-input"
        type="password"
        placeholder="Bearer token"
        autoComplete="off"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        aria-label="Bearer token"
      />
      <input
        className="llm-input"
        type="password"
        placeholder="Admin password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Admin password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" className="btn teal" disabled={checking || !token || !password}>
        {checking ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}

function CreateKeyForm({ onCreate }) {
  const [daysValid, setDaysValid] = useState(30);
  const [requestLimit, setRequestLimit] = useState(100);
  const [unlimited, setUnlimited] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setCopied(false);
    try {
      const key = await onCreate({
        daysValid: Math.max(1, Number(daysValid) || 30),
        requestLimit: unlimited ? null : Math.max(1, Number(requestLimit) || 100),
      });
      setCreated(key);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(created.api_key);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the key is still shown on screen
    }
  };

  return (
    <form className="llm-section" onSubmit={handleSubmit}>
      <h2>Create an API key</h2>
      <div className="llm-create-row">
        <label className="llm-field">
          <span>Days valid</span>
          <input
            className="llm-input"
            type="number"
            min="1"
            value={daysValid}
            onChange={(e) => setDaysValid(e.target.value)}
          />
        </label>
        <label className="llm-field">
          <span>Request limit</span>
          <input
            className="llm-input"
            type="number"
            min="1"
            value={requestLimit}
            onChange={(e) => setRequestLimit(e.target.value)}
            disabled={unlimited}
          />
        </label>
        <label className="llm-check">
          <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
          Unlimited
        </label>
        <button type="submit" className="btn teal" disabled={creating}>
          {creating ? "Creating…" : "Create key"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {created && (
        <div className="llm-new-key" role="status">
          <p>New key (id {created.id}), give this to the user:</p>
          <div className="llm-key-row">
            <code>{created.api_key}</code>
            <button type="button" className="story-action-btn" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

function KeyRow({ apiKey, onSetLimit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(apiKey.request_limit ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const expired = new Date(apiKey.expires_at) < new Date();
  const exhausted = apiKey.request_limit !== null && apiKey.request_count >= apiKey.request_limit;

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveLimit = () => run(() => onSetLimit(apiKey.id, limit === "" ? null : Math.max(0, Number(limit))));

  const handleDelete = () => {
    if (window.confirm(`Delete key ${apiKey.id}? It stops working immediately.`)) {
      run(() => onDelete(apiKey.id));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; nothing else to do
    }
  };

  return (
    <tr>
      <td>{apiKey.id}</td>
      <td>
        <button type="button" className="llm-key-copy" onClick={handleCopy} title="Copy full key">
          <code>{maskKey(apiKey.api_key)}</code>
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </td>
      <td>
        {editing ? (
          <span className="llm-limit-edit">
            {apiKey.request_count} /{" "}
            <input
              className="llm-input"
              type="number"
              min="0"
              value={limit}
              placeholder="∞"
              onChange={(e) => setLimit(e.target.value)}
              aria-label="New request limit (empty for unlimited)"
              autoFocus
            />
          </span>
        ) : (
          <>
            {apiKey.request_count} / {apiKey.request_limit ?? "∞"}
            {exhausted && <span className="llm-badge is-danger">Limit reached</span>}
          </>
        )}
      </td>
      <td>
        {formatDate(apiKey.expires_at)}
        {expired && <span className="llm-badge is-danger">Expired</span>}
      </td>
      <td>{formatDate(apiKey.created_at)}</td>
      <td>
        <div className="llm-row-actions">
          {editing ? (
            <>
              <button type="button" className="story-action-btn" onClick={saveLimit} disabled={busy}>
                Save
              </button>
              <button type="button" className="story-action-btn" onClick={() => setEditing(false)} disabled={busy}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" className="story-action-btn" onClick={() => setEditing(true)} disabled={busy}>
                Edit limit
              </button>
              <button type="button" className="story-action-btn llm-danger" onClick={handleDelete} disabled={busy}>
                Delete
              </button>
            </>
          )}
        </div>
        {error && <p className="error">{error}</p>}
      </td>
    </tr>
  );
}

function LlmNodeAdmin() {
  const [credentials, setCredentials] = useState(readCredentials);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadKeys = useCallback(async (creds) => {
    const list = await listKeys(creds);
    setKeys(Array.isArray(list) ? list : []);
  }, []);

  const refresh = useCallback(async () => {
    if (!credentials) return;
    setLoading(true);
    setError(null);
    try {
      await loadKeys(credentials);
    } catch (err) {
      if (err.status === 401 || err.status === 422) {
        // Saved credentials no longer work
        saveCredentials(null);
        setCredentials(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [credentials, loadKeys]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Signing in is checked by listing the keys
  const handleLogin = async (creds) => {
    await loadKeys(creds);
    saveCredentials(creds);
    setCredentials(creds);
  };

  const handleLogout = () => {
    saveCredentials(null);
    setCredentials(null);
    setKeys([]);
  };

  const handleCreate = async (options) => {
    const key = await createKey(credentials, options);
    await refresh();
    return key;
  };

  const handleSetLimit = async (id, requestLimit) => {
    await updateKeyLimit(credentials, id, requestLimit);
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, request_limit: requestLimit } : k)));
  };

  const handleDelete = async (id) => {
    await deleteKey(credentials, id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div className="project-details-page mythbuster-page story-page llm-page">
      <div className="mythbuster-card llm-admin-card">
        <div className="mythbuster-header">
          <span className="mythbuster-header-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8" cy="15" r="4" />
              <path d="M10.8 12.2L20 3M16 7l3 3M14 9l2 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h1>LLM Node Admin</h1>
            <p className="mythbuster-subtitle">Create API keys, watch their usage, change limits and revoke them.</p>
          </div>
        </div>

        <div className="mythbuster-body">
          {!credentials ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <>
              <div className="llm-admin-bar">
                <span className="llm-badge">Signed in as admin</span>
                <div className="llm-row-actions">
                  <button type="button" className="story-action-btn" onClick={refresh} disabled={loading}>
                    {loading ? "Refreshing…" : "Refresh"}
                  </button>
                  <button type="button" className="story-action-btn" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              </div>

              <CreateKeyForm onCreate={handleCreate} />

              <div className="llm-section">
                <h2>API keys ({keys.length})</h2>
                {error && <p className="error">{error}</p>}
                {keys.length === 0 && !loading ? (
                  <p className="llm-muted">No keys yet.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="result-table llm-keys-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Key</th>
                          <th>Used / limit</th>
                          <th>Expires</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keys.map((k) => (
                          <KeyRow key={k.id} apiKey={k} onSetLimit={handleSetLimit} onDelete={handleDelete} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          <p className="llm-admin-link">
            <Link to="/amazing_ai_projects/llm-node">Back to the LLM Node</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LlmNodeAdmin;
