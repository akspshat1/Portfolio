// ========================================
// PORTFOLIO — SUBTLE & ELEGANT
// Minimal JS: scroll reveals, typewriter,
// cursor glow, navigation, contact form
// ========================================

(function () {
    'use strict';

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
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

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
        let pauseTimer = 0;

        function typeStep() {
            const current = phrases[phraseIdx];
            if (!deleting) {
                typewriterEl.textContent = current.slice(0, charIdx + 1);
                charIdx++;
                if (charIdx >= current.length) {
                    pauseTimer = setTimeout(() => {
                        deleting = true;
                        typeStep();
                    }, 1800);
                    return;
                }
                setTimeout(typeStep, 80 + Math.random() * 40);
            } else {
                typewriterEl.textContent = current.slice(0, charIdx);
                charIdx--;
                if (charIdx < 0) {
                    deleting = false;
                    charIdx = 0;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    setTimeout(typeStep, 400);
                    return;
                }
                setTimeout(typeStep, 40);
            }
        }

        setTimeout(typeStep, 1200);
    }

    // ===== CURSOR GLOW (desktop only) =====
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.innerWidth > 768) {
        let mx = 0, my = 0;
        let cx = 0, cy = 0;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
        });

        function updateCursor() {
            cx += (mx - cx) * 0.08;
            cy += (my - cy) * 0.08;
            cursorGlow.style.left = cx + 'px';
            cursorGlow.style.top = cy + 'px';
            requestAnimationFrame(updateCursor);
        }
        updateCursor();
    }

    // ===== NAV — scroll shadow & smooth scroll =====
    const nav = document.getElementById('nav');

    window.addEventListener('scroll', () => {
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }
    }, { passive: true });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });

                // Close mobile sidebar
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
    const closeModal = document.querySelector('.close-modal');

    if (resumeBtn && resumeModal) {
        resumeBtn.addEventListener('click', () => {
            resumeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeModal && resumeModal) {
        closeModal.addEventListener('click', () => {
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

    // ===== ESCAPE KEY — close modal & sidebar =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileSidebar();
            if (resumeModal?.classList.contains('active')) {
                resumeModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

})();