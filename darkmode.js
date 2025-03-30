// Check for saved user preference, if any, on page load
var theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);


// Set the toggle state based on current theme
const toggle = document.getElementById('theme-toggle');

if (theme === 'dark') toggle.checked = true;

// Toggle between light and dark mode
toggle.addEventListener('click', function() {
    console.log('click')
    theme = (this.checked ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme',theme);
    localStorage.setItem('theme', theme);
});
