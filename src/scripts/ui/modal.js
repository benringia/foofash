export function initModal() {
  const triggers = document.querySelectorAll('[data-modal-trigger]')
  if (!triggers.length) return

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.dataset.modalTrigger
      const modal = document.getElementById(targetId)
      if (!modal) return
      modal.removeAttribute('hidden')
      modal.focus()
    })
  })

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    const openModal = document.querySelector('[data-modal]:not([hidden])')
    if (openModal) openModal.setAttribute('hidden', '')
  })
}
