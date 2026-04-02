export function initAccordion() {
  const accordions = document.querySelectorAll("[data-accordion]");
  if (!accordions.length) return;

  accordions.forEach((accordion) => {
    const trigger = accordion.querySelector("[data-accordion-trigger]");
    const panel = accordion.querySelector("[data-accordion-panel]");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isExpanded));
      panel.hidden = isExpanded;
    });
  });
}
