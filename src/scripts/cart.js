export function initCart() {
  const cartForm = document.querySelector('[data-cart-form]')
  if (!cartForm) return

  cartForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(cartForm)
    await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData))
    })
  })
}
