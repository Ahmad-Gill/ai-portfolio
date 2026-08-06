import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

const getPublicAsset = (path) => {
  const base = (process.env.REACT_APP_PUBLIC_URL || process.env.PUBLIC_URL || "").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path.replace(/^\/+/, "")}`;
};

const assets = {
  logo1: getPublicAsset("logo1.png"),
  logo3: getPublicAsset("logo3.png"),
  image1: getPublicAsset("1.jpg"),
  image2: getPublicAsset("2.jpg"),
  animation: getPublicAsset("Animation.json"),
  lottie: getPublicAsset("Animation.lottie"),
};

function Animation({ fullscreen = false, width = "100%", height = "100%" }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
   fetch(assets.animation) // load from public
// load from public
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load animation:", err));
  }, []);

  if (!animationData) return null;

  if (fullscreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0, // full screen
          background: "rgba(0, 0, 0, 0.3)", // slight dark overlay
          backdropFilter: "blur(6px)", // medium blur effect
          WebkitBackdropFilter: "blur(6px)", // Safari support
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <Lottie
          animationData={animationData}
          loop
          style={{ width: "40%", height: "40%" }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", textAlign: "center", marginBottom: "20px" }}>
      <Lottie
        animationData={animationData}
        loop
        style={{ width: width, height: height, margin: "0 auto" }}
      />
    </div>
  );
}

export default Animation;
