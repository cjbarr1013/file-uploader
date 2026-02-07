document.querySelectorAll('.animate-slide-in-out').forEach((el) => {
  el.addEventListener('animationend', () => {
    el.remove();
  });
});
