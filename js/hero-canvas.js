// Hero Canvas Animation (Particle Background)
(function() {
    if (window.siteParticlesInitialized) return;
    window.siteParticlesInitialized = true;
    let canvas = document.getElementById('particlesCanvas') || document.getElementById('heroCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'particlesCanvas';
        canvas.className = 'site-particles';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Particle background: Canvas 2D context is unavailable.');
        return;
    }
    let particles = [];
    let animationFrame;
    
    // Set canvas size
    const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Wrap around edges
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Initialize particles
    const initParticles = () => {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };
    
    // Draw connections between nearby particles
    const connectParticles = () => {
        const maxDistance = 150;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.2;
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    };
    
    // Mouse interaction
    let mouse = { x: null, y: null, radius: 150 };
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    const interactWithMouse = () => {
        if (mouse.x === null || mouse.y === null) return;
        
        particles.forEach(particle => {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                particle.x -= Math.cos(angle) * force * 2;
                particle.y -= Math.sin(angle) * force * 2;
            }
        });
    };
    
    // Animation loop
    const animate = () => {
        animationFrame = null;
        if (document.hidden) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        interactWithMouse();
        
        animationFrame = requestAnimationFrame(animate);
    };
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        initParticles();
        animate();
    }
    const suspend = () => {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    };
    const resume = () => {
        if (document.hidden) return;
        resizeCanvas();
        initParticles();
        if (!prefersReducedMotion && animationFrame === null) animate();
    };
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) suspend();
        else resume();
    });
    window.addEventListener('pagehide', suspend);
    window.addEventListener('pageshow', resume);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrame);
    });
    
})();
