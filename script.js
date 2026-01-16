// ========================================
// RICH INDIAN HERITAGE PORTFOLIO
// Warm · Luxurious · Transcendent
// ========================================

// ===== FLOATING PARTICLES =====
class FloatingParticles {
    constructor() {
        this.container = document.getElementById('particles');
        if (this.container) {
            this.createParticles();
        }
    }

    createParticles() {
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random position and animation delay
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${15 + Math.random() * 10}s`;

            // Random size variation
            const size = 2 + Math.random() * 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            this.container.appendChild(particle);
        }
    }
}

// ===== KUMKUM & CHAWAL SPREADING EFFECT =====
class KumkumChawal {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'kumkum-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
        `;
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.settledParticles = [];

        // Create bell sound
        this.bellSound = new Audio('bell.mp3');
        this.bellSound.volume = 0.0125;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Listen for clicks
        document.addEventListener('click', (e) => {
            this.spread(e.clientX, e.clientY);
            this.playBell();
        });

        this.animate();
    }

    playBell() {
        // Check global mute state
        if (window.portfolioMuted) return;

        // Clone and play to allow overlapping sounds
        const bellClone = this.bellSound.cloneNode();
        bellClone.volume = 0.0125;
        bellClone.play().catch(e => console.log('Bell sound blocked'));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Redraw settled particles after resize
        this.redrawSettled();
    }

    spread(x, y) {
        // Create kumkum (red powder) particles
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            const size = Math.random() * 4 + 2;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: size,
                color: this.getKumkumColor(),
                type: 'kumkum',
                life: 1,
                gravity: 0.15 + Math.random() * 0.1,
                friction: 0.98,
                rotation: Math.random() * 360
            });
        }

        // Create chawal (rice) particles
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                width: Math.random() * 3 + 2,
                height: Math.random() * 8 + 4,
                color: this.getChawalColor(),
                type: 'chawal',
                life: 1,
                gravity: 0.2 + Math.random() * 0.1,
                friction: 0.97,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
    }

    getKumkumColor() {
        // Various shades of kumkum red
        const colors = [
            '#e31c1c', // Bright red
            '#c41818', // Deep red
            '#d42a2a', // Vermillion
            '#b81414', // Dark red
            '#ff3030', // Light red
            '#a01010'  // Maroon red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getChawalColor() {
        // Shades of rice white/cream
        const colors = [
            '#fffff0', // Ivory
            '#faf8f5', // Off white
            '#f5f5dc', // Beige
            '#fffef0', // Cream
            '#fdfdf5'  // Light cream
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Apply gravity
            p.vy += p.gravity;

            // Apply friction
            p.vx *= p.friction;
            p.vy *= p.friction;

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Rotate chawal
            if (p.type === 'chawal') {
                p.rotation += p.rotationSpeed;
                p.rotationSpeed *= 0.98;
            }

            // Check if particle should settle
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed < 0.5 && p.y > 100) {
                // Settle the particle with fade timer
                p.opacity = 1;
                p.fadeStart = Date.now();
                p.fadeDuration = 3000; // Fade out over 3 seconds
                this.settledParticles.push({ ...p });
                this.particles.splice(i, 1);
            }

            // Remove if off screen
            if (p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
            }
        }

        // Update settled particles - fade them out
        for (let i = this.settledParticles.length - 1; i >= 0; i--) {
            const p = this.settledParticles[i];
            const elapsed = Date.now() - p.fadeStart;
            p.opacity = 1 - (elapsed / p.fadeDuration);

            if (p.opacity <= 0) {
                this.settledParticles.splice(i, 1);
            }
        }
    }

    drawParticle(p, opacity = 1) {
        this.ctx.save();
        this.ctx.globalAlpha = p.opacity !== undefined ? p.opacity : opacity;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation * Math.PI / 180);

        if (p.type === 'kumkum') {
            // Draw powder particle with soft edges
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.6, p.color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Draw rice grain (elongated oval)
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = 'rgba(0,0,0,0.1)';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetY = 1;

            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, p.width, p.height, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Add subtle highlight to rice
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.ctx.beginPath();
            this.ctx.ellipse(-p.width * 0.2, -p.height * 0.3, p.width * 0.3, p.height * 0.2, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    redrawSettled() {
        // Redraw all settled particles
        this.settledParticles.forEach(p => this.drawParticle(p));
    }

    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw
        this.update();

        // Draw settled particles (fading)
        this.settledParticles.forEach(p => this.drawParticle(p));

        // Draw active particles
        this.particles.forEach(p => this.drawParticle(p));

        requestAnimationFrame(() => this.animate());
    }
}

