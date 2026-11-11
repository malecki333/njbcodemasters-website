// Main JavaScript - Global functionality
(function() {
    'use strict';
    if (window.mainInitialized) return;
    window.mainInitialized = true;
    const isSerbian = document.documentElement.lang === 'sr';
    
    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = newsletterForm.querySelector('input[type="email"]').value;
            const button = newsletterForm.querySelector('button');
            const originalButtonHTML = button.innerHTML;
            
            // Show loading state
            button.disabled = true;
            button.innerHTML = `
                <div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
            `;
            
            try {
                // Simulate API call (replace with actual API endpoint)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Success feedback
                showNotification(
                    isSerbian ? 'Пријава за билтен није послата. Сервис још није повезан.' : 'Erfolgreich angemeldet! Vielen Dank.',
                    isSerbian ? 'error' : 'success'
                );
                newsletterForm.reset();
                
            } catch (error) {
                // Error feedback
                showNotification(isSerbian ? 'Дошло је до грешке. Покушајте поново касније.' : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'error');
            } finally {
                button.disabled = false;
                button.innerHTML = originalButtonHTML;
            }
        });
    }
    
    // Notification system
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };
    
    // Add notification animations
    const addNotificationStyles = () => {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    };
    
    addNotificationStyles();
    
    // Performance monitoring
    if ('PerformanceObserver' in window) {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const url = new URL(entry.name);
                const isBackgroundVideo = url.pathname.endsWith('/assets/video/videoplayback.mp4');
                const requestDuration = entry.responseEnd - entry.requestStart;

                if (!isBackgroundVideo && entry.transferSize > 0 && requestDuration > 1000) {
                    console.warn('Slow resource:', entry.name, `${Math.round(requestDuration)}ms`);
                }
            }
        });
        
        try {
            perfObserver.observe({ type: 'resource', buffered: true });
        } catch (error) {
            console.error('Resource performance monitoring could not start.', error);
        }
    }
    
    // Add meta tags if missing
    const ensureMetaTags = () => {
        if (!document.querySelector('meta[name="theme-color"]')) {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = '#6366f1';
            document.head.appendChild(meta);
        }
        
        if (!document.querySelector('meta[name="viewport"]')) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(meta);
        }
    };
    
    ensureMetaTags();

    // Basis-Pfad für Assets (da Seiten in /de, /sr, /en liegen können)
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const langBasePrefix = ['de', 'en', 'sr'].includes(pathParts[0]) ? '..' : '.';

    // Keep preference across visits and playback position within this tab.
    const initSoundToggle = () => {
        const readStorage = (storageName, key) => {
            try {
                return window[storageName].getItem(key);
            } catch (error) {
                console.warn(`Sound preference storage is unavailable (${storageName}).`, error);
                return null;
            }
        };
        const writeStorage = (storageName, key, value) => {
            try {
                window[storageName].setItem(key, value);
            } catch (error) {
                console.warn(`Sound preference could not be saved (${storageName}).`, error);
            }
        };
        const savedPreference = readStorage('localStorage', 'soundEnabled');
        let isMuted = savedPreference === 'false';
        if (savedPreference === null) writeStorage('localStorage', 'soundEnabled', 'true');
        let soundState = 'off';
        let playbackRequest = 0;
        let lastPositionSave = 0;
        let positionRestored = false;
        const savedPosition = Number(readStorage('sessionStorage', 'soundPlaybackPosition'));
        
        const audio = new Audio();
        audio.src = `${langBasePrefix}/assets/sounds/interface-sound.mp3`;
        audio.preload = 'auto';
        audio.autoplay = false;
        audio.loop = true;
        audio.volume = 0.6;
        audio.playsInline = true;

        const emitSoundEvent = (name) => window.dispatchEvent(new Event(name));
        const savePosition = () => {
            if (positionRestored && audio.readyState >= 1 && Number.isFinite(audio.currentTime)) {
                writeStorage('sessionStorage', 'soundPlaybackPosition', String(audio.currentTime));
            }
        };

        // Reuse the existing #soundToggle button if present; else create one.
        const existingBtn = document.getElementById('soundToggle');
        let soundToggle;
        let isManaged; // true = button HTML is managed by us

        if (existingBtn) {
            soundToggle = existingBtn;
            isManaged = false; // button markup already exists in HTML
        } else {
            soundToggle = document.createElement('button');
            soundToggle.type = 'button';
            soundToggle.className = 'sound-toggle';
            soundToggle.setAttribute('aria-label', isSerbian ? 'Укључи или искључи звук' : 'Sound umschalten');
            isManaged = true;
        }

        const updateToggleUI = () => {
            const active = soundState === 'active';
            const label = isSerbian
                ? (soundState === 'loading' ? 'Звук се учитава'
                    : soundState === 'blocked' ? 'Укључи звук'
                    : soundState === 'error' ? 'Звук није доступан'
                    : active ? 'Звук је укључен' : 'Звук је искључен')
                : soundState === 'loading' ? 'Sound l\u00e4dt'
                : soundState === 'blocked' ? 'Sound aktivieren'
                : soundState === 'error' ? 'Sound nicht verf\u00fcgbar'
                : active ? 'Sound an' : 'Sound aus';
            if (isManaged) {
                // Full SVG replacement for dynamically created button
                soundToggle.innerHTML = `
                    <svg class="sound-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path class="sound-speaker" d="M11 5L6 9H2v6h4l5 4V5z"/>
                        <line class="sound-wave sound-wave-1" x1="15.5" y1="8.5" x2="15.5" y2="15.5" style="opacity:${isMuted ? 0 : 1}"/>
                        <line class="sound-wave sound-wave-2" x1="18.5" y1="6" x2="18.5" y2="18" style="opacity:${isMuted ? 0 : 1}"/>
                        <line class="sound-wave sound-wave-3" x1="21.5" y1="4" x2="21.5" y2="20" style="opacity:${isMuted ? 0 : 1}"/>
                        <line class="sound-mute" x1="17" y1="9" x2="23" y2="15" style="opacity:${isMuted ? 1 : 0}"/>
                        <line class="sound-mute" x1="23" y1="9" x2="17" y2="15" style="opacity:${isMuted ? 1 : 0}"/>
                    </svg>
                    <span class="sound-label">${label}</span>
                `;
            } else {
                // Update the existing HTML button by toggling element visibility
                const waveEls = soundToggle.querySelectorAll('.sound-wave-1, .sound-wave-2, .sound-wave-3');
                const muteEls = soundToggle.querySelectorAll('.sound-mute');
                const labelEl = soundToggle.querySelector('.sound-label');
                waveEls.forEach(el => { el.style.display = active ? '' : 'none'; });
                muteEls.forEach(el => { el.style.display = active ? 'none' : ''; });
                if (labelEl) labelEl.textContent = label;
            }
            soundToggle.dataset.soundState = soundState;
            soundToggle.setAttribute('aria-busy', (soundState === 'loading').toString());
            soundToggle.setAttribute('aria-pressed', (!isMuted).toString());
            soundToggle.setAttribute('aria-label', isSerbian
                ? (soundState === 'blocked' ? 'Кликните да укључите звук' : `${label}; ${isMuted ? 'Укључи звук' : 'Искључи звук'}`)
                : (soundState === 'blocked' ? 'Sound durch Klick aktivieren' : `${label}; ${isMuted ? 'Sound einschalten' : 'Sound ausschalten'}`));
        };

        soundToggle.addEventListener('click', () => {
            if (!isMuted && soundState === 'blocked') {
                tryPlay();
                return;
            }
            isMuted = !isMuted;
            writeStorage('localStorage', 'soundEnabled', (!isMuted).toString());
            if (isMuted) {
                playbackRequest++;
                soundState = 'off';
                savePosition();
                audio.pause();
                emitSoundEvent('sound-stop');
            } else {
                tryPlay();
            }
            updateToggleUI();
        });

        updateToggleUI();

        if (isManaged) {
            const headerActions = document.querySelector('.nav__actions');
            (headerActions || document.body).appendChild(soundToggle);
        }

        const tryPlay = () => {
            if (isMuted || soundState === 'loading') return;
            const request = ++playbackRequest;
            soundState = 'loading';
            updateToggleUI();
            audio.play().catch(error => {
                if (request !== playbackRequest) return;
                emitSoundEvent('sound-stop');
                if (error.name === 'NotAllowedError') {
                    soundState = 'blocked';
                } else {
                    soundState = isMuted ? 'off' : 'error';
                    console.error('Sound playback failed.', error);
                }
                updateToggleUI();
            });
        };

        audio.addEventListener('loadedmetadata', () => {
            if (Number.isFinite(savedPosition) && savedPosition > 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
                audio.currentTime = savedPosition % audio.duration;
            }
            positionRestored = true;
        });
        audio.addEventListener('timeupdate', () => {
            if (Date.now() - lastPositionSave < 1000) return;
            lastPositionSave = Date.now();
            savePosition();
        });
        audio.addEventListener('playing', () => {
            if (isMuted) { audio.pause(); return; }
            soundState = 'active';
            updateToggleUI();
            emitSoundEvent('sound-play');
        });
        audio.addEventListener('waiting', () => {
            if (!isMuted && !audio.paused) {
                soundState = 'loading';
                updateToggleUI();
                emitSoundEvent('sound-stop');
            }
        });
        audio.addEventListener('pause', () => {
            savePosition();
            if (isMuted) soundState = 'off';
            updateToggleUI();
            emitSoundEvent('sound-stop');
        });
        audio.addEventListener('error', () => {
            soundState = isMuted ? 'off' : 'error';
            playbackRequest++;
            updateToggleUI();
            emitSoundEvent('sound-stop');
            if (audio.error) {
                console.error('Failed to load the site audio.', audio.error);
            }
        });
        const resumeAfterInteraction = (event) => {
            if (event.target instanceof Element && event.target.closest('#soundToggle, .sound-toggle')) return;
            if (!isMuted && soundState === 'blocked') tryPlay();
        };
        document.addEventListener('pointerdown', resumeAfterInteraction, { capture: true, passive: true });
        document.addEventListener('keydown', resumeAfterInteraction, { capture: true });
        window.addEventListener('pagehide', savePosition);
        window.addEventListener('pageshow', (event) => {
            if (event.persisted && !isMuted && audio.paused) {
                soundState = 'off';
                tryPlay();
            }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) savePosition();
        });
        window.addEventListener('storage', (event) => {
            if (event.key !== 'soundEnabled') return;
            isMuted = event.newValue === 'false';
            if (isMuted) {
                playbackRequest++;
                soundState = 'off';
                audio.pause();
                emitSoundEvent('sound-stop');
                updateToggleUI();
            } else {
                tryPlay();
            }
        });

        audio.load();
        if (!isMuted) tryPlay();
    };
    
    // Cookie consent (basic implementation)
    const initCookieConsent = () => {
        const cookieConsent = localStorage.getItem('cookieConsent');
        
        if (!cookieConsent) {
            const banner = document.createElement('div');
            banner.id = 'cookieConsentBanner';
            banner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--bg-secondary);
                padding: 24px;
                box-shadow: var(--shadow-xl);
                z-index: 10000;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
                border-top: 1px solid var(--border-color);
            `;
            
            banner.innerHTML = `
                <p style="margin: 0; color: var(--text-primary); flex: 1;">
                    ${isSerbian ? 'У прегледачу чувамо ваша подешавања језика, приказа, звука и овог обавештења.' : 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.'}
                    <a href="datenschutz.html" style="color: var(--primary-color); text-decoration: underline;">${isSerbian ? 'Сазнајте више' : 'Mehr erfahren'}</a>
                </p>
                <button id="acceptCookies" class="btn btn--primary" style="flex-shrink: 0;">
                    ${isSerbian ? 'Прихватам' : 'Akzeptieren'}
                </button>
            `;
            
            document.body.appendChild(banner);
            const positionFloatingControls = () => {
                document.documentElement.style.setProperty('--floating-control-bottom', `${Math.ceil(banner.getBoundingClientRect().height) + 16}px`);
            };
            positionFloatingControls();
            window.addEventListener('resize', positionFloatingControls);
            
            document.getElementById('acceptCookies')?.addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'true');
                banner.style.animation = 'slideOutDown 0.3s ease-out';
                setTimeout(() => {
                    banner.remove();
                    window.removeEventListener('resize', positionFloatingControls);
                    document.documentElement.style.removeProperty('--floating-control-bottom');
                }, 300);
            });
        }
    };
    
    // Initialize cookie consent after a short delay
    setTimeout(initCookieConsent, 1000);
    
    // Print current year in footer copyright
    const updateCopyrightYear = () => {
        const copyrightElements = document.querySelectorAll('[data-year]');
        const currentYear = new Date().getFullYear();
        copyrightElements.forEach(el => {
            el.textContent = currentYear;
        });
    };
    
    updateCopyrightYear();

    // Cursor reveal overlay - Hexagonal particle membrane effect (OPTIMIZED)
    const initRevealOverlay = () => {
        if (document.querySelector('.reveal-overlay')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const touchBackground = !window.matchMedia('(pointer: fine)').matches;

        // Text-Layer im Hintergrund
        const textLayer = document.createElement('div');
        textLayer.className = 'reveal-text-layer';
        textLayer.innerHTML = '<div class="reveal-text-content"></div>';

        const textContent = textLayer.querySelector('.reveal-text-content');

        // Typing-effect overlay to mimic live text input (placed above overlay so it stays visible)
        const typingLine = document.createElement('div');
        typingLine.className = 'reveal-typing-line';
        typingLine.innerHTML = '<span class="typing-prefix">&gt; </span><span class="typing-text"></span><span class="typing-caret">_</span>';
        typingLine.style.cssText = `
            position: fixed;
            left: 16px;
            bottom: 16px;
            padding: 10px 14px;
            border-radius: 10px;
            font-family: "SF Mono", "Fira Code", Consolas, monospace;
            font-size: 15px;
            letter-spacing: 0.6px;
            background: rgba(15, 23, 42, 0.85);
            color: #e2e8f0;
            text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
            pointer-events: none;
            z-index: 20000;
            box-sizing: border-box;
            max-width: calc(100vw - 32px);
            max-width: calc(100dvw - 32px);
            white-space: normal;
            overflow-wrap: anywhere;
            line-height: 1.5;
            opacity: 0;
            transition: opacity 200ms ease;
        `;

        const typingTextEl = typingLine.querySelector('.typing-text');
        const caretEl = typingLine.querySelector('.typing-caret');
        const isGerman = document.documentElement.lang === 'de';

        const bootMessages = isSerbian ? [
            'покретање приказа NJB CodeMasters...',
            'учитавање честичне мембране...'
        ] : isGerman ? [
            'NJB CodeMasters wird gestartet...',
            'Partikelmembran wird geladen...'
        ] : [
            'booting CodeMasters overlay...',
            'loading particle membrane...'
        ];

        const loopingMessages = isSerbian ? [
            'Потребан вам је веб-сајт или апликација?',
            'Развијмо је заједно — јавите нам се.',
            'Потребни су вам дизајн, идентитет или маркетинг?',
            'Осмислимо решење — јавите нам се.',
            'Потребни су вам стратегија и саветовање?',
            'Размотримо наредне кораке — јавите нам се.',
            'NJB CodeMasters',
            'Индустрија 6.0',
            'Дигитални близанац',
            'Аутономни процеси',
            'Индустријска интелигенција',
            'Системи знања',
            'Предиктивна аналитика',
            'Индустријска вештачка интелигенција',
            'VezaionGen VI',
            'Још користите Индустрију 4.0?',
            'Спремни сте за Индустрију 6.0?',
            'Развијајмо отпорне системе',
            'Развијајмо интелигентну индустрију',
            'Развијајмо VezaionGen VI'
        ] : isGerman ? [
            'Sie brauchen eine Website oder Web-App?',
            'Entwickeln wir sie gemeinsam - schreiben Sie uns.',
            'Sie brauchen Design, Markenauftritt oder Marketing?',
            'Gestalten wir Ihre Idee - schreiben Sie uns.',
            'Sie brauchen Strategie und Beratung?',
            'Planen wir Ihre nächsten Schritte gemeinsam.',
            'NJB CodeMasters',
            'Industrie 6.0',
            'Digitaler Zwilling',
            'Autonome Prozesse',
            'Industrielle Intelligenz',
            'Wissenssysteme',
            'Vorhersagende Analytik',
            'Industrielle KI',
            'VezaionGen VI',
            'Nutzen Sie noch Industrie 4.0?',
            'Bereit für Industrie 6.0?',
            'Entwickeln wir widerstandsfähige Systeme',
            'Gestalten wir die intelligente Industrie',
            'Entwickeln wir VezaionGen VI'
        ] : [
            'Need a website or web app?',
            'Let’s build it — message me.',
            'Need design, branding, marketing?',
            'I’ll craft it — message me.',
            'Need strategy and consulting?',
            'I’ll guide you — message me.',
            'NJB CodeMasters',
            'Industry 6.0',
            'Digital Twin',
            'Autonomous Operations',
            'Industrial Intelligence',
            'Knowledge Systems',
            'Predictive Analytics',
            'Industrial AI',
            'VezaionGen VI',
            'Still using Industry 4.0?',
            'Ready for Industry 6.0?',
            'Build resilient systems',
            'Build intelligent industry',
            'Build VezaionGen VI'
        ];

        let typingIndex = 0;
        let charIndex = 0;
        let isErasing = false;
        let hasPlayedBoot = false;

        const typeSpeed = 80;
        const eraseSpeed = 35;
        const holdDelay = 900;
        const betweenDelay = 600;

        const stepTyping = () => {
            // Erst Boot-Nachrichten, danach endlos CTAs loopen
            let currentMessage;
            if (!hasPlayedBoot && typingIndex < bootMessages.length) {
                currentMessage = bootMessages[typingIndex];
            } else {
                if (!hasPlayedBoot) {
                    hasPlayedBoot = true;
                    typingIndex = 0;
                }
                currentMessage = loopingMessages[typingIndex % loopingMessages.length];
            }

            if (!isErasing) {
                if (charIndex <= currentMessage.length) {
                    typingTextEl.textContent = currentMessage.slice(0, charIndex);
                    charIndex++;
                    setTimeout(stepTyping, typeSpeed);
                } else {
                    isErasing = true;
                    setTimeout(stepTyping, holdDelay);
                }
            } else {
                if (charIndex >= 0) {
                    typingTextEl.textContent = currentMessage.slice(0, charIndex);
                    charIndex--;
                    setTimeout(stepTyping, eraseSpeed);
                } else {
                    isErasing = false;
                    charIndex = 0; // reset before next message to avoid prefilled text
                    if (!hasPlayedBoot && typingIndex < bootMessages.length - 1) {
                        typingIndex++;
                    } else if (!hasPlayedBoot && typingIndex === bootMessages.length - 1) {
                        hasPlayedBoot = true;
                        typingIndex = 0;
                    } else {
                        typingIndex = (typingIndex + 1) % loopingMessages.length;
                    }
                    setTimeout(stepTyping, betweenDelay);
                }
            }
        };

        // Blink caret without extra CSS
        setInterval(() => {
            caretEl.style.opacity = caretEl.style.opacity === '0' ? '1' : '0';
        }, 550);

        stepTyping();

        // show/hide typing line depending on sound playback
        const showTyping = () => {
            typingLine.style.opacity = '1';
        };
        const hideTyping = () => {
            typingLine.style.opacity = '0';
        };
        hideTyping();
        window.addEventListener('sound-play', showTyping);
        window.addEventListener('sound-stop', hideTyping);

        // place typing line on body so the overlay canvas does not cover it
        document.body.appendChild(typingLine);

        const fillTextGrid = () => {
            const style = getComputedStyle(textContent);
            const measurement = document.createElement('canvas').getContext('2d');
            if (!measurement) {
                console.error('Background text: Canvas 2D context is unavailable.');
                return;
            }
            measurement.font = style.font;
            const word = '<CodeMasters>';
            const cols = Math.ceil(window.innerWidth / measurement.measureText(word).width) + 1;
            const rows = Math.ceil(window.innerHeight / parseFloat(style.lineHeight)) + 1;
            textContent.textContent = (word.repeat(cols) + '\n').repeat(rows);
        };

        // Image-Layer über dem Text - Canvas-basierte Video-Maskierung
        const imageLayer = document.createElement('div');
        imageLayer.className = 'reveal-image-layer';
        imageLayer.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: -2;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            opacity: 1;
        `;
        
        // Canvas für maskiertes Video
        const maskedCanvas = document.createElement('canvas');
        maskedCanvas.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        imageLayer.appendChild(maskedCanvas);
        
        const maskedCtx = maskedCanvas.getContext('2d', { alpha: true });
        if (!maskedCtx) {
            console.error('Video background: Canvas 2D context is unavailable.');
            return;
        }
        
        // Video-Element (versteckt)
        const video = document.createElement('video');
        video.src = `${langBasePrefix}/assets/video/videoplayback.mp4`;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.style.display = 'none';
        document.body.appendChild(video);
        
        // Maske laden
        const maskImg = new Image();
        maskImg.src = `${langBasePrefix}/assets/images/25604.png`;
        
        // Canvas-Dimensionen setzen
        const resizeMaskedCanvas = () => {
            maskedCanvas.width = window.innerWidth;
            maskedCanvas.height = window.innerHeight;
        };
        resizeMaskedCanvas();
        
        let pageSuspended = document.hidden;
        const startVideo = () => {
            if (pageSuspended) return;
            video.play().catch(error => console.warn('Background video playback was blocked or interrupted.', error));
        };
        video.addEventListener('error', () => console.error('Background video failed to load.', video.error));
        maskImg.addEventListener('error', () => console.error('Background video mask failed to load.'));
        video.addEventListener('loadeddata', startVideo);
        document.addEventListener('pointerdown', () => {
            if (video.paused) startVideo();
        }, { passive: true });

        const useVideoFrames = typeof video.requestVideoFrameCallback === 'function';
        let animationFrameId = null;
        let lastVideoTime = -1;
        const scheduleVideoFrame = () => {
            animationFrameId = useVideoFrames
                ? video.requestVideoFrameCallback(renderMaskedVideo)
                : requestAnimationFrame(renderMaskedVideo);
        };
        const renderMaskedVideo = () => {
            animationFrameId = null;
            if (pageSuspended) return;
            const ready = video.readyState >= 2 && maskImg.complete && maskImg.naturalWidth > 0;
            
            const w = maskedCanvas.width;
            const h = maskedCanvas.height;
            
            // Clear canvas
            if (ready && video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
                maskedCtx.clearRect(0, 0, w, h);
                maskedCtx.drawImage(video, 0, 0, w, h);
                maskedCtx.globalCompositeOperation = 'destination-in';
                maskedCtx.drawImage(maskImg, 0, 0, w, h);
                maskedCtx.globalCompositeOperation = 'source-over';
            }
            
            scheduleVideoFrame();
        };
        
        window.addEventListener('resize', () => {
            resizeMaskedCanvas();
        });
        
        const overlay = document.createElement('div');
        overlay.className = 'reveal-overlay';
        
        const canvas = document.createElement('canvas');
        overlay.appendChild(canvas);
        
        // Reihenfolge: Text-Layer (dahinter), Image-Layer (darüber), Overlay (davor)
        if (document.body.firstChild) {
            document.body.insertBefore(textLayer, document.body.firstChild);
            document.body.insertBefore(imageLayer, document.body.firstChild);
            document.body.insertBefore(overlay, document.body.firstChild);
        } else {
            document.body.appendChild(textLayer);
            document.body.appendChild(imageLayer);
            document.body.appendChild(overlay);
        }

        fillTextGrid();
        
        const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
        if (!ctx) {
            console.error('Membrane background: Canvas 2D context is unavailable.');
            return;
        }
        
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;
        let isActive = true;
        let time = 0;
        
        const spacing = 32;
        
        // Spatial grid für schnelle Nachbarsuche
        const grid = new Map();
        const gridSize = spacing * 2;
        
        const getGridKey = (x, y) => {
            const gx = Math.floor(x / gridSize);
            const gy = Math.floor(y / gridSize);
            return `${gx},${gy}`;
        };
        
        const particles = [];
        const particleSprites = Array.from({ length: 9 }, (_, force) => {
            const sprite = document.createElement('canvas');
            sprite.width = sprite.height = 32;
            const spriteCtx = sprite.getContext('2d');
            if (!spriteCtx) {
                console.error('Membrane particle sprite: Canvas 2D context is unavailable.');
                return null;
            }
            const gradient = spriteCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1, 0.9 + force * 0.1)})`);
            gradient.addColorStop(0.6, `rgba(0, 0, 0, ${Math.min(1, 0.6 + force * 0.2)})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            spriteCtx.fillStyle = gradient;
            spriteCtx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = Math.PI / 4 * i;
                const x = 16 + Math.cos(angle) * 11.2;
                const y = 16 + Math.sin(angle) * 11.2;
                if (i === 0) spriteCtx.moveTo(x, y);
                else spriteCtx.lineTo(x, y);
            }
            spriteCtx.closePath();
            spriteCtx.fill();
            return sprite;
        });
        
        class HexParticle {
            constructor(gridX, gridY, offsetX, offsetY) {
                this.baseX = offsetX + gridX * spacing;
                this.baseY = offsetY + gridY * spacing + (gridX % 2 ? spacing / 2 : 0);
                this.x = this.baseX;
                this.y = this.baseY;
                this.vx = 0;
                this.vy = 0;
                this.size = 5 + Math.random() * 3;
                this.noiseOffset = Math.random() * 1000;
                this.repelForce = 0;
                this.gridKey = getGridKey(this.x, this.y);
            }
            
            update(step) {
                const dx = currentX - this.x;
                const dy = currentY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Repel from cursor (creates opening)
                const repelRadius = 250;
                if (dist < repelRadius && dist > 1) {
                    const force = (1 - dist / repelRadius) * 8;
                    this.repelForce = force;
                    this.vx -= (dx / dist) * force * step;
                    this.vy -= (dy / dist) * force * step;
                } else {
                    this.repelForce *= Math.pow(0.9, step);
                }
                
                // Organic noise movement
                const nearX = currentX - this.baseX;
                const nearY = currentY - this.baseY;
                const nearSpotlight = nearX * nearX + nearY * nearY < 450 * 450;
                const noiseX = nearSpotlight ? Math.sin(time * 0.0008 + this.noiseOffset) * 0.5 : 0;
                const noiseY = nearSpotlight ? Math.cos(time * 0.001 + this.noiseOffset) * 0.5 : 0;
                this.vx += noiseX * step;
                this.vy += noiseY * step;
                
                // Spring back to base position
                this.vx += (this.baseX - this.x) * 0.03 * step;
                this.vy += (this.baseY - this.y) * 0.03 * step;
                
                // Friction
                this.vx *= Math.pow(0.88, step);
                this.vy *= Math.pow(0.88, step);
                
                this.x += this.vx * step;
                this.y += this.vy * step;
                
                // Update grid position
                const newKey = getGridKey(this.x, this.y);
                if (newKey !== this.gridKey) {
                    this.gridKey = newKey;
                }
            }
            
            getNearbyParticles() {
                const nearby = [];
                const [gx, gy] = this.gridKey.split(',').map(Number);
                
                // Nur benachbarte Grid-Zellen prüfen
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const key = `${gx + dx},${gy + dy}`;
                        const cellParticles = grid.get(key);
                        if (cellParticles) {
                            nearby.push(...cellParticles);
                        }
                    }
                }
                
                return nearby.filter(n => {
                    if (n === this) return false;
                    const dx = n.x - this.x;
                    const dy = n.y - this.y;
                    return dx * dx + dy * dy < (spacing * 1.8) ** 2;
                });
            }
            
            isInSpotlight() {
                const dx = currentX - this.x;
                const dy = currentY - this.y;
                return dx * dx + dy * dy < 350 * 350;
            }
            
            draw(ctx, neighbors) {
                // Nur zeichnen wenn im Spotlight
                if (!this.isInSpotlight()) return;
                
                const dx = currentX - this.x;
                const dy = currentY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const opacity = Math.max(0, 1 - dist / 350);
                
                // Verbindungen nur zu Nachbarn die auch im Spotlight sind
                ctx.strokeStyle = `rgba(0, 0, 0, ${(0.4 + this.repelForce * 0.1) * opacity})`;
                ctx.lineWidth = (2 + this.repelForce * 0.5) * opacity;
                ctx.beginPath();
                
                neighbors.forEach(n => {
                    if (!n.isInSpotlight()) return;
                    const dx = n.x - this.x;
                    const dy = n.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < spacing * 1.8) {
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(n.x, n.y);
                    }
                });
                ctx.stroke();
                
                const sprite = particleSprites[Math.min(8, Math.round(this.repelForce))];
                if (sprite) {
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(sprite, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                    ctx.globalAlpha = 1;
                }
            }
        }
        
        // Initialize hexagonal grid
        const initGrid = () => {
            particles.length = 0;
            grid.clear();
            
            const offsetX = -spacing;
            const offsetY = -spacing;
            const cols = Math.ceil(window.innerWidth / spacing) + 2;
            const rows = Math.ceil(window.innerHeight / spacing) + 2;
            
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const p = new HexParticle(x, y, offsetX, offsetY);
                    particles.push(p);
                    
                    if (!grid.has(p.gridKey)) {
                        grid.set(p.gridKey, []);
                    }
                    grid.get(p.gridKey).push(p);
                }
            }
        };
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            initGrid();
            fillTextGrid();
        };
        
        resize();
        window.addEventListener('resize', resize, { passive: true });
        
        const lerp = (start, end, factor) => start + (end - start) * factor;
        let membraneFrameId = null;
        let lastMembraneTime = null;
        
        const render = (timestamp) => {
            membraneFrameId = null;
            if (pageSuspended || !isActive) return;
            const elapsed = lastMembraneTime === null ? 1000 / 60 : timestamp - lastMembraneTime;
            lastMembraneTime = timestamp;
            const step = Math.min(elapsed / (1000 / 60), 2);
            time += step;
            // Reach 90% of the pointer position in about 55ms, independent of refresh rate.
            const follow = 1 - Math.exp(-elapsed / 24);
            currentX = lerp(currentX, targetX, follow);
            currentY = lerp(currentY, targetY, follow);
            
            // Update particles FIRST
            grid.clear();
            particles.forEach(p => {
                const dx = currentX - p.baseX;
                const dy = currentY - p.baseY;
                // Only simulate the spotlight and particles still returning to their base.
                if (dx * dx + dy * dy > 450 * 450 &&
                    Math.abs(p.x - p.baseX) + Math.abs(p.y - p.baseY) < 1 &&
                    Math.abs(p.vx) + Math.abs(p.vy) < 0.1) return;
                p.update(step);
                if (!p.isInSpotlight()) return;
                if (!grid.has(p.gridKey)) {
                    grid.set(p.gridKey, []);
                }
                grid.get(p.gridKey).push(p);
            });
            
            // Schwarzes Overlay (verdeckt den Text-Layer darunter komplett)
            ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.globalCompositeOperation = 'destination-out';
            
            // 1. Innerer Spotlight-Bereich (macht den Text sichtbar)
            const spotlightGradient = ctx.createRadialGradient(
                currentX, currentY, 0,
                currentX, currentY, 280
            );
            spotlightGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            spotlightGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
            spotlightGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
            spotlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = spotlightGradient;
            ctx.beginPath();
            ctx.arc(currentX, currentY, 280, 0, Math.PI * 2);
            ctx.fill();
            
            // 2. Partikel "öffnen" die Membran zusätzlich (organische Ränder)
            particles.forEach(p => {
                if (p.isInSpotlight()) {
                    const neighbors = p.getNearbyParticles();
                    p.draw(ctx, neighbors);
                }
            });
            
            ctx.globalCompositeOperation = 'source-over';
            
            if (isActive) {
                membraneFrameId = requestAnimationFrame(render);
            }
        };
        
        const handleMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            
            if (!isActive) {
                isActive = true;
                overlay.classList.remove('is-hidden');
                currentX = targetX;
                currentY = targetY;
            }
            if (!pageSuspended && membraneFrameId === null) {
                membraneFrameId = requestAnimationFrame(render);
            }
        };
        
        window.addEventListener('pointermove', handleMove, { passive: true });
        window.addEventListener('pointerdown', handleMove, { passive: true });

        const suspendBackground = () => {
            pageSuspended = true;
            video.pause();
            if (useVideoFrames) video.cancelVideoFrameCallback(animationFrameId);
            else cancelAnimationFrame(animationFrameId);
            cancelAnimationFrame(membraneFrameId);
            animationFrameId = null;
            membraneFrameId = null;
            lastMembraneTime = null;
        };
        const resumeBackground = () => {
            pageSuspended = document.hidden;
            if (pageSuspended) return;
            resizeMaskedCanvas();
            lastVideoTime = -1;
            resize();
            startVideo();
            if (animationFrameId === null) renderMaskedVideo();
            if (touchBackground && !isActive) {
                handleMove({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
            } else if (isActive && membraneFrameId === null) {
                membraneFrameId = requestAnimationFrame(render);
            }
        };
        window.addEventListener('pagehide', suspendBackground);
        window.addEventListener('pageshow', resumeBackground);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) suspendBackground();
            else resumeBackground();
        });
        resumeBackground();
    };

    // Horizontal Scroll Effekt (wie landonorris.com)
    const initHorizontalScroll = () => {
        const sections = document.querySelectorAll('.horizontal-scroll-section');

        if (sections.length === 0) return;

        sections.forEach(section => {
            const container = section.querySelector('.horizontal-scroll-container');
            if (!container) return;

            const direction = section.dataset.scrollDirection || 'right';
            
            // Hole die ursprüngliche Hintergrundfarbe
            const computedStyle = window.getComputedStyle(section);
            const originalBg = computedStyle.backgroundColor;
            
            let scrollProgress = 0;
            let isInView = false;

            const updateHorizontalScroll = () => {
                const rect = section.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Section ist im Viewport
                if (rect.top < windowHeight && rect.bottom > 0) {
                    isInView = true;
                    
                    // Berechne Scroll-Progress (0 = gerade sichtbar, 1 = komplett durch)
                    const sectionHeight = rect.height;
                    const scrolled = windowHeight - rect.top;
                    scrollProgress = Math.min(Math.max(scrolled / (windowHeight + sectionHeight * 0.5), 0), 1);
                    
                    // Easing function für smootheren Effekt
                    const eased = 1 - Math.pow(1 - scrollProgress, 3);
                    
                    // Horizontal position basierend auf Progress
                    if (direction === 'right') {
                        container.style.transform = `translateX(${100 - (eased * 100)}%)`;
                        // Hintergrund animieren - von transparent zu originalBg
                        section.style.background = `linear-gradient(90deg, transparent ${(1-eased)*100}%, ${originalBg} ${(1-eased)*100}%)`;
                    } else {
                        container.style.transform = `translateX(${-100 + (eased * 100)}%)`;
                        // Hintergrund animieren von links
                        section.style.background = `linear-gradient(270deg, transparent ${(1-eased)*100}%, ${originalBg} ${(1-eased)*100}%)`;
                    }
                } else {
                    isInView = false;
                }
            };

            // Initial update
            updateHorizontalScroll();

            // Update beim Scrollen
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        updateHorizontalScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        });
    };

    const initSiteParticles = () => {
        if (window.siteParticlesInitialized) return;
        if ([...document.scripts].some(script => /\/hero-canvas\.js(?:\?|$)/.test(script.src))) return;
        const script = document.createElement('script');
        script.src = `${langBasePrefix}/js/hero-canvas.js`;
        script.addEventListener('error', () => console.error('Failed to load the particle background.'));
        document.head.appendChild(script);
    };

    const ensureAssistantButton = () => {
        if (document.querySelector('script[src$="/js/ai-assistant.js"]')) return;
        const script = document.createElement('script');
        script.src = `${langBasePrefix}/js/ai-assistant.js`;
        script.addEventListener('error', () => {
            console.error('The assistant button could not be loaded.');
        });
        document.body.appendChild(script);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initSiteParticles();
            initRevealOverlay();
            initHorizontalScroll();
            initSoundToggle();
            ensureAssistantButton();
        });
    } else {
        initSiteParticles();
        initRevealOverlay();
        initHorizontalScroll();
        initSoundToggle();
        ensureAssistantButton();
    }
    
    const consoleBrandStyle = 'background: linear-gradient(90deg, #102d68, #1769aa, #3b9bea); -webkit-background-clip: text; color: transparent; font-size: 24px; font-weight: 800;';
    const consoleProductStyle = 'color: #173a73; font-size: 14px; font-weight: 700;';
    const consoleCopyStyle = 'color: #425466; font-size: 12px; line-height: 1.6;';
    console.log('%cNJB CodeMasters', consoleBrandStyle);
    console.log('%cVezaionGen VI%c — Industry 6.0 Platform', consoleProductStyle, consoleCopyStyle);
    console.log('%cIf your first instinct was F12,\nyou might be one of us.\nCuriosity is a prerequisite for innovation.', consoleCopyStyle);
    
})();
