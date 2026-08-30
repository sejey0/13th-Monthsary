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
  // If empty or file fails to load, it will seamlessly use the built-in ambient romantic chime synthesizer!
  audioSrc: "", 
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
function initKeypad() {
  const pinDots = document.querySelectorAll(".pin-dot");
  const numKeys = document.querySelectorAll("[data-key]");
  const clearBtn = document.getElementById("btn-clear");
  const backspaceBtn = document.getElementById("btn-backspace");
  const lockCard = document.getElementById("lock-card");

  function updateDots() {
    pinDots.forEach((dot, index) => {
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
    if (currentPin.length < CONFIG.passcode.length) {
      currentPin += digit;
      updateDots();
      if (currentPin.length === CONFIG.passcode.length) {
        verifyPin();
      }
    }
  }

  function handleBackspace() {
    if (currentPin.length > 0) {
      currentPin = currentPin.slice(0, -1);
      updateDots();
    }
  }

  function handleClear() {
    currentPin = "";
    updateDots();
  }

  function verifyPin() {
    if (currentPin === CONFIG.passcode) {
      // Success feedback
      pinDots.forEach((dot) => {
        dot.classList.remove("bg-[#e2b49a]");
        dot.classList.add("bg-emerald-400", "border-emerald-400", "shadow-[0_0_15px_rgba(52,211,153,0.8)]");
      });

      setTimeout(() => {
        unlockWebsite();
      }, 350);
    } else {
      // Error feedback
      lockCard.classList.add("animate-shake");
      pinDots.forEach((dot) => {
        dot.classList.remove("bg-[#e2b49a]");
        dot.classList.add("bg-rose-500", "border-rose-500", "shadow-[0_0_15px_rgba(244,63,94,0.8)]");
      });

      const errorMsg = document.getElementById("lock-error-msg");
      if (errorMsg) {
        errorMsg.classList.remove("opacity-0");
        errorMsg.classList.add("opacity-100");
      }

      setTimeout(() => {
        lockCard.classList.remove("animate-shake");
        currentPin = "";
        updateDots();
        if (errorMsg) {
          errorMsg.classList.add("opacity-0");
          errorMsg.classList.remove("opacity-100");
        }
      }, 900);
    }
  }

  numKeys.forEach((key) => {
    key.addEventListener("click", () => {
      handleKeyInput(key.getAttribute("data-key"));
    });
  });

  if (clearBtn) clearBtn.addEventListener("click", handleClear);
  if (backspaceBtn) backspaceBtn.addEventListener("click", handleBackspace);

  // Keyboard support
  window.addEventListener("keydown", (e) => {
    if (isUnlocked) return;
    if (e.key >= "0" && e.key <= "9") {
      handleKeyInput(e.key);
    } else if (e.key === "Backspace") {
      handleBackspace();
    } else if (e.key === "Escape") {
      handleClear();
    }
  });
}

function unlockWebsite() {
  isUnlocked = true;
  const lockScreen = document.getElementById("lock-screen");
  const mainContent = document.getElementById("main-content");
  const floatingMusicDock = document.getElementById("floating-music-dock");

  lockScreen.classList.add("opacity-0", "pointer-events-none", "scale-95");
  
  setTimeout(() => {
    lockScreen.classList.add("hidden");
    mainContent.classList.remove("hidden");
    if (floatingMusicDock) {
      floatingMusicDock.classList.remove("hidden");
    }
    
    // Smooth transition into content
    setTimeout(() => {
      mainContent.classList.remove("opacity-0", "translate-y-6");
      mainContent.classList.add("opacity-100", "translate-y-0");
      if (floatingMusicDock) {
        floatingMusicDock.classList.remove("opacity-0", "translate-y-8");
        floatingMusicDock.classList.add("opacity-100", "translate-y-0");
      }
    }, 50);

    // Auto-start ambient music on unlock
    startAudio();
  }, 500);
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

  // Attempt gentle audio playback
  try {
    if (!isPlaying) {
      startAudio();
    }
  } catch (err) {
    console.warn("Audio playback note:", err);
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
   AUDIO ENGINE (HTML5 Audio + Procedural Web Audio Ambient Chimes Fallback)
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
    isUsingSynth = false;
  } else {
    isUsingSynth = true;
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
      const mode = audioModeSelect ? audioModeSelect.value : "ambient";
      
      if (mode === "ambient") {
        isUsingSynth = true;
        if (audioElement) {
          audioElement.pause();
        }
        updateAudioSourceBadge("Ambient Chimes (Synthesized)");
      } else if (mode === "file" && fileAudioInput && fileAudioInput.files[0]) {
        const file = fileAudioInput.files[0];
        const url = URL.createObjectURL(file);
        audioElement.src = url;
        isUsingSynth = false;
        stopSynth();
        updateAudioSourceBadge(file.name);
      } else if (customAudioInput && customAudioInput.value.trim() !== "") {
        audioElement.src = customAudioInput.value.trim();
        isUsingSynth = false;
        stopSynth();
        updateAudioSourceBadge("Custom Audio Stream");
      }

      if (audioSourceModal) audioSourceModal.classList.add("hidden");

      if (isPlaying) {
        startAudio();
      }
    });
  }

  // Mode select change in modal
  if (audioModeSelect) {
    audioModeSelect.addEventListener("change", (e) => {
      const customUrlContainer = document.getElementById("custom-url-container");
      const fileUploadContainer = document.getElementById("file-upload-container");
      if (e.target.value === "url") {
        customUrlContainer.classList.remove("hidden");
        fileUploadContainer.classList.add("hidden");
      } else if (e.target.value === "file") {
        fileUploadContainer.classList.remove("hidden");
        customUrlContainer.classList.add("hidden");
      } else {
        customUrlContainer.classList.add("hidden");
        fileUploadContainer.classList.add("hidden");
      }
    });
  }

  // Handle native audio element end
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
  isPlaying = true;
  updateAudioUI();

  if (isUsingSynth) {
    startSynth();
  } else {
    stopSynth();
    if (audioElement && audioElement.src) {
      audioElement.volume = isMuted ? 0 : currentVolume;
      audioElement.play().catch((err) => {
        console.warn("Audio file playback blocked or not found, falling back to ambient melody synthesizer:", err);
        isUsingSynth = true;
        startSynth();
      });
    } else {
      isUsingSynth = true;
      startSynth();
    }
  }
}