// ===== AMBIENT OM AUDIO (SILENT BACKGROUND) =====
class AmbientAudio {
    constructor() {
        this.audio = document.getElementById('omSound');
        this.hasStarted = false;

        // Setup audio
        if (this.audio) {
            this.audio.src = 'om.mp3';
            this.audio.volume = 0.4;
            this.audio.loop = true;
            this.audio.load();
        }

        // Create entrance overlay for autoplay
        this.createEntranceOverlay();

        // Create audio control button (always visible)
        this.createAudioControl();
    }

    createAudioControl() {
        this.btn = document.createElement('button');
        this.btn.className = 'audio-control';

        // SVG Icons
        this.iconSound = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
        this.iconMute = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 9v6h4l5 5V4l-5 5H7z"/><path d="M16 11l2 2m0-2l-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

        this.btn.innerHTML = this.iconSound;
        this.btn.title = 'Toggle Sound';
        this.btn.style.cssText = `
            position: fixed;
            bottom: 3.5rem;
            right: 1.5rem;
            z-index: 10000;
            background: transparent;
            color: var(--gold, #c9a227);
            border: 1px solid var(--gold, #c9a227);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            padding: 0;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            opacity: 0; 
            pointer-events: none; /* Hidden until entrance done */
        `;

        // Hover effect
        this.btn.onmouseenter = () => {
            this.btn.style.transform = 'scale(1.1)';
            this.btn.style.boxShadow = '0 6px 15px rgba(201, 162, 39, 0.4)';
        };
        this.btn.onmouseleave = () => {
            this.btn.style.transform = 'scale(1)';
            this.btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
        };

        this.btn.onclick = () => this.toggleAudio();
        document.body.appendChild(this.btn);
    }

    toggleAudio() {
        if (this.audio.paused) {
            this.audio.play();
            this.btn.innerHTML = this.iconSound;
            this.btn.style.opacity = '1';
            window.portfolioMuted = false;
        } else {
            this.audio.pause();
            this.btn.innerHTML = this.iconMute;
            this.btn.style.opacity = '0.7';
            window.portfolioMuted = true;
        }
    }

    createEntranceOverlay() {
        // Create ultra-premium minimalist entrance
        this.overlay = document.createElement('div');
        this.overlay.id = 'entrance-overlay';
        this.overlay.innerHTML = `
            <!-- Subtle Geometric Background -->
            <div class="geo-bg">
                <div class="geo-circle"></div>
                <div class="geo-line line-h"></div>
                <div class="geo-line line-v"></div>
            </div>
            
            <!-- Main Content -->
            <div class="entrance-content">
                <div class="overline">॥ विद्या ददाति विनयम् ॥</div>
                <div class="om-symbol">ॐ</div>
                <h1>AKSHAT</h1>
                <div class="divider-line"></div>
                <p class="tagline">Tradition · Innovation · Excellence</p>
                <div class="enter-area">
                    <span class="enter-text">Enter</span>
                    <div class="enter-line"></div>
                </div>
            </div>
        `;

        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, #fdf8f0 0%, #f5ebe0 50%, #eddcd2 100%);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: opacity 1.5s ease, transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1), filter 1.5s ease;
            overflow: hidden;
            will-change: opacity, transform, filter;
        `;

        // Premium minimalist styles
        const epicStyle = document.createElement('style');
        epicStyle.textContent = `
            /* Subtle Geometric Background */
            #entrance-overlay .geo-bg {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
            }
            
