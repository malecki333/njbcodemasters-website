/**
 * i18n - Internationalization System
 * Unterstützt: Deutsch (de), English (en), Српски (sr)
 */

class i18n {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        this.initialized = false;
    }

    /**
     * Lagert Sprache im LocalStorage
     */
    getStoredLanguage() {
        return localStorage.getItem('language') || localStorage.getItem('preferredLanguage') || null;
    }

    setStoredLanguage(lang) {
        localStorage.setItem('language', lang);
        localStorage.setItem('preferredLanguage', lang);
    }

    /**
     * Erkennt Browser-Sprache
     */
    detectLanguage() {
        const pathLanguage = window.location.pathname.match(/\/(de|en|sr)(?:\/|$)/);
        if (pathLanguage) return pathLanguage[1];
        // Prioritaet: explizit gespeicherte Sprachwahl
        const stored = localStorage.getItem('language') || localStorage.getItem('preferredLanguage');
        if (stored && ['de', 'en', 'sr'].includes(stored)) {
            return stored;
        }

        // Zuerst: Prüfe data-language Attribute auf body
        const bodyLang = document.body.getAttribute('data-language');
        if (bodyLang && ['de', 'en', 'sr'].includes(bodyLang)) {
            return bodyLang;
        }
        
        // Dann: Prüfe ob Sprache im URL-Pfad steht (/de/index.html, /sr/index.html)
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        if (['de', 'en', 'sr'].includes(pathParts[0])) {
            return pathParts[0];
        }
        
        // Fallback: Browser-Sprache
        const browserLang = navigator.language.split('-')[0];
        const supportedLangs = ['de', 'en', 'sr'];
        return supportedLangs.includes(browserLang) ? browserLang : 'de';
    }

    /**
     * Lädt die benötigten Übersetzungen
     */
    async loadTranslations(languages = [this.currentLanguage]) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const hasLangDir = ['de', 'en', 'sr'].includes(pathParts[0]);
        const localesBase = hasLangDir ? '..' : '.';
        const loadLanguage = async (lang) => {
            if (this.translations[lang]) return;

            const response = await fetch(`${localesBase}/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            this.translations[lang] = await response.json();
        };

        try {
            for (const lang of languages) {
                await loadLanguage(lang);
            }
            this.initialized = Boolean(this.translations[this.currentLanguage]);
        } catch (error) {
            console.error('❌ Failed to load translations:', error);
            if (this.currentLanguage !== 'de') {
                this.currentLanguage = 'de';
                try {
                    await loadLanguage('de');
                    this.initialized = true;
                } catch (fallbackError) {
                    console.error('❌ Failed to load German fallback translations:', fallbackError);
                }
            }
        }
    }

    /**
     * Übersetzt einen Key
     * Beispiel: t('nav.home') -> "Startseite"
     */
    t(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || defaultValue || key;
    }

    /**
     * Wechselt Sprache und aktualisiert UI
     */
    async switchLanguage(lang) {
        if (!['de', 'en', 'sr'].includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        const pathLanguage = window.location.pathname.match(/\/(de|en|sr)(?:\/|$)/);
        this.currentLanguage = pathLanguage ? pathLanguage[1] : lang;
        this.setStoredLanguage(lang);
        if (!this.translations[this.currentLanguage]) {
            await this.loadTranslations([this.currentLanguage]);
        }

        // Update UI
        this.updatePageTranslations();
        document.documentElement.lang = this.currentLanguage;

        // Speichern für andere Tabs
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLanguage } }));
    }

    /**
     * Aktualisiert alle Elemente mit data-i18n Attribut
     */
    updatePageTranslations() {
        // Alle Elemente mit data-i18n
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Alle Elemente mit data-i18n-attr (z.B. alt, title, aria-label)
        document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
            const attrs = JSON.parse(el.getAttribute('data-i18n-attr'));
            Object.entries(attrs).forEach(([attrName, key]) => {
                el.setAttribute(attrName, this.t(key));
            });
        });

        // Button/Link Text
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = this.t(key);
        });

        // Fallback: Navigationstexte uebersetzen, auch wenn kein data-i18n gesetzt ist
        const navKeyByHref = {
            'index.html': 'nav.home',
            'about.html': 'nav.about',
            'services.html': 'nav.services',
            'pricing.html': 'nav.pricing',
            'portfolio.html': 'nav.portfolio',
            'blog.html': 'nav.blog',
            'contact.html': 'nav.contact',
        };

        document.querySelectorAll('.nav__menu .nav__link').forEach((link) => {
            const href = link.getAttribute('href') || '';
            const fileName = href.split('/').pop() || '';

            // Special link (Genesis): handle text + badge separately
            if (link.classList.contains('nav__link--special') || fileName === 'njb.html') {
                // Wenn bereits i18n-Markup vorhanden ist, nichts weiter manipulieren.
                if (link.querySelector('[data-i18n="nav.genesis"]') || link.querySelector('.nav__link-text')) {
                    const badgeExisting = link.querySelector('.nav__link-badge[data-i18n="nav.live"]');
                    if (!badgeExisting) {
                        const badge = link.querySelector('.nav__link-badge');
                        if (badge) {
                            badge.textContent = this.t('nav.live', 'LIVE');
                        }
                    }
                    return;
                }

                let textNode = link.querySelector('.nav__link-text');
                if (!textNode) {
                    textNode = document.createElement('span');
                    textNode.className = 'nav__link-text';
                    const icon = link.querySelector('.nav__link-icon');
                    if (icon && icon.nextSibling) {
                        link.insertBefore(textNode, icon.nextSibling);
                    } else if (icon) {
                        link.appendChild(textNode);
                    } else {
                        link.prepend(textNode);
                    }
                }

                // Remove legacy plain text nodes (keeps icon, badge and translated span)
                Array.from(link.childNodes).forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        node.remove();
                    }
                });

                textNode.textContent = this.t('nav.genesis', 'Genesis 6.0');

                const badge = link.querySelector('.nav__link-badge');
                if (badge) {
                    badge.textContent = this.t('nav.live', 'LIVE');
                }
                return;
            }

            const key = navKeyByHref[fileName];
            if (key) {
                link.textContent = this.t(key, link.textContent);
            }
        });
    }

    /**
     * Gibt aktuelle Sprache zurück
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Gibt alle verfügbaren Sprachen zurück
     */
    getAvailableLanguages() {
        return ['de', 'en', 'sr'];
    }
}

// Globale Instanz
window.i18n = new i18n();

// Auto-Initialize beim Laden
document.addEventListener('DOMContentLoaded', async () => {
    await window.i18n.loadTranslations();
    
    // Warte kurz, damit navigation.js das Menü klonen kann
    setTimeout(() => {
        window.i18n.updatePageTranslations();
    }, 50);
});

// Listener für Language-Wechsel von anderen Tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'language' && e.newValue) {
        window.i18n.currentLanguage = window.i18n.detectLanguage();
        window.i18n.updatePageTranslations();
    }
});

// Listener für Custom Event
window.addEventListener('languageChanged', (e) => {
    window.i18n.updatePageTranslations();
});
