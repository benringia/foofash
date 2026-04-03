export async function getCart() {
  const res = await fetch("/cart.js");
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(items) {
  const res = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

export async function updateItem(key, quantity) {
  const res = await fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: key, quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart");
  return res.json();
}

export async function removeItem(key) {
  return updateItem(key, 0);
}
