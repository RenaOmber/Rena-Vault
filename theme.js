// Theme manager — shared across all pages
(function() {
  const LIGHT = {
    '--bg': '#f4f5f7',
    '--bg2': '#ffffff',
    '--bg3': '#eef0f3',
    '--border': 'rgba(0,0,0,0.08)',
    '--border-hover': 'rgba(0,0,0,0.2)',
    '--text': '#111827',
    '--text2': '#374151',
    '--text3': '#9ca3af',
  };
  const DARK = {
    '--bg': null, '--bg2': null, '--bg3': null,
    '--border': null, '--border-hover': null,
    '--text': null, '--text2': null, '--text3': null,
  };

  function apply(mode) {
    const root = document.documentElement;
    if (mode === 'light') {
      Object.entries(LIGHT).forEach(([k,v]) => root.style.setProperty(k, v));
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      Object.keys(LIGHT).forEach(k => root.style.removeProperty(k));
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('ro_theme', mode);
    // Update all toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.textContent = mode === 'light' ? '🌙' : '☀️';
      btn.title = mode === 'light' ? 'Mode Gelap' : 'Mode Terang';
    });
  }

  window.toggleTheme = function() {
    const current = localStorage.getItem('ro_theme') || 'dark';
    apply(current === 'dark' ? 'light' : 'dark');
  };

  // Apply saved theme on load
  const saved = localStorage.getItem('ro_theme') || 'dark';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => apply(saved));
  } else {
    apply(saved);
  }
})();
