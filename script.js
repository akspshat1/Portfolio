// ========================================
// PORTFOLIO — ELEGANT WITH WOW
// Scroll reveals, typewriter, cursor glow,
// parallax numbers, magnetic hovers,
// animated counters, smooth nav
// ========================================

(function () {
    'use strict';

    // ===== DARK MODE TOGGLE =====
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    // ===== INTERSECTION OBSERVER — Fade-in on scroll =====
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    // Also observe timeline entries for dot pulse
    document.querySelectorAll('.timeline-entry').forEach((el) => observer.observe(el));

    // ===== TYPEWRITER =====
    const typewriterEl = document.getElementById('typewriter');
    if (typewriterEl) {
        const phrases = [
            'AI/ML Engineer',
            'Data Scientist',
            'Electrical Engineer',
            'Problem Solver',
        ];
        let phraseIdx = 0;
        let charIdx = 0;
        let deleting = false;

        function typeStep() {
            const current = phrases[phraseIdx];
            if (!deleting) {
                typewriterEl.textContent = current.slice(0, charIdx + 1);
                charIdx++;
                if (charIdx >= current.length) {
                    setTimeout(() => {
                        deleting = true;
                        typeStep();
                    }, 2000);
                    return;
                }
                setTimeout(typeStep, 75 + Math.random() * 45);
            } else {
                typewriterEl.textContent = current.slice(0, charIdx);
                charIdx--;
                if (charIdx < 0) {
                    deleting = false;
                    charIdx = 0;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    setTimeout(typeStep, 500);
                    return;
                }
                setTimeout(typeStep, 35);
            }
        }

        setTimeout(typeStep, 1400);
    }

    // ===== CURSOR GLOW (desktop only) =====
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.innerWidth > 768) {
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let cx = mx, cy = my;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
        });

        function updateCursor() {
            cx += (mx - cx) * 0.06;
            cy += (my - cy) * 0.06;
            cursorGlow.style.left = cx + 'px';
            cursorGlow.style.top = cy + 'px';
            requestAnimationFrame(updateCursor);
        }
        updateCursor();
    }

    // ===== PARALLAX SECTION NUMBERS =====
    const parallaxNums = document.querySelectorAll('.parallax-num');

    function updateParallax() {
        const scrollY = window.scrollY;
        parallaxNums.forEach((num) => {
            const rect = num.closest('.section').getBoundingClientRect();
            const offset = rect.top * -0.12;
            num.style.transform = `translateY(${offset}px)`;
        });
    }

    window.addEventListener('scroll', updateParallax, { passive: true });

    // ===== MAGNETIC HOVER EFFECT =====
    if (window.innerWidth > 768) {
        const magnetics = document.querySelectorAll('.magnetic');

        magnetics.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
                el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                setTimeout(() => {
                    el.style.transition = '';
                }, 400);
            });
        });
    }

    // ===== ANIMATED COUNTER =====
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.target);
                    const isFloat = target % 1 !== 0;
                    const duration = 1500;
                    const startTime = performance.now();

                    function animateCount(now) {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = eased * target;

                        el.textContent = isFloat ? current.toFixed(2) : Math.floor(current);

                        if (progress < 1) {
                            requestAnimationFrame(animateCount);
                        } else {
                            el.textContent = isFloat ? target.toFixed(2) : target;
                        }
                    }

                    requestAnimationFrame(animateCount);
                    counterObserver.unobserve(el);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach((c) => counterObserver.observe(c));

    // ===== NAV — scroll shadow =====
    const nav = document.getElementById('nav');

    window.addEventListener('scroll', () => {
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }
    }, { passive: true });

    // ===== SMOOTH SCROLL for nav links =====
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
                closeMobileSidebar();
            }
        });
    });

    // ===== HAMBURGER & MOBILE SIDEBAR =====
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function closeMobileSidebar() {
        hamburger?.classList.remove('active');
        sidebar?.classList.remove('open');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = sidebar.classList.contains('open');
            if (isOpen) {
                closeMobileSidebar();
            } else {
                hamburger.classList.add('active');
                sidebar.classList.add('open');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
    }

    // ===== RESUME MODAL =====
    const resumeBtn = document.getElementById('viewResumeBtn');
    const resumeModal = document.getElementById('resumeModal');
    const closeModalBtn = document.querySelector('.close-modal');

    if (resumeBtn && resumeModal) {
        resumeBtn.addEventListener('click', () => {
            resumeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeModalBtn && resumeModal) {
        closeModalBtn.addEventListener('click', () => {
            resumeModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        resumeModal.addEventListener('click', (e) => {
            if (e.target === resumeModal) {
                resumeModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ===== CONTACT FORM =====
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sent! ✓';
            btn.disabled = true;
            btn.style.background = '#2d8659';
            btn.style.color = '#fff';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = '';
                btn.style.color = '';
                form.reset();
            }, 2500);
        });
    }

    // ===== ESCAPE KEY =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileSidebar();
            if (resumeModal?.classList.contains('active')) {
                resumeModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // ===== PROJECT ROW CLICK — navigate to link =====
    document.querySelectorAll('.project-row').forEach((row) => {
        row.addEventListener('click', (e) => {
            // Don't override direct link clicks
            if (e.target.closest('a')) return;
            const link = row.querySelector('.project-arrow');
            if (link) window.open(link.href, '_blank');
        });
    });

})();