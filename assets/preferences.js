'use strict';

// Aplicado antes do CSS para evitar um flash de tema diferente do escolhido.
(() => {
  const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const preferences = {
    language: 'pt',
    theme: themeQuery.matches ? 'dark' : 'light',
    explicitTheme: false,
    save(key, value) {
      try { localStorage.setItem(`mc-portfolio-${key}`, value); } catch { /* Preferência vale nesta visita. */ }
    },
  };
  try {
    const language = localStorage.getItem('mc-portfolio-language');
    const theme = localStorage.getItem('mc-portfolio-theme');
    if (language === 'pt' || language === 'en') preferences.language = language;
    if (theme === 'dark' || theme === 'light') {
      preferences.theme = theme;
      preferences.explicitTheme = true;
    }
  } catch { /* Browsers podem bloquear armazenamento, inclusive em file://. */ }
  document.documentElement.dataset.theme = preferences.theme;
  window.portfolioPreferences = preferences;
})();
