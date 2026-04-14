import "../styles/main.css";

console.log("Vite bundle loaded:", new Date().toISOString());
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
  initCartDrawer();
  initCartUpsell();
  initStickyAtc();
  initQuickView();
  initProduct();
  initModal();
  initAccordion();
  initPredictiveSearch();
  initCollection();
  initProductRecommendations();
  initHeader();
  initBundle();
  document.querySelectorAll("[data-date-min-today]").forEach((el) => {
    el.min = new Date().toISOString().split("T")[0];
  });
});
