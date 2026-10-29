'use strict';

document.documentElement.classList.add('js-ready');

if (window.lucide) {
  window.lucide.createIcons();
}

const year = document.getElementById('current-year');
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const revealItems = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach(item => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

  revealItems.forEach(item => revealObserver.observe(item));
}

const navigation = document.getElementById('site-navigation');
if (navigation) {
  navigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.bootstrap && window.matchMedia('(max-width: 991.98px)').matches) {
        const collapse = window.bootstrap.Collapse.getInstance(navigation);
        if (collapse) {
          collapse.hide();
        }
      }
    });
  });
}
