// Footer Component - Mehrsprachig auf allen Seiten laden
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.footer')) return;

    // An explicit language directory takes precedence over stored preferences.
    const pathLanguage = window.location.pathname.match(/\/(de|en|sr)(?:\/|$)/);
    const storedLang = localStorage.getItem('language') || localStorage.getItem('preferredLanguage');
    const bodyLang = document.body.getAttribute('data-language');
    const lang = pathLanguage ? pathLanguage[1] : ['de', 'en', 'sr'].includes(storedLang)
        ? storedLang
        : (['de', 'en', 'sr'].includes(bodyLang) ? bodyLang : 'de');

    // Assets relativ zur Sprach-Subdir aufloesen
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const hasLangDir = ['de', 'en', 'sr'].includes(pathParts[0]);
    const pageHref = (page) => hasLangDir ? page : `${lang}/${page}`;
    const logoSrc = hasLangDir
        ? '../assets/brand/njb-codemasters.png'
        : 'assets/brand/njb-codemasters.png';
    const lightLogoSrc = hasLangDir
        ? '../assets/brand/njb-codemasters-light.png'
        : 'assets/brand/njb-codemasters-light.png';
    
    // Übersetzungen für Footer
    const translations = {
        de: {
            description: 'NJB CodeMasters d.o.o. Gornji Milanovac – Software, Beratung und industrielle Entwicklung.',
            quickLinks: 'Schnellzugriff',
            home: 'Startseite',
            about: 'Über uns',
            product: 'VezaionGen VI',
            modules: 'Module',
            pilot: 'Pilotprogramm',
            roadmap: 'Roadmap',
            services: 'Leistungen',
            pricing: 'Preise',
            portfolio: 'Portfolio',
            blog: 'Blog',
            legal: 'Rechtliches',
            impressum: 'Impressum',
            privacy: 'Datenschutz',
            contactTitle: 'Kontakt',
            newsletter: 'Newsletter',
            newsletterText: 'Bleiben Sie auf dem Laufenden',
            emailPlaceholder: 'Ihre E-Mail',
            copyright: '© NJB CodeMasters d.o.o. Alle Rechte vorbehalten.',
            thankYou: 'Es wurde keine Newsletter-Anmeldung übermittelt. Ein Newsletterdienst ist noch nicht konfiguriert. Kontakt: nenad@njbcodemasters.com.'
        },
        sr: {
            description: 'NJB CodeMasters д.о.о. Горњи Милановац – софтвер, консалтинг и индустријски развој.',
            quickLinks: 'Брзи приступ',
            home: 'Почетна',
            about: 'О нама',
            product: 'VezaionGen VI',
            modules: 'Модули',
            pilot: 'Пилот програм',
            roadmap: 'Мапа пута',
            services: 'Услуге',
            pricing: 'Цене',
            portfolio: 'Портфолио',
            blog: 'Блог',
            legal: 'Правне информације',
            impressum: 'Правно обавештење',
            privacy: 'Приватност',
            contactTitle: 'Контакт',
            newsletter: 'Билтен',
            newsletterText: 'Будите у току',
            emailPlaceholder: 'Ваша адреса е-поште',
            copyright: '© NJB CodeMasters д.о.о. Сва права задржана.',
            thankYou: 'Пријава за билтен није послата. Сервис за билтен још није подешен. Контакт: nenad@njbcodemasters.com.'
        },
        en: {
            description: 'NJB CodeMasters d.o.o. Gornji Milanovac – software, consulting and industrial development.',
            quickLinks: 'Quick Access',
            home: 'Home',
            about: 'About Us',
            product: 'VezaionGen VI',
            modules: 'Modules',
            pilot: 'Pilot Program',
            roadmap: 'Roadmap',
            services: 'Services',
            pricing: 'Pricing',
            portfolio: 'Portfolio',
            blog: 'Blog',
            legal: 'Legal',
            impressum: 'Imprint',
            privacy: 'Privacy',
            contactTitle: 'Contact',
            newsletter: 'Newsletter',
            newsletterText: 'Stay up to date',
            emailPlaceholder: 'Your Email',
            copyright: '© NJB CodeMasters d.o.o. All rights reserved.',
            thankYou: 'No newsletter subscription was submitted. A newsletter service is not configured yet. Contact: nenad@njbcodemasters.com.'
        }
    };
    
    const t = translations[lang] || translations.de;
    
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer__content">
                <div class="footer__column">
                    <div class="footer__logo">
                        <picture class="logo-theme" aria-hidden="true">
                            <img src="${lightLogoSrc}" alt="" class="logo logo--image logo--light" width="473" height="774" loading="lazy">
                            <img src="${logoSrc}" alt="" class="logo logo--image logo--dark" width="473" height="774" loading="lazy">
                        </picture>
                        <div class="footer__brand-name">NJB CodeMasters ${lang === 'sr' ? 'д.о.о.' : 'd.o.o.'}</div>
                    </div>
                    <p class="footer__description">
                        ${t.description}
                    </p>
                </div>
                <div class="footer__column">
                    <h4 class="footer__title">${t.quickLinks}</h4>
                    <ul class="footer__links">
                        <li><a href="${pageHref('index.html')}">${t.home}</a></li>
                        <li><a href="${pageHref('about.html')}">${t.about}</a></li>
                        <li><a href="${pageHref('vezaiongen-vi.html')}">${t.product}</a></li>
                        <li><a href="${pageHref('modules.html')}">${t.modules}</a></li>
                        <li><a href="${pageHref('pilot-program.html')}">${t.pilot}</a></li>
                        <li><a href="${pageHref('roadmap.html')}">${t.roadmap}</a></li>
                        <li><a href="${pageHref('services.html')}">${t.services}</a></li>
                        <li><a href="${pageHref('pricing.html')}">${t.pricing}</a></li>
                        <li><a href="${pageHref('portfolio.html')}">${t.portfolio}</a></li>
                        <li><a href="${pageHref('blog.html')}">${t.blog}</a></li>
                    </ul>
                </div>
                <div class="footer__column">
                    <h4 class="footer__title">${t.legal}</h4>
                    <ul class="footer__links">
                        <li><a href="${pageHref('impressum.html')}">${t.impressum}</a></li>
                        <li><a href="${pageHref('datenschutz.html')}">${t.privacy}</a></li>
                    </ul>
                </div>
                <div class="footer__column">
                    <h4 class="footer__title">${t.contactTitle}</h4>
                    <ul class="footer__contact">
                        <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>${lang === 'sr' ? 'Баба Вишњина 5<br>32300 Горњи Милановац' : 'Baba Višnjina 5<br>32300 Gornji Milanovac'}<br>${lang === 'sr' ? 'Србија' : lang === 'de' ? 'Serbien' : 'Serbia'}</span>
                        </li>
                        <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <a href="mailto:nenad@njbcodemasters.com">nenad@njbcodemasters.com</a>
                        </li>
                    </ul>
                </div>
                <div class="footer__column">
                    <h4 class="footer__title">${t.newsletter}</h4>
                    <p class="footer__newsletter-text">${t.newsletterText}</p>
                    <form class="newsletter-form" id="newsletterForm">
                        <input type="email" placeholder="${t.emailPlaceholder}" required aria-label="${t.emailPlaceholder}">
                        <button type="submit" class="btn btn--primary">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2"/></svg>
                        </button>
                    </form>
                </div>
            </div>
            <div class="footer__bottom">
                <p>${t.copyright}</p>
            </div>
        </div>
    </footer>`;

    // Finde den Footer-Placeholder oder erstelle einen am Ende des body
    let footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) {
        // Wenn kein Placeholder existiert, füge den Footer am Ende des body hinzu
        footerPlaceholder = document.createElement('div');
        footerPlaceholder.id = 'footer-placeholder';
        document.body.appendChild(footerPlaceholder);
    }
    
    // Footer einfügen
    footerPlaceholder.outerHTML = footerHTML;

    // Newsletter-Form Event Listener
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const message = t.thankYou.replace('{email}', email);
            alert(message);
        });
    }
});
