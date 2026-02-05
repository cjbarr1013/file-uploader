const checkbox = document.getElementById('uploadNameCheckbox');
const nameInput = document.getElementById('uploadName');

checkbox.addEventListener('change', () => {
  nameInput.disabled = checkbox.checked;
  nameInput.placeholder = checkbox.checked ? 'default' : '';
  nameInput.value = '';
});

nameInput.placeholder = checkbox.checked ? 'default' : '';
