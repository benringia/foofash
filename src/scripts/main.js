import "../styles/main.css";
import { initCart } from "./cart.js";
import { initProduct } from "./product.js";
import { initModal } from "./ui/modal.js";
import { initAccordion } from "./ui/accordion.js";

document.addEventListener("DOMContentLoaded", () => {
  initCart();
  initProduct();
  initModal();
  initAccordion();
});
