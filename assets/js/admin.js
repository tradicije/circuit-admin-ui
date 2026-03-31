(function () {
  "use strict";

  var storageKey = "circuit_admin_ui_theme";

  function getSavedTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (err) {
      return null;
    }
  }

  function saveLocalTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (err) {
      /* Ignore storage issues. */
    }
  }

  function getCurrentTheme() {
    return document.body.classList.contains("caiu-theme-light") ? "light" : "dark";
  }

  function setThemeBodyClass(theme) {
    document.body.classList.remove("caiu-theme-light", "caiu-theme-dark");
    document.body.classList.add("caiu-theme-" + theme);
    updateToggleLabel(theme);
  }

  function updateToggleLabel(theme) {
    var label = document.querySelector("#wp-admin-bar-circuit-admin-ui-theme-toggle .caiu-toggle-label");

    if (!label) {
      return;
    }

    label.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);

    var switchLink = document.querySelector("#wp-admin-bar-circuit-admin-ui-theme-toggle > a");
    if (!switchLink || typeof CircuitAdminUI === "undefined") {
      return;
    }

    switchLink.title = theme === "dark" ? CircuitAdminUI.i18n.light : CircuitAdminUI.i18n.dark;
  }

  function saveServerTheme(theme) {
    if (typeof CircuitAdminUI === "undefined") {
      return;
    }

    var payload = new URLSearchParams();
    payload.append("action", "circuit_admin_ui_set_theme");
    payload.append("nonce", CircuitAdminUI.nonce);
    payload.append("theme", theme);

    fetch(CircuitAdminUI.ajaxUrl, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: payload.toString()
    }).catch(function () {
      /* Keep UI responsive even if request fails. */
    });
  }

  function toggleTheme(event) {
    event.preventDefault();

    var current = getCurrentTheme();
    var next = current === "dark" ? "light" : "dark";

    setThemeBodyClass(next);
    saveLocalTheme(next);
    saveServerTheme(next);
  }

  function initSwitcher() {
    var toggleLink = document.querySelector("#wp-admin-bar-circuit-admin-ui-theme-toggle > a");

    if (!toggleLink) {
      return;
    }

    toggleLink.addEventListener("click", toggleTheme);
  }

  function initTheme() {
    var preferred = getSavedTheme();

    if (!preferred && typeof CircuitAdminUI !== "undefined") {
      preferred = CircuitAdminUI.currentTheme;
    }

    if (preferred !== "light" && preferred !== "dark") {
      preferred = "dark";
    }

    setThemeBodyClass(preferred);
    saveLocalTheme(preferred);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initSwitcher();
  });
})();
