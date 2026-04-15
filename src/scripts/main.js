import "../styles/main.css";

import { initCartDrawer } from "./cart-drawer.js";
import { initCartUpsell } from "./cart-upsell.js";
import { initStickyAtc } from "./sticky-atc.js";
import { initQuickView } from "./quick-view.js";
import { initProduct } from "./product.js";
import { initModal } from "./ui/modal.js";
import { initAccordion } from "./ui/accordion.js";
import { initPredictiveSearch } from "./predictive-search.js";
import { initCollection } from "./filters.js";
import { initProductRecommendations } from "./product-recommendations.js";
import { initHeader } from "./header.js";
import { initBundle } from "./bundle.js";

document.addEventListener("DOMContentLoaded", () => {
  const template = document.body.dataset.template;

  // Global — needed on every page
  initCartDrawer();
  initCartUpsell();
  initHeader();
  initModal();
  initAccordion();
  initPredictiveSearch();

  // Product pages only
  if (template === "product") {
    initProduct();
    initStickyAtc();
    initProductRecommendations();
    initBundle();
  }

  // Collection and search pages
  if (template === "collection" || template === "search") {
    initCollection();
  }

  // Pages with product cards (quick view trigger)
  if (
    template === "index" ||
    template === "collection" ||
    template === "search"
  ) {
    initQuickView();
  }

  document.querySelectorAll("[data-date-min-today]").forEach((el) => {
    el.min = new Date().toISOString().split("T")[0];
  });
});
