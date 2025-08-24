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
            
            // Deep rocket rumble (oscillator)
            const rumbleOsc = this.audioContext.createOscillator();
            rumbleOsc.type = 'triangle';
            rumbleOsc.frequency.setValueAtTime(36, this.audioContext.currentTime);
            rumbleOsc.frequency.linearRampToValueAtTime(20, this.audioContext.currentTime + 2.3);

            const rumbleGain = this.audioContext.createGain();
            rumbleGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            rumbleGain.gain.linearRampToValueAtTime(0.22 * this.masterVolume, this.audioContext.currentTime + 0.06);
            rumbleGain.gain.linearRampToValueAtTime(0.14 * this.masterVolume, this.audioContext.currentTime + 0.7);
            rumbleGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2.5);

            // Crackle (noise)
            const crackleBuffer = this.createNoiseBuffer(1.1);
            const crackleSource = this.audioContext.createBufferSource();
            crackleSource.buffer = crackleBuffer;

            const crackleGain = this.audioContext.createGain();
            crackleGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            crackleGain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, this.audioContext.currentTime + 0.15);
            crackleGain.gain.linearRampToValueAtTime(0.04 * this.masterVolume, this.audioContext.currentTime + 0.8);
            crackleGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);

            // Whoosh (filtered noise, even longer)
            const whooshBuffer = this.createNoiseBuffer(2.8);
            const whooshSource = this.audioContext.createBufferSource();
            whooshSource.buffer = whooshBuffer;

            const whooshFilter = this.audioContext.createBiquadFilter();
            whooshFilter.type = 'bandpass';
            whooshFilter.frequency.setValueAtTime(900, this.audioContext.currentTime);
            whooshFilter.frequency.linearRampToValueAtTime(300, this.audioContext.currentTime + 1.7);

            const whooshGain = this.audioContext.createGain();
            whooshGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            whooshGain.gain.linearRampToValueAtTime(0.19 * this.masterVolume, this.audioContext.currentTime + 0.25);
            whooshGain.gain.linearRampToValueAtTime(0.04 * this.masterVolume, this.audioContext.currentTime + 1.4);
            whooshGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2.7);

            // Connect nodes
            rumbleOsc.connect(rumbleGain).connect(this.audioContext.destination);
            crackleSource.connect(crackleGain).connect(this.audioContext.destination);
            whooshSource.connect(whooshFilter).connect(whooshGain).connect(this.audioContext.destination);

            // Start everything
            rumbleOsc.start();
            crackleSource.start();
            whooshSource.start();

            // Stop all after 2.8s
            rumbleOsc.stop(this.audioContext.currentTime + 2.6);
            crackleSource.stop(this.audioContext.currentTime + 1.25);
            whooshSource.stop(this.audioContext.currentTime + 2.8);
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
