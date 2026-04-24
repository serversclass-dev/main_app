/* ══════════════════════════════════════════════════════════════
   🎵 SmartClass - Sound Effects & Interactive Engine
   ══════════════════════════════════════════════════════════════ */

// ── AUDIO CONTEXT & SOUND SYSTEM ──
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
        this.bgMusicNode = null;
        this.bgMusicGain = null;
        this.masterGain = null;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
            console.log('🔊 Sound Engine initialized');
        } catch (e) {
            console.warn('Sound not supported:', e);
        }
    }

    // Generate a tone with specific frequency and type
    playTone(freq, duration = 0.15, type = 'sine', volume = 0.3) {
        if (!this.initialized || this.muted) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { }
    }

    // Click sound - short pop
    click() {
        this.playTone(800, 0.08, 'sine', 0.2);
        setTimeout(() => this.playTone(1000, 0.05, 'sine', 0.1), 30);
    }

    // Hover sound - soft whistle
    hover() {
        this.playTone(600, 0.1, 'sine', 0.08);
    }

    // Success sound - happy melody
    success() {
        this.playTone(523, 0.15, 'sine', 0.25);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.25), 100);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.25), 200);
        setTimeout(() => this.playTone(1047, 0.3, 'sine', 0.2), 350);
    }

    // Error sound - descending buzz
    error() {
        this.playTone(400, 0.15, 'square', 0.15);
        setTimeout(() => this.playTone(300, 0.15, 'square', 0.12), 120);
        setTimeout(() => this.playTone(200, 0.2, 'square', 0.1), 240);
    }

    // Type sound - keyboard click
    type() {
        const freq = 1200 + Math.random() * 400;
        this.playTone(freq, 0.03, 'square', 0.05);
    }

    // Whoosh sound - page transition
    whoosh() {
        if (!this.initialized || this.muted) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
            osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + 0.3);
        } catch (e) { }
    }

    // Pop sound - bubble pop
    pop() {
        this.playTone(1500, 0.06, 'sine', 0.2);
        setTimeout(() => this.playTone(2000, 0.04, 'sine', 0.1), 30);
    }

    // Notification sound
    notification() {
        this.playTone(880, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(1100, 0.1, 'sine', 0.2), 80);
        setTimeout(() => this.playTone(880, 0.15, 'sine', 0.15), 160);
    }

    // Pencil scratch sound
    pencilScratch() {
        if (!this.initialized || this.muted) return;
        try {
            const bufferSize = this.ctx.sampleRate * 0.05;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.1;
            }
            const source = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            source.buffer = buffer;
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            source.start();
        } catch (e) { }
    }

    // Background ambient music
    startBgMusic() {
        if (!this.initialized || this.muted || this.bgMusicNode) return;
        try {
            this.bgMusicGain = this.ctx.createGain();
            this.bgMusicGain.gain.value = 0;
            this.bgMusicGain.connect(this.masterGain);

            // Create a gentle ambient pad
            const playPad = (freq, delay) => {
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.value = freq;

                filter.type = 'lowpass';
                filter.frequency.value = 800;

                oscGain.gain.value = 0.03;

                // Slow LFO for movement
                const lfo = this.ctx.createOscillator();
                const lfoGain = this.ctx.createGain();
                lfo.frequency.value = 0.2 + Math.random() * 0.3;
                lfoGain.gain.value = freq * 0.02;
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                lfo.start(this.ctx.currentTime + delay);

                osc.connect(filter);
                filter.connect(oscGain);
                oscGain.connect(this.bgMusicGain);
                osc.start(this.ctx.currentTime + delay);

                return { osc, lfo, oscGain };
            };

            // Ambient chord: C major 7 spread
            this._bgNodes = [
                playPad(130.81, 0),    // C3
                playPad(164.81, 0.5),  // E3
                playPad(196.00, 1),    // G3
                playPad(246.94, 1.5),  // B3
                playPad(261.63, 2),    // C4
            ];

            // Fade in
            this.bgMusicGain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 4);
            this.bgMusicNode = true;
            console.log('🎵 Background music started');
        } catch (e) {
            console.warn('BG music error:', e);
        }
    }

    stopBgMusic() {
        if (!this.bgMusicNode || !this.bgMusicGain) return;
        try {
            this.bgMusicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
            setTimeout(() => {
                if (this._bgNodes) {
                    this._bgNodes.forEach(n => {
                        try { n.osc.stop(); n.lfo.stop(); } catch (e) { }
                    });
                    this._bgNodes = null;
                }
                this.bgMusicNode = null;
            }, 2500);
        } catch (e) { }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.linearRampToValueAtTime(
                this.muted ? 0 : 0.5,
                this.ctx.currentTime + 0.3
            );
        }
        if (this.muted) {
            this.stopBgMusic();
        } else {
            this.startBgMusic();
        }
        return this.muted;
    }
}

// ── GLOBAL INSTANCES ──
const sound = new SoundEngine();
let currentView = 'loading';
let loginUsername = '';
let signupData = {};

// ── INITIALIZE ON FIRST INTERACTION ──
function initAudio() {
    if (!sound.initialized) {
        sound.init();
        sound.startBgMusic();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
    }
}
document.addEventListener('click', initAudio);
document.addEventListener('touchstart', initAudio);

