document.addEventListener('DOMContentLoaded', () => {
    const htmlEl = document.documentElement;

    // 1. DYNAMIC BLUEPRINT NETWORK
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles;
        const connectionDistance = window.innerWidth < 768 ? 80 : 120;

        const initCanvas = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            const particleCount = window.innerWidth < 768 ? 30 : 70;

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width, y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
                    size: Math.random() * 1.5 + 0.5,
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, width, height);

            // Syncs with Tailwind's native '.dark' class
            const isDark = htmlEl.classList.contains('dark');

            const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
            if (!isDark) {
                grad.addColorStop(0, '#FFFFFF'); grad.addColorStop(1, '#F5F0E8');
            } else {
                grad.addColorStop(0, '#111318'); grad.addColorStop(1, '#0A0B0D');
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            const nodeColor = !isDark ? 'rgba(10, 11, 13, 0.6)' : 'rgba(255, 90, 31, 0.8)';
            const lineColor = !isDark ? '10, 11, 13' : '255, 90, 31';

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = 1 - (distance / connectionDistance);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${lineColor}, ${opacity * 0.3})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            ctx.fillStyle = nodeColor;
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            });

            requestAnimationFrame(drawParticles);
        };

        initCanvas(); drawParticles();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initCanvas, 200);
        });
    }

    // 2. THEME & RTL TOGGLES (Universal Multi-Button Support)
    const themeToggles = document.querySelectorAll('#theme-toggle, #mobile-theme-toggle, [data-theme]');
    const rtlToggles = document.querySelectorAll('#rtl-toggle, #mobile-rtl-toggle, [data-dir]');

    // Initialize RTL on load
    if (localStorage.getItem('dir') === 'rtl') htmlEl.setAttribute('dir', 'rtl');

    // Theme Toggle Logic
    themeToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            htmlEl.classList.toggle('dark');
            localStorage.setItem('theme', htmlEl.classList.contains('dark') ? 'dark' : 'light');
        });
    });

    // RTL Toggle Logic
    rtlToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const isRtl = htmlEl.getAttribute('dir') === 'rtl';
            htmlEl.setAttribute('dir', isRtl ? 'ltr' : 'rtl');
            localStorage.setItem('dir', isRtl ? 'ltr' : 'rtl');
        });
    });

    // 3. MAGNETIC HOVER PHYSICS (Disabled per client request to prevent shifting/scaling)
    // if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    //     document.querySelectorAll('.magnetic-btn').forEach(btn => {
    //         btn.addEventListener('mousemove', (e) => {
    //             const rect = btn.getBoundingClientRect();
    //             const x = e.clientX - rect.left - rect.width / 2;
    //             const y = e.clientY - rect.top - rect.height / 2;
    //             // btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
    //         });
    //         btn.addEventListener('mouseleave', () => btn.style.transform = '');
    //     });
    // }

    // 4. STAGGERED SCROLL REVEALS
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 5. MOBILE MENU (Updated to Fade-In Effect)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    const toggleMenu = () => {
        if (mobileMenu) {
            mobileMenu.classList.toggle('opacity-0');
            mobileMenu.classList.toggle('invisible');
            mobileMenu.classList.toggle('pointer-events-none');
        }
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);

    // 6. ANIMATED STATS COUNTERS
    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetEl = entry.target;
                const target = parseFloat(targetEl.getAttribute('data-target'));
                const isFloat = target % 1 !== 0;
                let count = 0;

                const increment = target / 60;

                const updateCounter = () => {
                    count += increment;
                    if (count < target) {
                        targetEl.innerText = isFloat ? count.toFixed(1) : Math.ceil(count);
                        requestAnimationFrame(updateCounter);
                    } else {
                        targetEl.innerText = target;
                    }
                };

                updateCounter();
                obs.unobserve(targetEl);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
});