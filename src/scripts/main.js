import "../styles/main.css";
import { initCartDrawer } from "./cart-drawer.js";
import { initStickyAtc } from "./sticky-atc.js";
import { initQuickView } from "./quick-view.js";
import { initProduct } from "./product.js";
import { initModal } from "./ui/modal.js";
import { initAccordion } from "./ui/accordion.js";
import { initPredictiveSearch } from "./predictive-search.js";

document.addEventListener("DOMContentLoaded", () => {
  initCartDrawer();
  initStickyAtc();
  initQuickView();
  initProduct();
  initModal();
  initAccordion();
  initPredictiveSearch();
});
