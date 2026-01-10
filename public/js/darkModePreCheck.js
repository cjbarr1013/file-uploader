(function () {
  const t = localStorage.getItem('color-theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (t === 'dark' || (!t && sysDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    const t = localStorage.getItem('color-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && sysDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});
