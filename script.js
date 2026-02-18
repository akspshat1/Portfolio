// ========================================
// 3D ROLLER COASTER PORTFOLIO — MAJESTIC
// All enhancements: energy flow, color shift,
// twinkling stars, fog breathing, momentum,
// staggered text, particle bursts
// ========================================

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ===== PANEL MANAGER =====
class PanelManager {
    constructor() {
        this.panels = document.querySelectorAll('.journey-panel');
        this.dots = document.querySelectorAll('.nav-dot');
        this.totalPanels = this.panels.length;
        this.currentPanel = -1;

        // Panel 0 (hero) lives outside the tunnel (t < ENTRY_T)
        // Panels 1..N are spread inside the tunnel from ENTRY_T to 0.92
        const ENTRY_T = 0.035;
        this.ringPositions = [0.0]; // panel 0 starts at t=0 (outside)
        const innerPanels = this.totalPanels - 1;
        for (let i = 0; i < innerPanels; i++) {
            this.ringPositions.push(ENTRY_T + (i / Math.max(innerPanels - 1, 1)) * (0.92 - ENTRY_T));
        }

        this.bindNav();
        this.setPanel(0);
    }

    bindNav() {
        document.querySelectorAll('[data-section]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(el.dataset.section);
                this.scrollToPanel(idx);
                document.getElementById('mobileSidebar')?.classList.remove('open');
                document.getElementById('sidebarOverlay')?.classList.remove('active');
                document.getElementById('hamburger')?.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        window.addEventListener('scroll', () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const bar = document.getElementById('scrollBar');
            if (bar && max > 0) bar.style.width = (window.scrollY / max * 100) + '%';
        }, { passive: true });
    }

    scrollToPanel(idx) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const target = (idx / (this.totalPanels - 1)) * max;
        window.scrollTo({ top: target, behavior: 'smooth' });
    }

    updateFromCamera(cameraT) {
        let panelIndex = this.totalPanels - 1;
        for (let i = 1; i < this.ringPositions.length; i++) {
            if (cameraT < this.ringPositions[i]) {
                panelIndex = i - 1;
                break;
            }
        }
        this.setPanel(panelIndex);
    }

    setPanel(idx) {
        if (idx === this.currentPanel) return;
        const prev = this.currentPanel;
        this.currentPanel = idx;

        this.panels.forEach((panel, i) => {
            panel.classList.toggle('active', i === idx);
        });
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === idx);
        });

        // Staggered text entrance for the new panel
        if (idx >= 0 && typeof gsap !== 'undefined') {
            const panel = this.panels[idx];
            if (!panel) return;
            const children = panel.querySelectorAll('.stagger-in');
            if (children.length > 0) {
                gsap.fromTo(children,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.15 }
                );
            }
        }
    }
}

// ===== 3D ROLLER COASTER =====
class RollerCoaster {
    constructor(panelManager) {
        this.canvas = document.getElementById('journey-canvas');
        if (!this.canvas) return;

        this.panelManager = panelManager;
        this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
        this.scroll = { current: 0, target: 0, speed: 0, last: 0, velocity: 0 };
        this.clock = new THREE.Clock();
        this.isMobile = window.innerWidth < 768;
        this.lastRingIndex = 0; // Track which ring we last passed

        // --- Entry transition constants ---
        this.ENTRY_T = 0.035;           // t on the curve where the tunnel mouth is
        this.TRANSITION_RANGE = 0.03;  // how wide the transition zone is
        this.entryFlashCooldown = 0;   // prevents repeated flashes
        this.hasEnteredTunnel = false;  // one-shot flash trigger

        // Outside environment settings
        this.outsideBg = new THREE.Color(0x020818);   // dark navy
        this.insideBg = new THREE.Color(0x000008);   // pitch black
        this.outsideFogDensity = 0.00003;

        this.init();
        this.buildPath();
        this.buildTunnel();
        this.buildStars();
        this.buildEnergyFlow();
        this.buildSpeedLines();
        this.buildFloaters();
        this.buildNebulae();
        this.setupPostProcessing();
        this.bind();
        this.loop();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000008);
        this.baseFogDensity = 0.00015;
        this.scene.fog = new THREE.FogExp2(0x000008, this.baseFogDensity);

