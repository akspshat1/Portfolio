// Main Application JavaScript
class SpacePortfolio {
    constructor() {
        this.init();
        this.setupIntersectionObserver();
        this.createStarfield();
        this.createParticles();
        this.setupScrollEffects();
        this.setupNavigation();
        this.setupLaunchButton();
        this.setupContactButtons(); // Enhanced contact functionality
        this.setupResponsiveAnimations();
    }

    init() {
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        // Initialize all components
        console.log('🚀 Space Portfolio Initialized');
        this.addLoadingAnimation();
    }

    // Intersection Observer for scroll animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    // Trigger specific animations
                    if (entry.target.classList.contains('timeline-item')) {
                        this.animateTimelineItem(entry.target);
                    }
                    
                    if (entry.target.classList.contains('project-card')) {
                        this.animateProjectCard(entry.target);
                    }
                    
                    if (entry.target.classList.contains('skill-category')) {
                        this.animateSkillCategory(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements
        this.observeElements();
    }

    observeElements() {
        const elementsToObserve = [
            '.timeline-item',
            '.project-card', 
            '.skill-category',
            '.about-content',
            '.contact-content'
        ];

        elementsToObserve.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => this.observer.observe(el));
        });
    }

    // Animation methods
    animateTimelineItem(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }

    animateProjectCard(element) {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
    }

    animateSkillCategory(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Animate skill items with delay
        const skillItems = element.querySelectorAll('.skill-item');
        skillItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
            }, index * 100);
        });
    }

    // Starfield creation
    createStarfield() {
        const starfield = document.getElementById('starfield');
        const starCount = 150;

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random star size
            const size = Math.random();
            if (size > 0.8) star.classList.add('large');
            else if (size > 0.5) star.classList.add('medium');
            else star.classList.add('small');

            // Random position
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            star.style.animationDelay = Math.random() * 3 + 's';
            
            starfield.appendChild(star);
        }
    }

    // Floating particles
    createParticles() {
        const container = document.getElementById('particlesContainer');
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Floating animation
            particle.style.animation = `float ${6 + Math.random() * 4}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 6 + 's';
            
            container.appendChild(particle);
        }
    }

    // Scroll effects
    setupScrollEffects() {
        let ticking = false;

        const updateScrollEffects = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Parallax background
            const starfield = document.getElementById('starfield');
            if (starfield) {
                starfield.style.transform = `translateY(${rate}px)`;
            }

            // Navbar background
            const nav = document.getElementById('nav');
            if (scrolled > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate);
    }

    // Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Update active nav on scroll
        window.addEventListener('scroll', this.throttle(() => {
            const sections = document.querySelectorAll('.section');
            const scrollPos = window.pageYOffset + 100;

            sections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                const id = section.getAttribute('id');

                if (scrollPos >= top && scrollPos <= bottom) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100));
    }

    // Launch button animation
    setupLaunchButton() {
        const launchBtn = document.getElementById('launchBtn');
        const spaceshipContainer = document.querySelector('.spaceship-container');

        if (launchBtn && spaceshipContainer) {
            launchBtn.addEventListener('click', () => {
                this.triggerLaunchSequence(spaceshipContainer);
            });
        }
    }
    // Add before triggerLaunchSequence in app.js
    showLaunchCountdown(callback) {
        const countdown = document.createElement('div');
        countdown.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            color: #ff6b35;
            font-weight: bold;
            z-index: 1000;
            text-shadow: 0 0 20px #ff6b35;
        `;
        document.body.appendChild(countdown);
        
        let count = 3;
        const timer = setInterval(() => {
            countdown.textContent = count;
            count--;
            
            if (count < 0) {
                countdown.textContent = 'LAUNCH!';
                clearInterval(timer);
                setTimeout(() => {
                    document.body.removeChild(countdown);
                    callback();
                }, 500);
            }
        }, 1000);
    }

    // Update your launch button event to use countdown
    setupLaunchButton() {
        const launchBtn = document.getElementById('launchBtn');
        const spaceshipContainer = document.querySelector('.spaceship-container');

        if (launchBtn && spaceshipContainer) {
            launchBtn.addEventListener('click', () => {
                this.showLaunchCountdown(() => {
                    this.triggerLaunchSequence(spaceshipContainer);
                });
            });
        }
    }


    triggerLaunchSequence(spaceship) {
    // Disable the launch button immediately
        const launchBtn = document.getElementById('launchBtn');
        launchBtn.disabled = true;
        launchBtn.style.opacity = '0.5';
        launchBtn.style.cursor = 'not-allowed';
        
        // Start the one-way launch
        spaceship.style.animation = 'rocket-launch-forever 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        
        // Animate flames during launch
        const flames = spaceship.querySelectorAll('#rocketFlames ellipse');
        flames.forEach((flame, index) => {
            flame.style.animation = `flame-launch 0.${12 + index}s infinite`;
        });
        
        // Create exhaust trail that follows rocket up
        const smoke = document.getElementById('rocketSmoke');
        smoke.innerHTML = '';
        
        // Create trailing particles
        for(let i = 0; i < 25; i++) {
            setTimeout(() => {
                const particle = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
                particle.setAttribute("cx", 45 + Math.random() * 10);
                particle.setAttribute("cy", 200 + Math.random() * 20);
                particle.setAttribute("rx", 2 + Math.random() * 3);
                particle.setAttribute("ry", 5 + Math.random() * 8);
                
                // Flame colors
                const colors = ['#ff6b35', '#f44336', '#ff9800', '#ffeb3b'];
                particle.setAttribute("fill", colors[Math.floor(Math.random() * colors.length)]);
                particle.style.opacity = 0.8;
                
                // Particle follows rocket path
                particle.style.animation = `rocket-launch-forever 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                particle.style.animationDelay = `-${i * 50}ms`;
                
                smoke.appendChild(particle);
            }, i * 80);
        }
        
        // Audio trigger
        if (window.audioManager) {
            window.audioManager.playLaunchSound();
        }
        
        // After 4 seconds, rocket is completely gone
        setTimeout(() => {
            spaceship.style.display = 'none'; // Hide forever
            
            // Update button text to show rocket is gone
            const buttonText = launchBtn.querySelector('span');
            if (buttonText) {
                buttonText.innerHTML = '🌌 ROCKET LAUNCHED';
            }
        }, 4000);
        
        // No reset - rocket stays gone forever!
    }

    // Responsive animations
    setupResponsiveAnimations() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleResponsive = (e) => {
            if (e.matches) {
                // Mobile animations
                this.adjustMobileAnimations();
            } else {
                // Desktop animations
                this.adjustDesktopAnimations();
            }
        };

        mediaQuery.addListener(handleResponsive);
        handleResponsive(mediaQuery);
    }

    adjustMobileAnimations() {
        // Reduce particle count on mobile
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            if (index > 10) particle.style.display = 'none';
        });
    }

    adjustDesktopAnimations() {
        // Show all particles on desktop
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            particle.style.display = 'block';
        });
    }

    // Loading animation
    addLoadingAnimation() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroDescription = document.querySelector('.hero-description');
        const launchBtn = document.querySelector('.launch-btn');

        const elements = [heroTitle, heroSubtitle, heroDescription, launchBtn];
        
        elements.forEach((el, index) => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 200 + 500);
            }
        });
    }

    // Enhanced Contact functionality
    setupContactButtons() {
        console.log('Setting up contact buttons...');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const downloadCvBtn = document.getElementById('downloadCvBtn');

        console.log('Send message button found:', sendMessageBtn);
        console.log('Download CV button found:', downloadCvBtn);

        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', (e) => {
                console.log('Send message button clicked!');
                this.handleSendMessage();
            });
        } else {
            console.error('Send message button not found!');
        }

        if (downloadCvBtn) {
            downloadCvBtn.addEventListener('click', this.handleDownloadCV.bind(this));
        }
    }

    handleSendMessage() {
        // Show contact options modal
        this.showContactModal();
    }

    showContactModal() {
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
        modal.innerHTML = `
            <div class="modal-content" style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid rgba(0, 212, 255, 0.3);
                border-radius: 20px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 212, 255, 0.2);
                position: relative;
                backdrop-filter: blur(10px);
            ">
                <h3 style="
                    color: #00d4ff;
                    text-align: center;
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                    font-weight: 600;
                ">Let's Connect! 🚀</h3>
                <div class="contact-options" style="display: flex; flex-direction: column; gap: 1rem;">
                    <button class="contact-option" data-action="email" style="
                        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    ">
                        📧 Send Email
                    </button>
                    <button class="contact-option" data-action="copy" style="
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    ">
                        📋 Copy Email
                    </button>
                    <button class="contact-option" data-action="linkedin" style="
                        background: linear-gradient(135deg, #0077b5 0%, #005885 100%);
                        color: white;
                        border: none;
                        padding: 1rem;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    ">
                        💼 LinkedIn
                    </button>
                </div>
                <button class="close-btn" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: transparent;
                    border: none;
                    color: #888;
                    font-size: 1.5rem;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">×</button>
            </div>
        `;
        
        // Add modal styles
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.3s ease-out'
        });
        
        document.body.appendChild(modal);
        
        // Add hover effects to buttons
        const contactOptions = modal.querySelectorAll('.contact-option');
        contactOptions.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        });
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeContactModal(modal);
            }
            
            if (e.target.classList.contains('close-btn')) {
                this.closeContactModal(modal);
            }
            
            if (e.target.classList.contains('contact-option')) {
                const action = e.target.getAttribute('data-action');
                this.handleContactAction(action, modal);
            }
        });
    }

    handleContactAction(action, modal) {
        const email = 'B22EE087@iitj.ac.in';
        
        switch (action) {
            case 'email':
                const subject = encodeURIComponent('Portfolio Inquiry - Collaboration Opportunity');
                const body = encodeURIComponent(`Hello Akshat,

I came across your impressive portfolio and would like to discuss potential opportunities.

Looking forward to connecting with you.

Best regards,`);
                const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
                
                try {
                    // Create a temporary link and click it
                    const tempLink = document.createElement('a');
                    tempLink.href = mailtoLink;
                    tempLink.style.display = 'none';
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                    
                    this.showNotification('Opening email client... 📧', 'success');
                } catch (error) {
                    console.error('Mailto failed:', error);
                    // Fallback: copy email to clipboard
                    this.copyToClipboard(email);
                    this.showNotification('Email copied to clipboard! 📋', 'info');
                }
                break;
                
            case 'copy':
                this.copyToClipboard(email);
                this.showNotification('Email copied to clipboard! 📋', 'success');
                break;
                
            case 'linkedin':
                window.open('https://www.linkedin.com/in/akspshat/', '_blank');
                this.showNotification('Opening LinkedIn... 💼', 'info');
                break;
        }
        
        this.closeContactModal(modal);
        
        // Play sound effect
        if (window.audioManager && window.audioManager.sounds && window.audioManager.sounds.click) {
            window.audioManager.sounds.click();
        }
    }

    closeContactModal(modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }

    // Helper method for copying to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Text copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                this.fallbackCopyTextToClipboard(text);
            });
        } else {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            console.log('Fallback: Text copied to clipboard');
        } catch (err) {
            console.error('Fallback: Unable to copy text', err);
        }
        
        document.body.removeChild(textArea);
    }

    handleDownloadCV() {
        const resumeUrl = 'https://drive.google.com/file/d/1x2S8Oq6xfviXNTRPzcyaSfQiVdscuMKD/view?usp=drive_link';
        window.open(resumeUrl, '_blank');
        this.showNotification('Opening resume in new tab! 🚀', 'success');
        
        if (window.audioManager && window.audioManager.sounds && window.audioManager.sounds.click) {
            window.audioManager.sounds.click();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const colors = {
            success: {
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                color: 'white'
            },
            info: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            },
            error: {
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                color: 'white'
            }
        };
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: colors[type].background,
            color: colors[type].color,
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            zIndex: '9999',
            fontWeight: '600',
            boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)',
            animation: 'slideInRight 0.5s ease-out forwards',
            maxWidth: '300px',
            fontSize: '0.9rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, wait, immediate) {
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

    // Performance monitoring
    measurePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            });
        }
    }
}

// Add CSS animations for modal
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScrollPolyfill = () => {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
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
    };
    smoothScrollPolyfill();
}

// Initialize the application
const spacePortfolio = new SpacePortfolio();

// Export for global access
window.spacePortfolio = spacePortfolio;
