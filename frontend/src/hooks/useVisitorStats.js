import { useEffect, useState } from "react";

const VISITORS_URL = `${(process.env.REACT_APP_API_URL || "").replace(/\/+$/, "")}/visitors/`;
const VISITOR_KEY = "ag_visitor_id";
const SESSION_KEY = "ag_visit_recorded";

const randomId = () =>
  window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

// Random ID saved in this browser, so the backend can tell new visitors
// from returning ones. Falls back to a one-off ID if storage is blocked.
function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return randomId();
  }
}

// One request per page load, shared by every component using the hook.
// POST counts the visit; it's sent once per browser session so refreshing
// doesn't inflate the count. Later page loads in the same session just GET
// the totals.
let statsPromise = null;

function loadStats() {
  if (statsPromise) return statsPromise;

  let alreadyCounted = false;
  try {
    alreadyCounted = sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {}

  const request = alreadyCounted
    ? fetch(VISITORS_URL)
    : fetch(VISITORS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor_id: getVisitorId() }),
      });

  statsPromise = request
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
    .then((data) => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      return { uniqueVisitors: data.unique_visitors, totalVisits: data.total_visits };
    })
    .catch(() => {
      statsPromise = null;
      return null;
    });

  return statsPromise;
}

/** Returns { uniqueVisitors, totalVisits } once loaded, otherwise null. */
function useVisitorStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    loadStats().then((result) => {
      if (active) setStats(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return stats;
}

export default useVisitorStats;
