// Navigation Functionality - Dropdown Menu
(function() {
    if (window.navigationInitialized) return;
    window.navigationInitialized = true;
    const header = document.getElementById('header');
    const navToggle = document.getElementById('navToggle');
    const navLogo = document.querySelector('.nav__logo');
    let navMenu = document.getElementById('navMenu');
    let navLinks = document.querySelectorAll('.nav__link');

    // Place menu toggle left of the logo on all pages.
    const placeToggleLeftOfLogo = () => {
        if (!navToggle || !navLogo) return;
        const logoLink = navLogo.querySelector('a');
        if (logoLink) {
            navLogo.insertBefore(navToggle, logoLink);
        } else {
            navLogo.prepend(navToggle);
        }
        navToggle.classList.add('nav__toggle--left');
    };

    placeToggleLeftOfLogo();
    let soundButton = document.getElementById('soundToggle') || document.querySelector('.sound-toggle');
    if (!soundButton) {
        soundButton = document.createElement('button');
        soundButton.type = 'button';
        soundButton.className = 'sound-toggle';
        soundButton.setAttribute('aria-label', 'Sound einschalten');
        const label = document.createElement('span');
        label.className = 'sound-label';
        label.textContent = 'Sound aus';
        soundButton.appendChild(label);
        (document.querySelector('.nav__actions') || document.body).appendChild(soundButton);
    }
    soundButton.id = 'soundToggle';
    if (soundButton && !soundButton.querySelector('svg')) {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('class', 'sound-icon');
        icon.setAttribute('width', '24');
        icon.setAttribute('height', '24');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('stroke-width', '2');
        icon.innerHTML = `
            <polygon class="sound-speaker" points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path class="sound-wave-1" d="M15.5 7.5c1.5 1.5 2.5 3.5 2.5 5.5s-1 4-2.5 5.5"></path>
            <path class="sound-wave-2" d="M18 4c3 3 5 7 5 11s-2 8-5 11"></path>
            <line class="sound-mute" x1="23" y1="1" x2="1" y2="23" stroke-linecap="round"></line>`;
        soundButton.prepend(icon);
    }
    window.addEventListener('load', placeToggleLeftOfLogo, { once: true });

    const ensureMainNavigation = () => {
        if (!navMenu) return;
        const pathLanguage = window.location.pathname.match(/\/(de|en|sr)(?:\/|$)/);
        let language = pathLanguage?.[1];
        if (!language) {
            try {
                language = localStorage.getItem('language') || localStorage.getItem('preferredLanguage');
            } catch (error) {
                console.warn('Saved navigation language is unavailable.', error);
            }
        }
        if (!['de', 'en', 'sr'].includes(language)) {
            const browserLanguage = navigator.language.split('-')[0];
            language = ['de', 'en', 'sr'].includes(browserLanguage) ? browserLanguage : 'de';
        }
        const pages = [
            'index', 'about', 'vezaiongen-vi', 'modules', 'pilot-program', 'roadmap',
            'services', 'pricing', 'portfolio', 'blog', 'contact', 'datenschutz', 'impressum'
        ];
        const labels = {
            de: ['Startseite', '\u00dcber uns', 'VezaionGen VI', 'Module', 'Pilotprogramm', 'Roadmap',
                'Leistungen', 'Preise', 'Portfolio', 'Blog', 'Kontakt', 'Datenschutz', 'Impressum'],
            en: ['Home', 'About us', 'VezaionGen VI', 'Modules', 'Pilot program', 'Roadmap',
                'Services', 'Pricing', 'Portfolio', 'Blog', 'Contact', 'Privacy', 'Legal notice'],
            sr: ['\u041f\u043e\u0447\u0435\u0442\u043d\u0430', '\u041e \u043d\u0430\u043c\u0430', 'VezaionGen VI', '\u041c\u043e\u0434\u0443\u043b\u0438', '\u041f\u0438\u043b\u043e\u0442 \u043f\u0440\u043e\u0433\u0440\u0430\u043c', '\u041c\u0430\u043f\u0430 \u043f\u0443\u0442\u0430',
                '\u0423\u0441\u043b\u0443\u0433\u0435', '\u0426\u0435\u043d\u0435', '\u041f\u043e\u0440\u0442\u0444\u043e\u043b\u0438\u043e', '\u0411\u043b\u043e\u0433', '\u041a\u043e\u043d\u0442\u0430\u043a\u0442', '\u041f\u0440\u0438\u0432\u0430\u0442\u043d\u043e\u0441\u0442', '\u041f\u0440\u0430\u0432\u043d\u0435 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u0458\u0435']
        };
        const existingLinks = [...navMenu.querySelectorAll('a')];
        const items = pages.map((page, index) => {
            const file = `${page}.html`;
            const link = existingLinks.find(a => new URL(a.href).pathname.split('/').pop() === file)
                || document.createElement('a');
            link.className = 'nav__link';
            link.href = pathLanguage ? file : `${language}/${file}`;
            link.textContent = labels[language][index];
            link.removeAttribute('data-i18n');
            link.removeAttribute('data-i18n-html');
            link.removeAttribute('data-legacy-alias');
            link.removeAttribute('title');
            const item = document.createElement('li');
            item.className = 'nav__item';
            item.appendChild(link);
            return item;
        });
        navMenu.replaceChildren(...items);
        if (language === 'sr' && navToggle) {
            navToggle.setAttribute('aria-label', '\u041c\u0435\u043d\u0438');
        }
        navLinks = navMenu.querySelectorAll('.nav__link');
    };

    ensureMainNavigation();
    
    // Move nav__menu OUTSIDE of header to avoid overflow:hidden
    if (navMenu && navMenu.parentElement !== document.body) {
        document.body.appendChild(navMenu);
        
        // Apply existing translations after assembling the shared menu.
        if (window.i18n && window.i18n.initialized) {
            window.i18n.updatePageTranslations();
        }
        
        navLinks = navMenu.querySelectorAll('.nav__link');
    }
    
    // Sticky header on scroll
    let lastScroll = 0;
    const headerHeight = header?.offsetHeight || 80;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > headerHeight) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Toggle menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Update ARIA attributes
            const isExpanded = navToggle.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    } else {
        console.warn('navToggle or navMenu not found!');
    }
    
    // Close menu when clicking on a link
    navLinks.forEach(link => {
        if (link.tagName !== 'A') return;
        link.addEventListener('click', () => {
            if (navMenu?.classList.contains('active')) {
                navToggle?.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle?.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navMenu?.classList.contains('active')) {
                navToggle?.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle?.setAttribute('aria-expanded', 'false');
                navToggle?.focus();
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu?.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle?.contains(e.target)) {
            navToggle?.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle?.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Active link highlighting
    const setActiveLink = () => {
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            if (link.tagName !== 'A') return;
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };
    
    setActiveLink();
    
    // Update active link on navigation
    window.addEventListener('popstate', setActiveLink);
})();
