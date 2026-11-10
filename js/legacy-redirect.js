(function() {
    'use strict';
    const supported = ['de', 'en', 'sr'];
    const normalize = value => String(value || '').toLowerCase().split(/[-_]/)[0];
    const current = new URL(window.location.href);
    const urlLanguage = current.pathname.match(/\/(de|en|sr)(?:\/|$)/);
    let language = urlLanguage?.[1];
    if (!language) {
        try {
            language = ['language', 'preferredLanguage', 'njb-language']
                .map(key => normalize(localStorage.getItem(key)))
                .find(value => supported.includes(value));
        } catch (error) {
            console.warn('Saved language is unavailable for legacy navigation.', error);
        }
    }
    language ||= (navigator.languages || [navigator.language])
        .map(normalize).find(value => supported.includes(value)) || 'de';
    const page = current.pathname.split('/').pop();
    const targetPage = page === 'njb.html' ? 'vezaiongen-vi.html' : page;
    const base = current.pathname.slice(0, current.pathname.lastIndexOf('/') + 1);
    current.pathname = `${base}${language}/${targetPage}`;
    current.searchParams.delete('page');
    window.location.replace(current.href);
})();
