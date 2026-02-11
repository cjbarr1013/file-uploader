document.addEventListener('DOMContentLoaded', () => {
  const uploadFileBtn = document.querySelector('#upload-file-modal-trigger');
  const uploadFileForm = document.querySelector('#upload-file-form');
  const uploadFileselect = uploadFileForm.querySelector('#parentId');

  uploadFileBtn.addEventListener('click', () => {
    uploadFileselect.value = uploadFileBtn.getAttribute(
      'data-upload-file-parent-value'
    );
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const createFolderBtn = document.querySelector(
    '#create-folder-modal-trigger'
  );
  const createFolderForm = document.querySelector('#create-folder-form');
  const createFolderselect = createFolderForm.querySelector('#parentId');

  createFolderBtn.addEventListener('click', () => {
    createFolderselect.value = createFolderBtn.getAttribute(
      'data-create-folder-parent-value'
    );
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-delete-confirm]');
  const form = document.querySelector('#delete-confirm-form');
  const msg = document.querySelector('#delete-item-confirm-modal-msg');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-delete-confirm-path');
      msg.textContent = btn.getAttribute('data-delete-confirm-msg');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-edit-item-name]');
  const form = document.querySelector('#edit-name-form');
  const textInput = document.querySelector('#editItemName');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-edit-item-name-path');
      textInput.value = btn.getAttribute('data-edit-item-name-value') || '';
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('button[data-edit-item-location]');
  const form = document.querySelector('#edit-location-form');
  const select = document.querySelector('#newParentId');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      form.action = btn.getAttribute('data-edit-item-location-path');
      select.value = btn.getAttribute('data-edit-item-location-value') || '';
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
