// Advanced Audio Manager for Space Portfolio
class AudioManager {
    constructor() {
        this.isEnabled = false;
        this.isMuted = true;
        this.audioContext = null;
        this.sounds = {};
        this.ambientAudio = null;
        this.masterVolume = 0.3;
        this.init();
    }

    async init() {
        // Check for Web Audio API support
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn('Web Audio API not supported');
            return;
        }

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.createSounds();
            this.setupAudioToggle();
            console.log('🎵 Audio Manager Initialized');
        } catch (error) {
            console.error('Audio initialization failed:', error);
        }
    }

    // Create procedural sounds using Web Audio API
    async createSounds() {
        // Ambient cosmic soundscape
        this.createAmbientSound();
        
        // Interaction sounds
        this.createHoverSound();
        this.createClickSound();
        this.createWhooshSound();
        this.createLaunchSound();
        this.createRevealSound();
    }

    createAmbientSound() {
        if (!this.audioContext) return;

        // Create oscillators for ambient space sound
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const oscillator3 = this.audioContext.createOscillator();
        
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Configure oscillators
        oscillator1.frequency.setValueAtTime(40, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator3.frequency.setValueAtTime(120, this.audioContext.currentTime);
        
        oscillator1.type = 'sine';
        oscillator2.type = 'triangle';
        oscillator3.type = 'sawtooth';
        
        // Configure filter and gain
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        // Connect nodes
        oscillator1.connect(filterNode);
        oscillator2.connect(filterNode);
        oscillator3.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Add modulation for cosmic effect
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator1.frequency);
        
        // Start oscillators
        oscillator1.start();
        oscillator2.start();
        oscillator3.start();
        lfo.start();
        
        this.ambientAudio = { gainNode, oscillators: [oscillator1, oscillator2, oscillator3], lfo };
    }

    createHoverSound() {
        this.sounds.hover = () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    createClickSound() {
        this.sounds.click = () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            filterNode.type = 'highpass';
            filterNode.frequency.setValueAtTime(400, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
            
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.15);
        };
    }

    createWhooshSound() {
        this.sounds.whoosh = () => {
            if (!this.audioContext || this.isMuted) return;
            
            const noiseBuffer = this.createNoiseBuffer(0.3);
            const source = this.audioContext.createBufferSource();
            const filterNode = this.audioContext.createBiquadFilter();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = noiseBuffer;
            
            filterNode.type = 'bandpass';
            filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            filterNode.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
            filterNode.Q.setValueAtTime(10, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            source.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
            source.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createLaunchSound() {
        this.sounds.launch = () => {
            if (!this.audioContext || this.isMuted) return;
            
            // Create rocket launch sound with multiple components
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const noiseBuffer = this.createNoiseBuffer(2);
            const noiseSource = this.audioContext.createBufferSource();
            
            const gainNode1 = this.audioContext.createGain();
            const gainNode2 = this.audioContext.createGain();
            const noiseGain = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            noiseSource.buffer = noiseBuffer;
            
            // Low rumble
            oscillator1.frequency.setValueAtTime(50, this.audioContext.currentTime);
            oscillator1.frequency.linearRampToValueAtTime(30, this.audioContext.currentTime + 2);
            
            // High whistle
            oscillator2.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(4000, this.audioContext.currentTime + 0.5);
            oscillator2.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 2);
            
            // Filter for noise (rocket exhaust)
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            
            // Gain envelopes
            gainNode1.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode1.gain.linearRampToValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime + 0.1);
            gainNode1.gain.linearRampToValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime + 1.5);
            gainNode1.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
            
            gainNode2.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode2.gain.linearRampToValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime + 0.1);
            gainNode2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
            
            noiseGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            noiseGain.gain.linearRampToValueAtTime(0.4 * this.masterVolume, this.audioContext.currentTime + 0.2);
            noiseGain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime + 1.5);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
            
            // Connect nodes
            oscillator1.connect(gainNode1);
            oscillator2.connect(gainNode2);
            noiseSource.connect(filterNode);
            filterNode.connect(noiseGain);
            
            gainNode1.connect(this.audioContext.destination);
            gainNode2.connect(this.audioContext.destination);
            noiseGain.connect(this.audioContext.destination);
            
            // Start sounds
            oscillator1.start();
            oscillator2.start();
            noiseSource.start();
            
            // Stop sounds
            oscillator1.stop(this.audioContext.currentTime + 2);
            oscillator2.stop(this.audioContext.currentTime + 2);
            noiseSource.stop(this.audioContext.currentTime + 2);
        };
    }

    createRevealSound() {
        this.sounds.reveal = () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
            oscillator.type = 'sine';
            
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
            
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.4);
        };
    }

    // Helper function to create noise buffer
    createNoiseBuffer(duration) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }

    // Setup audio toggle button
    setupAudioToggle() {
        const audioToggle = document.getElementById('audioToggle');
        if (!audioToggle) return;
        
        audioToggle.addEventListener('click', () => {
            this.toggle();
        });
        
        // Setup hover and click sounds for interactive elements
        this.setupInteractionSounds();
    }

    setupInteractionSounds() {
        // Hover sounds
        const hoverElements = document.querySelectorAll('.nav-link, .launch-btn, .contact-btn, .project-card, .skill-item');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (this.sounds.hover) this.sounds.hover();
            });
        });
        
        // Click sounds
        const clickElements = document.querySelectorAll('button, .nav-link, .contact-btn');
        clickElements.forEach(element => {
            element.addEventListener('click', () => {
                if (this.sounds.click) this.sounds.click();
            });
        });
        
        // Whoosh sounds for section reveals
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && this.sounds.whoosh) {
                        this.sounds.whoosh();
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(section);
        });
    }

    // Public methods
    toggle() {
        if (!this.audioContext) return;
        
        this.isMuted = !this.isMuted;
        const audioToggle = document.getElementById('audioToggle');
        
        if (this.isMuted) {
            this.stop();
            audioToggle.classList.add('muted');
        } else {
            this.play();
            audioToggle.classList.remove('muted');
            
            // Resume AudioContext if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }
    }

    play() {
        if (!this.ambientAudio || this.isMuted) return;
        
        this.ambientAudio.gainNode.gain.linearRampToValueAtTime(
            0.1 * this.masterVolume, 
            this.audioContext.currentTime + 1
        );
        this.isEnabled = true;
    }

    stop() {
        if (!this.ambientAudio) return;
        
        this.ambientAudio.gainNode.gain.linearRampToValueAtTime(
            0, 
            this.audioContext.currentTime + 1
        );
        this.isEnabled = false;
    }

    playLaunchSound() {
        if (this.sounds.launch) {
            this.sounds.launch();
        }
    }

    playRevealSound() {
        if (this.sounds.reveal) {
            this.sounds.reveal();
        }
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.ambientAudio && this.isEnabled) {
            this.ambientAudio.gainNode.gain.setValueAtTime(
                0.1 * this.masterVolume,
                this.audioContext.currentTime
            );
        }
    }
}

// Initialize audio manager
const audioManager = new AudioManager();

// Make it globally available
window.audioManager = audioManager;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
