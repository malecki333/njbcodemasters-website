/**
 * Language Switcher Component - Directory-based Version
 * Navigiert zwischen /de/, /sr/ und /en/ Verzeichnissen
 */

class LanguageSwitcher {
    constructor() {
        this.init();
    }

    isSupportedLanguage(lang) {
        return ['de', 'en', 'sr'].includes(lang);
    }

    createLanguageSelect() {
        const select = document.createElement('select');
        select.id = 'languageSelect';
        select.setAttribute('aria-label', 'Sprache waehlen');
        select.innerHTML = [
            '<option value="de">Deutsch</option>',
            '<option value="en">English</option>',
            '<option value="sr">Srpski</option>',
        ].join('');
        return select;
    }

    ensureSwitcherMarkup() {
        const existingSelect = document.getElementById('languageSelect');
        if (existingSelect) return existingSelect;

        // Wenn eine Button-basierte Umschaltung existiert, nicht ueberschreiben.
        if (document.querySelector('.language-switcher .lang-btn')) {
            return null;
        }

        let container = document.querySelector('.language-switcher');
        if (!container) {
            container = document.createElement('div');
            container.className = 'language-switcher';

            const actionsHost =
                document.querySelector('.nav__actions') ||
                document.querySelector('.njb-nav__right .nav__actions') ||
                document.querySelector('.njb-nav__content') ||
                document.querySelector('.nav.container') ||
                document.querySelector('nav');

            if (!actionsHost) return null;
            actionsHost.prepend(container);
        }

        const label = document.createElement('label');
        label.setAttribute('for', 'languageSelect');
        label.textContent = '🌐';

        const select = this.createLanguageSelect();
        container.replaceChildren(label, select);
        return select;
    }

    updateLabel(select) {
        const container = select?.closest('.language-switcher');
        if (!container) return;
        const selectedOption = select.options[select.selectedIndex];
        const code = (select.value || '').toUpperCase();
        const label = selectedOption ? selectedOption.textContent : code;
        container.setAttribute('title', label);
    }

    buildEnhancedUI(select) {
        const container = select.closest('.language-switcher');
        if (!container || container.classList.contains('language-switcher--enhanced')) return;

        const display = document.createElement('div');
        display.className = 'language-display';
        display.innerHTML = `
            <span class="language-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="8" class="globe-ring" />
                    <path class="globe-meridian" d="M8.5 4.6c-2.3 1.8-3.8 4.5-3.8 7.4s1.5 5.7 3.8 7.4" />
                    <path class="globe-meridian" d="M15.5 4.6c2.3 1.8 3.8 4.5 3.8 7.4s-1.5 5.7-3.8 7.4" />
                    <path class="globe-meridian" d="M12 3.8c2.3 1.8 3.8 4.7 3.8 8.2S14.3 17.4 12 19c-2.3-1.6-3.8-4.3-3.8-7s1.5-6.4 3.8-8.2z" />
                    <path class="globe-parallel" d="M4.5 9.2c2.4 1.2 4.7 1.6 7.5 1.6s5.1-0.4 7.5-1.6" />
                    <path class="globe-parallel" d="M4.5 14.8c2.4-1.2 4.7-1.6 7.5-1.6s5.1 0.4 7.5 1.6" />
                </svg>
            </span>
        `;

        container.classList.add('language-switcher--enhanced');
        select.classList.add('language-native-select');
        container.prepend(display);

        // Sync label with current selection
        this.updateLabel(select);

        // Focus styling helpers
        select.addEventListener('focus', () => container.classList.add('is-focused'));
        select.addEventListener('blur', () => container.classList.remove('is-focused'));
    }

    // Erkenne aktuelle Sprache aus URL-Pfad
    getCurrentLanguageFromPath() {
        const path = window.location.pathname;
        if (path.includes('/de/')) return 'de';
        if (path.includes('/sr/')) return 'sr';
        if (path.includes('/en/')) return 'en';

        const i18nStored = localStorage.getItem('language');
        if (this.isSupportedLanguage(i18nStored)) {
            return i18nStored;
        }

        const preferred = localStorage.getItem('preferredLanguage');
        if (this.isSupportedLanguage(preferred)) {
            return preferred;
        }

        const htmlLang = document.documentElement.lang;
        if (this.isSupportedLanguage(htmlLang)) {
            return htmlLang;
        }

        return 'de'; // Default
    }