// ══════════════════════════════════════
// DECORATIONS INJECTION
// ══════════════════════════════════════
function injectDecorations() {
    // Background shapes
    const shapesHTML = `
        <div class="bg-shapes">
            <div class="bg-shape circle" style="top:5%;left:10%;"></div>
            <div class="bg-shape square" style="top:60%;right:5%;"></div>
            <div class="bg-shape triangle" style="bottom:10%;left:20%;"></div>
            <div class="bg-shape circle" style="top:30%;right:15%;"></div>
            <div class="bg-shape square" style="top:80%;left:60%;"></div>
            <div class="bg-shape triangle" style="top:15%;left:70%;"></div>
        </div>
    `;

    // Stickers
    const stickersHTML = `
        <div class="sticker" style="top:8%;right:4%;">📐</div>
        <div class="sticker" style="top:25%;left:3%;">🎨</div>
        <div class="sticker" style="bottom:25%;right:6%;">📖</div>
        <div class="sticker" style="bottom:8%;left:4%;">🧪</div>
        <div class="sticker" style="top:50%;right:2%;">💡</div>
        <div class="sticker" style="top:70%;left:6%;">🌟</div>
    `;

    // Watercolor splashes
    const watercolorHTML = `
        <div class="watercolor-splash blue"></div>
        <div class="watercolor-splash orange"></div>
        <div class="watercolor-splash pink"></div>
    `;

    // Sound toggle button
    const soundToggleHTML = `
        <button class="sound-toggle" id="sound-toggle" onclick="toggleSound()" title="تبديل الصوت">
            <span id="sound-icon">🔊</span>
            <div class="sound-wave" id="sound-wave"></div>
        </button>
    `;

    // Page transition overlay
    const transitionHTML = `
        <div class="page-transition" id="page-transition">
            <div class="slice"></div>
            <div class="slice"></div>
            <div class="slice"></div>
            <div class="slice"></div>
            <div class="slice"></div>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', shapesHTML);
    document.body.insertAdjacentHTML('afterbegin', stickersHTML);
    document.body.insertAdjacentHTML('afterbegin', watercolorHTML);
    document.body.insertAdjacentHTML('beforeend', soundToggleHTML);
    document.body.insertAdjacentHTML('beforeend', transitionHTML);

    // Add logo image to hero
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const logoImg = document.createElement('img');
        logoImg.src = 'logo.png';
        logoImg.alt = 'SmartClass Logo';
        logoImg.className = 'logo-image';
        logoImg.onerror = function () {
            this.style.display = 'none';
        };
        heroContent.insertBefore(logoImg, heroContent.firstChild);
    }

    // Add washi tape & paper clip to cards
    document.querySelectorAll('.login-card').forEach((card, i) => {
        const clip = document.createElement('div');
        clip.className = 'paper-clip';
        clip.textContent = '📎';
        card.appendChild(clip);

        if (i % 2 === 0) {
            const tape = document.createElement('div');
            tape.className = 'washi-tape top-right';
            card.appendChild(tape);
        }
    });
}

// ══════════════════════════════════════
// PARTICLE SYSTEM
// ══════════════════════════════════════
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.emojis = ['✏️', '📝', '📚', '🎓', '⭐', '💫', '✨', '🌟', '📐', '🖊️'];
    }

    createClickSpark(x, y) {
        // Spark
        const spark = document.createElement('div');
        spark.className = 'click-spark';
        spark.style.left = (x - 15) + 'px';
        spark.style.top = (y - 15) + 'px';
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 600);

        // Ink splat
        const splat = document.createElement('div');
        splat.className = 'ink-splat';
        splat.style.left = (x - 20) + 'px';
        splat.style.top = (y - 20) + 'px';
        document.body.appendChild(splat);
        setTimeout(() => splat.remove(), 800);

        // Mini emoji particles
        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 9998;
                font-size: ${12 + Math.random() * 10}px;
                left: ${x}px;
                top: ${y}px;
                opacity: 1;
                transition: all ${0.5 + Math.random() * 0.5}s ease-out;
            `;
            particle.textContent = this.emojis[Math.floor(Math.random() * this.emojis.length)];
            document.body.appendChild(particle);

            requestAnimationFrame(() => {
                const angle = (Math.PI * 2 / 3) * i + Math.random() * 0.5;
                const distance = 40 + Math.random() * 60;
                particle.style.left = (x + Math.cos(angle) * distance) + 'px';
                particle.style.top = (y + Math.sin(angle) * distance - 30) + 'px';
                particle.style.opacity = '0';
                particle.style.transform = `scale(0.3) rotate(${Math.random() * 360}deg)`;
            });

            setTimeout(() => particle.remove(), 1000);
        }
    }

    createPencilTrail(x, y) {
        const dot = document.createElement('div');
        dot.className = 'pencil-dot';
        dot.style.left = (x - 3) + 'px';
        dot.style.top = (y - 3) + 'px';
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 1000);
    }

    createConfetti(container) {
        const colors = ['#4A90D9', '#F5A623', '#E74C6F', '#27AE60', '#9B59B6', '#F39C12'];
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 6 + Math.random() * 8;
            const startX = Math.random() * 100;
            const rotation = Math.random() * 360;
            const delay = Math.random() * 0.5;
            const duration = 1.5 + Math.random() * 2;

            confetti.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size * 0.6}px;
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                left: ${startX}%;
                top: -10px;
                opacity: 1;
                z-index: 10;
                pointer-events: none;
                transform: rotate(${rotation}deg);
                animation: confettiFall ${duration}s ease-in ${delay}s forwards;
            `;
            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), (duration + delay) * 1000 + 500);
        }

        // Add confetti keyframes if not exists
        if (!document.getElementById('confetti-keyframes')) {
            const style = document.createElement('style');
            style.id = 'confetti-keyframes';
            style.textContent = `
                @keyframes confettiFall {
                    0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                    25% { transform: translateY(100px) rotate(180deg) translateX(${Math.random() > 0.5 ? '' : '-'}30px) scale(0.9); }
                    50% { transform: translateY(200px) rotate(360deg) translateX(${Math.random() > 0.5 ? '-' : ''}20px) scale(0.8); }
                    100% { transform: translateY(400px) rotate(720deg) scale(0.3); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createFloatingEmoji(emoji, x, y) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9998;
            font-size: 24px;
            left: ${x}px;
            top: ${y}px;
            opacity: 1;
            transition: all 1.5s ease-out;
        `;
        el.textContent = emoji;
        document.body.appendChild(el);

        requestAnimationFrame(() => {
            el.style.top = (y - 100 - Math.random() * 50) + 'px';
            el.style.left = (x + (Math.random() - 0.5) * 80) + 'px';
            el.style.opacity = '0';
            el.style.transform = `scale(1.5) rotate(${(Math.random() - 0.5) * 60}deg)`;
        });

        setTimeout(() => el.remove(), 1500);
    }

    startAmbientParticles() {
        const emojis = ['✏️', '📝', '📚', '⭐', '💫'];
        setInterval(() => {
            if (document.hidden) return;
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emoji;
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.fontSize = (14 + Math.random() * 14) + 'px';
            particle.style.animationDuration = (6 + Math.random() * 8) + 's';
            particle.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 15000);
        }, 4000);
    }
}

const particles = new ParticleSystem();

// ══════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ══════════════════════════════════════
function showToast(message, type = 'info', duration = 3500) {
    const existing = document.querySelectorAll('.toast');
    existing.forEach(t => t.remove());

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    document.body.appendChild(toast);

    if (type === 'success') sound.success();
    else if (type === 'error') sound.error();
    else sound.notification();

    setTimeout(() => {
        toast.remove();
    }, duration + 500);
}

// ══════════════════════════════════════
// VIEW MANAGEMENT
// ══════════════════════════════════════
const allViews = [
    'loading-screen',
    'main-container',
    'signup-container',
    'verify-container',
    'login-username-container',
    'login-password-container',
    'success-container',
    'app-frame'
];

function hideAllViews() {
    allViews.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showView(viewName) {
    sound.whoosh();

    // Trigger page transition
    const transition = document.getElementById('page-transition');
    if (transition) {
        transition.classList.add('active');
        setTimeout(() => transition.classList.remove('active'), 800);
    }

    setTimeout(() => {
        hideAllViews();

        let targetId = '';
        switch (viewName) {
            case 'loading':
                targetId = 'loading-screen';
                break;
            case 'main':
                targetId = 'main-container';
                break;
            case 'signup':
                targetId = 'signup-container';
                break;
            case 'verify':
                targetId = 'verify-container';
                break;
            case 'login-username':
                targetId = 'login-username-container';
                break;
            case 'login-password':
                targetId = 'login-password-container';
                break;
            case 'success':
                targetId = 'success-container';
                break;
            case 'app':
                targetId = 'app-frame';
                break;
        }

        const target = document.getElementById(targetId);
        if (target) {
            target.style.display = targetId === 'app-frame' ? 'block' : 'flex';
            currentView = viewName;

            // Clear errors
            document.querySelectorAll('.status-msg').forEach(el => {
                el.style.display = 'none';
                el.textContent = '';
            });
        }
    }, 300);
}

// ══════════════════════════════════════
// FORM HANDLERS
// ══════════════════════════════════════

// Show error on specific container
function showError(containerId, message) {
    const el = document.getElementById(containerId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
        sound.error();

        // Shake the parent card
        const card = el.closest('.login-card');
        if (card) {
            card.style.animation = 'none';
            requestAnimationFrame(() => {
                card.style.animation = 'shakeIn 0.5s ease';
            });
        }
    }
}

// ── SIGNUP FLOW ──
function goToVerification() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const studentType = document.querySelector('input[name="student_type"]:checked')?.value;

    // Validation
    if (!username || username.length < 3) {
        showError('signup-error', 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
        return;
    }

    if (!password || password.length < 6) {
        showError('signup-error', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
    }

    if (password !== confirm) {
        showError('signup-error', 'كلمة المرور وتأكيدها غير متطابقتين');
        return;
    }

    // Store signup data
    signupData = {
        username: username,
        password: password,
        student_type: studentType
    };

    sound.success();
    showToast('تم التحقق من البيانات، أدخل رمز التحقق', 'success');
    showView('verify');
}

function submitSignup() {
    const code = document.getElementById('verify-code').value.trim();

    if (!code || code.length < 4) {
        showError('verify-error', 'الرجاء إدخال رمز التحقق الصحيح');
        return;
    }

    const btn = document.getElementById('btn-signup-submit');
    btn.disabled = true;
    btn.textContent = 'جاري الإنشاء...';

    // Simulate API call
    setTimeout(() => {
        sound.success();
        showView('success');

        const successCard = document.querySelector('#success-container .login-card');
        if (successCard) {
            particles.createConfetti(successCard);
        }

        document.getElementById('success-detail').textContent = 'تم إنشاء حسابك بنجاح! جاري التحويل...';

        // Redirect to app after delay
        setTimeout(() => {
            showView('app');
        }, 3000);

        btn.disabled = false;
        btn.textContent = 'إنشاء الحساب';
    }, 2000);
}

// ── LOGIN FLOW ──
function submitUsername() {
    const username = document.getElementById('login-username').value.trim();

    if (!username || username.length < 3) {
        showError('login-username-error', 'الرجاء إدخال اسم مستخدم صحيح');
        return;
    }

    loginUsername = username;
    document.getElementById('display-username').textContent = username;

    sound.pop();
    showView('login-password');

    // Focus password field after transition
    setTimeout(() => {
        const passField = document.getElementById('login-password');
        if (passField) passField.focus();
    }, 500);
}

function submitLogin() {
    const password = document.getElementById('login-password').value;

    if (!password || password.length < 6) {
        showError('login-password-error', 'الرجاء إدخال كلمة مرور صحيحة (6 أحرف على الأقل)');
        return;
    }

    const btn = document.getElementById('btn-login-submit');
    btn.disabled = true;
    btn.textContent = 'جاري التحقق...';

    // Simulate API call
    setTimeout(() => {
        sound.success();
        showView('success');

        const successCard = document.querySelector('#success-container .login-card');
        if (successCard) {
            particles.createConfetti(successCard);
        }

        document.getElementById('success-detail').textContent = `مرحباً ${loginUsername}! جاري التحويل...`;

        setTimeout(() => {
            showView('app');
        }, 3000);

        btn.disabled = false;
        btn.textContent = 'تسجيل الدخول';
    }, 2000);
}

// ══════════════════════════════════════
// SOUND TOGGLE
// ══════════════════════════════════════
function toggleSound() {
    const muted = sound.toggleMute();
    const icon = document.getElementById('sound-icon');
    const toggle = document.getElementById('sound-toggle');
    const wave = document.getElementById('sound-wave');

    if (muted) {
        icon.textContent = '🔇';
        toggle.classList.add('muted');
        if (wave) wave.style.display = 'none';
        showToast('تم كتم الصوت', 'info');
    } else {
        icon.textContent = '🔊';
        toggle.classList.remove('muted');
        if (wave) wave.style.display = 'block';
        showToast('تم تفعيل الصوت', 'success');
    }
}

// ══════════════════════════════════════
// PASSWORD STRENGTH CHECKER
// ══════════════════════════════════════
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return {
        score: strength,
        label: strength <= 1 ? 'ضعيفة' : strength <= 3 ? 'متوسطة' : 'قوية',
        class: strength <= 1 ? 'weak' : strength <= 3 ? 'medium' : 'strong'
    };
}

function setupPasswordStrength() {
    const passwordField = document.getElementById('signup-password');
    if (!passwordField) return;

    // Create strength indicator
    const strengthContainer = document.createElement('div');
    strengthContainer.className = 'password-strength';
    strengthContainer.innerHTML = `
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
    `;

    const strengthText = document.createElement('div');
    strengthText.className = 'password-strength-text';

    const parentGroup = passwordField.closest('.form-group');
    if (parentGroup) {
        parentGroup.appendChild(strengthContainer);
        parentGroup.appendChild(strengthText);
    }

    passwordField.addEventListener('input', function () {
        const result = checkPasswordStrength(this.value);
        const bars = strengthContainer.querySelectorAll('.bar');

        bars.forEach((bar, i) => {
            bar.className = 'bar';
            if (i < result.score) {
                bar.classList.add('active', result.class);
            }
        });

        if (this.value.length > 0) {
            strengthText.textContent = `قوة كلمة المرور: ${result.label}`;
            strengthText.style.color =
                result.class === 'weak' ? 'var(--danger)' :
                result.class === 'medium' ? 'var(--warning)' :
                'var(--success)';
        } else {
            strengthText.textContent = '';
        }
    });
}

// ══════════════════════════════════════
// EVENT LISTENERS & INTERACTIONS
// ══════════════════════════════════════
function setupInteractions() {

    // ── Click sounds & sparks on all buttons ──
    document.addEventListener('click', function (e) {
        // Initialize audio on first click
        initAudio();

        // Create click spark
        particles.createClickSpark(e.clientX, e.clientY);

        // Button click sound
        if (e.target.closest('.btn')) {
            sound.click();

            // Ripple effect
            const btn = e.target.closest('.btn');
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }

        // Radio button click
        if (e.target.closest('.radio-label')) {
            sound.pop();
            const label = e.target.closest('.radio-label');
            particles.createFloatingEmoji('✓', e.clientX, e.clientY);

            // Bounce animation
            label.style.animation = 'none';
            requestAnimationFrame(() => {
                label.style.animation = 'jelly 0.5s ease';
            });
        }

        // Link click
        if (e.target.tagName === 'A') {
            sound.pop();
        }
    });

    // ── Hover sounds on buttons ──
    document.addEventListener('mouseover', function (e) {
        if (e.target.closest('.btn')) {
            sound.hover();
        }
        if (e.target.closest('.radio-label')) {
            sound.hover();
        }
        if (e.target.closest('a')) {
            sound.hover();
        }
    });

    // ── Typing sounds on inputs ──
    document.addEventListener('input', function (e) {
        if (e.target.tagName === 'INPUT') {
            sound.type();
        }
    });

    // ── Focus sounds ──
    document.addEventListener('focusin', function (e) {
        if (e.target.tagName === 'INPUT') {
            sound.pencilScratch();

            // Add focus glow
            const group = e.target.closest('.form-group');
            if (group) {
                group.classList.add('focused');
            }
        }
    });

    document.addEventListener('focusout', function (e) {
        if (e.target.tagName === 'INPUT') {
            const group = e.target.closest('.form-group');
            if (group) {
                group.classList.remove('focused');
            }
        }
    });

    // ── Pencil trail on mouse move (throttled) ──
    let lastTrailTime = 0;
    document.addEventListener('mousemove', function (e) {
        const now = Date.now();
        if (now - lastTrailTime > 100) {
            lastTrailTime = now;
            if (Math.random() > 0.7) {
                particles.createPencilTrail(e.clientX, e.clientY);
            }
        }
    });

    // ── Keyboard shortcuts ──
    document.addEventListener('keydown', function (e) {
        // Escape to go back
        if (e.key === 'Escape') {
            sound.whoosh();
            if (currentView === 'verify') showView('signup');
            else if (currentView === 'login-password') showView('login-username');
            else if (currentView === 'signup' || currentView === 'login-username') showView('main');
        }

        // Ctrl+M to toggle mute
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            toggleSound();
        }
    });

    // ── Touch feedback for mobile ──
    document.addEventListener('touchstart', function (e) {
        initAudio();
        const touch = e.touches[0];
        if (touch) {
            particles.createClickSpark(touch.clientX, touch.clientY);
        }
    }, { passive: true });

    // ── Visibility change - pause/resume bg music ──
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            if (sound.bgMusicGain) {
                sound.bgMusicGain.gain.linearRampToValueAtTime(0, sound.ctx.currentTime + 1);
            }
        } else {
            if (sound.bgMusicGain && !sound.muted) {
                sound.bgMusicGain.gain.linearRampToValueAtTime(0.6, sound.ctx.currentTime + 1);
            }
        }
    });

    // ── Window resize handler ──
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate any position-dependent elements
            document.querySelectorAll('.particle').forEach(p => p.remove());
        }, 250);
    });
}

// ══════════════════════════════════════
// EASTER EGGS
// ══════════════════════════════════════
function setupEasterEggs() {
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

    document.addEventListener('keydown', function (e) {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }

        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            // Trigger confetti explosion
            sound.success();
            showToast('🎮 لقد اكتشفت السر!', 'success');

            const emojis = ['🎉', '🎊', '🌟', '⭐', '💫', '✨', '🎓', '📚', '🏆', '💎'];
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * window.innerHeight;
                    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                    particles.createFloatingEmoji(emoji, x, y);
                }, i * 100);
            }

            konamiCode = [];
        }
    });

    // Triple click easter egg
    let clickCount = 0;
    let clickTimer;
    document.querySelector('.logo-text')?.addEventListener('click', function () {
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clickCount = 0; }, 500);

        if (clickCount >= 3) {
            clickCount = 0;
            sound.success();

            // Rainbow mode
            document.body.style.animation = 'rainbowBg 3s ease';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 3000);

            // Add rainbow keyframes
            if (!document.getElementById('rainbow-keyframes')) {
                const style = document.createElement('style');
                style.id = 'rainbow-keyframes';
                style.textContent = `
                    @keyframes rainbowBg {
                        0% { filter: hue-rotate(0deg); }
                        25% { filter: hue-rotate(90deg); }
                        50% { filter: hue-rotate(180deg); }
                        75% { filter: hue-rotate(270deg); }
                        100% { filter: hue-rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }

            showToast('🌈 وضع قوس القزح!', 'success');
        }
    });
}