            #entrance-overlay .geo-circle {
                width: 400px;
                height: 400px;
                border: 1px solid rgba(201, 162, 39, 0.15);
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: slowRotate 60s linear infinite;
            }
            
            #entrance-overlay .geo-line {
                position: absolute;
                background: rgba(201, 162, 39, 0.08);
            }
            
            #entrance-overlay .line-h {
                width: 100vw;
                height: 1px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            #entrance-overlay .line-v {
                width: 1px;
                height: 100vh;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            @keyframes slowRotate {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            /* Main Content */
            #entrance-overlay .entrance-content {
                text-align: center;
                z-index: 10;
                animation: fadeIn 1.5s ease forwards;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            #entrance-overlay .overline {
                font-family: 'Cormorant Garamond', serif;
                font-size: 1rem;
                color: #c9a227;
                letter-spacing: 0.4em;
                margin-bottom: 2rem;
                opacity: 0;
                animation: fadeIn 1s ease forwards 0.5s;
            }
            
            #entrance-overlay .om-symbol {
                font-size: 5rem;
                color: #c9a227;
                margin-bottom: 1rem;
                opacity: 0;
                animation: fadeIn 1s ease forwards 0.8s, subtleGlow 4s ease-in-out infinite 1.8s;
            }
            
            @keyframes subtleGlow {
                0%, 100% { text-shadow: 0 0 20px rgba(201, 162, 39, 0.1); }
                50% { text-shadow: 0 0 40px rgba(201, 162, 39, 0.25); }
            }
            
            #entrance-overlay h1 {
                font-family: 'Cinzel', serif;
                font-size: clamp(3rem, 8vw, 5rem);
                font-weight: 400;
                color: #2d1810;
                letter-spacing: 0.4em;
                margin-right: -0.4em; /* Compensate for centering */
                margin-bottom: 1rem;
                opacity: 0;
                animation: fadeIn 1s ease forwards 1.1s;
            }
            
            #entrance-overlay .divider-line {
                width: 80px;
                height: 1px;
                background: linear-gradient(90deg, transparent, #c9a227, transparent);
                margin: 0 auto 1.5rem;
                opacity: 0;
                animation: fadeIn 1s ease forwards 1.4s;
            }
            
            #entrance-overlay .tagline {
                font-family: 'Poppins', sans-serif;
                font-size: 0.85rem;
                font-weight: 300;
                color: #5c4033;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                margin-bottom: 3rem;
                opacity: 0;
                animation: fadeIn 1s ease forwards 1.7s;
            }
            
            #entrance-overlay .enter-area {
                opacity: 0;
                animation: fadeIn 1s ease forwards 2s;
            }
            
            #entrance-overlay .enter-text {
                font-family: 'Cinzel', serif;
                font-size: 0.9rem;
                color: #6b1a1a;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                display: block;
                margin-bottom: 0.5rem;
            }
            
            #entrance-overlay .enter-line {
                width: 40px;
                height: 1px;
                background: #6b1a1a;
                margin: 0 auto;
                animation: expandLine 1.5s ease-in-out infinite 2.5s;
            }
            
            @keyframes expandLine {
                0%, 100% { width: 40px; opacity: 0.5; }
                50% { width: 60px; opacity: 1; }
            }
            
            #entrance-overlay:hover .enter-line {
                width: 80px;
                background: #c9a227;
            }
            
            #entrance-overlay:hover .enter-text {
                color: #c9a227;
            }
        `;
        document.head.appendChild(epicStyle);
        document.body.appendChild(this.overlay);

        // Click to enter
        this.overlay.addEventListener('click', () => this.enter());
    }

    enter() {
        // Trigger majestic 4-point entrance spread (Top/Bottom corners)
        if (window.kumkumInstance) {
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Left Side
            window.kumkumInstance.spread(0, h * 0.15); // Left Top
            window.kumkumInstance.spread(0, h * 0.85); // Left Bottom

            // Right Side
            setTimeout(() => {
                window.kumkumInstance.spread(w, h * 0.15); // Right Top
                window.kumkumInstance.spread(w, h * 0.85); // Right Bottom
            }, 100);
        }

        // Fade out overlay with cinematic effect
        this.overlay.style.opacity = '0';
        this.overlay.style.transform = 'scale(1.15)';
        this.overlay.style.filter = 'blur(10px)';

        setTimeout(() => {
            this.overlay.remove();
        }, 1500);

        // Start playing Om silently in background
        if (this.audio && !this.hasStarted) {
            this.audio.play().then(() => {
                this.hasStarted = true;
                if (this.btn) {
                    this.btn.style.opacity = '1';
                    this.btn.style.pointerEvents = 'auto';
                }
            }).catch(e => {
                console.log('Audio autoplay blocked - user interaction required');
                if (this.btn) {
                    this.btn.style.opacity = '1';
                    this.btn.style.pointerEvents = 'auto';
                    this.btn.innerHTML = this.iconMute; // State blocked/paused
                    window.portfolioMuted = true;
                }
            });
        } else if (this.btn) {
            // If already started or no audio, show button anyway
            this.btn.style.opacity = '1';
            this.btn.style.pointerEvents = 'auto';
        }
    }
}

// ===== EXPERIENCE CURVED PATH CONNECTOR =====
class ExperiencePathConnector {
    constructor() {
        this.experienceSection = document.getElementById('experience');
        if (!this.experienceSection) return;

        // Wait for DOM to be fully rendered
        setTimeout(() => this.createPaths(), 800);
        window.addEventListener('resize', () => this.createPaths());
    }

    createPaths() {
        const cards = this.experienceSection.querySelectorAll('.exp-content');
        if (cards.length < 2) return;

        // Remove existing path
        const existingSvg = this.experienceSection.querySelector('.journey-svg');
        if (existingSvg) existingSvg.remove();

        const flow = this.experienceSection.querySelector('.experience-flow');
        if (!flow) return;

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('journey-svg');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: visible;
        `;

        const flowRect = flow.getBoundingClientRect();

        // Get entry/exit points for each card (top and bottom center)
        // Get entry/exit points for each card (top and bottom center)
        const points = [];
        cards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left - flowRect.left + rect.width / 2;
            const topY = rect.top - flowRect.top;
            const bottomY = rect.top - flowRect.top + rect.height;
            const midY = rect.top - flowRect.top + rect.height / 2;

            // First card: start from middle, exit from bottom
            // Other cards: enter from top, exit from bottom
            if (i === 0) {
                points.push({ x: centerX, y: midY, type: 'start' });
                points.push({ x: centerX, y: bottomY, type: 'exit' });
            } else {
                points.push({ x: centerX, y: topY, type: 'enter' });
                points.push({ x: centerX, y: bottomY, type: 'exit' });
            }
        });

        // Remove last exit point (not needed)
        points.pop();

        // Create smooth curved path
        let pathD = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];

            // If both points are on same card (exit follows start/enter), draw straight line
            if (Math.abs(curr.x - next.x) < 5) {
                pathD += ` L ${next.x} ${next.y}`;
            } else {
                // Curve between cards - nice S-curve
                const midY = (curr.y + next.y) / 2;
                const curveOut = (next.x - curr.x) * 0.4;

                // Control points create smooth S-curve
                const cp1x = curr.x;
                const cp1y = curr.y + 50;
                const cp2x = next.x;
                const cp2y = next.y - 50;

                pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
            }
        }

        // Create path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#c9a227');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '10 8');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('opacity', '0.5');

        svg.appendChild(path);
        flow.style.position = 'relative';
        flow.appendChild(svg);
    }
}

