// Determine the initial theme: use localStorage if available, otherwise fallback to system preference
let currentTheme = (localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
document.documentElement.setAttribute("saved-theme", currentTheme);

// Dispatch a custom event when the theme changes
const dispatchThemeChange = (theme) => {
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
};

// Toggle between light and dark themes
const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("saved-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    currentTheme = newTheme;
    dispatchThemeChange(newTheme);
};

// Update theme based on system preference changes
const updateThemeFromSystem = (mediaQuery) => {
    const systemTheme = mediaQuery.matches ? "dark" : "light";
    document.documentElement.setAttribute("saved-theme", systemTheme);
    localStorage.setItem("theme", systemTheme);
    currentTheme = systemTheme;
    dispatchThemeChange(systemTheme);
};

// Add event listeners for theme toggling and system preference changes
document.addEventListener("nav", () => {
    const darkModeButton = document.querySelector("#darkmode");
    if (darkModeButton) {
      darkModeButton.addEventListener("click", toggleTheme);
      window.addCleanup(() => darkModeButton.removeEventListener("click", toggleTheme));
    }

    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
    systemPreference.addEventListener("change", updateThemeFromSystem);
    window.addCleanup(() => systemPreference.removeEventListener("change", updateThemeFromSystem));
});
