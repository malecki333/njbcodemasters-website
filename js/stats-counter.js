// Animated Statistics Counter
(function() {
    const stats = document.querySelectorAll('.stat-card__number[data-count]');
    
    if (stats.length === 0) return;
    if (typeof window.IntersectionObserver !== 'function') return;
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-count')) || 0;
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString('de-DE');
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString('de-DE');
                
                // Add + sign if needed
                if (element.dataset.suffix === '+') {
                    element.textContent += '+';
                }
            }
        };
        
        updateCounter();
    };
    
    // Use Intersection Observer to trigger animation when visible
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        // Set initial value to 0
        stat.textContent = '0';
        observer.observe(stat);
    });
    
})();
