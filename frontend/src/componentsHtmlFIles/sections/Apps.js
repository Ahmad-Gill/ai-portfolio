import React, { useState } from "react";
import useReveal from "../../hooks/useReveal";
import { apps, platforms } from "../../data/apps";
import "../../componentCssFiles/button.css";
import "../../componentCssFiles/apps.css";

const PLATFORM_ICONS = {
  macos: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.38-.92-2.4-3.66ZM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28Z" />
    </svg>
  ),
  windows: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.1 10.4 4v7.1H3V5.1Zm0 13.8 7.4 1.1v-7.1H3v6Zm8.3 1.2L21 21.5v-8.6h-9.7v7.2Zm0-16.2v7.2H21V2.5l-9.7 1.4Z" />
    </svg>
  ),
  ios: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" strokeLinecap="round" />
    </svg>
  ),
};

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const appPlatforms = (app) => [...new Set(app.downloads.map((d) => d.platform))];

function Apps() {
  const revealRef = useReveal();
  const [filter, setFilter] = useState("all");

  // Only offer tabs for platforms that actually have a download.
  const availablePlatforms = Object.keys(platforms).filter((key) =>
    apps.some((app) => appPlatforms(app).includes(key))
  );
  const visibleApps = filter === "all" ? apps : apps.filter((app) => appPlatforms(app).includes(filter));

  return (
    <section className="section apps-section" id="apps" ref={revealRef}>
      <div className="section-head reveal">
        <span className="section-eyebrow">Apps</span>
        <h2 className="section-title">Desktop &amp; Mobile Apps</h2>
        <p className="section-intro">
          Native apps I&rsquo;ve built for macOS, Windows and iOS. Free to download and try.
        </p>
      </div>

      {availablePlatforms.length > 1 && (
        <div className="apps-filter reveal" role="tablist" aria-label="Filter apps by platform">
          {["all", ...availablePlatforms].map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`apps-filter-tab ${filter === key ? "is-active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {key === "all" ? "All" : platforms[key].label}
            </button>
          ))}
        </div>
      )}

      <div className="apps-grid">
        {visibleApps.map((app, i) => {
          const downloads =
            filter === "all" ? app.downloads : app.downloads.filter((d) => d.platform === filter);

          return (
            <article
              key={app.name}
              className="app-card reveal"
              style={{ transitionDelay: `${(i % 6) * 70}ms` }}
            >
              <div className="app-card-head">
                <div className="app-card-icon">
                  {app.icon ? <img src={app.icon} alt="" /> : PLATFORM_ICONS[downloads[0].platform]}
                </div>
                <div>
                  <h3>{app.name}</h3>
                  <span className="app-card-platform">
                    {appPlatforms(app).map((key) => platforms[key].label).join(" · ")}
                    {app.version && ` · v${app.version}`}
                  </span>
                </div>
              </div>

              <p className="app-card-description">{app.description}</p>

              <ul className="app-card-downloads">
                {downloads.map((download) => (
                  <li key={download.url}>
                    <a
                      className="btn ghost app-card-download"
                      href={download.url}
                      rel="noopener noreferrer"
                    >
                      <span className="app-card-download-icon">{PLATFORM_ICONS[download.platform]}</span>
                      <span className="app-card-download-text">
                        <strong>{download.label}</strong>
                        <small>
                          {[download.note, download.size].filter(Boolean).join(" · ")}
                        </small>
                      </span>
                      <DownloadIcon />
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Apps;