// ===== SMOOTH SCROLL NAVIGATION =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== NAVIGATION HIGHLIGHTING =====
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNav() {
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNav);

// ===== SCROLL REVEAL ANIMATIONS =====
function revealOnScroll() {
    const elements = document.querySelectorAll('.fade-in');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== NAVBAR SHADOW ON SCROLL =====
const nav = document.querySelector('nav');

function updateNavShadow() {
    if (window.scrollY > 50) {
        nav.style.boxShadow = '0 4px 30px rgba(107, 26, 26, 0.08)';
    } else {
        nav.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', updateNavShadow);

// ===== FORM HANDLING (Google Forms) =====
const contactForm = document.querySelector('.contact-form');

// ⬇️ REPLACE THESE WITH YOUR GOOGLE FORM DETAILS
const GOOGLE_FORM_CONFIG = {
    // Example: https://docs.google.com/forms/d/e/1FAIpQLSd.../formResponse
    ACTION_URL: "https://docs.google.com/forms/d/e/1FAIpQLSd7tCVo55BCZ00XNoM8sVVFgwlbNnd2LS_4InUbf92u_q23Sw/formResponse",

    // Get these look at 'Get pre-filled link' in Google Forms
    ENTRY_IDS: {
        name: "entry.2121673752",    // John Doe -> Name
        email: "entry.534784293",   // johndoe@email.com -> Email
        message: "entry.490396674"  // Hey... -> Message
    }
};

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        // 1. Get input values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // 2. Prepare Google Form Data
        const formData = new FormData();
        formData.append(GOOGLE_FORM_CONFIG.ENTRY_IDS.name, name);
        formData.append(GOOGLE_FORM_CONFIG.ENTRY_IDS.email, email);
        formData.append(GOOGLE_FORM_CONFIG.ENTRY_IDS.message, message);

        submitBtn.textContent = 'Sending...';

        try {
            // 3. Send using 'no-cors' mode (allows sending to Google without error, but can't read response)
            await fetch(GOOGLE_FORM_CONFIG.ACTION_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            // Success Animation
            submitBtn.textContent = '✓ Message Sent';
            submitBtn.style.background = '#e07020';
            this.reset();

        } catch (error) {
            console.error('Error:', error);
            submitBtn.textContent = '⚠ Error';
            submitBtn.style.background = '#d32f2f';
        }

        // Reset button after delay
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 3500);
    });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    new FloatingParticles();
    new AmbientAudio();
    window.kumkumInstance = new KumkumChawal();
    new ExperiencePathConnector();
    highlightNav();
    revealOnScroll();

    console.log('॥ Portfolio Loaded ॥');
});

