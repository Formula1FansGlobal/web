document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach((img) => {
    // Saltar logos/críticos en nav
    const isNav = img.closest('nav');
    const isLogo = img.classList.contains('logo') || img.classList.contains('site-logo');
    if (isNav || isLogo) return;
    img.loading = 'lazy';
  });
});
