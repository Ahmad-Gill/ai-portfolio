import { useCallback, useEffect, useState } from "react";
import { getVisitorId } from "./useVisitorStats";

const REVIEWS_URL = `${(process.env.REACT_APP_API_URL || "").replace(/\/+$/, "")}/reviews/`;
const ADMIN_KEY = "ag_reviews_admin";

const EMPTY = { overall: null, apps: {}, reviews: [] };

async function request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || res.statusText || "Request failed.");
  }
  return data;
}

const toState = (data) => ({ overall: data.overall, apps: data.apps, reviews: data.reviews });

// The admin password is kept for this browser tab only, so a closed tab logs out.
function readAdminPassword() {
  try {
    return sessionStorage.getItem(ADMIN_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Reviews for every app. The visitor ID (same one the visitor counter uses)
 * marks which reviews this browser wrote, so it can edit or delete them.
 */
function useAppReviews() {
  const [state, setState] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminPassword, setAdminPassword] = useState(readAdminPassword);

  const visitorId = getVisitorId();

  const refresh = useCallback(async () => {
    try {
      const data = await request(`${REVIEWS_URL}?visitor_id=${encodeURIComponent(visitorId)}`);
      setState(toState(data));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitReview = useCallback(
    async ({ appId, name, rating, comment }) => {
      const data = await request(REVIEWS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: appId, visitor_id: visitorId, name, rating, comment }),
      });
      setState(toState(data));
    },
    [visitorId]
  );

  const deleteReview = useCallback(
    async (reviewId) => {
      const data = await request(
        `${REVIEWS_URL}${reviewId}/?visitor_id=${encodeURIComponent(visitorId)}`,
        {
          method: "DELETE",
          headers: adminPassword ? { "X-Reviews-Password": adminPassword } : {},
        }
      );
      setState(toState(data));
    },
    [visitorId, adminPassword]
  );

  const loginAdmin = useCallback(async (password) => {
    await request(`${REVIEWS_URL}admin/check/`, {
      method: "POST",
      headers: { "X-Reviews-Password": password },
    });
    try {
      sessionStorage.setItem(ADMIN_KEY, password);
    } catch {}
    setAdminPassword(password);
  }, []);

  const logoutAdmin = useCallback(() => {
    try {
      sessionStorage.removeItem(ADMIN_KEY);
    } catch {}
    setAdminPassword("");
  }, []);

  return {
    ...state,
    loading,
    error,
    isAdmin: Boolean(adminPassword),
    submitReview,
    deleteReview,
    loginAdmin,
    logoutAdmin,
  };
}

export default useAppReviews;
