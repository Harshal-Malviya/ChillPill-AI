import React, { useEffect, useState } from "react";

const MoodIndicator = ({ moodScore }) => {
  const [animatedScore, setAnimatedScore] = useState(null);
  const [emoji, setEmoji] = useState("❓");

  // Smoothly animate mood changes
  useEffect(() => {
    if (moodScore === null) {
      setAnimatedScore(null);
      setEmoji("❓");
      return;
    }

    const start = animatedScore ?? 0;
    const end = moodScore;
    const duration = 600; // ms
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const newValue = Math.round(start + (end - start) * progress);
      setAnimatedScore(newValue);

      // update emoji smoothly during animation
      if (newValue < 25) setEmoji("😔");
      else if (newValue < 75) setEmoji("🙂");
      else setEmoji("😊");

      if (currentStep === steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [moodScore]);

  return (
    <div className="mood-indicator">
      <div
        className="mood-circle"
        style={{
          background:
            animatedScore === null
              ? "#e0e0e0" // default grey when no mood yet
              : `conic-gradient(#8A2BE2 ${animatedScore}%, #e0e0e0 ${animatedScore}%)`,
        }}
      >
        <div className="mood-emoji">{emoji}</div>
      </div>
    </div>
  );
};

export default MoodIndicator;
