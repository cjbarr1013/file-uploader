document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-delete-confirm]');
  const form = document.querySelector('#delete-confirm-form');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-delete-confirm-path');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-edit-item-name]');
  const form = document.querySelector('#edit-name-form');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-edit-item-name-path');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-edit-item-location]');
  const form = document.querySelector('#edit-location-form');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-edit-item-location-path');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-edit-item-favorite]');
  const form = document.querySelector('#edit-favorite-form');
  const msg = document.querySelector('#edit-favorite-confirm-modal-msg');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-edit-item-favorite-path');
      msg.textContent = btn.getAttribute('data-edit-item-favorite-msg');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-download-confirm]');
  const form = document.querySelector('#download-confirm-form');
  const msg = document.querySelector('#download-confirm-modal-msg');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-download-confirm-path');
      msg.textContent = btn.getAttribute('data-download-confirm-msg');
    });
  });
});
