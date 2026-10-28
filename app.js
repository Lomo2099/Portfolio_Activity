// Minecraft Portfolio Engine - Kanav (app.js)

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------
  // 1. Ambient Particle System (Canvas)
  // -------------------------------------------------------------
  const ambientCanvas = document.getElementById("ambient-canvas");
  const ambientCtx = ambientCanvas.getContext("2d");

  let width = (ambientCanvas.width = window.innerWidth);
  let height = (ambientCanvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = ambientCanvas.width = window.innerWidth;
    height = ambientCanvas.height = window.innerHeight;
  });

  let currentBiome = "overworld"; // "overworld" | "nether" | "end"
  const particles = [];

  class AmbientParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.floor(Math.random() * 3) + 2;

      if (currentBiome === "overworld") {
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = -Math.random() * 0.8 - 0.2;
        this.color = Math.random() > 0.5 ? "rgba(85, 255, 85, 0.6)" : "rgba(85, 255, 255, 0.4)";
        this.alpha = Math.random() * 0.6 + 0.2;
      } else if (currentBiome === "nether") {
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = -Math.random() * 2.2 - 0.8; // Fast rising fire embers
        this.color = Math.random() > 0.4 ? "rgba(255, 85, 0, 0.8)" : "rgba(255, 215, 0, 0.7)";
        this.alpha = Math.random() * 0.8 + 0.2;
      } else {
        // The End
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.color = Math.random() > 0.5 ? "rgba(180, 80, 255, 0.7)" : "rgba(100, 240, 255, 0.6)";
        this.alpha = Math.random() * 0.7 + 0.3;
      }
      this.decay = Math.random() * 0.005 + 0.002;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;

      if (this.alpha <= 0 || this.y < -10 || this.y > height + 10 || this.x < -10 || this.x > width + 10) {
        this.reset();
        this.y = currentBiome === "nether" ? height + 5 : Math.random() * height;
      }
    }

    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    }
  }

  // Populate particles
  for (let i = 0; i < 60; i++) {
    particles.push(new AmbientParticle());
  }

  function animateAmbient() {
    ambientCtx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw(ambientCtx);
    }
    requestAnimationFrame(animateAmbient);
  }
  animateAmbient();

  // -------------------------------------------------------------
  // 2. Ender Pearl Throw & Teleportation FX
  // -------------------------------------------------------------
  const fxCanvas = document.getElementById("pearl-fx-canvas");
  const fxCtx = fxCanvas.getContext("2d");
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  });

  const activeEffects = [];

  function throwEnderPearl(startX, startY, targetEl, onComplete) {
    if (!targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();
    const destX = targetRect.left + targetRect.width / 2;
    const destY = targetRect.top + 80;

    window.soundEngine.playPearlThrow();

    // Flight parameters
    const totalDuration = 550; // ms
    const startTime = performance.now();
    const pearlTrail = [];

    // Arc control height
    const peakHeight = Math.min(startY, destY) - 180;

    function renderPearlFlight(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      // Quadratic Bezier curve
      const p0 = { x: startX, y: startY };
      const p1 = { x: (startX + destX) / 2, y: peakHeight };
      const p2 = { x: destX, y: destY };

      const t = progress;
      const curX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const curY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

      // Spawn trail particles
      for (let i = 0; i < 2; i++) {
        pearlTrail.push({
          x: curX + (Math.random() - 0.5) * 8,
          y: curY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.floor(Math.random() * 4) + 2,
          color: Math.random() > 0.4 ? "#00ffff" : "#aa00aa",
          alpha: 1.0,
          decay: 0.04
        });
      }

      // Clear & Draw
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

      // Draw trails
      for (let i = pearlTrail.length - 1; i >= 0; i--) {
        const pt = pearlTrail[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) {
          pearlTrail.splice(i, 1);
          continue;
        }
        fxCtx.fillStyle = pt.color;
        fxCtx.globalAlpha = pt.alpha;
        fxCtx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
      }

      // Draw pearl sprite (teal core with cyan border)
      fxCtx.globalAlpha = 1.0;
      fxCtx.fillStyle = "#000000";
      fxCtx.fillRect(curX - 6, curY - 6, 12, 12);
      fxCtx.fillStyle = "#0a5d62";
      fxCtx.fillRect(curX - 5, curY - 5, 10, 10);
      fxCtx.fillStyle = "#27cbd7";
      fxCtx.fillRect(curX - 4, curY - 4, 8, 8);
      fxCtx.fillStyle = "#ffffff";
      fxCtx.fillRect(curX - 2, curY - 2, 3, 3);

      if (progress < 1) {
        requestAnimationFrame(renderPearlFlight);
      } else {
        // Landing explosion!
        triggerPearlImpact(destX, destY, targetEl, onComplete);
      }
    }

    requestAnimationFrame(renderPearlFlight);
  }

  function triggerPearlImpact(x, y, targetEl, onComplete) {
    window.soundEngine.playPearlTeleport();

    // Impact blast particles
    const burstParticles = [];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.floor(Math.random() * 5) + 3,
        color: Math.random() > 0.5 ? "#24e0ec" : "#bf38ff",
        alpha: 1.0,
        decay: 0.035
      });
    }

    function renderBurst() {
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      let alive = false;
      for (let p of burstParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha > 0) {
          alive = true;
          fxCtx.fillStyle = p.color;
          fxCtx.globalAlpha = p.alpha;
          fxCtx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        }
      }
      if (alive) {
        requestAnimationFrame(renderBurst);
      } else {
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      }
    }
    renderBurst();

    // Screen flash & camera shake
    const flashEl = document.getElementById("teleport-flash");
    flashEl.classList.add("flash-active");
    document.body.classList.add("camera-shake");

    setTimeout(() => {
      flashEl.classList.remove("flash-active");
    }, 200);

    setTimeout(() => {
      document.body.classList.remove("camera-shake");
    }, 350);

    // Instant Teleport Scroll to Target
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });

    if (onComplete) onComplete();
  }

  // -------------------------------------------------------------
  // 3. Nether Portal Warp Sequence
  // -------------------------------------------------------------
  const portalOverlay = document.getElementById("nether-portal-overlay");
  const portalMsg = document.getElementById("portal-dimension-name");

  function triggerNetherPortal(targetBiome, targetSectionId) {
    window.soundEngine.playPortalWarp();
    portalMsg.textContent = `Entering ${targetBiome.toUpperCase()}...`;
    portalOverlay.classList.add("portal-active");

    setTimeout(() => {
      // Switch Biome
      setBiome(targetBiome);

      const targetEl = document.getElementById(targetSectionId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "auto", block: "start" });
      }

      setTimeout(() => {
        portalOverlay.classList.remove("portal-active");
        window.soundEngine.playDing();
      }, 500);
    }, 1100);
  }

  function setBiome(biome) {
    currentBiome = biome;
    document.body.classList.remove("biome-overworld", "biome-nether", "biome-end");
    document.body.classList.add(`biome-${biome}`);

    const biomeLabel = document.getElementById("current-biome-text");
    if (biomeLabel) {
      biomeLabel.textContent = biome.charAt(0).toUpperCase() + biome.slice(1);
    }
  }

  // -------------------------------------------------------------
  // 4. Hotbar Navigation (1-9 & Click)
  // -------------------------------------------------------------
  const hotbarSlots = document.querySelectorAll(".hotbar-slot");

  function activateHotbarSlot(slotIndex, originEvent) {
    hotbarSlots.forEach((s) => s.classList.remove("active"));
    const selectedSlot = hotbarSlots[slotIndex];
    if (!selectedSlot) return;

    selectedSlot.classList.add("active");
    const targetId = selectedSlot.getAttribute("data-target");
    const warpType = selectedSlot.getAttribute("data-warp") || "pearl";
    const targetEl = document.getElementById(targetId);

    if (warpType === "portal") {
      const biome = selectedSlot.getAttribute("data-biome") || "nether";
      triggerNetherPortal(biome, targetId);
    } else {
      // Ender Pearl Throw from hotbar or click origin
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight - 60;
      if (originEvent && originEvent.clientX) {
        startX = originEvent.clientX;
        startY = originEvent.clientY;
      }
      throwEnderPearl(startX, startY, targetEl);
    }
  }

  hotbarSlots.forEach((slot, index) => {
    slot.addEventListener("click", (e) => {
      activateHotbarSlot(index, e);
    });
  });

  // Keyboard hotkeys (1 - 9)
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key >= "1" && e.key <= "9") {
      const idx = parseInt(e.key) - 1;
      if (idx < hotbarSlots.length) {
        activateHotbarSlot(idx, null);
      }
    }

    // Toggle Chat with 'T' or '/'
    if (e.key.toLowerCase() === "t" || e.key === "/") {
      e.preventDefault();
      toggleChat(true);
    }

    // Escape closes modals
    if (e.key === "Escape") {
      toggleChat(false);
    }
  });

  // -------------------------------------------------------------
  // 5. Warp Buttons in Content (Teleport with Ender Pearl / Portal)
  // -------------------------------------------------------------
  document.querySelectorAll("[data-teleport-target]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetId = btn.getAttribute("data-teleport-target");
      const targetEl = document.getElementById(targetId);
      const isPortal = btn.classList.contains("nether-style");

      if (isPortal) {
        const biome = btn.getAttribute("data-biome") || "nether";
        triggerNetherPortal(biome, targetId);
      } else {
        const rect = btn.getBoundingClientRect();
        throwEnderPearl(rect.left + rect.width / 2, rect.top + rect.height / 2, targetEl);
      }
    });
  });

  // -------------------------------------------------------------
  // 6. Sound Toggle & Audio Feedback
  // -------------------------------------------------------------
  const soundToggleBtn = document.getElementById("sound-toggle-btn");
  const soundStatusText = document.getElementById("sound-status-text");

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      const enabled = window.soundEngine.toggleSound();
      soundStatusText.textContent = enabled ? "SFX: ON" : "SFX: OFF";
      soundToggleBtn.style.opacity = enabled ? "1" : "0.6";
    });
  }

  // Generic Button Click Sounds
  document.querySelectorAll(".mc-btn, .hud-btn, .cmd-chip, .contact-card").forEach((el) => {
    el.addEventListener("click", () => {
      window.soundEngine.playClick();
    });
  });

  // Player Hearts damage/hurt Easter Egg
  document.querySelectorAll(".hearts-container .hud-icon").forEach((heart) => {
    heart.addEventListener("click", () => {
      window.soundEngine.playOof();
      heart.style.transform = "scale(0.8) rotate(15deg)";
      heart.style.filter = "grayscale(100%)";
      setTimeout(() => {
        heart.style.transform = "";
        heart.style.filter = "";
      }, 500);
    });
  });

  // -------------------------------------------------------------
  // 7. Interactive Server Console / CLI Simulator
  // -------------------------------------------------------------
  const consoleOutput = document.getElementById("server-console-output");
  const consoleInput = document.getElementById("console-user-input");

  function appendConsoleLine(text, type = "normal") {
    if (!consoleOutput) return;
    const line = document.createElement("div");
    line.className = `console-line ${type}`;
    line.innerHTML = text;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  function handleConsoleCommand(cmd) {
    const raw = cmd.trim();
    if (!raw) return;

    appendConsoleLine(`<span class="prefix">kanav@minecraft-server:~$</span> ${raw}`);
    const lower = raw.toLowerCase();

    if (lower === "help") {
      appendConsoleLine("Available commands:", "info");
      appendConsoleLine("  - <b>skills</b> : List core technical skills & proficiency", "info");
      appendConsoleLine("  - <b>tps</b>    : Check Minecraft server performance metrics", "info");
      appendConsoleLine("  - <b>status</b> : Show Kanav's player stats and mission", "info");
      appendConsoleLine("  - <b>git</b>    : Inspect Git workflow and commit streak", "info");
      appendConsoleLine("  - <b>warp [overworld|nether|end]</b> : Dimension teleport", "info");
      appendConsoleLine("  - <b>clear</b>  : Clear console logs", "info");
    } else if (lower === "skills") {
      appendConsoleLine("[SKILLS LOADED] Git, CLI Automation, Hardware Systems, Minecraft Server Architecture, AI/ML Models", "success");
    } else if (lower === "tps") {
      appendConsoleLine("[SERVER TPS] 20.0 / 20.0 (Memory: 3.2GB / 8GB allocated) - Zero tick lag!", "success");
    } else if (lower === "status") {
      appendConsoleLine("[PLAYER] Kanav (Age 18) | Level 18 ML Engineer | Passion: AI, High Performance Systems & Robotics", "info");
    } else if (lower === "git") {
      appendConsoleLine("On branch <b>main</b><br>Your branch is up to date with 'origin/main'.<br>Working tree clean. 100+ commits pushed.", "success");
    } else if (lower.startsWith("warp ")) {
      const dim = lower.split(" ")[1];
      if (["overworld", "nether", "end"].includes(dim)) {
        const targetMap = { overworld: "about", nether: "achievements", end: "hobbies" };
        triggerNetherPortal(dim, targetMap[dim]);
        appendConsoleLine(`[PORTAL] Teleporting player to dimension: ${dim}`, "success");
      } else {
        appendConsoleLine(`Unknown dimension: ${dim}. Choose overworld, nether, or end.`, "error");
      }
    } else if (lower === "clear") {
      consoleOutput.innerHTML = "";
      return;
    } else {
      appendConsoleLine(`bash: command not found: ${raw}. Type 'help' for command list.`, "error");
    }

    window.soundEngine.playClick();
  }

  if (consoleInput) {
    consoleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleConsoleCommand(consoleInput.value);
        consoleInput.value = "";
      }
    });
  }

  document.querySelectorAll(".cmd-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const cmd = chip.getAttribute("data-cmd");
      if (consoleInput) {
        consoleInput.value = cmd;
        handleConsoleCommand(cmd);
        consoleInput.value = "";
      }
    });
  });

  // -------------------------------------------------------------
  // 8. Interactive AI / ML Neural Visualizer & Weight Matrix
  // -------------------------------------------------------------
  const sliders = document.querySelectorAll(".weight-slider");
  const predResult = document.getElementById("ai-prediction-text");
  const predBarFill = document.getElementById("ai-pred-bar");

  function updateAIPrediction() {
    let totalScore = 0;
    sliders.forEach((slider) => {
      const val = parseInt(slider.value, 10);
      const valDisplay = slider.parentElement.querySelector(".weight-val");
      if (valDisplay) valDisplay.textContent = `${val}%`;
      totalScore += val;
    });

    const avg = Math.round(totalScore / sliders.length);
    if (predBarFill) {
      predBarFill.style.width = `${avg}%`;
    }

    if (predResult) {
      if (avg >= 85) {
        predResult.textContent = `Autonomous AI Agent Architect (${avg}% Match)`;
        predResult.style.color = "#55ff55";
      } else if (avg >= 65) {
        predResult.textContent = `Applied ML & Systems Specialist (${avg}% Match)`;
        predResult.style.color = "#55ffff";
      } else {
        predResult.textContent = `Full-Stack Tech Explorer (${avg}% Match)`;
        predResult.style.color = "#ffff55";
      }
    }
  }

  sliders.forEach((s) => s.addEventListener("input", updateAIPrediction));
  updateAIPrediction();

  // -------------------------------------------------------------
  // 9. Minecraft Chat Modal ('T' hotkey)
  // -------------------------------------------------------------
  const chatModal = document.getElementById("chat-modal");
  const chatInput = document.getElementById("chat-text-input");
  const chatHistory = document.getElementById("chat-history-content");
  const chatToggleBtn = document.getElementById("chat-toggle-btn");

  function toggleChat(forceOpen) {
    if (!chatModal) return;
    const shouldOpen = forceOpen !== undefined ? forceOpen : !chatModal.classList.contains("chat-open");
    if (shouldOpen) {
      chatModal.classList.add("chat-open");
      if (chatInput) chatInput.focus();
    } else {
      chatModal.classList.remove("chat-open");
    }
  }

  if (chatToggleBtn) {
    chatToggleBtn.addEventListener("click", () => toggleChat());
  }

  function addChatMessage(sender, text, isSystem = false) {
    if (!chatHistory) return;
    const msg = document.createElement("div");
    msg.className = `chat-msg ${isSystem ? "system" : ""}`;
    msg.innerHTML = `<span class="sender">&lt;${sender}&gt;</span> ${text}`;
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const text = chatInput.value.trim();
        if (text) {
          addChatMessage("You", text);
          chatInput.value = "";
          processChatCommand(text);
        }
      }
    });
  }

  function processChatCommand(msg) {
    if (msg.startsWith("/")) {
      const parts = msg.slice(1).split(" ");
      const cmd = parts[0].toLowerCase();
      if (cmd === "help") {
        addChatMessage("Server", "Commands: /teleport [overworld|nether|end], /stats, /contact, /clear", true);
      } else if (cmd === "teleport" || cmd === "tp") {
        const dim = parts[1] || "nether";
        const map = { overworld: "about", nether: "achievements", end: "hobbies" };
        if (map[dim]) {
          triggerNetherPortal(dim, map[dim]);
          addChatMessage("Server", `Teleported to ${dim}`, true);
        } else {
          addChatMessage("Server", `Unknown realm: ${dim}. Try: overworld, nether, end`, true);
        }
      } else if (cmd === "stats") {
        addChatMessage("Kanav", "18 yrs old | Passion: AI/ML | TT State Rank | Counter-Strike Finalist | Robot Builder", true);
      } else if (cmd === "contact") {
        const contactSection = document.getElementById("contact");
        if (contactSection) {
          throwEnderPearl(window.innerWidth / 2, window.innerHeight - 80, contactSection);
        }
      } else {
        addChatMessage("Server", `Unknown command '${cmd}'. Type /help for help.`, true);
      }
    } else {
      setTimeout(() => {
        addChatMessage("Kanav", "Thanks for reaching out! Check the Ender Chest at the bottom to connect with me!");
      }, 600);
    }
  }

  // -------------------------------------------------------------
  // 10. Copy /msg command to clipboard
  // -------------------------------------------------------------
  const copyBtn = document.getElementById("copy-cmd-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const textToCopy = '/msg Kanav "Hey! Saw your portfolio, let\'s connect!"';
      navigator.clipboard.writeText(textToCopy).then(() => {
        const oldText = copyBtn.textContent;
        copyBtn.textContent = "COPIED!";
        window.soundEngine.playDing();
        setTimeout(() => {
          copyBtn.textContent = oldText;
        }, 1500);
      });
    });
  }
});

