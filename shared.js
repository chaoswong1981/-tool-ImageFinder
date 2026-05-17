function t(key, ...args) {
  let msg = chrome.i18n.getMessage(key);
  if (msg && args.length > 0) {
    msg = msg.replace(/\{(\d+)\}/g, (_, n) => args[Number(n)] !== undefined ? String(args[Number(n)]) : _);
  }
  return msg || key;
}

function localizePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const attr = el.dataset.i18nAttr || 'placeholder';
      el.setAttribute(attr, t(key));
    } else {
      el.textContent = t(key);
    }
  });
}

document.addEventListener('DOMContentLoaded', localizePage);
