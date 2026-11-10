// Testimonials Slider
(function() {
    const slider = document.getElementById('testimonialsSlider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    const dotsContainer = document.querySelector('.testimonials-dots');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Create dots
    const createDots = () => {
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'testimonial-dot';
            dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
            dot.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: ${i === 0 ? 'var(--primary-color)' : 'var(--border-color)'};
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    };
    
    // Update dots
    const updateDots = () => {
        const dots = dotsContainer?.querySelectorAll('.testimonial-dot');
        dots?.forEach((dot, index) => {
            dot.style.backgroundColor = index === currentSlide 
                ? 'var(--primary-color)' 
                : 'var(--border-color)';
            dot.style.transform = index === currentSlide ? 'scale(1.2)' : 'scale(1)';
        });
    };
    
    // Show slide
    const showSlide = (n) => {
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        currentSlide = (n + totalSlides) % totalSlides;
        slides[currentSlide].classList.add('active');
        updateDots();
    };
    
    // Go to specific slide
    const goToSlide = (n) => {
        showSlide(n);
    };
    
    // Next slide
    const nextSlide = () => {
        showSlide(currentSlide + 1);
    };
    
    // Previous slide
    const prevSlide = () => {
        showSlide(currentSlide - 1);
    };
    
    // Event listeners
    nextBtn?.addEventListener('click', nextSlide);
    prevBtn?.addEventListener('click', prevSlide);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
    
    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    const handleSwipe = () => {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    };
    
    // Auto-play (optional)
    let autoplayInterval;
    const startAutoplay = () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    };
    
    const stopAutoplay = () => {
        clearInterval(autoplayInterval);
    };
    
    // Pause autoplay on hover
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    
    // Initialize
    createDots();
    showSlide(0);
    startAutoplay();
    
})();
