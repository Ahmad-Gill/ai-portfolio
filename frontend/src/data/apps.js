// Downloadable apps shown in the "Apps" section on the home page.
//
// To add an app: upload the installers to a GitHub Release
// (installers are too big to commit; *.dmg / *.exe / *.msi / *.ipa are gitignored)
// and add an entry below. One app can have a download per platform/build;
// each download's `platform` must be one of the keys in `platforms`.
// `url` can also be an App Store / Microsoft Store link.

const RELEASES = "https://github.com/Ahmad-Gill/ai-portfolio/releases/download";

export const platforms = {
  macos: { label: "macOS" },
  windows: { label: "Windows" },
  ios: { label: "iOS" },
};

export const apps = [
  {
    name: "Clipboard",
    version: "1.0.0",
    description:
      "A clipboard manager that keeps your copy history so you can find and paste anything you copied earlier.",
    downloads: [
      {
        platform: "macos",
        label: "Mac (Apple Silicon)",
        note: "M1 or later",
        size: "121 MB",
        url: `${RELEASES}/clipboard-v1.0.0/Clipboard-1.0.0-mac-arm64.dmg`,
      },
      {
        platform: "macos",
        label: "Mac (Intel)",
        size: "129 MB",
        url: `${RELEASES}/clipboard-v1.0.0/Clipboard-1.0.0-mac-x64.dmg`,
      },
      {
        platform: "windows",
        label: "Windows",
        note: "64-bit",
        size: "122 MB",
        url: `${RELEASES}/clipboard-v1.0.0/Clipboard-1.0.0-win-x64.exe`,
      },
    ],
  },
];
