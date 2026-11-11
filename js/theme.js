// Theme Toggle Functionality
(function() {
    if (window.themeInitialized) return;
    window.themeInitialized = true;
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    if (themeToggle && !themeToggle.querySelector('.sun-icon, .moon-icon')) {
        const icons = document.createElement('span');
        icons.innerHTML = `
            <svg class="sun-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <line class="sun-ray" x1="12" y1="1" x2="12" y2="5"></line>
                <line class="sun-ray" x1="12" y1="19" x2="12" y2="23"></line>
                <line class="sun-ray" x1="4.22" y1="4.22" x2="6.34" y2="6.34"></line>
                <line class="sun-ray" x1="17.66" y1="17.66" x2="19.78" y2="19.78"></line>
                <line class="sun-ray" x1="1" y1="12" x2="5" y2="12"></line>
                <line class="sun-ray" x1="19" y1="12" x2="23" y2="12"></line>
                <line class="sun-ray" x1="4.22" y1="19.78" x2="6.34" y2="17.66"></line>
                <line class="sun-ray" x1="17.66" y1="6.34" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path class="moon-crescent" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                <circle class="moon-full" cx="12" cy="12" r="9" opacity="0"></circle>
            </svg>`;
        themeToggle.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const label = document.createElement('span');
                label.className = 'toggle-label';
                node.replaceWith(label);
                label.appendChild(node);
            }
        });
        themeToggle.append(...icons.childNodes);
    }
    
    // Check for saved theme preference or default to system preference
    const getPreferredTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return 'light';
    };
    
    // Set theme
    const setTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff');
        }
    };
    
    // Initialize theme (persisted or light)
    setTheme(getPreferredTheme());
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
})();
