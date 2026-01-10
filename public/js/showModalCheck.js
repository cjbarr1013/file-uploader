window.addEventListener('load', function () {
  const modalId = document.body.dataset.showModal;
  if (!modalId) return;

  let attempts = 0;
  const maxAttempts = 20; // 2 seconds max (20 * 100ms)

  const tryShowModal = () => {
    const modal = FlowbiteInstances.getInstance('Modal', modalId);

    // need to give Flowbite time to initialize in some instances
    if (modal) {
      modal.show();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(tryShowModal, 100); // Try again in 100ms
    } else {
      console.error(
        `Failed to show modal: ${modalId} - modal instance not found`
      );
    }
  };

  tryShowModal();
});
