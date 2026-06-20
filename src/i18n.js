export function msg(key, substitutions = []) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = msg(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", msg(element.dataset.i18nPlaceholder));
  });

  root.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.setAttribute("title", msg(element.dataset.i18nTitle));
  });
}