// ══════════════════════════════════════
// SMOOTH TEXT ANIMATION
// ══════════════════════════════════════
function animateText(element, text, speed = 50) {
    return new Promise(resolve => {
        element.textContent = '';
        let i = 0;
        const interval = setInterval(() => {
            element.textContent += text[i];
            sound.type();
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

// ══════════════════════════════════════
// INTERSECTION OBSERVER FOR ANIMATIONS
// ══════════════════════════════════════
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.animation = entry.target.dataset.animation || 'fadeInUp 0.6s ease forwards';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ══════════════════════════════════════
// TILT EFFECT ON CARDS
// ══════════════════════════════════════
function setupTiltEffect() {
    document.querySelectorAll('.login-card').forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1) rotate(-0.3deg)';
            this.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                this.style.transition = '';
            }, 500);
        });
    });
}

// ══════════════════════════════════════
// MAGNETIC BUTTONS
// ══════════════════════════════════════
function setupMagneticButtons() {
    document.querySelectorAll('.btn-lg').forEach(btn => {
        btn.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            this.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) rotate(-0.3deg)`;
        });

        btn.addEventListener('mouseleave', function () {
            this.style.transform = '';
            this.style.transition = 'transform 0.4s var(--transition-bounce)';
            setTimeout(() => {
                this.style.transition = '';
            }, 400);
        });
    });
}

// ══════════════════════════════════════
// DYNAMIC THEME BASED ON TIME
// ══════════════════════════════════════
function applyTimeTheme() {
    const hour = new Date().getHours();
    let greeting = '';
    let emoji = '';

    if (hour >= 5 && hour < 12) {
        greeting = 'صباح الخير';
        emoji = '🌅';
        document.documentElement.style.setProperty('--bg-paper', '#FFF8F0');
    } else if (hour >= 12 && hour < 17) {
        greeting = 'مساء النور';
        emoji = '☀️';
        document.documentElement.style.setProperty('--bg-paper', '#FFFDF5');
    } else if (hour >= 17 && hour < 21) {
        greeting = 'مساء الخير';
        emoji = '🌆';
        document.documentElement.style.setProperty('--bg-paper', '#FFF5EE');
    } else {
        greeting = 'مساء النجوم';
        emoji = '🌙';
        document.documentElement.style.setProperty('--bg-paper', '#F5F0FF');
    }

    // Update tagline with greeting
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const originalText = tagline.textContent.replace(/[«»\s]/g, '').trim();
        tagline.setAttribute('data-original', originalText);
        tagline.innerHTML = `« ${emoji} ${greeting} - ${originalText} »`;
    }
}

// ══════════════════════════════════════
// NETWORK STATUS INDICATOR
// ══════════════════════════════════════
function setupNetworkStatus() {
    window.addEventListener('online', function () {
        showToast('تم استعادة الاتصال بالإنترنت ✅', 'success');
        sound.success();
    });

    window.addEventListener('offline', function () {
        showToast('انقطع الاتصال بالإنترنت ❌', 'error');
        sound.error();
    });
}

// ══════════════════════════════════════
// IDLE DETECTION
// ══════════════════════════════════════
function setupIdleDetection() {
    let idleTimer;
    let idleEmojis = ['😴', '💤', '🌙', '⏰', '☕'];
    let isIdle = false;

    function resetIdle() {
        clearTimeout(idleTimer);
        if (isIdle) {
            isIdle = false;
            document.querySelectorAll('.idle-emoji').forEach(el => el.remove());
        }
        idleTimer = setTimeout(() => {
            isIdle = true;
            // Show idle animation
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const emoji = idleEmojis[Math.floor(Math.random() * idleEmojis.length)];
                    const el = document.createElement('div');
                    el.className = 'idle-emoji';
                    el.textContent = emoji;
                    el.style.cssText = `
                        position: fixed;
                        font-size: ${20 + Math.random() * 20}px;
                        left: ${Math.random() * window.innerWidth}px;
                        top: ${Math.random() * window.innerHeight}px;
                        pointer-events: none;
                        z-index: 9990;
                        opacity: 0;
                        animation: idleFloat 4s ease-in-out infinite;
                    `;
                    document.body.appendChild(el);
                }, i * 500);
            }

            // Add idle animation keyframes
            if (!document.getElementById('idle-keyframes')) {
                const style = document.createElement('style');
                style.id = 'idle-keyframes';
                style.textContent = `
                    @keyframes idleFloat {
                        0%, 100% { opacity: 0; transform: translateY(0) scale(0.8); }
                        25% { opacity: 0.6; transform: translateY(-20px) scale(1); }
                        50% { opacity: 0.4; transform: translateY(-10px) scale(0.9); }
                        75% { opacity: 0.6; transform: translateY(-30px) scale(1.1); }
                    }
                `;
                document.head.appendChild(style);
            }
        }, 30000); // 30 seconds idle
    }

    ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(event => {
        document.addEventListener(event, resetIdle, { passive: true });
    });

    resetIdle();
}

// ══════════════════════════════════════
// SMOOTH COUNTER ANIMATION
// ══════════════════════════════════════
function animateCounter(element, target, duration = 1000) {
    let start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        element.textContent = current.toLocaleString('ar-EG');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString('ar-EG');
        }
    }

    requestAnimationFrame(update);
}

// ══════════════════════════════════════
// FORM VALIDATION VISUAL FEEDBACK
// ══════════════════════════════════════
function setupFormValidation() {
    // Username validation
    const signupUsername = document.getElementById('signup-username');
    if (signupUsername) {
        signupUsername.addEventListener('input', function () {
            const value = this.value.trim();
            const isValid = value.length >= 3;

            this.style.borderColor = value.length === 0 ? '' :
                isValid ? 'var(--success)' : 'var(--danger)';

            if (isValid && value.length === 3) {
                particles.createFloatingEmoji('✅', this.getBoundingClientRect().left, this.getBoundingClientRect().top);
                sound.pop();
            }
        });
    }

    // Password match validation
    const signupConfirm = document.getElementById('signup-confirm');
    const signupPassword = document.getElementById('signup-password');
    if (signupConfirm && signupPassword) {
        signupConfirm.addEventListener('input', function () {
            const matches = this.value === signupPassword.value && this.value.length > 0;
            this.style.borderColor = this.value.length === 0 ? '' :
                matches ? 'var(--success)' : 'var(--danger)';

            if (matches) {
                particles.createFloatingEmoji('🔒', this.getBoundingClientRect().left, this.getBoundingClientRect().top);
                sound.pop();
            }
        });
    }

    // Login username validation
    const loginUsername = document.getElementById('login-username');
    if (loginUsername) {
        loginUsername.addEventListener('input', function () {
            const value = this.value.trim();
            const isValid = value.length >= 3;
            this.style.borderColor = value.length === 0 ? '' :
                isValid ? 'var(--success)' : 'var(--danger)';
        });
    }

    // Login password validation
    const loginPassword = document.getElementById('login-password');
    if (loginPassword) {
        loginPassword.addEventListener('input', function () {
            const isValid = this.value.length >= 6;
            this.style.borderColor = this.value.length === 0 ? '' :
                isValid ? 'var(--success)' : 'var(--danger)';
        });
    }

    // Verify code validation
    const verifyCode = document.getElementById('verify-code');
    if (verifyCode) {
        verifyCode.addEventListener('input', function () {
            const isValid = this.value.trim().length >= 4;
            this.style.borderColor = this.value.length === 0 ? '' :
                isValid ? 'var(--success)' : 'var(--danger)';

            if (isValid) {
                sound.pop();
            }
        });
    }
}

// ══════════════════════════════════════
// LOADING SCREEN MANAGER
// ══════════════════════════════════════
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');

    const loadingMessages = [
        'جاري التحقق...',
        'تحميل الموارد... 📚',
        'إعداد البيئة... ⚙️',
        'تجهيز المنصة... 🎓',
        'جاري الانتهاء... ✨'
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        messageIndex++;
        if (messageIndex < loadingMessages.length && loadingText) {
            loadingText.textContent = loadingMessages[messageIndex];
        }
    }, 600);

    // Simulate loading
    setTimeout(() => {
        clearInterval(messageInterval);

        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
        }

        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }

            // Show main container
            const mainContainer = document.getElementById('main-container');
            if (mainContainer) {
                mainContainer.style.display = 'flex';
            }

            currentView = 'main';

            // Play welcome sound
            setTimeout(() => {
                if (sound.initialized) {
                    sound.success();
                }
            }, 300);

        }, 800);
    }, 3000);
}

// ══════════════════════════════════════
// CURSOR CUSTOM EFFECTS
// ══════════════════════════════════════
function setupCustomCursor() {
    // Create custom cursor follower
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--primary);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        transition: transform 0.15s ease, width 0.2s ease, height 0.2s ease, border-color 0.2s ease;
        transform: translate(-50%, -50%);
        mix-blend-mode: difference;
        opacity: 0.7;
    `;
    document.body.appendChild(cursor);

    // Create inner dot
    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    dot.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: var(--primary);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        transition: transform 0.05s ease;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(dot);

    document.addEventListener('mousemove', function (e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
    });

    // Enlarge on hoverable elements
    document.addEventListener('mouseover', function (e) {
        if (e.target.closest('.btn, a, .radio-label, .sound-toggle, input, .clickable')) {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.borderColor = 'var(--secondary)';
            cursor.style.opacity = '0.5';
            dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
        }
    });

    document.addEventListener('mouseout', function (e) {
        if (e.target.closest('.btn, a, .radio-label, .sound-toggle, input, .clickable')) {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.borderColor = 'var(--primary)';
            cursor.style.opacity = '0.7';
            dot.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });

    // Click effect
    document.addEventListener('mousedown', function () {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });

    document.addEventListener('mouseup', function () {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // Hide on mobile
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
        dot.style.display = 'none';
    }
}

// ══════════════════════════════════════
// SMOOTH SCROLL REVEAL
// ══════════════════════════════════════
function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.form-group, .form-actions, .form-footer');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ══════════════════════════════════════
// SERVICE WORKER REGISTRATION (PWA)
// ══════════════════════════════════════
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered:', reg.scope))
                .catch(err => console.log('SW registration failed:', err));
        });
    }
}

