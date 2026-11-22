/* Mahmoud Moselhy — Portfolio interactions (no dependencies) */
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header background once the page scrolls ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Active section in rail / bottom bar and header nav ---------- */
  const navLinks = [...document.querySelectorAll('.rail-link, .main-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  // The active section is the last one whose top has passed 40% of the viewport.
  // At the very bottom of the page the last section wins, even if it is short.
  let ticking = false;
  const updateActive = () => {
    ticking = false;
    if (!sections.length) return;
    const line = window.innerHeight * 0.4;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = sections[sections.length - 1];
    setActive(current.id);
  };
  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActive);
    }
  };
  updateActive();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* ---------- Copy email ---------- */
  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  const fallbackCopy = (text) => {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    field.remove();
    return ok;
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    const label = button.querySelector('.copy-text');
    button.addEventListener('click', async () => {
      const text = button.getAttribute('data-copy');
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else {
          ok = fallbackCopy(text);
        }
      } catch (err) {
        ok = fallbackCopy(text);
      }

      if (ok) {
        button.classList.add('is-copied');
        if (label) label.textContent = 'Copied';
        showToast('Email copied to clipboard');
        setTimeout(() => {
          button.classList.remove('is-copied');
          if (label) label.textContent = 'Copy';
        }, 2200);
      } else {
        showToast('Copy failed — email: ' + text);
      }
    });
  });
})();