// ===== RESUME MODAL LOGIC =====
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('resumeModal');
    const btn = document.getElementById('viewResumeBtn');
    const span = document.getElementsByClassName('close-modal')[0];

    if (btn && modal && span) {
        // Open modal
        btn.onclick = function () {
            modal.style.display = "block";
            modal.classList.remove('closing');
            // Play subtle bell sound when opening
            const audio = new Audio('bell.mp3');
            audio.volume = 0.05;
            audio.play().catch(e => console.log('Audio error'));
        }

        function closeModal() {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.style.display = "none";
                modal.classList.remove('closing');
            }, 380); // Slightly less than 0.4s to prevent flickers
        }

        // Close modal
        span.onclick = function () {
            closeModal();
        }

        // Close on outside click
        window.onclick = function (event) {
            if (event.target == modal) {
                closeModal();
            }
        }
    }
});

// ===== DARK/LIGHT THEME TOGGLE =====
class ThemeToggle {
    constructor() {
        this.toggle = document.getElementById('themeToggle');
        this.html = document.documentElement;
        this.STORAGE_KEY = 'portfolio-theme';

        if (!this.toggle) return;

        // Initialize theme
        this.initTheme();

        // Add click listener
        this.toggle.addEventListener('click', () => this.toggleTheme());
    }

    initTheme() {
        // Check localStorage first - only respect saved preference
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);

        if (savedTheme) {
            // User explicitly chose a theme before
            this.setTheme(savedTheme);
        } else {
            // Always default to light mode (ignore system preference)
            this.setTheme('light');
        }

        // Don't auto-switch based on system preference
        // User must manually toggle if they want dark mode
    }

    setTheme(theme) {
        if (theme === 'dark') {
            this.html.setAttribute('data-theme', 'dark');
        } else {
            this.html.removeAttribute('data-theme');
        }
    }

    toggleTheme() {
        const currentTheme = this.html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        this.setTheme(newTheme);
        localStorage.setItem(this.STORAGE_KEY, newTheme);

        // Play subtle sound on toggle
        const audio = new Audio('bell.mp3');
        audio.volume = 0.03;
        audio.play().catch(e => console.log('Audio blocked'));
    }
}

// Initialize theme toggle
document.addEventListener('DOMContentLoaded', () => {
    new ThemeToggle();
});

// ===== SMART HEADER (Hide on scroll down, show on scroll up) =====
class SmartHeader {
    constructor() {
        this.nav = document.querySelector('nav');
        if (!this.nav) return;

        this.lastScrollY = 0;
        this.ticking = false;
        this.navHeight = this.nav.offsetHeight;

        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    onScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateNav();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    updateNav() {
        const currentScrollY = window.scrollY;

        // Don't hide when at top of page
        if (currentScrollY < 100) {
            this.nav.classList.remove('nav-hidden');
            this.lastScrollY = currentScrollY;
            return;
        }

        // Scrolling down - hide navbar
        if (currentScrollY > this.lastScrollY && currentScrollY > this.navHeight) {
            this.nav.classList.add('nav-hidden');
        }
        // Scrolling up - show navbar
        else if (currentScrollY < this.lastScrollY) {
            this.nav.classList.remove('nav-hidden');
        }

        this.lastScrollY = currentScrollY;
    }
}

// ===== HAMBURGER MENU (Mobile Navigation) =====
// ===== HAMBURGER MENU (Mobile Navigation) =====
class MobileMenu {
    constructor() {
        this.nav = document.querySelector('nav .container');
        this.originalMenu = document.querySelector('nav ul');
        if (!this.nav || !this.originalMenu) return;

        this.isOpen = false;
        this.createHamburger();
        this.createSidebar(); // New sidebar method
        this.createOverlay();
        this.setupEventListeners();
    }

