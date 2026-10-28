// Minecraft Portfolio Engine - Kanav (app.js)
// Complete with Authentic Obsidian Nether Portal, Cosmic End Portal, Scroll Lock & Advancements

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------
  // 1. Scroll Locking Mechanism (Guarantees zero scroll during warps)
  // -------------------------------------------------------------
  let isScrollLocked = false;

  function preventDefaultWheel(e) {
    if (isScrollLocked) e.preventDefault();
  }
  function preventDefaultTouch(e) {
    if (isScrollLocked) e.preventDefault();
  }
  function preventDefaultKeys(e) {
    if (!isScrollLocked) return;
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) {
      e.preventDefault();
    }
  }

  function lockScroll() {
    isScrollLocked = true;
    document.documentElement.classList.add("mc-scroll-locked");
    document.body.classList.add("mc-scroll-locked");
    window.addEventListener("wheel", preventDefaultWheel, { passive: false });
    window.addEventListener("touchmove", preventDefaultTouch, { passive: false });
    window.addEventListener("keydown", preventDefaultKeys, { passive: false });
  }

  function unlockScroll() {
    isScrollLocked = false;
    document.documentElement.classList.remove("mc-scroll-locked");
    document.body.classList.remove("mc-scroll-locked");
    window.removeEventListener("wheel", preventDefaultWheel);
    window.removeEventListener("touchmove", preventDefaultTouch);
    window.removeEventListener("keydown", preventDefaultKeys);
  }

  // -------------------------------------------------------------
  // 2. Minecraft Advancement Toast System
  // -------------------------------------------------------------
  const toastEl = document.getElementById("advancement-toast");
  const toastIcon = document.getElementById("advancement-icon");
  const toastLabel = document.getElementById("advancement-label");
  const toastTitle = document.getElementById("advancement-title");
  let toastTimer = null;

  function showAdvancement(icon, title, label = "ADVANCEMENT MADE!") {
    if (!toastEl) return;
    clearTimeout(toastTimer);

    toastIcon.textContent = icon;
    toastLabel.textContent = label;
    toastTitle.textContent = title;

    toastEl.classList.add("show-advancement");
    if (window.soundEngine && window.soundEngine.playAdvancement) {
      window.soundEngine.playAdvancement();
    }

    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show-advancement");
    }, 4000);
  }

  // -------------------------------------------------------------
  // 3. Minecraft Title Screen Overlay (/title effect)
  // -------------------------------------------------------------
  const titleHud = document.getElementById("minecraft-title-hud");
  const titleMain = document.getElementById("mc-title-main");
  const titleSub = document.getElementById("mc-title-sub");
  let titleTimer = null;

  function showMinecraftTitle(mainText, subText, colorHex) {
    if (!titleHud) return;
    clearTimeout(titleTimer);

    titleMain.textContent = mainText;
    titleMain.style.color = colorHex;
    titleSub.textContent = subText;

    titleHud.classList.add("title-active");

    titleTimer = setTimeout(() => {
      titleHud.classList.remove("title-active");
    }, 2200);
  }

  // -------------------------------------------------------------
  // 4. Ambient Particle System (Canvas)
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
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -Math.random() * 2.8 - 1.0;
        this.color = Math.random() > 0.4 ? "rgba(255, 85, 0, 0.85)" : "rgba(255, 215, 0, 0.75)";
        this.alpha = Math.random() * 0.85 + 0.2;
      } else {
        // The End
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.color = Math.random() > 0.5 ? "rgba(213, 104, 255, 0.75)" : "rgba(85, 255, 255, 0.65)";
        this.alpha = Math.random() * 0.75 + 0.25;
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

  for (let i = 0; i < 70; i++) {
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
  // 5. Ender Pearl Throw & Flight FX Canvas
  // -------------------------------------------------------------
  const fxCanvas = document.getElementById("pearl-fx-canvas");
  const fxCtx = fxCanvas.getContext("2d");
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  });

  function throwEnderPearl(startX, startY, targetEl, onComplete) {
    if (!targetEl) return;
    lockScroll(); // Lock scroll during teleport

    const targetRect = targetEl.getBoundingClientRect();
    const destX = targetRect.left + targetRect.width / 2;
    const destY = targetRect.top + 80;

    window.soundEngine.playPearlThrow();

    const totalDuration = 550;
    const startTime = performance.now();
    const pearlTrail = [];
    const peakHeight = Math.min(startY, destY) - 180;

    function renderPearlFlight(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      const p0 = { x: startX, y: startY };
      const p1 = { x: (startX + destX) / 2, y: peakHeight };
      const p2 = { x: destX, y: destY };

      const t = progress;
      const curX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const curY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

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

      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

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
        triggerPearlImpact(destX, destY, targetEl, onComplete);
      }
    }

    requestAnimationFrame(renderPearlFlight);
  }

  function triggerPearlImpact(x, y, targetEl, onComplete) {
    window.soundEngine.playPearlTeleport();

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

    // Flash & Camera Shake
    const flashEl = document.getElementById("teleport-flash");
    flashEl.classList.add("flash-active");
    document.body.classList.add("camera-shake");

    setTimeout(() => {
      flashEl.classList.remove("flash-active");
    }, 200);

    setTimeout(() => {
      document.body.classList.remove("camera-shake");
    }, 350);

    // Scroll to target and unlock
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      unlockScroll();
      if (onComplete) onComplete();
    }, 450);
  }

  // -------------------------------------------------------------
  // 6. Realistic Fullscreen Obsidian Nether Portal Teleportation
  // -------------------------------------------------------------
  const netherPortalOverlay = document.getElementById("nether-portal-overlay");
  const bgTextureLayer = document.getElementById("mc-bg-texture-layer");
  const biomeText = document.getElementById("current-biome-text");

  function triggerNetherPortal(targetBiome = "nether", targetSectionId = "achievements") {
    lockScroll(); // Disable all user scrolling until animation is done!
    window.soundEngine.playPortalWarp();

    netherPortalOverlay.classList.add("portal-active");

    setTimeout(() => {
      setBiome(targetBiome, false, true);
      showAdvancement("🔥", "We Need to Go Deeper");

      const targetEl = document.getElementById(targetSectionId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "auto", block: "start" });
      }

      setTimeout(() => {
        netherPortalOverlay.classList.remove("portal-active");
        window.soundEngine.playDing();
        unlockScroll(); // Finished! Unlock scroll
      }, 700);
    }, 1200);
  }

  // -------------------------------------------------------------
  // 7. Realistic Fullscreen End Portal Teleportation
  // -------------------------------------------------------------
  const endPortalOverlay = document.getElementById("end-portal-overlay");

  function triggerEndPortal(targetSectionId = "hobbies") {
    lockScroll(); // Disable user scrolling
    window.soundEngine.playPearlThrow();

    endPortalOverlay.classList.add("end-portal-active");

    setTimeout(() => {
      window.soundEngine.playPearlTeleport();
      setBiome("end", false, true);
      showAdvancement("👁️", "The End?");

      const targetEl = document.getElementById(targetSectionId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "auto", block: "start" });
      }

      setTimeout(() => {
        endPortalOverlay.classList.remove("end-portal-active");
        window.soundEngine.playDing();
        unlockScroll(); // Finished! Unlock scroll
      }, 700);
    }, 1200);
  }

  function setBiome(biome, triggerSound = true, showTitle = true) {
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
      if (showTitle) showMinecraftTitle("THE NETHER", "Entering Nether Fortress", "#ff5555");
    } else if (biome === "end") {
      if (triggerSound) window.soundEngine.playPearlTeleport();
      if (showTitle) showMinecraftTitle("THE END", "Entering Celestial Void", "#d568ff");
    } else {
      if (triggerSound) window.soundEngine.playDing();
      if (showTitle) showMinecraftTitle("THE OVERWORLD", "Plains Base Camp", "#55ff55");
    }
  }

  // -------------------------------------------------------------
  // 8. Automatic Scroll-Triggered Gateway Interception & Scroll Lock
  // -------------------------------------------------------------
  const trackedSections = [
    { id: "hero", biome: "overworld", slotIndex: 0 },
    { id: "about", biome: "overworld", slotIndex: 0 },
    { id: "experience", biome: "overworld", slotIndex: 1 },
    { id: "nether-gateway", biome: "nether", isNetherGateway: true, slotIndex: 2 },
    { id: "achievements", biome: "nether", slotIndex: 2 },
    { id: "end-gateway", biome: "end", isEndGateway: true, slotIndex: 3 },
    { id: "hobbies", biome: "end", slotIndex: 3 },
    { id: "contact", biome: "overworld", slotIndex: 7 }
  ];

  let lastScrollWarpTime = 0;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      if (isScrollLocked) return;

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const sectionId = entry.target.id;
        const config = trackedSections.find((s) => s.id === sectionId);
        if (!config) return;

        // Hotbar Slot Sync
        if (config.slotIndex !== undefined) {
          hotbarSlots.forEach((s) => s.classList.remove("active"));
          if (hotbarSlots[config.slotIndex]) {
            hotbarSlots[config.slotIndex].classList.add("active");
          }
        }

        const now = performance.now();
        if (config.biome !== currentBiome && now - lastScrollWarpTime > 2000) {
          lastScrollWarpTime = now;

          if (config.isNetherGateway || (config.biome === "nether" && currentBiome === "overworld")) {
            triggerNetherPortal("nether", "achievements");
          } else if (config.isEndGateway || (config.biome === "end" && currentBiome === "nether")) {
            triggerEndPortal("hobbies");
          } else if (config.biome === "overworld") {
            setBiome("overworld", true, true);
          }
        }
      });
    },
    { threshold: 0.25 }
  );

  trackedSections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) sectionObserver.observe(el);
  });

  // -------------------------------------------------------------
  // 9. Hotbar Navigation (1-9 & Click) + Item Name Tooltip HUD
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
    }, 2000);
  }

  function activateHotbarSlot(slotIndex, originEvent) {
    if (isScrollLocked) return;
    hotbarSlots.forEach((s) => s.classList.remove("active"));
    const selectedSlot = hotbarSlots[slotIndex];
    if (!selectedSlot) return;

    selectedSlot.classList.add("active");
    const targetId = selectedSlot.getAttribute("data-target");
    const warpType = selectedSlot.getAttribute("data-warp") || "pearl";
    const slotName = selectedSlot.querySelector(".tooltip-title")?.textContent || "Selected Item";
    showItemName(slotName);

    const targetEl = document.getElementById(targetId);

    if (warpType === "portal") {
      triggerNetherPortal("nether", targetId);
    } else if (warpType === "endportal") {
      triggerEndPortal(targetId);
    } else {
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
    slot.addEventListener("mouseenter", () => {
      const slotName = slot.querySelector(".tooltip-title")?.textContent;
      if (slotName) showItemName(slotName);
    });
  });

  // -------------------------------------------------------------
  // 10. Minecraft Splash Text Click Interaction
  // -------------------------------------------------------------
  const splashQuotes = [
    "Also try AI & ML!",
    "100% Redstone Compatible!",
    "20.0 TPS Zero Lag!",
    "Never dig straight down!",
    "Delhi State TT Champion!",
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
  // 11. Minecraft Inventory GUI Modal ('E' key or Inventory Button)
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
  // 12. Keyboard Controls (1-9, E, T, Esc)
  // -------------------------------------------------------------
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      if (e.key === "Escape") toggleChat(false);
      return;
    }

    if (e.key >= "1" && e.key <= "9") {
      const idx = parseInt(e.key) - 1;
      if (idx < hotbarSlots.length) {
        activateHotbarSlot(idx, null);
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
  // 13. Gateway Buttons & Content Triggers
  // -------------------------------------------------------------
  document.querySelectorAll("[data-teleport-target]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (isScrollLocked) return;
      const targetId = btn.getAttribute("data-teleport-target");
      const warpType = btn.getAttribute("data-warp");

      if (warpType === "portal") {
        triggerNetherPortal("nether", targetId);
      } else if (warpType === "endportal") {
        triggerEndPortal(targetId);
      } else {
        const rect = btn.getBoundingClientRect();
        const targetEl = document.getElementById(targetId);
        throwEnderPearl(rect.left + rect.width / 2, rect.top + rect.height / 2, targetEl);
      }
    });
  });

  // Sound Toggle Button
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
  // 14. Server Console Simulator
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
        triggerNetherPortal("nether", "achievements");
      } else if (dim === "end") {
        triggerEndPortal("hobbies");
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
  // 15. AI / ML Neural Visualizer & Weight Matrix
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
  // 16. Chat Modal ('T' hotkey)
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
        if (dim === "nether") triggerNetherPortal("nether", "achievements");
        else if (dim === "end") triggerEndPortal("hobbies");
        else {
          setBiome("overworld", true, true);
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
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
