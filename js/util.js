/* © 2021 Peter Rodrick <pete@lftlc.xyz>
 *
 * Helpers with no state and no page of their own, shared by whichever entry
 * modules need them. Nothing here touches the DOM on import.
 */

export function randNumb(num) {
  return Math.floor(Math.random() * num);
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function toggleArrayItem(array, item) {
  const i = array.indexOf(item);
  if (i === -1) {
    array.push(item);
  } else {
    array.splice(i, 1);
  }
}

/* Settings that are a choice between segmented buttons. The users of this —
 * view mode, landing mode, translation order, the library tab and the chapter
 * filter — differ only in which buttons they own, what they store, and whether
 * picking a value does anything beyond marking its button active. Tabs carry
 * aria-selected rather than aria-pressed, which is what activeAttribute is
 * for. */
export function setupChoiceSetting({
  storageKey,
  fallback,
  choices,
  apply,
  activeAttribute = "aria-pressed",
}) {
  const buttons = choices.map((choice) => ({
    value: choice.value,
    el: document.getElementById(choice.buttonId),
  }));
  /* about.html has none of these controls. */
  if (buttons.some((button) => !button.el)) return;

  let value = localStorage.getItem(storageKey);
  if (!choices.some((choice) => choice.value === value)) {
    value = fallback;
    localStorage.setItem(storageKey, value);
  }

  function render() {
    buttons.forEach((button) => {
      const isActive = button.value === value;
      button.el.classList.toggle("active", isActive);
      button.el.setAttribute(activeAttribute, isActive);
    });
    if (apply) apply(value);
  }

  function select(next) {
    value = next;
    localStorage.setItem(storageKey, value);
    render();
  }

  buttons.forEach((button) => {
    button.el.addEventListener("click", () => select(button.value));
  });

  render();

  /* Handed back so a setting can also be moved by something other than its
   * own buttons: reordering the library list flips translation order to
   * Manual. Undefined on about.html, which owns none of these controls. */
  return { set: select };
}

/* Every dialog on the page opens from a button, closes from its own close
 * button, and closes when the backdrop is clicked. Only what happens on open
 * and on close differs, so that is all a caller passes.
 *
 * A dialog fills the viewport when open, so a click whose target is the dialog
 * itself — rather than anything inside it — landed on the backdrop.
 *
 * Returns the dialog, because two of them are also closed from elsewhere: the
 * Library when a chapter is picked from it, and Search when a result is. */
export function setupModal({
  buttonId,
  modalId,
  closeButtonId,
  onOpen,
  onClose,
}) {
  const modal = document.getElementById(modalId);

  document.getElementById(buttonId).addEventListener("click", () => {
    modal.showModal();
    if (onOpen) onOpen();
  });

  document.getElementById(closeButtonId).addEventListener("click", () => {
    modal.close();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });

  if (onClose) modal.addEventListener("close", onClose);

  return modal;
}