    buildLanguageUrl(lang) {
        const current = new URL(window.location.href);
        const languageDirectory = current.pathname.match(/\/(de|en|sr)(?:\/|$)/);
        const fileName = current.pathname.split('/').pop();
        const page = fileName?.endsWith('.html') ? fileName : 'index.html';
        const base = languageDirectory
            ? current.pathname.slice(0, languageDirectory.index + 1)
            : current.pathname.slice(0, current.pathname.lastIndexOf('/') + 1);
        current.pathname = `${base}${lang}/${page}`;
        current.search = '';
        current.hash = '';
        return current.href;
    }

    hasLanguageDirectoryInPath() {
        return /\/(de|en|sr)(?:\/|$)/.test(window.location.pathname);
    }

    async navigateToLanguage(lang) {
        const candidate = this.buildLanguageUrl(lang);

        // DE/SR Seiten sind als vollstaendige Sprachseiten vorhanden.
        if (lang === 'de' || lang === 'sr') {
            window.location.href = candidate;
            return true;
        }

        try {
            const response = await fetch(candidate, { method: 'GET' });
            if (response.ok) {
                window.location.href = candidate;
                return true;
            }
        } catch (error) {
            // Fallback below
        }

        const fallback = `${window.location.origin}/${lang}/index.html`;
        try {
            const fallbackResponse = await fetch(fallback, { method: 'GET' });
            if (fallbackResponse.ok) {
                window.location.href = fallback;
                return true;
            }
        } catch (error) {
            // If even fallback is unavailable, stay on current page and keep i18n language.
        }

        return false;
    }

    init() {
        const select = this.ensureSwitcherMarkup();
        if (!select) return;

        // Setze aktuelle Sprache basierend auf Verzeichnis
        const currentLang = this.getCurrentLanguageFromPath();
        select.value = currentLang;
        if (currentLang === 'sr') {
            select.setAttribute('aria-label', 'Изаберите језик');
            const languageNames = { de: 'Немачки', en: 'Енглески', sr: 'Српски' };
            for (const option of select.options) {
                if (languageNames[option.value]) {
                    option.textContent = languageNames[option.value];
                }
            }
        }

        // Root-Seiten ohne Sprachprefix direkt in die gespeicherte Sprachseite umleiten,
        // damit der komplette Inhalt (nicht nur Navigation) korrekt lokalisiert ist.
        if (!document.body.classList.contains('njb-landing') && !this.hasLanguageDirectoryInPath()) {
            const storedLang = localStorage.getItem('language') || localStorage.getItem('preferredLanguage');
            if (this.isSupportedLanguage(storedLang)) {
                this.navigateToLanguage(storedLang);
                return;
            }
        }

        // Build animated button-style UI
        this.buildEnhancedUI(select);

        // Change-Event-Listener
        select.addEventListener('change', async (e) => {
            const newLang = e.target.value;

            localStorage.setItem('preferredLanguage', newLang);
            localStorage.setItem('language', newLang);

            if (window.i18n && typeof window.i18n.switchLanguage === 'function') {
                await window.i18n.switchLanguage(newLang);
            }

            // Für alle Seiten (inkl. NJB): versuche zur gleichen Unterseite im Sprachordner zu wechseln,
            // damit der komplette Seiteninhalt in der gewählten Sprache erscheint.
            const navigated = await this.navigateToLanguage(newLang);
            if (!navigated) {
                // Fallback: wenn keine Sprachseite vorhanden ist, wenigstens in-place anwenden.
                if (typeof window.setNjbLanguage === 'function') {
                    window.setNjbLanguage(newLang);
                }
                this.updateLabel(select);
            }
        });

        // Aktualisiere Label bei Änderungen
        select.addEventListener('change', () => this.updateLabel(select));

        // Sync UI when language changes from other scripts/components
        window.addEventListener('languageChanged', (event) => {
            const lang = event?.detail?.lang;
            if (!this.isSupportedLanguage(lang)) return;
            select.value = lang;
            this.updateLabel(select);
        });

    }
}

// Initialisiere wenn DOM bereit
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LanguageSwitcher();
    });
} else {
    new LanguageSwitcher();
}
