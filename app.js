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
  audioSrc: "",
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
   AMBIENT BACKGROUND PARTICLES (Blended Orbs & Floating Dust)
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

  const particles = [];
  const particleCount = Math.min(width > 768 ? 40 : 22, 50);

  const colors = [
    "rgba(244, 114, 182, 0.65)", // Pink
    "rgba(192, 132, 252, 0.65)", // Purple
    "rgba(232, 121, 249, 0.6)",  // Fuchsia
    "rgba(255, 255, 255, 0.8)"   // White star
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 0.02 + 0.01,
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += Math.sin(Date.now() * 0.001) * 0.003;

      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
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
  const floatingMusicDock = document.getElementById("floating-music-dock");

  // Keep floating music dock hidden until inside letter
  if (floatingMusicDock) {
    floatingMusicDock.classList.add("hidden", "opacity-0", "translate-y-8");
  }

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
  const floatingMusicDock = document.getElementById("floating-music-dock");
  const letterSheet = document.getElementById("letter-sheet");
  const envelopeFront = document.getElementById("envelope-front");
  const sealBtn = document.getElementById("seal-btn");

  if (floatingMusicDock) {
    floatingMusicDock.classList.add("opacity-0", "translate-y-8");
    setTimeout(() => {
      floatingMusicDock.classList.add("hidden");
    }, 300);
  }

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

  const sealBtn = document.getElementById("seal-btn");
  const envelopeFront = document.getElementById("envelope-front");
  const letterSheet = document.getElementById("letter-sheet");
  const floatingMusicDock = document.getElementById("floating-music-dock");

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

  // Show floating music dock ONLY inside the letter view
  if (floatingMusicDock) {
    floatingMusicDock.classList.remove("hidden");
    setTimeout(() => {
      floatingMusicDock.classList.remove("opacity-0", "translate-y-8");
      floatingMusicDock.classList.add("opacity-100", "translate-y-0");
    }, 150);
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
  const floatingMusicDock = document.getElementById("floating-music-dock");

  // Hide floating music dock when outside letter
  if (floatingMusicDock) {
    floatingMusicDock.classList.add("opacity-0", "translate-y-8");
    setTimeout(() => {
      floatingMusicDock.classList.add("hidden");
    }, 300);
  }

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
  const audioSourceModal = document.getElementById("audio-source-modal");
  const openSourceModalBtns = document.querySelectorAll(".btn-open-source-modal");
  const closeSourceModalBtn = document.getElementById("btn-close-source-modal");
  const applySourceBtn = document.getElementById("btn-apply-source");
  const customAudioInput = document.getElementById("custom-audio-url");
  const fileAudioInput = document.getElementById("custom-audio-file");
  const audioModeSelect = document.getElementById("audio-mode-select");

  // Check if initial audioSrc exists
  if (CONFIG.audioSrc && CONFIG.audioSrc.trim() !== "") {
    audioElement.src = CONFIG.audioSrc;
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

  // Music Source Modal Interactions
  openSourceModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (audioSourceModal) audioSourceModal.classList.remove("hidden");
    });
  });

  if (closeSourceModalBtn && audioSourceModal) {
    closeSourceModalBtn.addEventListener("click", () => {
      audioSourceModal.classList.add("hidden");
    });
  }

  if (applySourceBtn) {
    applySourceBtn.addEventListener("click", () => {
      const mode = audioModeSelect ? audioModeSelect.value : "file";
      
      if (mode === "file" && fileAudioInput && fileAudioInput.files[0]) {
        const file = fileAudioInput.files[0];
        const url = URL.createObjectURL(file);
        audioElement.src = url;
        updateAudioSourceBadge(file.name);
        startAudio();
      } else if (customAudioInput && customAudioInput.value.trim() !== "") {
        audioElement.src = customAudioInput.value.trim();
        updateAudioSourceBadge("Custom Audio Stream");
        startAudio();
      }

      if (audioSourceModal) audioSourceModal.classList.add("hidden");
    });
  }

  // Mode select change in modal
  if (audioModeSelect) {
    audioModeSelect.addEventListener("change", (e) => {
      const customUrlContainer = document.getElementById("custom-url-container");
      const fileUploadContainer = document.getElementById("file-upload-container");
      if (e.target.value === "url") {
        if (customUrlContainer) customUrlContainer.classList.remove("hidden");
        if (fileUploadContainer) fileUploadContainer.classList.add("hidden");
      } else {
        if (fileUploadContainer) fileUploadContainer.classList.remove("hidden");
        if (customUrlContainer) customUrlContainer.classList.add("hidden");
      }
    });
  }

  // Handle native audio element end (looping)
  if (audioElement) {
    audioElement.addEventListener("ended", () => {
      audioElement.currentTime = 0;
      audioElement.play().catch(() => {});
    });
  }
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
  if (!audioElement || !audioElement.src || audioElement.src === window.location.href) {
    const audioSourceModal = document.getElementById("audio-source-modal");
    if (audioSourceModal) audioSourceModal.classList.remove("hidden");
    return;
  }

  audioElement.volume = isMuted ? 0 : currentVolume;
  audioElement.play().then(() => {
    isPlaying = true;
    updateAudioUI();
  }).catch((err) => {
    console.warn("Audio playback waiting for user file / interaction:", err);
    isPlaying = false;
    updateAudioUI();
  });
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
