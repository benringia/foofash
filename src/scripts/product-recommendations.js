export function initProductRecommendations() {
  const section = document.querySelector("[data-product-recommendations]");
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      loadRecommendations(section);
    },
    { rootMargin: "200px" },
  );
  observer.observe(section);
}

function loadRecommendations(section) {
  const { productId, url, limit = 4 } = section.dataset;
  fetch(
    `${url}?section_id=product-recommendations&product_id=${productId}&limit=${limit}`,
  )
    .then((res) => (res.ok ? res.text() : Promise.reject()))
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const inner = doc.querySelector("[data-product-recommendations]");
      if (inner?.children.length) {
        section.innerHTML = inner.innerHTML;
      } else {
        section.closest("section")?.remove();
      }
    })
    .catch(() => section.closest("section")?.remove());
}
