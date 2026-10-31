import React, { useEffect, useState } from "react";
import "../componentCssFiles/downloadNotice.css";

// Shown before an app download starts. The apps aren't distributed through the
// App Store / Microsoft Store (and aren't notarized or code-signed), so the OS
// blocks them on first launch. This explains why, shows what the warning looks
// like and walks the user through opening the app anyway.

function MacWarningPreview({ appName }) {
  return (
    <div className="dl-preview dl-preview-mac" aria-hidden="true">
      <div className="dl-mac-icon">
        <span className="dl-mac-icon-app" />
        <span className="dl-mac-icon-badge">!</span>
      </div>
      <strong className="dl-mac-title">&ldquo;{appName}&rdquo; Not Opened</strong>
      <p className="dl-mac-text">
        Apple could not verify &ldquo;{appName}&rdquo; is free of malware that may harm your Mac or
        compromise your privacy.
      </p>
      <div className="dl-mac-buttons">
        <span className="dl-mac-btn">Move to Trash</span>
        <span className="dl-mac-btn is-primary">Done</span>
      </div>
    </div>
  );
}

function WindowsWarningPreview() {
  return (
    <div className="dl-preview dl-preview-win" aria-hidden="true">
      <strong className="dl-win-title">Windows protected your PC</strong>
      <p className="dl-win-text">
        Microsoft Defender SmartScreen prevented an unrecognized app from starting. Running this app
        might put your PC at risk.
      </p>
      <span className="dl-win-link">More info</span>
      <div className="dl-win-buttons">
        <span className="dl-win-btn">Don&rsquo;t run</span>
      </div>
    </div>
  );
}

function CopyCommand({ command }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access denied — the command is still selectable.
    }
  };

  return (
    <div className="dl-command">
      <code>{command}</code>
      <button type="button" onClick={handleCopy}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

const GUIDES = {
  macos: (appName) => ({
    why: (
      <>
        {appName} isn&rsquo;t from the Mac App Store and isn&rsquo;t notarized by Apple (that requires a
        paid Apple Developer account). Because of that, macOS blocks it the first time you open it and
        shows a warning like this. It&rsquo;s a normal warning for apps from independent developers, not
        a sign the app is harmful.
      </>
    ),
    preview: <MacWarningPreview appName={appName} />,
    previewCaption: (
      <>
        On older macOS versions it says &ldquo;can&rsquo;t be opened because Apple cannot check it for
        malicious software&rdquo;.
      </>
    ),
    steps: [
      <>Open the downloaded <b>.dmg</b> and drag <b>{appName}</b> into <b>Applications</b>.</>,
      <>Open {appName}. When the warning appears, click <b>Done</b> (not Move to Trash).</>,
      <>Open <b>System Settings &rarr; Privacy &amp; Security</b> and scroll down to <b>Security</b>.</>,
      <>Next to &ldquo;{appName} was blocked&hellip;&rdquo;, click <b>Open Anyway</b>, then confirm with your password or Touch ID.</>,
      <>Click <b>Open Anyway</b> once more. You only need to do this the first time.</>,
    ],
    extra: (
      <>
        <p>
          Still blocked, or it says the app &ldquo;is damaged&rdquo;? Open <b>Terminal</b> and run:
        </p>
        <CopyCommand command={`xattr -cr /Applications/${appName}.app`} />
      </>
    ),
  }),
  windows: (appName) => ({
    why: (
      <>
        {appName} isn&rsquo;t from the Microsoft Store and isn&rsquo;t signed with a paid code-signing
        certificate, so Windows SmartScreen doesn&rsquo;t recognise it yet and shows a warning like this.
        It&rsquo;s a normal warning for apps from independent developers, not a sign the app is harmful.
      </>
    ),
    preview: <WindowsWarningPreview />,
    steps: [
      <>If your browser says the file &ldquo;isn&rsquo;t commonly downloaded&rdquo;, open the download menu (<b>&hellip;</b>) and choose <b>Keep</b>.</>,
      <>Run the installer. When the blue SmartScreen window appears, click <b>More info</b>.</>,
      <>Click <b>Run anyway</b> and finish the installation.</>,
    ],
  }),
};

function DownloadNoticeModal({ appName, download, onClose }) {
  const [started, setStarted] = useState(false);
  const guide = GUIDES[download.platform]?.(appName);

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

  return (
    <div className="dl-notice-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dl-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dl-notice-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="dl-notice-close" aria-label="Close" onClick={onClose}>
          &times;
        </button>

        <span className="dl-notice-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3.5 21.5 20h-19L12 3.5Z" strokeLinejoin="round" />
            <path d="M12 10v4.5M12 17.5h.01" strokeLinecap="round" />
          </svg>
        </span>
        <h3 className="dl-notice-title" id="dl-notice-title">
          Before you download
        </h3>

        {guide && (
          <>
            <p className="dl-notice-text">{guide.why}</p>

            <figure className="dl-notice-figure">
              {guide.preview}
              <figcaption>
                What you&rsquo;ll see the first time you open it.
                {guide.previewCaption && <> {guide.previewCaption}</>}
              </figcaption>
            </figure>

            <h4 className="dl-notice-subtitle">How to open it</h4>
            <ol className="dl-notice-steps">
              {guide.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            {guide.extra && <div className="dl-notice-extra">{guide.extra}</div>}
          </>
        )}

        {started && (
          <p className="dl-notice-started" role="status">
            Download started. Follow the steps above once it finishes.
          </p>
        )}

        <div className="dl-notice-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            {started ? "Close" : "Cancel"}
          </button>
          <a
            className="btn teal"
            href={download.url}
            rel="noopener noreferrer"
            onClick={() => setStarted(true)}
          >
            Download {download.label}
          </a>
        </div>
      </div>
    </div>
  );
}

export default DownloadNoticeModal;
