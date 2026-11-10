// Performance Optimizations - Lädt Ressourcen intelligent

// 1. Lazy Loading für Bilder
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer für Lazy Loading
    if (typeof window.IntersectionObserver !== 'function') {
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
            if (img.dataset.src) img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            img.classList.add('loaded');
        });
        return;
    }
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Lade das echte Bild
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Lade srcset falls vorhanden
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    img.removeAttribute('data-srcset');
                }
                
                // Füge loaded-Klasse hinzu für Fade-in Effekt
                img.classList.add('loaded');
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px' // Lade Bilder 50px bevor sie sichtbar sind
    });

    // Beobachte alle Bilder mit data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
});

// 2. Debounce für Scroll-Events (verbessert Performance)
function debounce(func, wait = 10, immediate = false) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// 3. Optimierte Scroll-Handler
let ticking = false;
function optimizedScrollHandler(callback) {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            callback();
            ticking = false;
        });
        ticking = true;
    }
}

// 4. Preload wichtiger Ressourcen
function preloadCriticalAssets() {
    const criticalFonts = [
        'assets/fonts/main-font.woff2'
    ];
    
    criticalFonts.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.href = fontUrl;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });
}

// 5. DNS-Prefetch für externe Ressourcen
function setupDNSPrefetch() {
    const externalDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];
    
    externalDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
    });
}

// 6. Passive Event Listeners für bessere Scroll-Performance
function setupPassiveListeners() {
    // Alle Scroll- und Touch-Events als passive markieren
    const supportsPassive = (() => {
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch(err) {
            passiveSupported = false;
        }
        return passiveSupported;
    })();
    
    if (supportsPassive) {
        // Original Event Listener überschreiben für passive Events
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            const passiveEvents = ['scroll', 'wheel', 'touchstart', 'touchmove', 'touchenter', 'touchend', 'touchleave', 'mousewheel'];
            
            if (passiveEvents.includes(type)) {
                if (typeof options === 'object') {
                    options.passive = options.passive !== false;
                } else {
                    options = { passive: true };
                }
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
}

// 7. Reduziere Layout-Shifts (Cumulative Layout Shift - CLS)
function preventLayoutShifts() {
    // Setze Aspect-Ratio für Bilder ohne definierte Größe
    document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
        img.style.aspectRatio = 'auto';
    });
}

// 9. Defer Non-Critical CSS
function deferNonCriticalCSS() {
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
    
    nonCriticalCSS.forEach(link => {
        link.media = 'print';
        link.onload = function() {
            this.media = 'all';
        };
    });
}

// 10. Resource Hints für besseres Preloading
function setupResourceHints() {
    // Preconnect zu wichtigen Domains
    const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];
    
    preconnectDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });
}

// Initialisiere alle Optimierungen
document.addEventListener('DOMContentLoaded', function() {
    setupDNSPrefetch();
    setupResourceHints();
    setupPassiveListeners();
    preventLayoutShifts();
    deferNonCriticalCSS();
});

// Exportiere nützliche Funktionen
window.optimizePerformance = {
    debounce,
    optimizedScrollHandler
};
