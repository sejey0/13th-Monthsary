/**
 * 13th Monthsary Website Application
 * Date: August 15, 2026
 */

// Global Configuration
const CONFIG = {
  passcode: "07152025", // Passcode PIN (07152025)
  dateString: "August 15, 2026",
  occasion: "13th Monthsary",
  // Path to your custom mp3 file (e.g. './music.mp3' or full URL)
  audioSrc: "assets/audio/Tadhana%20(feat.%20Trisha%20Macapagal).mp3",
  audioTitle: "Tadhana - Trisha Macapagal",
  devMode: true, // Dev mode: Bypasses lock screen automatically on load
};

// State Variables
let currentPin = "";
let isUnlocked = false;
let isLetterOpened = false;
let isPlaying = false;
let isMuted = false;
let previousVolume = 0.7;
let currentVolume = 0.7;

// Audio System State
let audioElement = null;
let audioContext = null;
let synthInterval = null;
let isUsingSynth = true;
let masterGainNode = null;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initIcons();
  initBackgroundSlideshow();
  initCanvas();
  initKeypad();
  initAudioPlayer();
  initLetterInteraction();
  initDevMode();
});

// Refresh Lucide Icons
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   BACKGROUND IMAGE 3-TILE GRID SLIDESHOW (Smooth Organic Crossfades)
   ========================================================================== */
function initBackgroundSlideshow() {
  const columns = document.querySelectorAll(".tile-column");
  if (!columns || columns.length === 0) return;

  columns.forEach((col, colIdx) => {
    const slides = col.querySelectorAll(".tile-slide");
    if (!slides || slides.length === 0) return;

    let current = 0;
    slides.forEach((slide, idx) => {
      if (slide.classList.contains("active")) {
        current = idx;
      }
    });

    // Stagger transitions across the 3 tiles for dynamic movement
    const slideInterval = 5500 + colIdx * 1500;

    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, slideInterval);
  });
}

/* ==========================================================================
   CONSTELLATION SKY BACKGROUND EFFECT (Interactive Starlight & Celestial Lines)
   ========================================================================== */
function initCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const isMobile = width <= 768;
  const starCount = isMobile ? 32 : 55;
  const maxLineDist = isMobile ? 85 : 120;
  const maxLineDistSq = maxLineDist * maxLineDist;
  const mouseDistSq = 140 * 140;

  const mouse = { x: -1000, y: -1000, active: false };

  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener("pointerleave", () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Star colors (romantic pastel starlight)
  const starColors = [
    { r: 244, g: 114, b: 182 }, // Blush Pink
    { r: 192, g: 132, b: 252 }, // Soft Lavender
    { r: 232, g: 121, b: 249 }, // Radiant Fuchsia
    { r: 255, g: 245, b: 255 }, // Shimmering Starlight White
    { r: 251, g: 191, b: 236 }, // Light Rose
  ];

  const stars = [];
  for (let i = 0; i < starCount; i++) {
    const col = starColors[Math.floor(Math.random() * starColors.length)];
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28 - 0.05,
      color: col,
      baseAlpha: Math.random() * 0.5 + 0.35,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
      isMajorStar: Math.random() > 0.78, // Bright star with cross glint
    });
  }

  // Shooting star system
  let shootingStars = [];
  function createShootingStar() {
    shootingStars.push({
      x: Math.random() * width * 0.8 + width * 0.1,
      y: Math.random() * height * 0.4,
      length: Math.random() * 70 + 50,
      speed: Math.random() * 6 + 7,
      angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.25, // ~45 deg downward
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 30 + 35,
    });
  }

  setInterval(() => {
    if (Math.random() > 0.45 && shootingStars.length < 2) {
      createShootingStar();
    }
  }, 4500);

  function render() {
    ctx.clearRect(0, 0, width, height);
    const now = Date.now() * 0.001;

    // 1. Draw Constellation Connection Lines Between Stars
    for (let i = 0; i < stars.length; i++) {
      const s1 = stars[i];
      for (let j = i + 1; j < stars.length; j++) {
        const s2 = stars[j];
        const dx = s1.x - s2.x;
        const dy = s1.y - s2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxLineDistSq) {
          const dist = Math.sqrt(distSq);
          const lineAlpha = (1 - dist / maxLineDist) * 0.22;

          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.strokeStyle = `rgba(244, 114, 182, ${lineAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      // Constellation connection to cursor / touch
      if (mouse.active) {
        const mdx = s1.x - mouse.x;
        const mdy = s1.y - mouse.y;
        const mdistSq = mdx * mdx + mdy * mdy;

        if (mdistSq < mouseDistSq) {
          const mdist = Math.sqrt(mdistSq);
          const mlineAlpha = (1 - mdist / 140) * 0.38;

          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(232, 121, 249, ${mlineAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // 2. Draw Stars and Twinkle
    stars.forEach((s) => {
      s.x += s.vx;
      s.y += s.vy;

      // Wrap around edges smoothly
      if (s.x < -10) s.x = width + 10;
      if (s.x > width + 10) s.x = -10;
      if (s.y < -10) s.y = height + 10;
      if (s.y > height + 10) s.y = -10;

      const alpha = s.baseAlpha + Math.sin(now * s.twinkleSpeed * 10 + s.twinkleOffset) * 0.25;
      const clampedAlpha = Math.max(0.1, Math.min(1, alpha));

      // Star core circle
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${clampedAlpha})`;
      ctx.shadowBlur = s.isMajorStar ? 10 : 4;
      ctx.shadowColor = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${clampedAlpha})`;
      ctx.fill();

      // Delicate 4-point cross glint on major bright stars
      if (s.isMajorStar && clampedAlpha > 0.45) {
        const glintLen = s.radius * 2.8;
        ctx.beginPath();
        ctx.moveTo(s.x - glintLen, s.y);
        ctx.lineTo(s.x + glintLen, s.y);
        ctx.moveTo(s.x, s.y - glintLen);
        ctx.lineTo(s.x, s.y + glintLen);
        ctx.strokeStyle = `rgba(255, 255, 255, ${clampedAlpha * 0.45})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    });

    // 3. Render Shooting Stars
    shootingStars.forEach((meteor, index) => {
      meteor.life++;
      meteor.x += Math.cos(meteor.angle) * meteor.speed;
      meteor.y += Math.sin(meteor.angle) * meteor.speed;
      meteor.opacity = 1 - meteor.life / meteor.maxLife;

      if (meteor.opacity <= 0) {
        shootingStars.splice(index, 1);
        return;
      }

      const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
      const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

      const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
      grad.addColorStop(0, "rgba(244, 114, 182, 0)");
      grad.addColorStop(0.7, `rgba(192, 132, 252, ${meteor.opacity * 0.5})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${meteor.opacity})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(meteor.x, meteor.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(244, 114, 182, 0.8)";
      ctx.stroke();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   LOCK SCREEN & PASSCODE SYSTEM
   ========================================================================== */
let errorTimeout = null;

function initKeypad() {
  const pinDots = document.querySelectorAll(".pin-dot");
  const numKeys = document.querySelectorAll("[data-key]");
  const clearBtn = document.getElementById("btn-clear");
  const backspaceBtn = document.getElementById("btn-backspace");
  const lockCard = document.getElementById("lock-card");
  const errorMsg = document.getElementById("lock-error-msg");

  function clearPendingError() {
    if (errorTimeout) {
      clearTimeout(errorTimeout);
      errorTimeout = null;
    }
    if (lockCard) lockCard.classList.remove("animate-shake");
    if (errorMsg) {
      errorMsg.classList.add("opacity-0");
      errorMsg.classList.remove("opacity-100");
    }
    pinDots.forEach((dot) => {
      dot.classList.remove("bg-rose-500", "border-rose-500", "shadow-[0_0_15px_rgba(244,63,94,0.8)]");
    });
  }

  function updateDots() {
    pinDots.forEach((dot, index) => {
      dot.classList.remove("bg-rose-500", "border-rose-500", "bg-emerald-400", "border-emerald-400");
      if (index < currentPin.length) {
        dot.classList.remove("bg-white/20", "border-white/30");
        dot.classList.add("bg-[#f472b6]", "border-[#f472b6]", "shadow-[0_0_14px_rgba(244,114,182,0.8)]");
      } else {
        dot.classList.add("bg-white/20", "border-white/30");
        dot.classList.remove("bg-[#f472b6]", "border-[#f472b6]", "shadow-[0_0_14px_rgba(244,114,182,0.8)]");
      }
    });
  }

  function handleKeyInput(digit) {
    clearPendingError();
    if (currentPin.length < CONFIG.passcode.length) {
      currentPin += digit;
      updateDots();
      if (currentPin.length === CONFIG.passcode.length) {
        verifyPin();
      }
    }
  }

  function handleBackspace() {
    clearPendingError();
    if (currentPin.length > 0) {
      currentPin = currentPin.slice(0, -1);
      updateDots();
    }
  }

  function handleClear() {
    clearPendingError();
    currentPin = "";
    updateDots();
  }

  function verifyPin() {
    if (currentPin === CONFIG.passcode) {
      // Success feedback
      pinDots.forEach((dot) => {
        dot.classList.remove("bg-rose-500", "bg-[#f472b6]");
        dot.classList.add("bg-emerald-400", "border-emerald-400", "shadow-[0_0_15px_rgba(52,211,153,0.8)]");
      });

      setTimeout(() => {
        unlockWebsite();
      }, 300);
    } else {
      // Error feedback & Auto-reset
      if (lockCard) lockCard.classList.add("animate-shake");
      pinDots.forEach((dot) => {
        dot.classList.remove("bg-[#f472b6]", "bg-white/20", "border-white/30");
        dot.classList.add("bg-rose-500", "border-rose-500", "shadow-[0_0_15px_rgba(244,63,94,0.8)]");
      });

      if (errorMsg) {
        errorMsg.classList.remove("opacity-0");
        errorMsg.classList.add("opacity-100");
      }

      // Automatically reset PIN state immediately
      currentPin = "";

      errorTimeout = setTimeout(() => {
        if (lockCard) lockCard.classList.remove("animate-shake");
        updateDots();
        if (errorMsg) {
          errorMsg.classList.add("opacity-0");
          errorMsg.classList.remove("opacity-100");
        }
        errorTimeout = null;
      }, 600);
    }
  }

  // Keypad numbers
  numKeys.forEach((key) => {
    key.addEventListener("click", (e) => {
      e.preventDefault();
      handleKeyInput(key.getAttribute("data-key"));
    });
  });

  // Reset / Clear button
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleClear();
    });
  }

  // Delete / Backspace button
  if (backspaceBtn) {
    backspaceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleBackspace();
    });
  }

  // Keyboard support
  window.addEventListener("keydown", (e) => {
    if (isUnlocked && !document.getElementById("lock-screen").classList.contains("hidden")) {
      // if lock screen is currently visible
    } else if (isUnlocked) {
      return;
    }

    if (e.key >= "0" && e.key <= "9") {
      handleKeyInput(e.key);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      handleBackspace();
    } else if (e.key === "Escape") {
      handleClear();
    }
  });
}

function unlockWebsite(instant = false) {
  isUnlocked = true;
  const lockScreen = document.getElementById("lock-screen");
  const mainContent = document.getElementById("main-content");

  if (instant) {
    if (lockScreen) lockScreen.classList.add("hidden");
    if (mainContent) {
      mainContent.classList.remove("hidden", "opacity-0", "translate-y-6");
      mainContent.classList.add("opacity-100", "translate-y-0");
    }
    return;
  }

  if (lockScreen) lockScreen.classList.add("opacity-0", "pointer-events-none", "scale-95");
  
  setTimeout(() => {
    if (lockScreen) lockScreen.classList.add("hidden");
    if (mainContent) mainContent.classList.remove("hidden");
    
    // Smooth transition into content
    setTimeout(() => {
      if (mainContent) {
        mainContent.classList.remove("opacity-0", "translate-y-6");
        mainContent.classList.add("opacity-100", "translate-y-0");
      }
    }, 50);
  }, 400);
}

window.lockWebsite = function(e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  isUnlocked = false;
  isLetterOpened = false;

  pauseAudio();

  const lockScreen = document.getElementById("lock-screen");
  const mainContent = document.getElementById("main-content");
  const letterSheet = document.getElementById("letter-sheet");
  const envelopeFront = document.getElementById("envelope-front");
  const sealBtn = document.getElementById("seal-btn");

  if (letterSheet) {
    letterSheet.classList.add("hidden", "opacity-0", "translate-y-12", "scale-95");
    letterSheet.classList.remove("opacity-100", "translate-y-0", "scale-100");
  }

  if (envelopeFront) {
    envelopeFront.classList.remove("hidden", "opacity-0", "scale-95", "pointer-events-none");
    envelopeFront.classList.add("opacity-100", "scale-100");
    if (sealBtn) {
      sealBtn.classList.remove("scale-125", "opacity-0");
    }
  }

  if (mainContent) {
    mainContent.classList.remove("opacity-100", "translate-y-0");
    mainContent.classList.add("opacity-0", "translate-y-6");
    setTimeout(() => {
      mainContent.classList.add("hidden");
      if (lockScreen) {
        lockScreen.classList.remove("hidden");
        setTimeout(() => {
          lockScreen.classList.remove("opacity-0", "pointer-events-none", "scale-95");
          initIcons();
        }, 50);
      }
    }, 300);
  }

  currentPin = "";
  const pinDots = document.querySelectorAll(".pin-dot");
  pinDots.forEach((dot) => {
    dot.classList.add("bg-white/20", "border-white/30");
    dot.classList.remove("bg-[#f472b6]", "border-[#f472b6]", "bg-rose-500", "border-rose-500", "bg-emerald-400", "border-emerald-400", "shadow-[0_0_14px_rgba(244,114,182,0.8)]");
  });
};

function initDevMode() {
  if (CONFIG.devMode) {
    unlockWebsite(true);
  }

  const toggleBtn = document.getElementById("btn-toggle-lock-screen");
  const lockScreen = document.getElementById("lock-screen");
  const mainContent = document.getElementById("main-content");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isLockHidden = lockScreen.classList.contains("hidden");
      if (isLockHidden) {
        window.lockWebsite();
        toggleBtn.textContent = "Show Letter";
      } else {
        unlockWebsite(true);
        toggleBtn.textContent = "Lock Test";
      }
    });
  }
}

/* ==========================================================================
   LETTER & ENVELOPE INTERACTION
   ========================================================================== */
window.openLetter = function(e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  if (isLetterOpened) return;
  isLetterOpened = true;

  // Auto-play the background music and loop nonstop when the letter is opened
  startAudio();

  const sealBtn = document.getElementById("seal-btn");
  const envelopeFront = document.getElementById("envelope-front");
  const letterSheet = document.getElementById("letter-sheet");

  if (sealBtn) {
    sealBtn.classList.add("scale-125", "opacity-0");
  }

  if (envelopeFront) {
    envelopeFront.classList.add("opacity-0", "scale-95", "pointer-events-none");
    setTimeout(() => {
      envelopeFront.classList.add("hidden");
    }, 400);
  }

  if (letterSheet) {
    letterSheet.classList.remove("hidden");
    // Force a reflow
    void letterSheet.offsetWidth;
    setTimeout(() => {
      letterSheet.classList.remove("opacity-0", "translate-y-12", "scale-95");
      letterSheet.classList.add("opacity-100", "translate-y-0", "scale-100");
      initIcons();
    }, 40);
  }
};

window.closeLetter = function(e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  if (!isLetterOpened) return;
  isLetterOpened = false;

  const sealBtn = document.getElementById("seal-btn");
  const envelopeFront = document.getElementById("envelope-front");
  const letterSheet = document.getElementById("letter-sheet");

  if (letterSheet) {
    letterSheet.classList.remove("opacity-100", "translate-y-0", "scale-100");
    letterSheet.classList.add("opacity-0", "translate-y-12", "scale-95");
    setTimeout(() => {
      letterSheet.classList.add("hidden");
    }, 400);
  }

  if (envelopeFront) {
    envelopeFront.classList.remove("hidden");
    void envelopeFront.offsetWidth;
    setTimeout(() => {
      envelopeFront.classList.remove("opacity-0", "scale-95", "pointer-events-none");
      envelopeFront.classList.add("opacity-100", "scale-100");
      if (sealBtn) {
        sealBtn.classList.remove("scale-125", "opacity-0");
      }
      initIcons();
    }, 50);
  }
};

function initLetterInteraction() {
  const sealBtn = document.getElementById("seal-btn");
  const envelopeFront = document.getElementById("envelope-front");
  const closeLetterBtns = document.querySelectorAll(".btn-close-letter");

  if (sealBtn) {
    sealBtn.addEventListener("click", window.openLetter);
    sealBtn.addEventListener("touchend", window.openLetter);
  }

  if (envelopeFront) {
    envelopeFront.addEventListener("click", window.openLetter);
  }

  closeLetterBtns.forEach((btn) => {
    btn.addEventListener("click", window.closeLetter);
  });
}

/* ==========================================================================
   AUDIO ENGINE (HTML5 Audio for Custom Music File / URL)
   ========================================================================== */
function initAudioPlayer() {
  audioElement = document.getElementById("bg-audio");
  const playToggleBtns = document.querySelectorAll(".btn-toggle-play");
  const muteBtns = document.querySelectorAll(".btn-toggle-mute");
  const volumeSliders = document.querySelectorAll(".volume-slider");

  if (audioElement) {
    // Enable nonstop looping
    audioElement.loop = true;

    // Check if initial audioSrc exists in CONFIG or HTML element
    if (CONFIG.audioSrc && CONFIG.audioSrc.trim() !== "") {
      audioElement.src = CONFIG.audioSrc;
      updateAudioSourceBadge(CONFIG.audioTitle || "Tadhana - Trisha Macapagal");
    } else if (audioElement.src && audioElement.src !== window.location.href) {
      updateAudioSourceBadge(CONFIG.audioTitle || "Tadhana - Trisha Macapagal");
    }

    // Seamless nonstop loop listener as reliable fallback
    audioElement.addEventListener("ended", () => {
      audioElement.currentTime = 0;
      audioElement.play().catch(() => {});
    });

    // Synchronize play/pause state with UI
    audioElement.addEventListener("play", () => {
      isPlaying = true;
      updateAudioUI();
    });

    audioElement.addEventListener("pause", () => {
      isPlaying = false;
      updateAudioUI();
    });
  }

  // Play / Pause Toggles
  playToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      togglePlay();
    });
  });

  // Mute Toggles
  muteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleMute();
    });
  });

  // Volume Sliders
  volumeSliders.forEach((slider) => {
    slider.value = currentVolume;
    slider.addEventListener("input", (e) => {
      setVolume(parseFloat(e.target.value));
    });
  });
}

function updateAudioSourceBadge(name) {
  const badge = document.getElementById("audio-source-name");
  if (badge) {
    badge.textContent = name;
  }
}

function togglePlay() {
  if (isPlaying) {
    pauseAudio();
  } else {
    startAudio();
  }
}

function startAudio() {
  if (!audioElement) return;

  if (!audioElement.src || audioElement.src === window.location.href) {
    if (CONFIG.audioSrc && CONFIG.audioSrc.trim() !== "") {
      audioElement.src = CONFIG.audioSrc;
    } else {
      return;
    }
  }

  audioElement.volume = isMuted ? 0 : currentVolume;
  audioElement.loop = true;

  if (isPlaying && !audioElement.paused) {
    updateAudioUI();
    return;
  }

  const playPromise = audioElement.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      isPlaying = true;
      updateAudioUI();
    }).catch((err) => {
      console.warn("Audio playback waiting for user file / interaction:", err);
      isPlaying = false;
      updateAudioUI();
    });
  }
}

function pauseAudio() {
  isPlaying = false;
  if (audioElement) {
    audioElement.pause();
  }
  updateAudioUI();
}

function toggleMute() {
  if (isMuted) {
    isMuted = false;
    currentVolume = previousVolume || 0.7;
  } else {
    isMuted = true;
    previousVolume = currentVolume;
    currentVolume = 0;
  }
  setVolume(currentVolume, false);
  updateAudioUI();
}

function setVolume(val, updateMuteState = true) {
  currentVolume = Math.max(0, Math.min(1, val));
  if (updateMuteState) {
    isMuted = currentVolume === 0;
  }

  if (audioElement) {
    audioElement.volume = currentVolume;
  }

  // Update volume slider elements
  document.querySelectorAll(".volume-slider").forEach((s) => (s.value = currentVolume));
  updateAudioUI();
}

function updateAudioUI() {
  const playIcons = document.querySelectorAll(".play-state-icon");
  const muteIcons = document.querySelectorAll(".mute-state-icon");
  const visualizers = document.querySelectorAll(".audio-visualizer");
  const playTextLabels = document.querySelectorAll(".play-state-text");

  // Play / Pause Icons
  playIcons.forEach((el) => {
    el.setAttribute("data-lucide", isPlaying ? "pause" : "play");
  });

  playTextLabels.forEach((el) => {
    el.textContent = isPlaying ? "Pause Music" : "Play Music";
  });

  // Mute / Volume Icons
  muteIcons.forEach((el) => {
    el.setAttribute("data-lucide", isMuted || currentVolume === 0 ? "volume-x" : currentVolume < 0.5 ? "volume-1" : "volume-2");
  });

  // Visualizer Animation
  visualizers.forEach((v) => {
    if (isPlaying) {
      v.classList.add("playing");
    } else {
      v.classList.remove("playing");
    }
  });

  initIcons();
}