        this.camera = new THREE.PerspectiveCamera(
            68, window.innerWidth / window.innerHeight, 0.1, 6000
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: !this.isMobile,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    // ===== FLIGHT PATH — short, smooth, cinematic =====
    buildPath() {
        this.pathPoints = [
            // Start right at the tunnel mouth
            new THREE.Vector3(0, 0, 450),
            // Enter the tunnel
            new THREE.Vector3(0, 0, 400),
            new THREE.Vector3(0, 3, 350),
            new THREE.Vector3(5, 8, 300),
            new THREE.Vector3(12, 20, 250),
            new THREE.Vector3(25, 38, 200),
            new THREE.Vector3(40, 55, 150),
            new THREE.Vector3(50, 65, 100),
            new THREE.Vector3(55, 70, 50),
            new THREE.Vector3(50, 68, 0),
            new THREE.Vector3(38, 55, -50),
            new THREE.Vector3(20, 35, -100),
            new THREE.Vector3(0, 15, -140),
            new THREE.Vector3(-20, -5, -180),
            new THREE.Vector3(-38, -25, -220),
            new THREE.Vector3(-50, -40, -265),
            new THREE.Vector3(-55, -45, -310),
            new THREE.Vector3(-48, -35, -355),
            new THREE.Vector3(-35, -15, -395),
            new THREE.Vector3(-18, 10, -435),
            new THREE.Vector3(0, 30, -475),
            new THREE.Vector3(20, 45, -515),
            new THREE.Vector3(38, 50, -555),
            new THREE.Vector3(48, 42, -595),
            new THREE.Vector3(50, 28, -635),
            new THREE.Vector3(42, 10, -670),
            new THREE.Vector3(28, -5, -705),
            new THREE.Vector3(12, -12, -740),
            new THREE.Vector3(0, -10, -770),
            new THREE.Vector3(-8, -5, -800),
        ];
        this.curve = new THREE.CatmullRomCurve3(this.pathPoints, false, 'catmullrom', 0.35);
    }

    // ===== TUNNEL — color shifts along journey =====
    // Tunnel geometry starts at ENTRY_T so the approach portion is open space
    buildTunnel() {
        // Build a separate curve for just the tunnel portion (from entry point to end)
        const tunnelSamples = 120;
        const tunnelPoints = [];
        for (let i = 0; i <= tunnelSamples; i++) {
            const t = this.ENTRY_T + (i / tunnelSamples) * (1.0 - this.ENTRY_T);
            tunnelPoints.push(this.curve.getPointAt(Math.min(t, 0.999)));
        }
        this.tunnelCurve = new THREE.CatmullRomCurve3(tunnelPoints, false, 'catmullrom', 0.35);

        // Main structural tunnel
        const mainGeo = new THREE.TubeGeometry(this.tunnelCurve, 800, 40, 32, false);
        const mainMat = new THREE.MeshBasicMaterial({
            color: 0x0d9488, wireframe: true, transparent: true,
            opacity: 0.10, side: THREE.BackSide
        });
        this.tunnelMain = new THREE.Mesh(mainGeo, mainMat);
        this.scene.add(this.tunnelMain);

        // Inner energy tube
        const innerGeo = new THREE.TubeGeometry(this.tunnelCurve, 800, 35, 16, false);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6, wireframe: true, transparent: true,
            opacity: 0.05, side: THREE.BackSide
        });
        this.tunnelInner = new THREE.Mesh(innerGeo, innerMat);
        this.scene.add(this.tunnelInner);

        // Outer shell
        const outerGeo = new THREE.TubeGeometry(this.tunnelCurve, 400, 60, 12, false);
        const outerMat = new THREE.MeshBasicMaterial({
            color: 0x312e81, wireframe: true, transparent: true,
            opacity: 0.03, side: THREE.BackSide
        });
        this.tunnelOuter = new THREE.Mesh(outerGeo, outerMat);
        this.scene.add(this.tunnelOuter);