// ══════════════════════════════════════
// PERFORMANCE MONITOR
// ══════════════════════════════════════
function setupPerformanceMonitor() {
    // Log performance metrics
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`⚡ Page loaded in ${loadTime}ms`);

                if (loadTime > 3000) {
                    console.warn('⚠️ Slow page load detected');
                }
            }, 0);
        });
    }

    // Monitor FPS
    let frameCount = 0;
    let lastFpsTime = performance.now();

    function checkFps() {
        frameCount++;
        const now = performance.now();
        if (now - lastFpsTime >= 1000) {
            const fps = frameCount;
            frameCount = 0;
            lastFpsTime = now;

            // Reduce animations if FPS is low
            if (fps < 30) {
                document.body.classList.add('reduce-animations');
                console.warn(`⚠️ Low FPS: ${fps}, reducing animations`);
            } else {
                document.body.classList.remove('reduce-animations');
            }
        }
        requestAnimationFrame(checkFps);
    }
    requestAnimationFrame(checkFps);
}

// Add reduced animations style
const reduceStyle = document.createElement('style');
reduceStyle.textContent = `
    .reduce-animations * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
    }
    .reduce-animations .particle,
    .reduce-animations .pencil-dot,
    .reduce-animations .click-spark,
    .reduce-animations .ink-splat,
    .reduce-animations .sticker,
    .reduce-animations .bg-shape,
    .reduce-animations .watercolor-splash {
        display: none !important;
    }
`;
document.head.appendChild(reduceStyle);

