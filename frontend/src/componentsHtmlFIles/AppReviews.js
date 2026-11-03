import React, { useEffect, useMemo, useRef, useState } from "react";
import "../componentCssFiles/appReviews.css";

const MAX_NAME = 40;
const MAX_COMMENT = 1000;
const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.8 14.8 8.6l6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.6-4.4 6.3-.8L12 2.8Z" />
    </svg>
  );
}

/** Read-only stars; fractional ratings fill part of a star. */
export function Stars({ value = 0, size = 16 }) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = Array.from({ length: 5 }, (_, i) => <StarIcon key={i} />);

  return (
    <span
      className="rv-stars"
      style={{ "--star-size": `${size}px` }}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <span className="rv-stars-empty">{row}</span>
      <span className="rv-stars-fill" style={{ width: `${percent}%` }}>
        {row}
      </span>
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="rv-picker" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className={`rv-picker-star ${star <= shown ? "is-on" : ""}`}
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange(star)}
        >
          <StarIcon />
        </button>
      ))}
      <span className="rv-picker-label">{shown ? RATING_LABELS[shown] : "Tap to rate"}</span>
    </div>
  );
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

function ReviewForm({ appId, existing, onSubmit, onCancel }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [name, setName] = useState(existing?.name || "");
  const [comment, setComment] = useState(existing?.comment || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  // "Edit" is clicked in the list below, so bring the form into view.
  useEffect(() => {
    if (existing) formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [existing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setError("Pick a star rating.");
    if (!name.trim()) return setError("Add your name.");
    if (!comment.trim()) return setError("Write a few words about the app.");

    setSaving(true);
    setError("");
    try {
      await onSubmit({ appId, rating, name: name.trim(), comment: comment.trim() });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="rv-form" onSubmit={handleSubmit} ref={formRef}>
      <h4 className="rv-subtitle">{existing ? "Edit your review" : "Write a review"}</h4>
      <StarPicker value={rating} onChange={setRating} />

      <input
        className="rv-input"
        type="text"
        placeholder="Your name"
        value={name}
        maxLength={MAX_NAME}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="rv-textarea-wrap">
        <textarea
          className="rv-input rv-textarea"
          placeholder="What did you like? What could be better?"
          rows={4}
          value={comment}
          maxLength={MAX_COMMENT}
          onChange={(e) => setComment(e.target.value)}
        />
        <span className="rv-counter">
          {comment.length}/{MAX_COMMENT}
        </span>
      </div>

      {error && <p className="rv-error" role="alert">{error}</p>}

      <div className="rv-form-actions">
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn teal" disabled={saving}>
          {saving ? "Saving…" : existing ? "Update review" : "Post review"}
        </button>
      </div>
    </form>
  );
}

function ReviewItem({ review, canDelete, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await onDelete(review.id);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <li className={`rv-item ${review.mine ? "is-mine" : ""}`}>
      <div className="rv-item-head">
        <span className="rv-avatar" aria-hidden="true">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <div className="rv-item-meta">
          <strong>
            {review.name}
            {review.mine && <span className="rv-badge">You</span>}
          </strong>
          <span>
            <Stars value={review.rating} size={13} />
            <time dateTime={review.created_at}>{formatDate(review.created_at)}</time>
            {review.updated_at !== review.created_at && <em>edited</em>}
          </span>
        </div>
      </div>

      <p className="rv-item-comment">{review.comment}</p>

      {(review.mine || canDelete) && (
        <div className="rv-item-actions">
          {confirming ? (
            <>
              <span className="rv-confirm-text">Delete this review and its rating?</span>
              <button type="button" className="rv-link" onClick={() => setConfirming(false)} disabled={deleting}>
                Keep
              </button>
              <button type="button" className="rv-link is-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </>
          ) : (
            <>
              {review.mine && onEdit && (
                <button type="button" className="rv-link" onClick={onEdit}>
                  Edit
                </button>
              )}
              <button type="button" className="rv-link is-danger" onClick={() => setConfirming(true)}>
                Delete
              </button>
            </>
          )}
        </div>
      )}
      {error && <p className="rv-error" role="alert">{error}</p>}
    </li>
  );
}

function AdminPanel({ isAdmin, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  if (isAdmin) {
    return (
      <div className="rv-admin is-active">
        <span>Admin mode: you can delete any review.</span>
        <button type="button" className="rv-link" onClick={onLogout}>
          Log out
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="rv-admin">
        <button type="button" className="rv-link rv-admin-toggle" onClick={() => setOpen(true)}>
          Manage reviews (owner)
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setChecking(true);
    setError("");
    try {
      await onLogin(password);
      setPassword("");
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <form className="rv-admin rv-admin-form" onSubmit={handleSubmit}>
      <input
        className="rv-input"
        type="password"
        placeholder="Admin password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      <button type="submit" className="btn ghost" disabled={checking || !password}>
        {checking ? "Checking…" : "Unlock"}
      </button>
      <button type="button" className="rv-link" onClick={() => setOpen(false)}>
        Cancel
      </button>
      {error && <p className="rv-error" role="alert">{error}</p>}
    </form>
  );
}

const SORTS = {
  newest: { label: "Newest", fn: (a, b) => b.created_at.localeCompare(a.created_at) },
  highest: { label: "Highest", fn: (a, b) => b.rating - a.rating || b.created_at.localeCompare(a.created_at) },
  lowest: { label: "Lowest", fn: (a, b) => a.rating - b.rating || b.created_at.localeCompare(a.created_at) },
};

/** Ratings summary, review form and review list for one app. */
export function ReviewsModal({ app, reviewsState, onClose }) {
  const { apps, reviews, isAdmin, submitReview, deleteReview, loginAdmin, logoutAdmin } = reviewsState;
  const [sort, setSort] = useState("newest");
  const [starFilter, setStarFilter] = useState(0);
  const [editing, setEditing] = useState(false);

  const stats = apps[app.id] || { average: 0, count: 0, distribution: {} };
  const appReviews = useMemo(() => reviews.filter((r) => r.app_id === app.id), [reviews, app.id]);
  const myReview = appReviews.find((r) => r.mine);
  const visible = useMemo(
    () =>
      appReviews
        .filter((r) => !starFilter || r.rating === starFilter)
        .sort(SORTS[sort].fn),
    [appReviews, starFilter, sort]
  );

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleSubmit = async (data) => {
    await submitReview(data);
    setEditing(false);
  };

  return (
    <div className="rv-backdrop" role="presentation" onClick={onClose}>
      <div
        className="rv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rv-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="rv-close" aria-label="Close" onClick={onClose}>
          &times;
        </button>

        <h3 className="rv-title" id="rv-title">
          {app.name} reviews
        </h3>

        <div className="rv-summary">
          <div className="rv-summary-score">
            <span className="rv-big-number">{stats.count ? stats.average.toFixed(1) : "–"}</span>
            <Stars value={stats.average} size={18} />
            <span className="rv-muted">
              {stats.count} review{stats.count === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="rv-bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const n = stats.distribution[star] || 0;
              const pct = stats.count ? (n / stats.count) * 100 : 0;
              return (
                <li key={star}>
                  <button
                    type="button"
                    className={`rv-bar-row ${starFilter === star ? "is-active" : ""}`}
                    onClick={() => setStarFilter(starFilter === star ? 0 : star)}
                    disabled={!n}
                    aria-pressed={starFilter === star}
                    title={n ? `Show ${star}-star reviews` : undefined}
                  >
                    <span className="rv-bar-label">{star}★</span>
                    <span className="rv-bar-track">
                      <span className="rv-bar-fill" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="rv-bar-count">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {myReview && !editing ? (
          <div className="rv-mine-note">
            You reviewed this app. Edit or delete your review below   deleting it also removes your rating.
          </div>
        ) : (
          <ReviewForm
            key={myReview?.id || "new"}
            appId={app.id}
            existing={editing ? myReview : null}
            onSubmit={handleSubmit}
            onCancel={editing ? () => setEditing(false) : null}
          />
        )}

        <div className="rv-list-head">
          <h4 className="rv-subtitle">
            {starFilter ? `${starFilter}-star reviews` : "All reviews"}
            {starFilter > 0 && (
              <button type="button" className="rv-link" onClick={() => setStarFilter(0)}>
                Clear filter
              </button>
            )}
          </h4>
          {appReviews.length > 1 && (
            <div className="rv-sort" role="group" aria-label="Sort reviews">
              {Object.entries(SORTS).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  className={sort === key ? "is-active" : ""}
                  aria-pressed={sort === key}
                  onClick={() => setSort(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {visible.length ? (
          <ul className="rv-list">
            {visible.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                canDelete={isAdmin}
                onDelete={deleteReview}
                onEdit={review.mine ? () => setEditing(true) : null}
              />
            ))}
          </ul>
        ) : (
          <p className="rv-empty">No reviews yet. Be the first to share what you think.</p>
        )}

        <AdminPanel isAdmin={isAdmin} onLogin={loginAdmin} onLogout={logoutAdmin} />
      </div>
    </div>
  );
}
