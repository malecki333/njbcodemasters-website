(() => {
    'use strict';

    const API_ENDPOINT = 'https://workers.dev';

    if (document.getElementById('ai-chat-toggle')) return;

    const language = (document.documentElement.lang || 'en').slice(0, 2);
    const messages = {
        de: {
            title: 'VezaionGen VI AI-Assistent',
            welcome: 'System bereit. Fragen Sie zu Modulen, TMS-Logistik oder dem Pilotprogramm.',
            placeholder: 'Frage eingeben...',
            send: 'Senden',
            thinking: '> Analysiere Anfrage_',
            error: 'Verbindungsfehler. Kontakt: nenad@njbcodemasters.com',
            prompts: ['Was ist VezaionGen VI?', 'Wie läuft das Pilotprogramm ab?', 'TMS & Logistik-Module'],
            open: 'VezaionGen VI AI-Assistenten öffnen',
            close: 'Schließen'
        },
        en: {
            title: 'VezaionGen VI AI Assistant',
            welcome: 'System online. Ask about modules, TMS logistics, or the Pilot Program.',
            placeholder: 'Ask a question...',
            send: 'Send',
            thinking: '> Processing query_',
            error: 'Connection error. Contact: nenad@njbcodemasters.com',
            prompts: ['What is VezaionGen VI?', 'How does the Pilot Program work?', 'TMS & Logistics modules'],
            open: 'Open VezaionGen VI AI Assistant',
            close: 'Close'
        },
        sr: {
            title: 'VezaionGen VI AI асистент',
            welcome: 'Систем активан. Питајте о модулима, ТМС логистици или Пилот програму.',
            placeholder: 'Унесите питање...',
            send: 'Пошаљи',
            thinking: '> Обрада упита_',
            error: 'Грешка у вези. Контакт: nenad@njbcodemasters.com',
            prompts: ['Шта је VezaionGen VI?', 'Како ради Пилот програм?', 'ТМС и логистички модули'],
            open: 'Отвори VezaionGen VI AI асистента',
            close: 'Затвори'
        }
    };
    const text = messages[language] || messages.en;

    const style = document.createElement('style');
    style.textContent = `
        .ai-chat-log { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; font-size: 0.9rem; line-height: 1.45; }
        .ai-msg { padding: 8px 10px; border-radius: 6px; word-wrap: break-word; }
        .ai-msg--bot { background: rgba(0, 212, 255, 0.08); border-left: 2px solid #00d4ff; }
        .ai-msg--user { background: rgba(255, 255, 255, 0.08); align-self: flex-end; text-align: right; }
        .ai-quick-prompts { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
        .ai-chip { background: transparent; border: 1px solid rgba(0, 212, 255, 0.4); color: inherit; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; }
        .ai-chip:hover { background: rgba(0, 212, 255, 0.15); }
        .ai-input-row { display: flex; gap: 6px; }
        .ai-input { flex: 1; padding: 7px 10px; border-radius: 4px; border: 1px solid rgba(0, 212, 255, 0.35); background: rgba(0, 0, 0, 0.35); color: inherit; font-size: 0.85rem; }
        .ai-send-btn { padding: 7px 12px; border-radius: 4px; border: 1px solid #00d4ff; background: rgba(0, 212, 255, 0.15); color: inherit; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
        .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
    document.head.append(style);

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

    const chatLog = document.createElement('div');
    chatLog.className = 'ai-chat-log';
    chatLog.setAttribute('aria-live', 'polite');

    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'ai-msg ai-msg--bot';
    welcomeMsg.textContent = text.welcome;
    chatLog.append(welcomeMsg);

    const quickPrompts = document.createElement('div');
    quickPrompts.className = 'ai-quick-prompts';
    text.prompts.forEach((promptText) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'ai-chip';
        chip.textContent = promptText;
        chip.addEventListener('click', () => sendMessage(promptText));
        quickPrompts.append(chip);
    });

    const form = document.createElement('form');
    form.className = 'ai-input-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ai-input';
    input.placeholder = text.placeholder;
    input.maxLength = 500;
    input.required = true;

    const sendBtn = document.createElement('button');
    sendBtn.type = 'submit';
    sendBtn.className = 'ai-send-btn';
    sendBtn.textContent = text.send;

    form.append(input, sendBtn);
    content.append(chatLog, quickPrompts, form);
    panel.append(header, content);
    document.body.append(toggle, panel);

    const typeWriter = (element, fullText) => {
        element.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += fullText.charAt(i);
            i += 1;
            chatLog.scrollTop = chatLog.scrollHeight;
            if (i >= fullText.length) clearInterval(timer);
        }, 16);
    };

    const sendMessage = async (rawMessage) => {
        const question = rawMessage.trim();
        if (!question || sendBtn.disabled) return;

        const userBubble = document.createElement('div');
        userBubble.className = 'ai-msg ai-msg--user';
        userBubble.textContent = question;
        chatLog.append(userBubble);

        const botBubble = document.createElement('div');
        botBubble.className = 'ai-msg ai-msg--bot';
        botBubble.textContent = text.thinking;
        chatLog.append(botBubble);
        chatLog.scrollTop = chatLog.scrollHeight;

        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        try {
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question, lang: language })
            });
            const data = await res.json();
            typeWriter(botBubble, data.reply || text.error);
        } catch {
            botBubble.textContent = text.error;
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(input.value);
    });

    const setOpen = (open) => {
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        if (open) input.focus();
        else toggle.focus();
    };

    toggle.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });
})();
