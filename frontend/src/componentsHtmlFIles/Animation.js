import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
const publicUrl = process.env.PUBLIC_URL;

const assets = {
  logo1: `${publicUrl}/logo1.png`,
  logo3: `${publicUrl}/logo3.png`,
  image1: `${publicUrl}/1.jpg`,
  image2: `${publicUrl}/2.jpg`,
  animation: `${publicUrl}/Animation.json`,
  lottie: `${publicUrl}/Animation.lottie`,
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
