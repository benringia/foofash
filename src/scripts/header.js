export function initHeader() {
  initMegaMenu();
  initMobileDrawer();
  initMobileAccordion();
}

// ─── Mega Menu ────────────────────────────────────────────────────────────────

function initMegaMenu() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const panels = document.querySelectorAll("[data-mega-panel]");

  const positionPanels = () => {
    const top = header.offsetHeight;
    panels.forEach((panel) => {
      panel.style.top = `${top}px`;
    });
  };

  positionPanels();

  // ResizeObserver avoids window resize listener leaks and catches header
  // height changes that don't involve a viewport resize (e.g. promo banners).
  const headerObserver = new ResizeObserver(positionPanels);
  headerObserver.observe(header);

  const openPanel = (trigger, panel) => {
    panel.classList.remove("opacity-0", "pointer-events-none");
    panel.classList.add("opacity-100", "pointer-events-auto");
    panel.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    const chevron = trigger.querySelector("[data-mega-chevron]");
    if (chevron) chevron.classList.add("rotate-180");
  };

  const closePanel = (trigger, panel) => {
    panel.classList.remove("opacity-100", "pointer-events-auto");
    panel.classList.add("opacity-0", "pointer-events-none");
    panel.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
    const chevron = trigger.querySelector("[data-mega-chevron]");
    if (chevron) chevron.classList.remove("rotate-180");
  };

  document.querySelectorAll("[data-mega-menu]").forEach((container) => {
    const trigger = container.querySelector("[data-mega-trigger]");
    if (!trigger) return;
    const panelId = trigger.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    if (!panel) return;

    let closeTimer;

    const scheduleClose = () => {
      closeTimer = setTimeout(() => closePanel(trigger, panel), 100);
    };
    const cancelClose = () => clearTimeout(closeTimer);

    // Hover — 100ms close delay lets cursor cross the gap to the panel
    container.addEventListener("mouseenter", () => {
      cancelClose();
      openPanel(trigger, panel);
    });
    container.addEventListener("mouseleave", scheduleClose);
    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("mouseleave", scheduleClose);

    // Keyboard — focus opens panel; guard prevents Escape re-opening it
    trigger.addEventListener("focus", () => {
      if (trigger.getAttribute("aria-expanded") === "true") return;
      openPanel(trigger, panel);
    });

    // Cancel close timer when focus enters panel via keyboard Tab
    panel.addEventListener("focusin", cancelClose);

    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closePanel(trigger, panel);
        trigger.focus();
      }
    });

    panel.addEventListener("focusout", (e) => {
      if (
        !panel.contains(e.relatedTarget) &&
        !container.contains(e.relatedTarget)
      ) {
        closePanel(trigger, panel);
      }
    });
  });
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function initMobileDrawer() {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const drawer = document.querySelector("[data-mobile-drawer]");
  const closeBtn = document.querySelector("[data-mobile-close]");
  const backdrop = document.querySelector("[data-mobile-backdrop]");

  if (!toggle || !drawer || !backdrop) return;

  const focusableSelectors =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const openDrawer = () => {
    drawer.classList.remove("-translate-x-full");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.classList.remove("hidden");
    toggle.setAttribute("aria-expanded", "true");
    const firstFocusable = drawer.querySelector(focusableSelectors);
    if (firstFocusable) firstFocusable.focus();
  };

  const closeDrawer = () => {
    drawer.classList.add("-translate-x-full");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  closeBtn?.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeDrawer();
    }
  });

  // Focus trap — cycle Tab/Shift+Tab within the drawer while it is open
  drawer.addEventListener("keydown", (e) => {
    if (drawer.getAttribute("aria-hidden") === "true") return;
    if (e.key !== "Tab") return;
    const focusable = [...drawer.querySelectorAll(focusableSelectors)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// ─── Mobile Accordion ─────────────────────────────────────────────────────────

function initMobileAccordion() {
  document.querySelectorAll("[data-mobile-accordion]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panelId = trigger.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      // Collapse all sibling accordions in the drawer
      const drawer = trigger.closest("[data-mobile-drawer]");
      if (drawer) {
        drawer.querySelectorAll("[data-mobile-accordion]").forEach((other) => {
          if (other === trigger) return;
          const otherId = other.getAttribute("aria-controls");
          const otherPanel = document.getElementById(otherId);
          other.setAttribute("aria-expanded", "false");
          const otherChevron = other.querySelector("[data-accordion-chevron]");
          if (otherChevron) otherChevron.classList.remove("rotate-180");
          otherPanel?.classList.add("hidden");
        });
      }

      // Toggle this accordion
      trigger.setAttribute("aria-expanded", String(!isExpanded));
      const chevron = trigger.querySelector("[data-accordion-chevron]");
      if (chevron) chevron.classList.toggle("rotate-180", !isExpanded);
      panel.classList.toggle("hidden", isExpanded);
    });
  });
}