function pauseAudio() {
  isPlaying = false;
  updateAudioUI();

  if (isUsingSynth) {
    stopSynth();
  }
  if (audioElement) {
    audioElement.pause();
  }
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
  if (masterGainNode && audioContext) {
    masterGainNode.gain.setValueAtTime(currentVolume, audioContext.currentTime);
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

/* ==========================================================================
   WEB AUDIO API - ROMANTIC CELESTE & AMBIENT CHIME SYNTHESIZER
   Plays a calming, beautiful ambient chord progression (Db Major / F Minor)
   ========================================================================== */
function initWebAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioContext.currentTime);
    masterGainNode.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playSoftChime(frequency, time, duration = 2.5) {
  if (!audioContext || !masterGainNode) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  // Warm gentle sine + subtle triangle character
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, time);

  // Lowpass filter for warm velvety acoustics
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1400, time);
  filter.frequency.exponentialRampToValueAtTime(300, time + duration);

  // Envelope (soft attack, slow lingering decay)
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(0.22, time + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGainNode);

  osc.start(time);
  osc.stop(time + duration);
}

function startSynth() {
  initWebAudioContext();
  stopSynth();

  // Romantic Pentatonic Progression: (Db4, F4, Ab4, C5, Eb5, F5, Ab5)
  const notes = [
    277.18, 349.23, 415.30, 523.25, 622.25, 698.46, 830.61, 
    311.13, 392.00, 466.16, 587.33, 783.99
  ];

  let step = 0;
  function scheduleMelody() {
    if (!isPlaying || !isUsingSynth) return;

    const now = audioContext.currentTime;
    // Play dual harmonized ambient notes
    const note1 = notes[step % notes.length];
    const note2 = notes[(step + 3) % notes.length];

    playSoftChime(note1, now, 3.2);
    setTimeout(() => {
      if (isPlaying && isUsingSynth) {
        playSoftChime(note2, audioContext.currentTime, 2.8);
      }
    }, 450);

    step = (step + 1) % notes.length;
  }

  scheduleMelody();
  synthInterval = setInterval(scheduleMelody, 2200);
}

function stopSynth() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
}