// ══════════════════════════════════════
// LOCAL STORAGE HELPERS
// ══════════════════════════════════════
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(`smartclass_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage set failed:', e);
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`smartclass_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage get failed:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(`smartclass_${key}`);
        } catch (e) {
            console.warn('Storage remove failed:', e);
        }
    },

    clear() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('smartclass_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Storage clear failed:', e);
        }
    }
};

// ══════════════════════════════════════
// REMEMBER USER PREFERENCES
// ══════════════════════════════════════
function loadUserPreferences() {
    // Sound preference
    const soundPref = Storage.get('sound_muted', false);
    if (soundPref && sound.initialized) {
        sound.muted = true;
        const icon = document.getElementById('sound-icon');
        const toggle = document.getElementById('sound-toggle');
        const wave = document.getElementById('sound-wave');
        if (icon) icon.textContent = '🔇';
        if (toggle) toggle.classList.add('muted');
        if (wave) wave.style.display = 'none';
    }

    // Remember last username
    const lastUsername = Storage.get('last_username', '');
    if (lastUsername) {
        const loginField = document.getElementById('login-username');
        if (loginField) {
            loginField.value = lastUsername;
        }
    }

    // Remember student type
    const lastType = Storage.get('student_type', '');
    if (lastType) {
        const radio = document.querySelector(`input[name="student_type"][value="${lastType}"]`);
        if (radio) radio.checked = true;
    }
}

function saveUserPreferences() {
    Storage.set('sound_muted', sound.muted);

    const loginField = document.getElementById('login-username');
    if (loginField && loginField.value.trim()) {
        Storage.set('last_username', loginField.value.trim());
    }

    const studentType = document.querySelector('input[name="student_type"]:checked');
    if (studentType) {
        Storage.set('student_type', studentType.value);
    }
}

// Save preferences before page unload
window.addEventListener('beforeunload', saveUserPreferences);

// ══════════════════════════════════════
// SESSION TOKEN MANAGEMENT
// ══════════════════════════════════════
function checkExistingSession() {
    const token = Storage.get('auth_token', null);
    const expiry = Storage.get('auth_expiry', 0);

    if (token && Date.now() < expiry) {
        console.log('✅ Valid session found');
        return true;
    }

    // Clear expired session
    if (token) {
        Storage.remove('auth_token');
        Storage.remove('auth_expiry');
        console.log('⏰ Session expired, cleared');
    }

    return false;
}

