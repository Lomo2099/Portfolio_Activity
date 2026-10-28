// Kanav's Portfolio Engine (app.js)
// Clean, accessible, and responsive navigation adhering to First-Year Portfolio Lab standards

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------
  // 1. Subtle Ambient Particles (Canvas)
  // -------------------------------------------------------------
  const ambientCanvas = document.getElementById("ambient-canvas");
  const ambientCtx = ambientCanvas.getContext("2d");

  let width = (ambientCanvas.width = window.innerWidth);
  let height = (ambientCanvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = ambientCanvas.width = window.innerWidth;
    height = ambientCanvas.height = window.innerHeight;
  });

  const particles = [];
  class AmbientParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.floor(Math.random() * 2) + 2;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -Math.random() * 0.6 - 0.2;
      this.color = Math.random() > 0.5 ? "rgba(56, 189, 248, 0.45)" : "rgba(74, 222, 128, 0.45)";
      this.alpha = Math.random() * 0.5 + 0.2;
      this.decay = Math.random() * 0.004 + 0.002;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;

      if (this.alpha <= 0 || this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
        this.y = height + 5;
      }
    }

    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    }
  }

  for (let i = 0; i < 40; i++) {
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
  // 2. Smooth Navigation & Quick Particle Flash
  // -------------------------------------------------------------
  const fxCanvas = document.getElementById("pearl-fx-canvas");
  const fxCtx = fxCanvas.getContext("2d");
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  });

  function playNavigateFX(targetEl) {
    window.soundEngine.playPearlTeleport();

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Subtle particle ripple
    const burst = [];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      burst.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3,
        color: "#38bdf8",
        alpha: 1.0
      });
    }

    function renderFX() {
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      let alive = false;
      for (let p of burst) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.05;
        if (p.alpha > 0) {
          alive = true;
          fxCtx.fillStyle = p.color;
          fxCtx.globalAlpha = p.alpha;
          fxCtx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        }
      }
      if (alive) {
        requestAnimationFrame(renderFX);
      } else {
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      }
    }
    renderFX();
  }

  // -------------------------------------------------------------
  // 3. Section Tracking (Keeps Hotbar & HUD Synchronized)
  // -------------------------------------------------------------
  const trackedSections = [
    { id: "hero", slotIndex: 0 },
    { id: "about", slotIndex: 0 },
    { id: "experience", slotIndex: 1 },
    { id: "achievements", slotIndex: 2 },
    { id: "lab", slotIndex: 3 },
    { id: "hobbies", slotIndex: 4 },
    { id: "contact", slotIndex: 5 }
  ];

  const hotbarSlots = document.querySelectorAll(".hotbar-slots .hotbar-slot");
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

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const config = trackedSections.find((s) => s.id === entry.target.id);
        if (!config || config.slotIndex === undefined) return;

        hotbarSlots.forEach((s) => s.classList.remove("active"));
        if (hotbarSlots[config.slotIndex]) {
          hotbarSlots[config.slotIndex].classList.add("active");
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
  // 4. Hotbar Slot Interaction (1-9 & Click)
  // -------------------------------------------------------------
  function selectHotbarSlot(index) {
    const slot = hotbarSlots[index];
    if (!slot) return;

    hotbarSlots.forEach((s) => s.classList.remove("active"));
    slot.classList.add("active");

    const targetId = slot.getAttribute("data-target");
    const name = slot.querySelector(".tooltip-title")?.textContent || "Selected";
    showItemName(name);

    if (targetId) {
      const targetEl = document.getElementById(targetId);
      if (targetEl) playNavigateFX(targetEl);
    }
  }

  hotbarSlots.forEach((slot, index) => {
    slot.addEventListener("click", (e) => {
      if (slot.id === "slot-inv-btn") {
        e.preventDefault();
        toggleInventory();
        return;
      }
      if (slot.id === "slot-sfx-btn") {
        e.preventDefault();
        toggleAudio();
        return;
      }
      selectHotbarSlot(index);
    });

    slot.addEventListener("mouseenter", () => {
      const name = slot.querySelector(".tooltip-title")?.textContent;
      if (name) showItemName(name);
    });
  });

  // Keyboard Navigation: 1-9 & E
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key >= "1" && e.key <= "9") {
      const idx = parseInt(e.key) - 1;
      if (idx === 6) {
        toggleInventory();
      } else if (idx === 7) {
        toggleAudio();
      } else if (idx < hotbarSlots.length) {
        selectHotbarSlot(idx);
      }
    }

    if (e.key.toLowerCase() === "e") {
      e.preventDefault();
      toggleInventory();
    }

    if (e.key === "Escape") {
      toggleInventory(false);
    }
  });

  // -------------------------------------------------------------
  // 5. SEPARATE TAB: Interactive 2x2 Crafting Workbench
  // -------------------------------------------------------------
  const craftSlot1 = document.getElementById("craft-slot-1");
  const craftSlot2 = document.getElementById("craft-slot-2");
  const craftSlot3 = document.getElementById("craft-slot-3");
  const craftSlot4 = document.getElementById("craft-slot-4");
  const craftOutput = document.getElementById("craft-output");
  const craftOutputName = document.getElementById("craft-output-name");

  const recipes = {
    ai: {
      s1: "🧠", s2: "⚡", s3: "🖥️", s4: "🏓",
      out: "🤖",
      name: "Crafted: Autonomous AI Agent"
    },
    server: {
      s1: "📜", s2: "⚙️", s3: "💻", s4: "⚡",
      out: "🚀",
      name: "Crafted: Ultra-Optimized 20.0 TPS Server"
    },
    athlete: {
      s1: "🏓", s2: "⚡", s3: "🏋️", s4: "🎯",
      out: "🏆",
      name: "Crafted: Delhi State Championship Trophy"
    }
  };

  function applyRecipe(key) {
    const r = recipes[key];
    if (!r) return;

    if (craftSlot1) craftSlot1.textContent = r.s1;
    if (craftSlot2) craftSlot2.textContent = r.s2;
    if (craftSlot3) craftSlot3.textContent = r.s3;
    if (craftSlot4) craftSlot4.textContent = r.s4;
    if (craftOutput) craftOutput.textContent = r.out;
    if (craftOutputName) craftOutputName.textContent = r.name;

    window.soundEngine.playDing();
  }

  document.querySelectorAll(".recipe-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const recipeKey = btn.getAttribute("data-recipe");
      applyRecipe(recipeKey);
    });
  });

  if (craftOutput) {
    craftOutput.addEventListener("click", () => {
      window.soundEngine.playDing();
      craftOutput.style.transform = "scale(1.25)";
      setTimeout(() => {
        craftOutput.style.transform = "";
      }, 150);
    });
  }

  // -------------------------------------------------------------
  // 6. SEPARATE TAB: Interactive Server Console (CLI Simulator)
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

    appendConsoleLine(`<span class="prefix">kanav@server-core:~$</span> ${raw}`);
    const lower = raw.toLowerCase();

    if (lower === "help") {
      appendConsoleLine("Available commands:", "info");
      appendConsoleLine("  - <b>skills</b> : List core technical skills &amp; tools", "info");
      appendConsoleLine("  - <b>tps</b>    : Check game server performance metrics", "info");
      appendConsoleLine("  - <b>status</b> : Show Kanav's focus, age, and academic goals", "info");
      appendConsoleLine("  - <b>git</b>    : Inspect git workflow details", "info");
      appendConsoleLine("  - <b>clear</b>  : Clear console terminal", "info");
    } else if (lower === "skills") {
      appendConsoleLine("[SKILLS]: Git, Shell Scripting (Zsh/Bash), Hardware Systems, Minecraft Server Dev, Machine Learning Models", "success");
    } else if (lower === "tps") {
      appendConsoleLine("[METRICS]: 20.0 / 20.0 TPS (0.0% tick drop) | JVM Memory: 4.2GB / 8GB allocated | Paper/Spigot", "success");
    } else if (lower === "status") {
      appendConsoleLine("[PROFILE]: Kanav | 18 Years Old | AI/ML Student | State Table Tennis Ranking Delhi | Robotics Competitor", "info");
    } else if (lower === "git") {
      appendConsoleLine("On branch <b>main</b><br>Everything up to date with origin/main. Working tree clean.", "success");
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
  // 7. SEPARATE TAB: AI Neural Weights Simulator
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
    if (predBarFill) predBarFill.style.width = `${avg}%`;

    if (predResult) {
      if (avg >= 85) {
        predResult.textContent = `Autonomous AI Agent Architect (${avg}% Match)`;
        predResult.style.color = "#4ade80";
      } else if (avg >= 65) {
        predResult.textContent = `Applied ML & Systems Specialist (${avg}% Match)`;
        predResult.style.color = "#38bdf8";
      } else {
        predResult.textContent = `Full-Stack Systems Explorer (${avg}% Match)`;
        predResult.style.color = "#fde047";
      }
    }
  }

  sliders.forEach((s) => s.addEventListener("input", updateAIPrediction));
  updateAIPrediction();

  // -------------------------------------------------------------
  // 8. Player Inventory Modal ('E' Key or Button)
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
  // 9. Sound Engine Toggle
  // -------------------------------------------------------------
  const soundToggleBtn = document.getElementById("sound-toggle-btn");
  const soundStatusText = document.getElementById("sound-status-text");

  function toggleAudio() {
    const enabled = window.soundEngine.toggleSound();
    if (soundStatusText) soundStatusText.textContent = enabled ? "SFX: ON" : "SFX: OFF";
    if (soundToggleBtn) soundToggleBtn.style.opacity = enabled ? "1" : "0.6";
  }

  if (soundToggleBtn) soundToggleBtn.addEventListener("click", toggleAudio);

  // Click Sound on Buttons & Chips
  document.querySelectorAll(".mc-btn, .hud-btn, .cmd-chip, .contact-card, .recipe-btn, .craft-slot").forEach((el) => {
    el.addEventListener("click", () => {
      window.soundEngine.playClick();
    });
  });

  // Hearts Easter Egg
  document.querySelectorAll(".hearts-container .hud-icon").forEach((heart) => {
    heart.addEventListener("click", () => {
      window.soundEngine.playOof();
      heart.style.transform = "scale(0.8) rotate(15deg)";
      heart.style.filter = "grayscale(100%)";
      setTimeout(() => {
        heart.style.transform = "";
        heart.style.filter = "";
      }, 450);
    });
  });

  // -------------------------------------------------------------
  // 10. Copy Direct Message Command
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

  // -------------------------------------------------------------
  // 11. Content Editing Challenge (Portfolio Quality Lab - Section 07)
  // -------------------------------------------------------------
  const bioEl = document.getElementById("about-bio-text");
  const editBioBtn = document.getElementById("edit-bio-btn");
  if (bioEl && editBioBtn) {
    const savedBio = localStorage.getItem("kanav_user_bio");
    if (savedBio) bioEl.textContent = savedBio;

    editBioBtn.addEventListener("click", () => {
      const isEditing = bioEl.isContentEditable;
      if (!isEditing) {
        bioEl.contentEditable = "true";
        bioEl.focus();
        editBioBtn.innerHTML = "<span>💾</span> <span>SAVE BIO</span>";
        editBioBtn.classList.add("btn-active-editing");
      } else {
        bioEl.contentEditable = "false";
        localStorage.setItem("kanav_user_bio", bioEl.textContent.trim());
        editBioBtn.innerHTML = "<span>✏️</span> <span>EDIT BIO</span>";
        editBioBtn.classList.remove("btn-active-editing");
        window.soundEngine.playDing();
      }
    });
  }
});
