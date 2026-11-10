// Scroll Animations
(function() {
    if (window.revealAnimations) return;
    // ── Intersection Observer: class-based, GPU-accelerated ──────────────────
    const ANIM_SELECTOR = '.fade-in-up, .fade-in-down, .fade-in-left, .fade-in-right, .scale-in, .reveal, .scroll-reveal, .scale-in-section';
    const CARD_SELECTOR = '.card, .glass-card, .feature-card, .service-card, .stat-card, .value-card, .codemasters-card, .team-member, .contact-method, .legal-section, main h1, main h2, .section-label, .section-description';
    const registered = new WeakSet();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    let initialized = false;

    const finish = (element) => {
        element.classList.remove('reveal-entry');
        element.classList.add('is-visible', 'revealed');
    };

    const init = () => {
        if (initialized) return;
        initialized = true;
        if (typeof window.IntersectionObserver === 'function') {
            try {
                observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting || entry.intersectionRatio < 0.15) return;
                        const element = entry.target;
                        observer.unobserve(element);
                        if (!reducedMotion.matches) {
                            element.classList.add('reveal-entry');
                            element.addEventListener('animationend', () => finish(element), { once: true });
                            setTimeout(() => finish(element), 500);
                        } else {
                            finish(element);
                        }
                    });
                }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
            } catch (error) {
                console.error('Reveal observer unavailable; content remains visible.', error);
            }
        }
        const register = () => {
            document.querySelectorAll(`${ANIM_SELECTOR}, ${CARD_SELECTOR}`).forEach(element => {
                if (registered.has(element)) return;
                registered.add(element);
                finish(element);
                if (observer && !element.parentElement.closest(`${ANIM_SELECTOR}, ${CARD_SELECTOR}`)) {
                    observer.observe(element);
                }
            });
        };
        register();
        // Footer and other asynchronously inserted content share the same observer.
        new MutationObserver(records => {
            if (records.some(record => Array.from(record.addedNodes).some(node =>
                node.nodeType === Node.ELEMENT_NODE &&
                (node.matches(`${ANIM_SELECTOR}, ${CARD_SELECTOR}`) ||
                    node.querySelector(`${ANIM_SELECTOR}, ${CARD_SELECTOR}`))
            ))) register();
        }).observe(document.body, { childList: true, subtree: true });
    };

    window.revealAnimations = { init };
    window.addEventListener('load', init, { once: true });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    // ── Parallax ─────────────────────────────────────────────────────────────
    const parallaxElements = document.querySelectorAll('.parallax');
    if (parallaxElements.length > 0) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    parallaxElements.forEach(el => {
                        const speed = el.dataset.speed || 0.5;
                        el.style.transform = `translateY(${-(scrolled * speed)}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ── Scroll-to-top button ─────────────────────────────────────────────────
    const createScrollToTop = () => {
        if (document.querySelector('.scroll-to-top')) return; // avoid duplicates
        const button = document.createElement('button');
        button.className = 'scroll-to-top';
        button.setAttribute('aria-label', document.documentElement.lang === 'sr' ? 'Назад на врх странице' : 'Nach oben scrollen');
        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
            </svg>
        `;
        document.body.appendChild(button);
        window.addEventListener('scroll', () => {
            button.classList.toggle('visible', window.pageYOffset > 500);
        });
        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };
    createScrollToTop();

    // ── Smooth anchor scroll ─────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ── Lazy images ──────────────────────────────────────────────────────────
    if (typeof window.IntersectionObserver === 'function') {
        const imageObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
                    if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute('data-srcset'); }
                    img.classList.add('loaded');
                    obs.unobserve(img);
                }
            });
        });
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => imageObserver.observe(img));
    }
})();
