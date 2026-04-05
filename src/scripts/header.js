export function initHeader() {
  initMegaMenu();
  initMobileDrawer();
  initMobileAccordion();
}

function initMegaMenu() {
  const header = document.querySelector(".site-header");
  const panels = document.querySelectorAll("[data-mega-panel]");

  const positionPanels = () => {
    const top = header ? header.offsetHeight : 0;
    panels.forEach((panel) => {
      panel.style.top = `${top}px`;
    });
  };
  positionPanels();
  window.addEventListener("resize", positionPanels);

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

    container.addEventListener("mouseenter", () => {
      cancelClose();
      openPanel(trigger, panel);
    });
    container.addEventListener("mouseleave", scheduleClose);

    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("mouseleave", scheduleClose);

    trigger.addEventListener("focus", () => openPanel(trigger, panel));

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

function initMobileDrawer() {
  // Implemented in Task 6
}

function initMobileAccordion() {
  // Implemented in Task 6
}