function saveSession(token, expiresInHours = 24) {
    Storage.set('auth_token', token);
    Storage.set('auth_expiry', Date.now() + (expiresInHours * 60 * 60 * 1000));
}

function clearSession() {
    Storage.remove('auth_token');
    Storage.remove('auth_expiry');
    Storage.remove('last_username');
}

// ══════════════════════════════════════
// HAPTIC FEEDBACK (Mobile)
// ══════════════════════════════════════
function haptic(type = 'light') {
    if (!navigator.vibrate) return;

    switch (type) {
        case 'light':
            navigator.vibrate(10);
            break;
        case 'medium':
            navigator.vibrate(25);
            break;
        case 'heavy':
            navigator.vibrate(50);
            break;
        case 'success':
            navigator.vibrate([10, 50, 10, 50, 30]);
            break;
        case 'error':
            navigator.vibrate([50, 30, 50, 30, 50]);
            break;
        case 'warning':
            navigator.vibrate([30, 50, 30]);
            break;
    }
}

// ══════════════════════════════════════
// DEVICE ORIENTATION PARALLAX
// ══════════════════════════════════════
function setupDeviceParallax() {
    if (!window.DeviceOrientationEvent) return;

    window.addEventListener('deviceorientation', function (e) {
        const gamma = e.gamma || 0; // Left/Right tilt (-90 to 90)
        const beta = e.beta || 0;   // Front/Back tilt (-180 to 180)

        const moveX = gamma * 0.3;
        const moveY = (beta - 45) * 0.3; // Normalize for holding phone

        // Move background shapes
        document.querySelectorAll('.bg-shape').forEach((shape, i) => {
            const factor = (i + 1) * 0.5;
            shape.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
        });

        // Move stickers
        document.querySelectorAll('.sticker').forEach((sticker, i) => {
            const factor = (i + 1) * 0.3;
            sticker.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
        });
    }, { passive: true });
}

// ══════════════════════════════════════
// MOUSE PARALLAX (Desktop)
// ══════════════════════════════════════
function setupMouseParallax() {
    if ('ontouchstart' in window) return; // Skip on mobile

    let rafId;
    document.addEventListener('mousemove', function (e) {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const moveX = (e.clientX - centerX) / centerX;
            const moveY = (e.clientY - centerY) / centerY;

            // Parallax on background shapes
            document.querySelectorAll('.bg-shape').forEach((shape, i) => {
                const factor = (i + 1) * 5;
                shape.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
            });

            // Parallax on stickers
            document.querySelectorAll('.sticker').forEach((sticker, i) => {
                const factor = (i + 1) * 3;
                sticker.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
            });

            // Parallax on watercolor splashes
            document.querySelectorAll('.watercolor-splash').forEach((splash, i) => {
                const factor = (i + 1) * 8;
                splash.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
            });
        });
    });
}

// ══════════════════════════════════════
// THEME SWITCHER
// ══════════════════════════════════════
const themes = {
    default: {
        '--primary': '#4A90D9',
        '--primary-dark': '#2C5F8A',
        '--primary-light': '#7BB3E8',
        '--secondary': '#F5A623',
        '--accent': '#E74C6F',
        '--bg-paper': '#FFF8F0'
    },
    ocean: {
        '--primary': '#0077B6',
        '--primary-dark': '#023E8A',
        '--primary-light': '#48CAE4',
        '--secondary': '#00B4D8',
        '--accent': '#90E0EF',
        '--bg-paper': '#F0F8FF'
    },
    forest: {
        '--primary': '#2D6A4F',
        '--primary-dark': '#1B4332',
        '--primary-light': '#52B788',
        '--secondary': '#95D5B2',
        '--accent': '#D8F3DC',
        '--bg-paper': '#F0FFF4'
    },
    sunset: {
        '--primary': '#E76F51',
        '--primary-dark': '#C1440E',
        '--primary-light': '#F4A261',
        '--secondary': '#E9C46A',
        '--accent': '#264653',
        '--bg-paper': '#FFF5EE'
    },
    lavender: {
        '--primary': '#7B2CBF',
        '--primary-dark': '#5A189A',
        '--primary-light': '#9D4EDD',
        '--secondary': '#C77DFF',
        '--accent': '#E0AAFF',
        '--bg-paper': '#F5F0FF'
    }
};

function setTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;

    Object.entries(theme).forEach(([prop, value]) => {
        document.documentElement.style.setProperty(prop, value);
    });

    Storage.set('theme', themeName);
    sound.pop();
    showToast(`تم تغيير السمة إلى ${themeName} 🎨`, 'info');
}

function loadSavedTheme() {
    const savedTheme = Storage.get('theme', 'default');
    if (savedTheme !== 'default') {
        setTheme(savedTheme);
    }
}

// ══════════════════════════════════════
// ACCESSIBILITY HELPERS
// ══════════════════════════════════════
function setupAccessibility() {
    // Announce view changes to screen readers
    const announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap;
        border: 0;
    `;
    document.body.appendChild(announcer);

    // Add ARIA labels to interactive elements
    document.querySelectorAll('.btn').forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', btn.textContent.trim());
        }
    });

    document.querySelectorAll('input').forEach(input => {
        const label = input.closest('.form-group')?.querySelector('label');
        if (label && !input.getAttribute('aria-label')) {
            input.setAttribute('aria-label', label.textContent.trim());
        }
    });

    // Tab trap in modals/cards
    document.querySelectorAll('.login-card').forEach(card => {
        card.setAttribute('role', 'form');
    });
}

function announce(message) {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
}

// ══════════════════════════════════════
// ANTI-SPAM / RATE LIMITING
// ══════════════════════════════════════
const RateLimiter = {
    attempts: {},

    check(action, maxAttempts = 5, windowMs = 60000) {
        const now = Date.now();
        if (!this.attempts[action]) {
            this.attempts[action] = [];
        }

        // Clean old attempts
        this.attempts[action] = this.attempts[action].filter(t => now - t < windowMs);

        if (this.attempts[action].length >= maxAttempts) {
            const waitTime = Math.ceil((windowMs - (now - this.attempts[action][0])) / 1000);
            showToast(`الرجاء الانتظار ${waitTime} ثانية قبل المحاولة مرة أخرى`, 'warning');
            sound.error();
            haptic('warning');
            return false;
        }

        this.attempts[action].push(now);
        return true;
    },

    reset(action) {
        delete this.attempts[action];
    }
};

// ══════════════════════════════════════
// ENHANCED FORM HANDLERS WITH RATE LIMITING
// ══════════════════════════════════════
const originalGoToVerification = goToVerification;
goToVerification = function () {
    if (!RateLimiter.check('signup_verify', 5, 60000)) return;
    haptic('light');
    originalGoToVerification();
};

const originalSubmitSignup = submitSignup;
submitSignup = function () {
    if (!RateLimiter.check('signup_submit', 3, 60000)) return;
    haptic('medium');
    originalSubmitSignup();
};

const originalSubmitUsername = submitUsername;
submitUsername = function () {
    if (!RateLimiter.check('login_username', 10, 60000)) return;
    haptic('light');
    originalSubmitUsername();
};

const originalSubmitLogin = submitLogin;
submitLogin = function () {
    if (!RateLimiter.check('login_submit', 5, 60000)) return;
    haptic('medium');
    originalSubmitLogin();
};

// ══════════════════════════════════════
// BACKGROUND MUSIC VISUALIZER
// ══════════════════════════════════════
function setupMusicVisualizer() {
    if (!sound.initialized || !sound.ctx) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'music-visualizer';
    canvas.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        pointer-events: none;
        z-index: 0;
        opacity: 0.15;
    `;
    document.body.appendChild(canvas);

    const ctx2d = canvas.getContext('2d');
    let animFrameId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = 60;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawVisualizer() {
        animFrameId = requestAnimationFrame(drawVisualizer);

        if (sound.muted || !sound.bgMusicNode) {
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        const barCount = 40;
        const barWidth = canvas.width / barCount;
        const time = Date.now() * 0.002;

        for (let i = 0; i < barCount; i++) {
            // Generate pseudo-random wave heights based on time
            const height = Math.abs(
                Math.sin(time + i * 0.3) * 15 +
                Math.sin(time * 1.5 + i * 0.5) * 10 +
                Math.sin(time * 0.7 + i * 0.8) * 8
            );

            const hue = (i / barCount) * 60 + 200; // Blue to purple range
            ctx2d.fillStyle = `hsla(${hue}, 70%, 60%, 0.6)`;

            const x = i * barWidth;
            const y = canvas.height - height;

            // Rounded bars
            ctx2d.beginPath();
            ctx2d.roundRect(x + 2, y, barWidth - 4, height, 3);
            ctx2d.fill();
        }
    }

    drawVisualizer();

    // Cleanup function
    return function cleanup() {
        cancelAnimationFrame(animFrameId);
        canvas.remove();
    };
}

// ══════════════════════════════════════
// WEATHER-BASED AMBIENT EFFECTS
// ══════════════════════════════════════
function setupAmbientEffects() {
    const hour = new Date().getHours();

    // Night mode: add stars
    if (hour >= 21 || hour < 5) {
        createStarField();
    }

    // Morning: add sun rays
    if (hour >= 6 && hour < 10) {
        createSunRays();
    }
}

function createStarField() {
    const container = document.createElement('div');
    container.className = 'star-field';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    `;

    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        const size = 1 + Math.random() * 3;
        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: #fff;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${0.2 + Math.random() * 0.5};
            animation: starTwinkle ${2 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 3}s;
        `;
        container.appendChild(star);
    }

    document.body.appendChild(container);

    // Add star animation
    if (!document.getElementById('star-keyframes')) {
        const style = document.createElement('style');
        style.id = 'star-keyframes';
        style.textContent = `
            @keyframes starTwinkle {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.5); }
            }
        `;
        document.head.appendChild(style);
    }
}

