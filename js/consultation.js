(() => {
    'use strict';

    const form = document.getElementById('consultationForm');
    if (!form) return;

    const requestType = form.elements.namedItem('requestType');
    const message = form.elements.namedItem('message');
    const status = document.getElementById('draftStatus');
    const language = document.documentElement.lang;
    const contentElement = document.getElementById('requestContent');
    if (!contentElement) {
        console.error('Contact request content is missing.');
        status.textContent = language === 'sr'
            ? 'Подешавања обрасца нису доступна. Пишите директно на nenad@njbcodemasters.com.'
            : 'Contact request configuration is missing. Please email nenad@njbcodemasters.com directly.';
        return;
    }
    const content = JSON.parse(contentElement.textContent);
    const notices = {
        de: 'Ein E-Mail-Entwurf wurde angefordert. Es wurde nichts versendet. Bitte im E-Mail-Programm prüfen und selbst senden oder die Nachricht manuell kopieren.',
        en: 'An email draft was requested. Nothing has been sent. Review and send it in your email application, or copy the message manually.',
        sr: 'Затражен је нацрт е-поште. Ништа није послато. Проверите и пошаљите поруку у свом програму или је ручно копирајте.'
    };
    const template = language === 'sr' ? `Поштовани,

Заинтересовани смо за VezaionGen VI.

Модел примене:
Пилот програм:
Модули који нас занимају:
Компанија:
Држава:
Додатне информације:

Срдачан поздрав` : `Hello,

I am interested in VezaionGen VI.

Deployment Model: [ ]
Pilot Program: [ ]
Modules of Interest: [ ]
Company: [ ]
Country: [ ]
Additional Information: [ ]

Best regards`;

    const query = new URLSearchParams(window.location.search);
    let generatedMessage = '';
    function prepareConsultation(fromLink = false) {
        if (fromLink) {
            const fragment = window.location.hash.slice(1);
            const area = fragment === 'vezaiongen-consultation' ? 'vezaiongen'
                : fragment.startsWith('request-') ? fragment.slice(8) : '';
            if (area && Object.hasOwn(content.labels, area)) {
                requestType.value = area;
            } else if (area) {
                console.warn('Unsupported contact request area:', area);
                status.textContent = content.prepared + ': ' + requestType.options[0].textContent;
            }
        }
        if (!message.value.trim() || message.value === generatedMessage) {
            const draft = requestType.value === 'vezaiongen' ? template : content.templates[requestType.value];
            generatedMessage = draft || '';
            message.value = generatedMessage;
            const packageName = query.get('package');
            if (requestType.value === 'website' && ['Starter', 'Professional', 'Premium', 'Почетни', 'Професионални', 'Премијум'].includes(packageName)) {
                generatedMessage += (language === 'sr' ? '\n\nПакет: ' : '\n\nPackage: ') + packageName;
                message.value = generatedMessage;
            }
        }
    }

    const requestedMessage = query.get('message');
    if (requestedMessage && !message.value.trim() && window.location.hash !== '#vezaiongen-consultation') {
        message.value = requestedMessage;
        requestType.value = 'website';
    }
    prepareConsultation(true);
    requestType.addEventListener('change', () => prepareConsultation());
    window.addEventListener('hashchange', () => prepareConsultation(true));
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const values = new FormData(form);
        const name = values.get('name').trim();
        const company = values.get('company').trim();
        const email = values.get('email').trim();
        const telephone = values.get('telephone').trim();
        const consultation = requestType.value === 'vezaiongen';
        const subject = consultation ? (language === 'sr' ? 'Упит за консултације о VezaionGen VI' : 'VezaionGen VI Consultation Request')
            : ((requestType.value === 'website' && query.get('subject')) || `${language === 'sr' ? 'NJB CodeMasters — упит' : 'NJB CodeMasters Enquiry'}: ${content.labels[requestType.value] || requestType.options[0].textContent}`);
        const body = language === 'sr'
            ? message.value.replace(/^Компанија:$/m, `Компанија: ${company}`)
                + `\n\nКонтакт подаци:\nИме: ${name}\nКомпанија: ${company}\nЕ-пошта: ${email}\nТелефон: ${telephone}`
            : message.value.replace('Company: [ ]', `Company: ${company}`)
                + `\n\nContact details:\nName: ${name}\nCompany: ${company}\nEmail: ${email}\nTelephone: ${telephone}`;

        status.textContent = notices[language] || notices.en;
        window.location.href = `mailto:nenad@njbcodemasters.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
})();
