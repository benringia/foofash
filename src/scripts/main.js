import "../styles/main.css";
import { initCartDrawer } from "./cart-drawer.js";
import { initProduct } from "./product.js";
import { initModal } from "./ui/modal.js";
import { initAccordion } from "./ui/accordion.js";

document.addEventListener("DOMContentLoaded", () => {
  initCartDrawer();
  initProduct();
  initModal();
  initAccordion();
});
