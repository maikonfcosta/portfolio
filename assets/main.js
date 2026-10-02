'use strict';

(() => {
  const root = document.documentElement;
  const preferences = window.portfolioPreferences;
  const translations = window.portfolioTranslations;
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const tools = document.querySelector('.header-tools');
  const filters = document.querySelector('.filters');
  const cards = [...document.querySelectorAll('.project-card')];
  const count = document.querySelector('#project-count');
  const themeButton = document.querySelector('.theme-toggle');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  // Estudos de cor anteriores usam este caminho, mas não os novos controles.
  if (!preferences || !translations || !tools) return;
  const textEntries = [];
  const attributeEntries = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  // Guardar o original permite trocar idioma sem acumular traduções ou reconstruir HTML.
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, .header-tools, #project-count')) continue;
    const key = node.textContent.trim();
    if (Object.hasOwn(translations, key)) textEntries.push({ node, original: node.textContent, key });
  }
  document.querySelectorAll('[aria-label], [alt]').forEach((node) => {
    ['aria-label', 'alt'].forEach((attribute) => {
      const original = node.getAttribute(attribute);
      if (Object.hasOwn(translations, original)) attributeEntries.push({ node, original, attribute });
    });
  });

  function updateProjectCount() {
    const visible = cards.filter((card) => !card.hidden).length;
    const english = preferences.language === 'en';
    const label = english ? (visible === 1 ? 'project' : 'projects') : (visible === 1 ? 'projeto' : 'projetos');
    count.textContent = `${String(visible).padStart(2, '0')} ${label}`;
  }

  function updateControlLabels() {
    const english = preferences.language === 'en';
    const dark = preferences.theme === 'dark';
    menu.setAttribute('aria-label', english ? 'Navigation menu' : 'Menu de navegação');
    themeButton.setAttribute('aria-label', english
      ? `Switch to ${dark ? 'light' : 'dark'} theme`
      : `Ativar tema ${dark ? 'claro' : 'escuro'}`);
    themeButton.setAttribute('aria-pressed', String(!dark));
    themeButton.title = themeButton.getAttribute('aria-label');
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === preferences.language));
    });
  }

  function setLanguage(language, save = true) {
    preferences.language = language;
    const english = language === 'en';
    textEntries.forEach(({ node, original, key }) => {
      node.textContent = english ? original.replace(key, () => translations[key]) : original;
    });
    attributeEntries.forEach(({ node, original, attribute }) => {
      node.setAttribute(attribute, english ? translations[original] : original);
    });
    root.lang = english ? 'en' : 'pt-BR';
    document.title = english ? 'Maikon Costa · QA, automation & consulting' : 'Maikon Costa · QA, automação & consultoria';
    const description = english
      ? 'Maikon Costa — QA Lead and Test Automation Engineer. E2E automation, performance, quality strategy, consulting and personal projects.'
      : 'Maikon Costa — QA Lead e Test Automation Engineer. Automação E2E, performance, estratégia de qualidade, consultoria e projetos pessoais.';
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = 'Maikon Costa — QA Lead & Test Automation Engineer';
    document.querySelector('meta[property="og:description"]').content = description;
    const personalContact = document.querySelector('.project-card[data-category="personal"] .project-links a');
    personalContact.href = `mailto:maikonfcosta@gmail.com?subject=${encodeURIComponent(english ? 'Tell me about TrackFit PRO' : 'Quero conhecer o TrackFit PRO')}`;
    const contactSubjects = english ? ['QA opportunity', 'Quality consulting'] : ['Oportunidade em QA', 'Consultoria em qualidade'];
    document.querySelectorAll('.contact-actions .text-link').forEach((link, index) => {
      link.href = `mailto:maikonfcosta@gmail.com?subject=${encodeURIComponent(contactSubjects[index])}`;
    });
    updateProjectCount();
    updateControlLabels();
    if (save) preferences.save('language', language);
  }

  function setTheme(theme, explicit = true) {
    preferences.theme = theme;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#111715' : '#f6f8f3';
    if (explicit) {
      preferences.explicitTheme = true;
      preferences.save('theme', theme);
    }
    updateControlLabels();
  }

  function closeMenu(restoreFocus = false) {
    navigation.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menu.focus();
  }

  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    navigation.classList.toggle('is-open', !expanded);
    menu.setAttribute('aria-expanded', String(!expanded));
  });
  navigation.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    closeMenu();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.querySelectorAll('.reveal-pending').forEach((item) => item.classList.remove('reveal-pending'));
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  window.matchMedia('(min-width: 981px)').addEventListener('change', () => closeMenu());

  tools.addEventListener('click', (event) => {
    const button = event.target.closest('[data-language]');
    if (button) setLanguage(button.dataset.language);
  });
  themeButton.addEventListener('click', () => setTheme(preferences.theme === 'dark' ? 'light' : 'dark'));
  themeQuery.addEventListener('change', (event) => {
    if (!preferences.explicitTheme) setTheme(event.matches ? 'dark' : 'light', false);
  });
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach((card) => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) card.classList.remove('reveal-pending');
    });
    updateProjectCount();
  });

  let revealObserver;
  function revealContent() {
    if (revealObserver) revealObserver.disconnect();
    document.querySelectorAll('.reveal-pending').forEach((item) => item.classList.remove('reveal-pending'));
    if (motionQuery.matches || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.classList.remove('reveal-pending');
          revealObserver.unobserve(target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 40px 0px' });
    document.querySelectorAll('.section-heading, .project-card, .services-grid article, .timeline article, .toolbox').forEach((item) => {
      item.classList.add('reveal');
      if (item.getBoundingClientRect().top > window.innerHeight) {
        item.classList.add('reveal-pending');
        revealObserver.observe(item);
      }
    });
  }
  document.addEventListener('focusin', (event) => {
    event.target.closest('.reveal-pending')?.classList.remove('reveal-pending');
  });
  motionQuery.addEventListener('change', revealContent);

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const active = entries.find((entry) => entry.isIntersecting);
      if (!active) return;
      navigation.querySelectorAll('a').forEach((link) => {
        if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main > section[id]').forEach((section) => navObserver.observe(section));
  }

  setLanguage(preferences.language, false);
  setTheme(preferences.theme, false);
  root.classList.add('js');
  menu.hidden = false;
  tools.hidden = false;
  filters.hidden = false;
  revealContent();
})();