        // Ring gates — placed along the main camera curve, but only inside the tunnel
        this.rings = [];
        const ringCount = 7;
        for (let i = 0; i < ringCount; i++) {
            // Spread rings from just past the entry to 0.92 on the main curve
            const t = this.ENTRY_T + 0.02 + (i / (ringCount - 1)) * (0.90 - this.ENTRY_T);
            const pos = this.curve.getPointAt(t);
            const tangent = this.curve.getTangentAt(t);
            const hue = 0.47 + (i / ringCount) * 0.45;
            const color = new THREE.Color().setHSL(hue, 0.65, 0.55);

            const ringGeo = new THREE.TorusGeometry(42, 1.2, 8, 80);
            const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(pos);
            ring.lookAt(pos.clone().add(tangent));
            this.scene.add(ring);

            const ring2Geo = new THREE.TorusGeometry(44, 0.6, 6, 80);
            const ring2Mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 });
            const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
            ring2.position.copy(pos);
            ring2.lookAt(pos.clone().add(tangent));
            this.scene.add(ring2);

            const glow = this.createGlowSprite(color, 0.12);
            glow.position.copy(pos);
            glow.scale.set(140, 140, 1);
            this.scene.add(glow);

            this.rings.push({ main: ring, outer: ring2, glow, t, color });
        }

        // Tunnel end cap — close off the far end
        const endPt = this.curve.getPointAt(0.99);
        const endTangent = this.curve.getTangentAt(0.99);

        // Dark sphere to block the open end
        const capGeo = new THREE.SphereGeometry(45, 24, 24);
        const capMat = new THREE.MeshBasicMaterial({ color: 0x000008, transparent: true, opacity: 0.95 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.copy(endPt).addScaledVector(endTangent, 20);
        this.scene.add(cap);

        // Glow at the end
        const endGlow = this.createGlowSprite(new THREE.Color(0x0d9488), 0.08);
        endGlow.position.copy(endPt).addScaledVector(endTangent, 10);
        endGlow.scale.set(120, 120, 1);
        this.scene.add(endGlow);

        // ===== TUNNEL MOUTH PORTAL RING =====
        const mouthT = this.ENTRY_T;
        const mouthPos = this.curve.getPointAt(mouthT);
        const mouthTan = this.curve.getTangentAt(mouthT);

        // "Space Black" Aesthetic
        const portalBase = new THREE.Color(0x050510);   // Almost black, slight blue tint
        const portalRim = new THREE.Color(0x4f46e5);   // Deep indigo/violet rim (subtle)
        const voidColor = new THREE.Color(0x000000);   // Pure void

        // Main portal ring — Sleek, dark, metallic
        const portalGeo = new THREE.TorusGeometry(43, 2.5, 16, 120);
        const portalMat = new THREE.MeshBasicMaterial({
            color: portalBase, transparent: true, opacity: 0.9
        });
        this.portalRing = new THREE.Mesh(portalGeo, portalMat);
        this.portalRing.position.copy(mouthPos);
        this.portalRing.lookAt(mouthPos.clone().add(mouthTan));
        this.scene.add(this.portalRing);

        // Thin glowing rim (Event Horizon) instead of big halo
        const rimGeo = new THREE.TorusGeometry(43, 0.4, 8, 120);
        const rimMat = new THREE.MeshBasicMaterial({
            color: portalRim, transparent: true, opacity: 0.8
        });
        this.portalRim = new THREE.Mesh(rimGeo, rimMat);
        this.portalRim.position.copy(mouthPos);
        this.portalRim.lookAt(mouthPos.clone().add(mouthTan));
        this.scene.add(this.portalRim);

        // Light outer halo/distortion - very subtle
        const haloGeo = new THREE.TorusGeometry(48, 0.5, 8, 100);
        const haloMat = new THREE.MeshBasicMaterial({
            color: portalRim, transparent: true, opacity: 0.15
        });
        this.portalHalo = new THREE.Mesh(haloGeo, haloMat);
        this.portalHalo.position.copy(mouthPos);
        this.portalHalo.lookAt(mouthPos.clone().add(mouthTan));
        this.scene.add(this.portalHalo);

        // Portal glow sprite — Deep, dark void glow
        this.portalGlow = this.createGlowSprite(new THREE.Color(0x2e1065), 0.25); // Dark purple glow
        this.portalGlow.position.copy(mouthPos);
        this.portalGlow.scale.set(220, 220, 1);
        this.scene.add(this.portalGlow);
    }

    // ===== STARS — with twinkling =====
    buildStars() {
        const count = this.isMobile ? 3000 : 7000;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        this.starPhases = new Float32Array(count); // For twinkling

        const palette = [
            new THREE.Color(0xc4f0f0), new THREE.Color(0xddd6fe),
            new THREE.Color(0xfce7f3), new THREE.Color(0xe0f2fe),
            new THREE.Color(0xf0abfc),
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const t = Math.random();
            const pt = this.curve.getPointAt(t);
            const angle = Math.random() * Math.PI * 2;
            const radius = 50 + Math.random() * 600;

            pos[i3] = pt.x + Math.cos(angle) * radius;
            pos[i3 + 1] = pt.y + Math.sin(angle) * radius;
            pos[i3 + 2] = pt.z + (Math.random() - 0.5) * 150;

            const c = palette[Math.floor(Math.random() * palette.length)];
            col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;

            sizes[i] = (this.isMobile ? 1.0 : 1.5) + Math.random() * 1.0;
            this.starPhases[i] = Math.random() * Math.PI * 2; // Random phase for twinkle
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        this.starBaseSizes = sizes.slice(); // Store base sizes

        this.stars = new THREE.Points(geo, new THREE.PointsMaterial({
            size: this.isMobile ? 1.2 : 1.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        }));
        this.scene.add(this.stars);
    }

    // ===== ENERGY FLOW — particles streaming along tunnel walls =====
    buildEnergyFlow() {
        const count = this.isMobile ? 100 : 300;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        this.energyData = [];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const t = Math.random();
            const angle = Math.random() * Math.PI * 2;
            const radius = 30 + Math.random() * 15; // Close to tunnel wall

            this.energyData.push({
                t,
                angle,
                radius,
                speed: 0.0003 + Math.random() * 0.0006, // Drift speed along curve
                phase: Math.random() * Math.PI * 2
            });

            const pt = this.curve.getPointAt(t);
            pos[i3] = pt.x + Math.cos(angle) * radius;
            pos[i3 + 1] = pt.y + Math.sin(angle) * radius;
            pos[i3 + 2] = pt.z;

            const hue = 0.45 + Math.random() * 0.4;
            const c = new THREE.Color().setHSL(hue, 0.7, 0.6);
            col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        this.energyFlow = new THREE.Points(geo, new THREE.PointsMaterial({
            size: this.isMobile ? 1.5 : 2.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        }));
        this.scene.add(this.energyFlow);
    }

    // ===== SPEED LINES =====
    buildSpeedLines() {
        const count = this.isMobile ? 150 : 500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 6);
        const col = new Float32Array(count * 6);

        for (let i = 0; i < count; i++) {
            const i6 = i * 6;
            const t = Math.random();
            const pt = this.curve.getPointAt(t);
            const tan = this.curve.getTangentAt(t);
            const angle = Math.random() * Math.PI * 2;
            const rad = 15 + Math.random() * 80;

            pos[i6] = pt.x + Math.cos(angle) * rad;
            pos[i6 + 1] = pt.y + Math.sin(angle) * rad;
            pos[i6 + 2] = pt.z;

            const len = 3 + Math.random() * 15;
            pos[i6 + 3] = pos[i6] + tan.x * len;
            pos[i6 + 4] = pos[i6 + 1] + tan.y * len;
            pos[i6 + 5] = pos[i6 + 2] + tan.z * len;

            const c = new THREE.Color().setHSL(0.5 + Math.random() * 0.35, 0.6, 0.65);
            col[i6] = c.r; col[i6 + 1] = c.g; col[i6 + 2] = c.b;
            col[i6 + 3] = c.r * 0.15; col[i6 + 4] = c.g * 0.15; col[i6 + 5] = c.b * 0.15;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        this.speedLines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
            vertexColors: true, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false
        }));
        this.scene.add(this.speedLines);
    }

    // ===== FLOATING OBJECTS =====
    buildFloaters() {
        this.floaters = [];
        const geos = [
            () => new THREE.IcosahedronGeometry(1, 1),
            () => new THREE.OctahedronGeometry(1, 0),
            () => new THREE.TorusGeometry(1, 0.3, 8, 16),
            () => new THREE.TorusKnotGeometry(0.8, 0.25, 48, 8),
            () => new THREE.DodecahedronGeometry(1, 0),
        ];

        const count = this.isMobile ? 10 : 25;
        for (let i = 0; i < count; i++) {
            const geo = geos[Math.floor(Math.random() * geos.length)]();
            const hue = 0.55 + Math.random() * 0.2;
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(hue, 0.6, 0.4),
                wireframe: true, transparent: true,
                opacity: 0.06 + Math.random() * 0.04
            });
            const mesh = new THREE.Mesh(geo, mat);
            const t = 0.05 + Math.random() * 0.9;
            const pt = this.curve.getPointAt(t);
            const angle = Math.random() * Math.PI * 2;
            const dist = 55 + Math.random() * 180;
            mesh.position.set(pt.x + Math.cos(angle) * dist, pt.y + Math.sin(angle) * dist, pt.z);
            const s = 3 + Math.random() * 12;
            mesh.scale.set(s, s, s);
            mesh.userData = {
                rx: (Math.random() - 0.5) * 0.003,
                ry: (Math.random() - 0.5) * 0.003,
                baseY: mesh.position.y,
                fs: 0.2 + Math.random() * 0.3,
                fa: 4 + Math.random() * 8
            };
            this.floaters.push(mesh);
            this.scene.add(mesh);
        }
    }

    // ===== NEBULAE — deeper, more atmospheric =====
    buildNebulae() {
        this.nebulaSprites = [];
        const colors = [0x0d9488, 0x8b5cf6, 0x06b6d4, 0xa855f7, 0xec4899, 0x6366f1];
        const count = this.isMobile ? 4 : 8;

        for (let i = 0; i < count; i++) {
            const sprite = this.createGlowSprite(
                new THREE.Color(colors[i % colors.length]),
                0.02 + Math.random() * 0.015
            );
            const t = Math.random();
            const pt = this.curve.getPointAt(t);
            const dist = 300 + Math.random() * 500;
            const angle = Math.random() * Math.PI * 2;
            sprite.position.set(
                pt.x + Math.cos(angle) * dist,
                pt.y + Math.sin(angle) * dist * 0.7,
                pt.z + (Math.random() - 0.5) * 200
            );
            const scale = 250 + Math.random() * 500;
            sprite.scale.set(scale, scale, 1);
            sprite.userData = {
                baseScale: scale,
                breathSpeed: 0.15 + Math.random() * 0.15,
                breathAmp: scale * 0.06,
                phase: Math.random() * Math.PI * 2
            };
            this.nebulaSprites.push(sprite);
            this.scene.add(sprite);
        }
    }

    // ===== RING BURST PARTICLES =====
    createRingBurst(ringIndex) {
        if (ringIndex < 0 || ringIndex >= this.rings.length) return;
        const ring = this.rings[ringIndex];
        const count = this.isMobile ? 20 : 50;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            pos[i3] = ring.main.position.x;
            pos[i3 + 1] = ring.main.position.y;
            pos[i3 + 2] = ring.main.position.z;
            const c = ring.color;
            col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const burst = new THREE.Points(geo, new THREE.PointsMaterial({
            size: 2.5, vertexColors: true, transparent: true,
            opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false,
            sizeAttenuation: true
        }));

        // Store velocity data for each particle
        const velocities = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            const upSpeed = (Math.random() - 0.5) * 1.0;
            velocities.push({
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed + upSpeed,
                z: (Math.random() - 0.5) * speed
            });
        }

        burst.userData = { velocities, life: 1.0, decay: 0.015 };
        this.scene.add(burst);

        // Animate and remove
        const animateBurst = () => {
            burst.userData.life -= burst.userData.decay;
            if (burst.userData.life <= 0) {
                this.scene.remove(burst);
                geo.dispose();
                return;
            }
            const positions = burst.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                const v = velocities[i];
                positions[i3] += v.x;
                positions[i3 + 1] += v.y;
                positions[i3 + 2] += v.z;
                v.x *= 0.97; v.y *= 0.97; v.z *= 0.97;
            }
            burst.geometry.attributes.position.needsUpdate = true;
            burst.material.opacity = burst.userData.life * 0.6;
            requestAnimationFrame(animateBurst);
        };
        animateBurst();
    }

    // ===== POST PROCESSING =====
    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.isMobile ? 0.5 : 0.7, 0.3, 0.85
        );
        this.composer.addPass(this.bloomPass);
    }

    // ===== HELPERS =====
    createGlowSprite(color, opacity = 0.1) {
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = 128;
        const ctx = cvs.getContext('2d');
        const r = color.r * 255 | 0, g = color.g * 255 | 0, b = color.b * 255 | 0;
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, `rgba(${r},${g},${b},${opacity * 5})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${opacity * 2})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(cvs),
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        }));
    }

    // Journey color: teal → violet → rose
    getJourneyColor(t) {
        if (t < 0.33) {
            // Teal (0.47) → Cyan-blue (0.55)
            const hue = 0.47 + (t / 0.33) * 0.08;
            return new THREE.Color().setHSL(hue, 0.6, 0.4);
        } else if (t < 0.66) {
            // Cyan-blue (0.55) → Violet (0.78)
            const ratio = (t - 0.33) / 0.33;
            const hue = 0.55 + ratio * 0.23;
            return new THREE.Color().setHSL(hue, 0.55 + ratio * 0.1, 0.42);
        } else {
            // Violet (0.78) → Rose (0.92)
            const ratio = (t - 0.66) / 0.34;
            const hue = 0.78 + ratio * 0.14;
            return new THREE.Color().setHSL(hue, 0.5 + ratio * 0.15, 0.45 + ratio * 0.05);
        }
    }

    // ===== EVENTS =====
    bind() {
        window.addEventListener('resize', () => {
            const w = window.innerWidth, h = window.innerHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
            this.composer.setSize(w, h);
            this.isMobile = w < 768;
        });

        window.addEventListener('mousemove', e => {
            this.mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('scroll', () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            this.scroll.target = max > 0 ? window.scrollY / max : 0;
        }, { passive: true });
    }

    // ===== RENDER LOOP =====
    loop() {
        requestAnimationFrame(() => this.loop());
        const time = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();

        // ---- Momentum scrolling — buttery smooth, cinematic ----
        const diff = this.scroll.target - this.scroll.current;
        this.scroll.velocity += diff * 0.004; // Gentle spring
        this.scroll.velocity *= 0.92; // Heavy damping for silk feel
        this.scroll.current += this.scroll.velocity;
        this.scroll.current = Math.max(0, Math.min(0.97, this.scroll.current));

        this.scroll.speed = Math.abs(this.scroll.velocity);
        this.scroll.last = this.scroll.target;

        this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
        this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;

        // ---- Camera on path ----
        const t = Math.max(0.001, Math.min(0.999, this.scroll.current));
        const pos = this.curve.getPointAt(t);
        const lookT = Math.min(t + 0.015, 0.999);
        const lookAt = this.curve.getPointAt(lookT);

        // ---- Inside factor: 0 = fully outside, 1 = fully inside tunnel ----
        const insideFactor = THREE.MathUtils.clamp(
            (t - this.ENTRY_T + this.TRANSITION_RANGE / 2) / this.TRANSITION_RANGE, 0, 1
        );
        // Smooth easing for more cinematic feel
        const smoothInside = insideFactor * insideFactor * (3 - 2 * insideFactor); // smoothstep

        // Update panels based on smoothed camera position
        if (this.panelManager) this.panelManager.updateFromCamera(t);

        this.camera.position.set(
            pos.x + this.mouse.x * 12,
            pos.y - this.mouse.y * 8,
            pos.z
        );
        this.camera.lookAt(lookAt.x + this.mouse.x * 5, lookAt.y - this.mouse.y * 4, lookAt.z);
        this.camera.rotation.z += Math.sin(time * 0.12) * 0.006;

        // ---- OUTSIDE → INSIDE TRANSITION ----

        // Background color: dark navy (outside) → pitch black (inside)
        if (this.scene.background) {
            const targetBg = this.outsideBg.clone().lerp(this.insideBg, smoothInside);
            this.scene.background.lerp(targetBg, 0.08);
        }

        // Fog density: very thin (outside) → dense (inside)
        if (this.scene.fog) {
            const breath = Math.sin(time * 0.25) * 0.000015;
            const targetDensity = THREE.MathUtils.lerp(
                this.outsideFogDensity, this.baseFogDensity, smoothInside
            ) + breath;
            this.scene.fog.density += (targetDensity - this.scene.fog.density) * 0.05;
        }

        // ---- Color gradient shift along journey ----
        const journeyColor = this.getJourneyColor(t);
        if (this.tunnelMain) {
            this.tunnelMain.material.color.lerp(journeyColor, 0.03);
            // Tunnel structure more visible from outside, subtler from inside
            const outsideOpacity = 0.18;
            const insideOpacity = 0.10;
            this.tunnelMain.material.opacity = THREE.MathUtils.lerp(outsideOpacity, insideOpacity, smoothInside);
        }
        if (this.tunnelInner) {
            const innerColor = journeyColor.clone();
            innerColor.offsetHSL(0.08, 0, 0);
            this.tunnelInner.material.color.lerp(innerColor, 0.03);
            this.tunnelInner.material.opacity = THREE.MathUtils.lerp(0.02, 0.05, smoothInside);
        }
        if (this.tunnelOuter) {
            this.tunnelOuter.material.opacity = THREE.MathUtils.lerp(0.06, 0.03, smoothInside);
        }

        // ---- Speed lines — only visible inside ----
        const warp = Math.min(this.scroll.speed * 80, 1);
        if (this.speedLines) this.speedLines.material.opacity = warp * 0.45 * smoothInside;

        // ---- Dynamic bloom — lower outside, higher inside ----
        const baseBloom = this.isMobile ? 0.4 : 0.6;
        let bloomTarget = THREE.MathUtils.lerp(0.2, baseBloom, smoothInside) + warp * 0.4;

        // ---- Entry flash — dramatic bloom spike when crossing the threshold ----
        if (this.entryFlashCooldown > 0) {
            this.entryFlashCooldown -= 0.016; // ~1 frame at 60fps
            const flashIntensity = Math.max(0, this.entryFlashCooldown / 0.6);
            bloomTarget += flashIntensity * 1.2;
        }
        if (!this.hasEnteredTunnel && insideFactor > 0.5) {
            this.hasEnteredTunnel = true;
            this.entryFlashCooldown = 0.6; // 0.6 seconds of flash
        }
        if (this.hasEnteredTunnel && insideFactor < 0.3) {
            this.hasEnteredTunnel = false; // allow re-trigger if scrolling back out
        }
        if (this.bloomPass) this.bloomPass.strength = bloomTarget;

        // ---- Portal ring animation ----
        if (this.portalRing) {
            this.portalRing.rotation.z = time * 0.15; // Slow, massive rotation

            const portalDist = this.camera.position.distanceTo(this.portalRing.position);
            const portalProx = Math.max(0, 1 - portalDist / 400);

            // Main ring — solid void
            this.portalRing.material.opacity = 0.95;

            // Rim — glowing edge
            if (this.portalRim) {
                this.portalRim.rotation.z = -time * 0.3;
                this.portalRim.material.opacity = 0.7 + Math.sin(time * 3) * 0.15;
            }

            // Halo — subtle distortion feel
            this.portalHalo.rotation.z = time * 0.05;
            this.portalHalo.material.opacity = 0.05 + portalProx * 0.1;

            if (this.portalGlow) {
                // Deep pulse
                this.portalGlow.material.opacity = 0.1 + portalProx * 0.2 + Math.sin(time * 2) * 0.05;
                this.portalGlow.scale.setScalar(220 + Math.sin(time * 1.5) * 10);
            }

            // Fade out
            const portalFade = 1 - smoothInside;
            this.portalRing.material.opacity *= portalFade;
            if (this.portalRim) this.portalRim.material.opacity *= portalFade;
            this.portalHalo.material.opacity *= portalFade;
            if (this.portalGlow) this.portalGlow.material.opacity *= portalFade;
        }

        // ---- Rings: rotate + proximity glow + burst on pass ----
        if (this.rings) {
            let currentRingIndex = 0;
            this.rings.forEach((ring, idx) => {
                ring.main.rotation.z = time * 0.3;
                ring.outer.rotation.z = -time * 0.2;
                const dist = this.camera.position.distanceTo(ring.main.position);
                const prox = Math.max(0, 1 - dist / 200);
                ring.main.material.opacity = 0.15 + prox * 0.25;
                ring.outer.material.opacity = 0.08 + prox * 0.15;
                ring.glow.material.opacity = 0.08 + prox * 0.3;
                ring.glow.scale.setScalar(120 + prox * 40 + Math.sin(time * 2) * 6);

                // Track ring passage
                if (t >= ring.t) currentRingIndex = idx;
            });

            // Fire burst particle when passing a new ring
            if (currentRingIndex !== this.lastRingIndex) {
                this.createRingBurst(currentRingIndex);
                this.lastRingIndex = currentRingIndex;
            }
        }

        // ---- Twinkling stars ----
        if (this.stars && this.starPhases) {
            const sizeAttr = this.stars.geometry.attributes.size;
            if (sizeAttr) {
                const sizes = sizeAttr.array;
                for (let i = 0; i < sizes.length; i++) {
                    const twinkle = 0.7 + 0.3 * Math.sin(time * (0.5 + (this.starPhases[i] % 1) * 1.5) + this.starPhases[i]);
                    sizes[i] = this.starBaseSizes[i] * twinkle;
                }
                sizeAttr.needsUpdate = true;
            }
            // Stars brighter outside, dimmer inside
            this.stars.material.opacity = THREE.MathUtils.lerp(0.7, 0.35, smoothInside);
        }
        if (this.stars) this.stars.rotation.y = time * 0.002;

        // ---- Energy flow: particles drifting along tunnel walls ----
        if (this.energyFlow && this.energyData) {
            const positions = this.energyFlow.geometry.attributes.position.array;
            for (let i = 0; i < this.energyData.length; i++) {
                const d = this.energyData[i];
                // Move along the curve
                d.t += d.speed + this.scroll.speed * 0.3;
                if (d.t > 1) d.t -= 1;
                if (d.t < 0) d.t += 1;

                const pt = this.curve.getPointAt(d.t);
                const spinAngle = d.angle + time * 0.2 + Math.sin(time * d.speed * 500 + d.phase) * 0.3;
                const i3 = i * 3;
                positions[i3] = pt.x + Math.cos(spinAngle) * d.radius;
                positions[i3 + 1] = pt.y + Math.sin(spinAngle) * d.radius;
                positions[i3 + 2] = pt.z;
            }
            this.energyFlow.geometry.attributes.position.needsUpdate = true;
            // Energy flow: invisible outside, active inside
            const baseEnergyOpacity = THREE.MathUtils.lerp(0.0, 0.2, smoothInside);
            this.energyFlow.material.opacity = baseEnergyOpacity + warp * 0.5 * smoothInside;
        }

        // ---- Floaters ----
        this.floaters.forEach(m => {
            m.rotation.x += m.userData.rx;
            m.rotation.y += m.userData.ry;
            m.position.y = m.userData.baseY + Math.sin(time * m.userData.fs) * m.userData.fa;
        });

        // ---- Nebulae breathing ----
        this.nebulaSprites.forEach(s => {
            const d = s.userData;
            const scale = d.baseScale + Math.sin(time * d.breathSpeed + d.phase) * d.breathAmp;
            s.scale.set(scale, scale, 1);
        });

        this.composer.render();
    }
}

// ===== GSAP ANIMATIONS =====
class ScrollAnimations {
    constructor() {
        if (typeof gsap === 'undefined') { this.fallback(); return; }
        this.hero();
    }

    hero() {
        const tl = gsap.timeline({ delay: 0.5 });
        tl.to('.hero-overline', { opacity: 1, duration: 1.2, ease: 'power2.out' });
        tl.to('.hero-overline .line', { width: 60, duration: 0.8 }, '-=0.8');
        tl.to('.hero-name .char', {
            opacity: 1, y: 0, rotateX: 0,
            stagger: 0.07, duration: 0.7, ease: 'power4.out'
        }, '-=0.4');
        tl.to('.hero-subtitle', {
            opacity: 1, duration: 0.6,
            onStart: () => new TypeWriter(document.getElementById('typewriter'), 'B.Tech Electrical Engineering — IIT Jodhpur', 45)
        }, '-=0.2');
        tl.to('.hero-tagline', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3');
        tl.to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
        gsap.set(['.hero-tagline', '.hero-cta'], { y: 15 });
    }

    fallback() {
        setTimeout(() => {
            document.querySelectorAll('.hero-name .char').forEach((c, i) => {
                setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'translateY(0) rotateX(0)'; c.style.transition = 'all 0.7s ease'; }, i * 100);
            });
            ['.hero-overline', '.hero-subtitle', '.hero-tagline', '.hero-cta'].forEach((s, i) => {
                setTimeout(() => { const el = document.querySelector(s); if (el) { el.style.opacity = '1'; el.style.transition = 'opacity 1s ease'; } }, 800 + i * 300);
            });
        }, 500);
    }
}

// ===== TYPEWRITER =====
class TypeWriter {
    constructor(el, text, speed = 50) {
        this.el = el; this.text = text; this.speed = speed; this.i = 0;
        if (el) this.type();
    }
    type() {
        if (this.i < this.text.length) {
            this.el.textContent += this.text.charAt(this.i++);
            setTimeout(() => this.type(), this.speed);
        }
    }
}

// ===== 3D CARD TILT =====
if (window.innerWidth >= 768) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(1000px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateZ(6px)`;
            const g = card.querySelector('.card-glow');
            if (g) { g.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(67,97,238,0.06), transparent 60%)`; g.style.opacity = '1'; }
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)'; const g = card.querySelector('.card-glow'); if (g) g.style.opacity = '0'; });
        card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
    });
}

// ===== SMART HEADER =====
{
    const nav = document.getElementById('topNav');
    let lastY = 0;
    if (nav) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                const y = window.scrollY;
                if (y < 100) nav.classList.remove('hidden');
                else if (y > lastY) nav.classList.add('hidden');
                else nav.classList.remove('hidden');
                lastY = y;
            });
        }, { passive: true });
    }
}

// ===== MOBILE MENU =====
{
    const btn = document.getElementById('hamburger');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    let isOpen = false;

    function toggle() {
        isOpen = !isOpen;
        btn?.classList.toggle('active', isOpen);
        sidebar?.classList.toggle('open', isOpen);
        overlay?.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    function close() { if (isOpen) toggle(); }

    btn?.addEventListener('click', toggle);
    overlay?.addEventListener('click', close);
    sidebar?.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// ===== CONTACT FORM (Google Forms) =====
{
    const GF = {
        URL: "https://docs.google.com/forms/d/e/1FAIpQLSd7tCVo55BCZ00XNoM8sVVFgwlbNnd2LS_4InUbf92u_q23Sw/formResponse",
        NAME: "entry.2121673752", EMAIL: "entry.534784293", MSG: "entry.490396674"
    };
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn span');
            if (!btn) return;
            const orig = btn.textContent;
            const fd = new FormData();
            fd.append(GF.NAME, document.getElementById('name').value);
            fd.append(GF.EMAIL, document.getElementById('email').value);
            fd.append(GF.MSG, document.getElementById('message').value);
            btn.textContent = 'Sending...';
            try { await fetch(GF.URL, { method: 'POST', mode: 'no-cors', body: fd }); btn.textContent = '✓ Sent!'; form.reset(); }
            catch { btn.textContent = '⚠ Error'; }
            setTimeout(() => { btn.textContent = orig; }, 3000);
        });
    }
}

// ===== RESUME MODAL =====
{
    const modal = document.getElementById('resumeModal');
    const openBtn = document.getElementById('viewResumeBtn');
    const closeBtn = document.querySelector('.close-modal');
    openBtn?.addEventListener('click', () => { if (modal) modal.style.display = 'block'; });
    closeBtn?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal) modal.style.display = 'none'; });
}

// ===== INIT =====
const panelMgr = new PanelManager();
new RollerCoaster(panelMgr);
new ScrollAnimations();