// Kanav's Portfolio Engine (app.js)
// Smooth, responsive, non-blocking dimension switches with ambient particles & audio

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
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -Math.random() * 0.7 - 0.2;
        this.color = Math.random() > 0.5 ? "rgba(85, 255, 85, 0.55)" : "rgba(85, 255, 255, 0.45)";
        this.alpha = Math.random() * 0.5 + 0.2;
      } else if (currentBiome === "nether") {
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = -Math.random() * 2.2 - 0.8;
        this.color = Math.random() > 0.4 ? "rgba(255, 85, 0, 0.75)" : "rgba(255, 200, 0, 0.65)";
        this.alpha = Math.random() * 0.7 + 0.2;
      } else {
        // The End
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.color = Math.random() > 0.5 ? "rgba(213, 104, 255, 0.7)" : "rgba(85, 255, 255, 0.6)";
        this.alpha = Math.random() * 0.6 + 0.25;
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

  for (let i = 0; i < 55; i++) {
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
  // 2. Sleek Dimension Transition Pill Notification
  // -------------------------------------------------------------
  const pillNotice = document.getElementById("dimension-pill-notice");
  const pillIcon = document.getElementById("dimension-pill-icon");
  const pillText = document.getElementById("dimension-pill-text");
  let pillTimer = null;

  function showDimensionPill(icon, text) {
    if (!pillNotice) return;
    clearTimeout(pillTimer);
    pillIcon.textContent = icon;
    pillText.textContent = text;
    pillNotice.classList.add("pill-active");
    pillTimer = setTimeout(() => {
      pillNotice.classList.remove("pill-active");
    }, 2000);
  }

  // -------------------------------------------------------------
  // 3. Biome / Dimension Management (Smooth Color & Atmosphere Shift)
  // -------------------------------------------------------------
  const bgTextureLayer = document.getElementById("mc-bg-texture-layer");
  const biomeText = document.getElementById("current-biome-text");
  const teleportFlash = document.getElementById("teleport-flash");

  function setBiome(biome, triggerSound = true, showNotice = true) {
    if (currentBiome === biome) return;
    currentBiome = biome;

    document.body.classList.remove("biome-overworld", "biome-nether", "biome-end");
    document.body.classList.add(`biome-${biome}`);

    if (bgTextureLayer) {
      bgTextureLayer.classList.remove("mc-dirt-bg", "mc-cobble-bg", "mc-netherrack-bg", "mc-endstone-bg");
      if (biome === "nether") {
        bgTextureLayer.classList.add("mc-netherrack-bg");
      } else if (biome === "end") {
        bgTextureLayer.classList.add("mc-endstone-bg");
      } else {
        bgTextureLayer.classList.add("mc-dirt-bg");
      }
    }

    if (biomeText) {
      biomeText.textContent = biome.charAt(0).toUpperCase() + biome.slice(1);
    }

    if (biome === "nether") {
      if (triggerSound) window.soundEngine.playPortalWarp();
      if (showNotice) showDimensionPill("🔥", "Entered The Nether Fortress");
    } else if (biome === "end") {
      if (triggerSound) window.soundEngine.playPearlTeleport();
      if (showNotice) showDimensionPill("🌌", "Entered The End Celestial Void");
    } else {
      if (triggerSound) window.soundEngine.playDing();
      if (showNotice) showDimensionPill("🌍", "Entered The Overworld Base");
    }
  }

  // -------------------------------------------------------------
  // 4. Quick Ender Pearl / Warp FX (Non-blocking Particle Streak)
  // -------------------------------------------------------------
  const fxCanvas = document.getElementById("pearl-fx-canvas");
  const fxCtx = fxCanvas.getContext("2d");
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  });

  function playWarpEffect(targetEl, soundType = "pearl") {
    if (soundType === "portal") {
      window.soundEngine.playPortalWarp();
    } else {
      window.soundEngine.playPearlTeleport();
    }

    // Flash screen subtly
    if (teleportFlash) {
      teleportFlash.classList.add("flash-active");
      setTimeout(() => {
        teleportFlash.classList.remove("flash-active");
      }, 160);
    }

    // Smooth native scroll
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Burst particles at center
    const burstParticles = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      burstParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.floor(Math.random() * 4) + 2,
        color: soundType === "portal" ? "#ff5555" : "#55ffff",
        alpha: 1.0,
        decay: 0.04
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
  }

  // -------------------------------------------------------------
  // 5. Natural Scroll Observer (Synchronizes Biome & Hotbar)
  // -------------------------------------------------------------
  const trackedSections = [
    { id: "hero", biome: "overworld", slotIndex: 0 },
    { id: "about", biome: "overworld", slotIndex: 0 },
    { id: "experience", biome: "overworld", slotIndex: 1 },
    { id: "achievements", biome: "nether", slotIndex: 2 },
    { id: "hobbies", biome: "end", slotIndex: 3 },
    { id: "contact", biome: "overworld", slotIndex: 7 }
  ];

  let lastBiomeShiftTime = 0;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const sectionId = entry.target.id;
        const config = trackedSections.find((s) => s.id === sectionId);
        if (!config) return;

        // Synchronize Hotbar Active Slot
        if (config.slotIndex !== undefined) {
          hotbarSlots.forEach((s) => s.classList.remove("active"));
          if (hotbarSlots[config.slotIndex]) {
            hotbarSlots[config.slotIndex].classList.add("active");
          }
        }

        // Smooth Biome Switch when crossing sections
        const now = performance.now();
        if (config.biome !== currentBiome && now - lastBiomeShiftTime > 1200) {
          lastBiomeShiftTime = now;
          setBiome(config.biome, true, true);
        }
      });
    },
    { threshold: 0.3 }
  );

  trackedSections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) sectionObserver.observe(el);
  });

  // -------------------------------------------------------------
  // 6. Hotbar Navigation (1-9 & Click) + Item Name Tooltip HUD
  // -------------------------------------------------------------
  const hotbarSlots = document.querySelectorAll(".hotbar-slot");
  const itemNameHud = document.getElementById("hotbar-item-name");
  let itemNameTimer = null;

  function showItemName(name) {
    if (!itemNameHud) return;
    clearTimeout(itemNameTimer);
    itemNameHud.textContent = name;
    itemNameHud.classList.add("item-name-show");
    itemNameTimer = setTimeout(() => {
      itemNameHud.classList.remove("item-name-show");
    }, 1800);
  }

  function activateHotbarSlot(slotIndex) {
    hotbarSlots.forEach((s) => s.classList.remove("active"));
    const selectedSlot = hotbarSlots[slotIndex];
    if (!selectedSlot) return;

    selectedSlot.classList.add("active");
    const targetId = selectedSlot.getAttribute("data-target");
    const warpType = selectedSlot.getAttribute("data-warp") || "pearl";
    const slotName = selectedSlot.querySelector(".tooltip-title")?.textContent || "Selected Item";
    showItemName(slotName);

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      playWarpEffect(targetEl, warpType === "portal" ? "portal" : "pearl");
    }
  }

  hotbarSlots.forEach((slot, index) => {
    slot.addEventListener("click", () => activateHotbarSlot(index));
    slot.addEventListener("mouseenter", () => {
      const slotName = slot.querySelector(".tooltip-title")?.textContent;
      if (slotName) showItemName(slotName);
    });
  });

  // -------------------------------------------------------------
  // 7. Interactive Warp Buttons Throughout Content
  // -------------------------------------------------------------
  document.querySelectorAll("[data-teleport-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-teleport-target");
      const warpType = btn.getAttribute("data-warp") || (btn.classList.contains("nether-style") ? "portal" : "pearl");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        playWarpEffect(targetEl, warpType);
      }
    });
  });

  // -------------------------------------------------------------
  // 8. Minecraft Splash Text Click Interaction
  // -------------------------------------------------------------
  const splashQuotes = [
    "Also try AI & ML!",
    "100% Redstone Powered!",
    "20.0 TPS Zero Lag!",
    "Never dig straight down!",
    "Delhi State TT Player!",
    "Spigot & Paper tuned!",
    "Autonomous Robotics!",
    "Beware of Creepers!",
    "Press E for Inventory!"
  ];
  let splashIdx = 0;
  const splashEl = document.getElementById("minecraft-splash");
  if (splashEl) {
    splashEl.addEventListener("click", () => {
      splashIdx = (splashIdx + 1) % splashQuotes.length;
      splashEl.textContent = splashQuotes[splashIdx];
      window.soundEngine.playClick();
    });
  }

  // -------------------------------------------------------------
  // 9. Inventory GUI Modal ('E' Key or HUD Button)
  // -------------------------------------------------------------
  const invModal = document.getElementById("inventory-modal");
  const invCloseBtn = document.getElementById("inv-close-btn");
  const invToggleBtn = document.getElementById("inv-toggle-btn");

  function toggleInventory(forceOpen) {
    if (!invModal) return;
    const shouldOpen = forceOpen !== undefined ? forceOpen : !invModal.classList.contains("inv-open");
    if (shouldOpen) {
      invModal.classList.add("inv-open");
      window.soundEngine.playChest();
    } else {
      invModal.classList.remove("inv-open");
      window.soundEngine.playClick();
    }
  }

  if (invToggleBtn) invToggleBtn.addEventListener("click", () => toggleInventory());
  if (invCloseBtn) invCloseBtn.addEventListener("click", () => toggleInventory(false));
  if (invModal) {
    invModal.addEventListener("click", (e) => {
      if (e.target === invModal) toggleInventory(false);
    });
  }

  // -------------------------------------------------------------
  // 10. Keyboard Shortcuts (1-9, E, T, Esc)
  // -------------------------------------------------------------
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      if (e.key === "Escape") toggleChat(false);
      return;
    }

    if (e.key >= "1" && e.key <= "9") {
      const idx = parseInt(e.key) - 1;
      if (idx < hotbarSlots.length) {
        activateHotbarSlot(idx);
      }
    }

    if (e.key.toLowerCase() === "e") {
      e.preventDefault();
      toggleInventory();
    }

    if (e.key.toLowerCase() === "t" || e.key === "/") {
      e.preventDefault();
      toggleChat(true);
    }

    if (e.key === "Escape") {
      toggleChat(false);
      toggleInventory(false);
    }
  });

  // -------------------------------------------------------------
  // 11. Audio Toggle & Sound Feedback
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

  document.querySelectorAll(".mc-btn, .hud-btn, .cmd-chip, .contact-card, .inv-slot-box").forEach((el) => {
    el.addEventListener("click", () => {
      window.soundEngine.playClick();
    });
  });

  // Hearts damage easter egg
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
  // 12. Server Console Simulator
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
      if (dim === "nether") {
        setBiome("nether", true, true);
        document.getElementById("achievements")?.scrollIntoView({ behavior: "smooth" });
      } else if (dim === "end") {
        setBiome("end", true, true);
        document.getElementById("hobbies")?.scrollIntoView({ behavior: "smooth" });
      } else if (dim === "overworld") {
        setBiome("overworld", true, true);
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
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
  // 13. AI / ML Neural Visualizer & Weight Matrix
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
  // 14. Chat Modal ('T' hotkey)
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

  if (chatToggleBtn) chatToggleBtn.addEventListener("click", () => toggleChat());

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
        if (dim === "nether") {
          setBiome("nether", true, true);
          document.getElementById("achievements")?.scrollIntoView({ behavior: "smooth" });
        } else if (dim === "end") {
          setBiome("end", true, true);
          document.getElementById("hobbies")?.scrollIntoView({ behavior: "smooth" });
        } else {
          setBiome("overworld", true, true);
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        }
      } else if (cmd === "stats") {
        addChatMessage("Kanav", "18 yrs old | Passion: AI/ML | TT State Rank | Counter-Strike Finalist | Robot Builder", true);
      } else if (cmd === "contact") {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      } else {
        addChatMessage("Server", `Unknown command '${cmd}'. Type /help for help.`, true);
      }
    } else {
      setTimeout(() => {
        addChatMessage("Kanav", "Thanks for checking out my portfolio! Feel free to connect via the Contact section below.");
      }, 500);
    }
  }

  // Copy command button
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