function createSunRays() {
    const rays = document.createElement('div');
    rays.style.cssText = `
        position: fixed;
        top: -100px;
        right: -100px;
        width: 400px;
        height: 400px;
        pointer-events: none;
        z-index: 0;
        opacity: 0.08;
        background: radial-gradient(circle, #FFD700 0%, transparent 70%);
        animation: sunPulse 6s ease-in-out infinite;
    `;
    document.body.appendChild(rays);

    if (!document.getElementById('sun-keyframes')) {
        const style = document.createElement('style');
        style.id = 'sun-keyframes';
        style.textContent = `
            @keyframes sunPulse {
                0%, 100% { transform: scale(1); opacity: 0.08; }
                50% { transform: scale(1.2); opacity: 0.12; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ══════════════════════════════════════
// NOTIFICATION PERMISSION
// ══════════════════════════════════════
async function requestNotificationPermission() {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                showToast('تم تفعيل الإشعارات بنجاح 🔔', 'success');
            }
        } catch (e) {
            console.warn('Notification permission error:', e);
        }
    }
}

function sendNotification(title, body, icon = 'logo.png') {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
        new Notification(title, {
            body: body,
            icon: icon,
            badge: icon,
            dir: 'rtl',
            lang: 'ar',
            vibrate: [100, 50, 100]
        });
    } catch (e) {
        console.warn('Notification error:', e);
    }
}

// ══════════════════════════════════════
// CLIPBOARD HELPERS
// ══════════════════════════════════════
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('تم النسخ بنجاح 📋', 'success');
        sound.pop();
        haptic('light');
        return true;
    } catch (e) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('تم النسخ بنجاح 📋', 'success');
            sound.pop();
            return true;
        } catch (err) {
            showToast('فشل النسخ ❌', 'error');
            return false;
        } finally {
            textarea.remove();
        }
    }
}

// ══════════════════════════════════════
// FULLSCREEN TOGGLE
// ══════════════════════════════════════
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            showToast('وضع ملء الشاشة 🖥️', 'info');
            sound.whoosh();
        }).catch(err => {
            console.warn('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            showToast('تم الخروج من ملء الشاشة', 'info');
            sound.whoosh();
        });
    }
}

// Double-tap to fullscreen on mobile
let lastTapTime = 0;
document.addEventListener('touchend', function (e) {
    const now = Date.now();
    if (now - lastTapTime < 300) {
        // Double tap detected on header area only
        if (e.target.closest('.hero, .logo-text, .logo-image')) {
            toggleFullscreen();
        }
    }
    lastTapTime = now;
}, { passive: true });

// ══════════════════════════════════════
// SHAKE DETECTION (Mobile)
// ══════════════════════════════════════
function setupShakeDetection() {
    if (!window.DeviceMotionEvent) return;

    let lastShakeTime = 0;
    let shakeThreshold = 15;
    let lastX, lastY, lastZ;

    window.addEventListener('devicemotion', function (e) {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;

        const now = Date.now();
        if (now - lastShakeTime < 1000) return; // Cooldown

        if (lastX !== undefined) {
            const deltaX = Math.abs(acc.x - lastX);
            const deltaY = Math.abs(acc.y - lastY);
            const deltaZ = Math.abs(acc.z - lastZ);

            if (deltaX + deltaY + deltaZ > shakeThreshold) {
                lastShakeTime = now;
                onShake();
            }
        }

        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
    }, { passive: true });
}

function onShake() {
    sound.notification();
    haptic('heavy');

    // Cycle through themes
    const themeNames = Object.keys(themes);
    const currentTheme = Storage.get('theme', 'default');
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setTheme(themeNames[nextIndex]);

    // Fun shake animation
    document.body.style.animation = 'shakeBody 0.5s ease';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);

    if (!document.getElementById('shake-keyframes')) {
        const style = document.createElement('style');
        style.id = 'shake-keyframes';
        style.textContent = `
            @keyframes shakeBody {
                0%, 100% { transform: translateX(0); }
                10% { transform: translateX(-5px) rotate(-0.5deg); }
                20% { transform: translateX(5px) rotate(0.5deg); }
                30% { transform: translateX(-4px) rotate(-0.3deg); }
                40% { transform: translateX(4px) rotate(0.3deg); }
                50% { transform: translateX(-3px); }
                60% { transform: translateX(3px); }
                70% { transform: translateX(-2px); }
                80% { transform: translateX(2px); }
                90% { transform: translateX(-1px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ══════════════════════════════════════
// DEBUG PANEL (Development only)
// ══════════════════════════════════════
function setupDebugPanel() {
    // Only show in development
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;

    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0,0,0,0.85);
        color: #0f0;
        padding: 12px;
        border-radius: 10px;
        font-family: monospace;
        font-size: 11px;
        z-index: 99999;
        max-width: 250px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0,255,0,0.3);
        display: none;
    `;

    panel.innerHTML = `
        <div style="margin-bottom:8px;font-weight:bold;color:#0ff;">🔧 Debug Panel</div>
        <div id="debug-fps">FPS: --</div>
        <div id="debug-view">View: --</div>
        <div id="debug-sound">Sound: --</div>
        <div id="debug-theme">Theme: --</div>
        <div style="margin-top:8px;">
            <button onclick="setTheme('ocean')" style="font-size:10px;margin:2px;cursor:pointer;">🌊</button>
            <button onclick="setTheme('forest')" style="font-size:10px;margin:2px;cursor:pointer;">🌲</button>
            <button onclick="setTheme('sunset')" style="font-size:10px;margin:2px;cursor:pointer;">🌅</button>
            <button onclick="setTheme('lavender')" style="font-size:10px;margin:2px;cursor:pointer;">💜</button>
            <button onclick="setTheme('default')" style="font-size:10px;margin:2px;cursor:pointer;">🔄</button>
        </div>
    `;

    document.body.appendChild(panel);

    // Toggle with Ctrl+D
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    });

    // Update debug info
    setInterval(() => {
        const fpsEl = document.getElementById('debug-fps');
        const viewEl = document.getElementById('debug-view');
        const soundEl = document.getElementById('debug-sound');
        const themeEl = document.getElementById('debug-theme');

        if (viewEl) viewEl.textContent = `View: ${currentView}`;
        if (soundEl) soundEl.textContent = `Sound: ${sound.muted ? 'Muted' : 'On'} | Init: ${sound.initialized}`;
        if (themeEl) themeEl.textContent = `Theme: ${Storage.get('theme', 'default')}`;
    }, 500);
}

// ══════════════════════════════════════
// POLYFILLS
// ══════════════════════════════════════
// roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// ══════════════════════════════════════
// MAIN INITIALIZATION
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎓 SmartClass - Initializing...');
    console.log('═══════════════════════════════════');

    // Step 1: Inject decorations
    try {
        injectDecorations();
        console.log('✅ Decorations injected');
    } catch (e) {
        console.warn('⚠️ Decorations error:', e);
    }

    // Step 2: Setup interactions
    try {
        setupInteractions();
        console.log('✅ Interactions setup');
    } catch (e) {
        console.warn('⚠️ Interactions error:', e);
    }

    // Step 3: Setup password strength
    try {
        setupPasswordStrength();
        console.log('✅ Password strength setup');
    } catch (e) {
        console.warn('⚠️ Password strength error:', e);
    }

    // Step 4: Setup form validation
    try {
        setupFormValidation();
        console.log('✅ Form validation setup');
    } catch (e) {
        console.warn('⚠️ Form validation error:', e);
    }

    // Step 5: Setup tilt effect
    try {
        setupTiltEffect();
        console.log('✅ Tilt effect setup');
    } catch (e) {
        console.warn('⚠️ Tilt effect error:', e);
    }

    // Step 6: Setup magnetic buttons
    try {
        setupMagneticButtons();
        console.log('✅ Magnetic buttons setup');
    } catch (e) {
        console.warn('⚠️ Magnetic buttons error:', e);
    }

    // Step 7: Setup custom cursor
    try {
        setupCustomCursor();
        console.log('✅ Custom cursor setup');
    } catch (e) {
        console.warn('⚠️ Custom cursor error:', e);
    }

    // Step 8: Apply time-based theme
    try {
        applyTimeTheme();
        console.log('✅ Time theme applied');
    } catch (e) {
        console.warn('⚠️ Time theme error:', e);
    }

    // Step 9: Load saved theme
    try {
        loadSavedTheme();
        console.log('✅ Saved theme loaded');
    } catch (e) {
        console.warn('⚠️ Saved theme error:', e);
    }

    // Step 10: Load user preferences
    try {
        loadUserPreferences();
        console.log('✅ User preferences loaded');
    } catch (e) {
        console.warn('⚠️ User preferences error:', e);
    }

    // Step 11: Setup network status
    try {
        setupNetworkStatus();
        console.log('✅ Network status setup');
    } catch (e) {
        console.warn('⚠️ Network status error:', e);
    }

    // Step 12: Setup accessibility
    try {
        setupAccessibility();
        console.log('✅ Accessibility setup');
    } catch (e) {
        console.warn('⚠️ Accessibility error:', e);
    }

    // Step 13: Setup easter eggs
    try {
        setupEasterEggs();
        console.log('✅ Easter eggs setup');
    } catch (e) {
        console.warn('⚠️ Easter eggs error:', e);
    }

    // Step 14: Setup idle detection
    try {
        setupIdleDetection();
        console.log('✅ Idle detection setup');
    } catch (e) {
        console.warn('⚠️ Idle detection error:', e);
    }

    // Step 15: Setup ambient effects
    try {
        setupAmbientEffects();
        console.log('✅ Ambient effects setup');
    } catch (e) {
        console.warn('⚠️ Ambient effects error:', e);
    }

    // Step 16: Setup parallax
    try {
        setupMouseParallax();
        setupDeviceParallax();
        console.log('✅ Parallax setup');
    } catch (e) {
        console.warn('⚠️ Parallax error:', e);
    }

    // Step 17: Setup shake detection
    try {
        setupShakeDetection();
        console.log('✅ Shake detection setup');
    } catch (e) {
        console.warn('⚠️ Shake detection error:', e);
    }

    // Step 18: Setup scroll reveal
    try {
        setupScrollReveal();
        console.log('✅ Scroll reveal setup');
    } catch (e) {
        console.warn('⚠️ Scroll reveal error:', e);
    }

    // Step 19: Setup performance monitor
    try {
        setupPerformanceMonitor();
        console.log('✅ Performance monitor setup');
    } catch (e) {
        console.warn('⚠️ Performance monitor error:', e);
    }

    // Step 20: Setup debug panel
    try {
        setupDebugPanel();
        console.log('✅ Debug panel setup');
    } catch (e) {
        console.warn('⚠️ Debug panel error:', e);
    }

    // Step 21: Start ambient particles
    try {
        particles.startAmbientParticles();
        console.log('✅ Ambient particles started');
    } catch (e) {
        console.warn('⚠️ Ambient particles error:', e);
    }

    // Step 22: Check existing session
    try {
        const hasSession = checkExistingSession();
        if (hasSession) {
            console.log('✅ Existing session found, redirecting...');
            // Skip loading and go to app
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        showView('app');
                        showToast('مرحباً بعودتك! 👋', 'success');
                    }, 800);
                }
            }, 1000);
        } else {
            // Step 23: Initialize loading screen
            initLoadingScreen();
            console.log('✅ Loading screen initialized');
        }
    } catch (e) {
        console.warn('⚠️ Session check error:', e);
        initLoadingScreen();
    }

    // Step 24: Setup music visualizer after a delay
    setTimeout(() => {
        try {
            if (sound.initialized) {
                setupMusicVisualizer();
                console.log('✅ Music visualizer setup');
            }
        } catch (e) {
            console.warn('⚠️ Music visualizer error:', e);
        }
    }, 5000);

    // Step 25: Request notification permission after delay
    setTimeout(() => {
        try {
            requestNotificationPermission();
        } catch (e) {
            console.warn('⚠️ Notification permission error:', e);
        }
    }, 10000);

    console.log('═══════════════════════════════════');
    console.log('🎓 SmartClass - Ready!');
    console.log('💡 Tips:');
    console.log('   Ctrl+M = Toggle sound');
    console.log('   Ctrl+D = Debug panel (localhost)');
    console.log('   Escape = Go back');
    console.log('   ↑↑↓↓←→←→BA = Easter egg');
    console.log('   Triple click logo = Rainbow mode');
    console.log('   Shake phone = Change theme');
    console.log('═══════════════════════════════════');
});

// ══════════════════════════════════════
// GLOBAL ERROR HANDLER
// ══════════════════════════════════════
window.addEventListener('error', function (e) {
    console.error('🔴 Global error:', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('🔴 Unhandled promise rejection:', e.reason);
});

// ══════════════════════════════════════
// EXPOSE GLOBAL API
// ══════════════════════════════════════
window.SmartClass = {
    sound,
    particles,
    showView,
    showToast,
    setTheme,
    toggleSound,
    toggleFullscreen,
    copyToClipboard,
    Storage,
    RateLimiter,
    haptic,
    announce,
    animateText,
    animateCounter,
    version: '2.0.0',
    author: 'SmartClass Team'
};
