import "../components/dipole-calculator/dipole-calculator.js";
import "../components/ground-plane-calculator/ground-plane-calculator.js";
import "../components/yagi-calculator/yagi-calculator.js";
import "../components/parabolic-calculator/parabolic-calculator.js";
import "../components/low-pass-filter-calculator/low-pass-filter-calculator.js";
import "../components/high-pass-filter-calculator/high-pass-filter-calculator.js";
import "../components/lc-low-pass-filter-calculator/lc-low-pass-filter-calculator.js";
import "../components/lc-high-pass-filter-calculator/lc-high-pass-filter-calculator.js";
import "../components/pi-filter-calculator/pi-filter-calculator.js";

const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const THEME_STORAGE_KEY = "ham-radio-tools-theme";

const storedTheme = safeStorageGet(THEME_STORAGE_KEY);
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

setTheme(storedTheme || preferredTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  safeStorageSet(THEME_STORAGE_KEY, nextTheme);
});

function setTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = normalizedTheme;

  if (!themeToggle || !themeToggleText) return;

  const isDark = normalizedTheme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Alternar para tema claro" : "Alternar para tema escuro",
  );
  themeToggleText.textContent = isDark ? "Escuro" : "Claro";
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Theme still works for the current page even when storage is blocked.
  }
}