    createHamburger() {
        // Create hamburger button
        this.hamburger = document.createElement('button');
        this.hamburger.className = 'hamburger';
        this.hamburger.setAttribute('aria-label', 'Toggle menu');
        this.hamburger.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;

        // Insert at the beginning (left side) of nav container
        this.nav.insertBefore(this.hamburger, this.nav.firstChild);
    }

    createSidebar() {
        // Create independent sidebar
        this.sidebar = document.createElement('div');
        this.sidebar.className = 'mobile-sidebar';

        // Clone links from original menu
        const scrollOffset = 60; // Helper for scroll adjustment

        this.originalMenu.querySelectorAll('a').forEach(link => {
            const sidebarLink = document.createElement('a');
            sidebarLink.href = link.href;
            sidebarLink.textContent = link.textContent;
            sidebarLink.className = 'mobile-sidebar-link';

            // Handle smooth scroll manually if needed or rely on global smooth scroll
            // We just need to ensure it closes the menu

            this.sidebar.appendChild(sidebarLink);
        });

        document.body.appendChild(this.sidebar);
    }

    createOverlay() {
        // Create overlay for sidebar
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        document.body.appendChild(this.overlay);
    }

    setupEventListeners() {
        this.hamburger.addEventListener('click', () => this.toggle());

        // Close menu when clicking a link in the NEW sidebar
        this.sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Close menu on overlay click
        this.overlay.addEventListener('click', () => this.close());

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.hamburger.classList.add('active');
        this.sidebar.classList.add('mobile-open'); // Open sidebar
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        this.hamburger.classList.remove('active');
        this.sidebar.classList.remove('mobile-open'); // Close sidebar
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== TOUCH FEEDBACK (Ripple Effect) =====
class TouchFeedback {
    constructor() {
        // Add ripple to interactive elements
        const interactiveElements = document.querySelectorAll(
            '.btn, .project-card, .hobby-card, .social-link, .resume-btn, .submit-btn, .nav-link'
        );

        interactiveElements.forEach(el => {
            el.classList.add('ripple-container');
            el.addEventListener('click', (e) => this.createRipple(e, el));
        });
    }

    createRipple(e, element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
        `;

        element.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => ripple.remove(), 600);
    }
}

// ===== SWIPE GESTURES (Project Cards) =====
// DISABLED: Replaced with native CSS Scroll Snap for better performance
class SwipeGestures {
    constructor() {
        // Native CSS handling is smoother
        return;
    }
}

// ===== PULL-TO-REFRESH ANIMATION =====
class PullToRefresh {
    constructor() {
        this.startY = 0;
        this.pulling = false;
        this.threshold = 100;

        // Only on mobile and when at top of page
        if (window.innerWidth > 768) return;

        this.createIndicator();
        this.setupEventListeners();
    }

    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'pull-refresh-indicator';
        this.indicator.innerHTML = `
            <div class="pull-refresh-icon">🕉</div>
            <span class="pull-refresh-text">Pull to refresh</span>
        `;
        document.body.prepend(this.indicator);
    }

    setupEventListeners() {
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                this.startY = e.touches[0].clientY;
                this.pulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this.pulling) return;

            const currentY = e.touches[0].clientY;
            const diff = currentY - this.startY;

            if (diff > 0 && diff < this.threshold * 1.5) {
                this.indicator.style.transform = `translateY(${Math.min(diff, this.threshold)}px)`;
                this.indicator.style.opacity = Math.min(diff / this.threshold, 1);

                if (diff > this.threshold) {
                    this.indicator.classList.add('ready');
                    this.indicator.querySelector('.pull-refresh-text').textContent = 'Release to refresh';
                } else {
                    this.indicator.classList.remove('ready');
                    this.indicator.querySelector('.pull-refresh-text').textContent = 'Pull to refresh';
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (!this.pulling) return;

            if (this.indicator.classList.contains('ready')) {
                // Trigger refresh animation
                this.indicator.classList.add('refreshing');
                this.indicator.querySelector('.pull-refresh-text').textContent = 'Refreshing...';

                // Simulate refresh
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                this.reset();
            }

            this.pulling = false;
        });
    }

    reset() {
        this.indicator.style.transform = 'translateY(0)';
        this.indicator.style.opacity = '0';
        this.indicator.classList.remove('ready', 'refreshing');
    }
}

// Initialize all mobile enhancements
document.addEventListener('DOMContentLoaded', () => {
    new SmartHeader();
    new MobileMenu();
    new TouchFeedback();
    new SwipeGestures();
    new PullToRefresh();
});