(() => {
    'use strict';

    if (document.getElementById('ai-chat-toggle')) return;

    const language = document.documentElement.lang;
    const messages = {
        de: {
            title: 'VezaionGen VI AI-Assistent',
            unavailable: 'Diese Funktion wird derzeit vorbereitet. Ein vollständiger KI-Assistent wird in einer zukünftigen Version verfügbar sein.',
            contact: 'Für Beratungs- und Pilotanfragen:',
            email: 'nenad@njbcodemasters.com',
            open: 'Informationen zum VezaionGen VI AI-Assistenten öffnen',
            close: 'Schließen'
        },
        en: {
            title: 'VezaionGen VI AI Assistant',
            unavailable: 'This feature is currently being prepared. A full AI-powered assistant experience will be available in a future release.',
            contact: 'For consultations and pilot inquiries:',
            email: 'nenad@njbcodemasters.com',
            open: 'Open VezaionGen VI AI Assistant information',
            close: 'Close'
        },
        sr: {
            title: 'VezaionGen VI асистент',
            unavailable: 'Ова функција је тренутно у припреми. Асистент са вештачком интелигенцијом планиран је за будуће издање.',
            contact: 'За консултације и упите о пилот-програму:',
            email: 'nenad@njbcodemasters.com',
            open: 'Отвори информације о асистенту VezaionGen VI',
            close: 'Затвори'
        }
    };
    const text = messages[language] || messages.en;

    const toggle = document.createElement('button');
    toggle.id = 'ai-chat-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', text.open);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'ai-chat-window');
    const face = document.createElement('img');
    face.src = '/assets/brand/njb-codemasters-mark.png';
    face.alt = '';
    face.width = 36;
    face.height = 44;
    face.setAttribute('aria-hidden', 'true');
    toggle.append(face);

    const panel = document.createElement('section');
    panel.id = 'ai-chat-window';
    panel.className = 'ai-assistant-window';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'ai-assistant-title');
    panel.hidden = true;

    const heading = document.createElement('h2');
    heading.id = 'ai-assistant-title';
    heading.textContent = text.title;

    const close = document.createElement('button');
    close.id = 'ai-close-btn';
    close.type = 'button';
    close.className = 'ai-assistant-close';
    close.setAttribute('aria-label', text.close);
    close.textContent = '×';

    const header = document.createElement('div');
    header.className = 'ai-assistant-header';
    header.append(heading, close);

    const content = document.createElement('div');
    content.className = 'ai-assistant-content';

    const notice = document.createElement('p');
    notice.textContent = text.unavailable;

    const contact = document.createElement('p');
    contact.textContent = text.contact;

    const email = document.createElement('a');
    email.href = `mailto:${text.email}`;
    email.textContent = text.email;

    content.append(notice, contact, email);
    panel.append(header, content);
    document.body.append(toggle, panel);

    const setOpen = (open) => {
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        if (open) close.focus();
        else toggle.focus();
    };

    toggle.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });
})();
