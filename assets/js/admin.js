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

  function initPostMetaTabs() {
    var body = document.body;
    var isPostScreen = body.classList.contains("post-new-php") || body.classList.contains("post-php");

    if (!isPostScreen || body.classList.contains("block-editor-page")) {
      return;
    }

    var postBodyContent = document.querySelector("#post-body-content");
    if (!postBodyContent || postBodyContent.querySelector(".caiu-metabox-tabs")) {
      return;
    }

    var sortableContainers = ["#normal-sortables", "#advanced-sortables"]
      .map(function (selector) {
        return document.querySelector(selector);
      })
      .filter(Boolean);

    var boxes = [];
    sortableContainers.forEach(function (container) {
      Array.prototype.slice.call(container.children).forEach(function (child) {
        if (child.classList.contains("postbox")) {
          boxes.push(child);
        }
      });
    });

    if (boxes.length < 2) {
      return;
    }

    var tabShell = document.createElement("section");
    tabShell.className = "caiu-metabox-tabs";

    var tabList = document.createElement("div");
    tabList.className = "caiu-metabox-tablist";
    tabList.setAttribute("role", "tablist");
    tabList.setAttribute("aria-label", "Post settings");

    var panels = document.createElement("div");
    panels.className = "caiu-metabox-panels";

    boxes.forEach(function (box, index) {
      var boxId = box.id || "caiu-metabox-" + (index + 1);
      box.id = boxId;

      var titleEl = box.querySelector(".hndle, .postbox-header h2, .postbox-header h3");
      var titleText = titleEl ? titleEl.textContent.trim() : "Panel " + (index + 1);

      var tabButton = document.createElement("button");
      tabButton.type = "button";
      tabButton.className = "caiu-metabox-tab";
      tabButton.id = boxId + "-tab";
      tabButton.setAttribute("role", "tab");
      tabButton.setAttribute("aria-controls", boxId + "-panel");
      tabButton.setAttribute("aria-selected", index === 0 ? "true" : "false");
      tabButton.tabIndex = index === 0 ? 0 : -1;
      tabButton.textContent = titleText;

      var panel = document.createElement("section");
      panel.className = "caiu-metabox-panel";
      panel.id = boxId + "-panel";
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabButton.id);
      panel.hidden = index !== 0;
      panel.appendChild(box);

      tabButton.addEventListener("click", function () {
        var buttons = tabList.querySelectorAll(".caiu-metabox-tab");
        var tabPanels = panels.querySelectorAll(".caiu-metabox-panel");

        buttons.forEach(function (btn) {
          btn.setAttribute("aria-selected", "false");
          btn.tabIndex = -1;
          btn.classList.remove("is-active");
        });

        tabPanels.forEach(function (tabPanel) {
          tabPanel.hidden = true;
        });

        tabButton.setAttribute("aria-selected", "true");
        tabButton.tabIndex = 0;
        tabButton.classList.add("is-active");
        panel.hidden = false;
      });

      tabButton.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
          return;
        }

        event.preventDefault();
        var allTabs = Array.prototype.slice.call(tabList.querySelectorAll(".caiu-metabox-tab"));
        var currentIndex = allTabs.indexOf(tabButton);
        var nextIndex = event.key === "ArrowRight" ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex < 0) {
          nextIndex = allTabs.length - 1;
        }
        if (nextIndex >= allTabs.length) {
          nextIndex = 0;
        }

        allTabs[nextIndex].focus();
        allTabs[nextIndex].click();
      });

      if (index === 0) {
        tabButton.classList.add("is-active");
      }

      tabList.appendChild(tabButton);
      panels.appendChild(panel);
    });

    sortableContainers.forEach(function (container) {
      container.style.display = "none";
    });

    tabShell.appendChild(tabList);
    tabShell.appendChild(panels);

    var titleDiv = document.querySelector("#titlediv");
    if (titleDiv && titleDiv.parentNode) {
      titleDiv.parentNode.insertBefore(tabShell, titleDiv.nextSibling);
    } else {
      postBodyContent.insertBefore(tabShell, postBodyContent.firstChild);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initSwitcher();
    initPostMetaTabs();
  });
})();
