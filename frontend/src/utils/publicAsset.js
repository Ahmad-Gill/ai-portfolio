export const getPublicAsset = (path) => {
  const base = (process.env.REACT_APP_PUBLIC_URL || process.env.PUBLIC_URL || "").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path.replace(/^\/+/, "")}`;
};
