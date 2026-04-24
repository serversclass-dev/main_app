/* ══════════════════════════════════════════════════════════════
   🎓 SmartClass - Complete App Engine
   Backend API Integration + Sound Effects + Interactive UI
   ══════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ══════════════════════════════════════
    // SOUND ENGINE
    // ══════════════════════════════════════
    var SoundEngine = {
        ctx: null,
        muted: false,
        initialized: false,
        masterGain: null,
        bgMusicNode: null,
        bgMusicGain: null,
        _bgNodes: null,

        init: function() {
            if (this.initialized) return;
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.5;
                this.masterGain.connect(this.ctx.destination);
                this.initialized = true;
                console.log('🔊 Sound Engine initialized');
            } catch(e) {
                console.warn('Sound not supported:', e);
            }
        },

        playTone: function(freq, duration, type, volume) {
            if (!this.initialized || this.muted) return;
            duration = duration || 0.15;
            type = type || 'sine';
            volume = volume || 0.3;
            try {
                var osc = this.ctx.createOscillator();
                var gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(volume, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(this.ctx.currentTime);
                osc.stop(this.ctx.currentTime + duration);
            } catch(e) {}
        },

        click: function() {
            this.playTone(800, 0.08, 'sine', 0.2);
            var self = this;
            setTimeout(function() { self.playTone(1000, 0.05, 'sine', 0.1); }, 30);
        },

        hover: function() {
            this.playTone(600, 0.1, 'sine', 0.08);
        },

        success: function() {
            var self = this;
            this.playTone(523, 0.15, 'sine', 0.25);
            setTimeout(function() { self.playTone(659, 0.15, 'sine', 0.25); }, 100);
            setTimeout(function() { self.playTone(784, 0.2, 'sine', 0.25); }, 200);
            setTimeout(function() { self.playTone(1047, 0.3, 'sine', 0.2); }, 350);
        },

        error: function() {
            var self = this;
            this.playTone(400, 0.15, 'square', 0.15);
            setTimeout(function() { self.playTone(300, 0.15, 'square', 0.12); }, 120);
            setTimeout(function() { self.playTone(200, 0.2, 'square', 0.1); }, 240);
        },

        type: function() {
            var freq = 1200 + Math.random() * 400;
            this.playTone(freq, 0.03, 'square', 0.05);
        },

        whoosh: function() {
            if (!this.initialized || this.muted) return;
            try {
                var osc = this.ctx.createOscillator();
                var gain = this.ctx.createGain();
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
            } catch(e) {}
        },

        pop: function() {
            var self = this;
            this.playTone(1500, 0.06, 'sine', 0.2);
            setTimeout(function() { self.playTone(2000, 0.04, 'sine', 0.1); }, 30);
        },

        notification: function() {
            var self = this;
            this.playTone(880, 0.1, 'sine', 0.2);
            setTimeout(function() { self.playTone(1100, 0.1, 'sine', 0.2); }, 80);
            setTimeout(function() { self.playTone(880, 0.15, 'sine', 0.15); }, 160);
        },

        pencilScratch: function() {
            if (!this.initialized || this.muted) return;
            try {
                var bufferSize = this.ctx.sampleRate * 0.05;
                var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                var data = buffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.1;
                }
                var source = this.ctx.createBufferSource();
                var gain = this.ctx.createGain();
                var filter = this.ctx.createBiquadFilter();
                source.buffer = buffer;
                filter.type = 'highpass';
                filter.frequency.value = 2000;
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
                source.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);
                source.start();
            } catch(e) {}
        },

        startBgMusic: function() {
            if (!this.initialized || this.muted || this.bgMusicNode) return;
            try {
                this.bgMusicGain = this.ctx.createGain();
                this.bgMusicGain.gain.value = 0;
                this.bgMusicGain.connect(this.masterGain);

                var self = this;
                var playPad = function(freq, delay) {
                    var osc = self.ctx.createOscillator();
                    var oscGain = self.ctx.createGain();
                    var filter = self.ctx.createBiquadFilter();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    filter.type = 'lowpass';
                    filter.frequency.value = 800;
                    oscGain.gain.value = 0.03;
                    var lfo = self.ctx.createOscillator();
                    var lfoGain = self.ctx.createGain();
                    lfo.frequency.value = 0.2 + Math.random() * 0.3;
                    lfoGain.gain.value = freq * 0.02;
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    lfo.start(self.ctx.currentTime + delay);
                    osc.connect(filter);
                    filter.connect(oscGain);
                    oscGain.connect(self.bgMusicGain);
                    osc.start(self.ctx.currentTime + delay);
                    return { osc: osc, lfo: lfo, oscGain: oscGain };
                };

                this._bgNodes = [
                    playPad(130.81, 0),
                    playPad(164.81, 0.5),
                    playPad(196.00, 1),
                    playPad(246.94, 1.5),
                    playPad(261.63, 2)
                ];

                this.bgMusicGain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 4);
                this.bgMusicNode = true;
            } catch(e) {}
        },

        stopBgMusic: function() {
            if (!this.bgMusicNode || !this.bgMusicGain) return;
            try {
                this.bgMusicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
                var self = this;
                setTimeout(function() {
                    if (self._bgNodes) {
                        self._bgNodes.forEach(function(n) {
                            try { n.osc.stop(); n.lfo.stop(); } catch(e) {}
                        });
                        self._bgNodes = null;
                    }
                    self.bgMusicNode = null;
                }, 2500);
            } catch(e) {}
        },

        toggleMute: function() {
            this.muted = !this.muted;
            if (this.masterGain) {
                this.masterGain.gain.linearRampToValueAtTime(
                    this.muted ? 0 : 0.5,
                    this.ctx.currentTime + 0.3
                );
            }
            if (this.muted) this.stopBgMusic();
            else this.startBgMusic();
            return this.muted;
        }
    };

    // ══════════════════════════════════════
    // PARTICLE SYSTEM
    // ══════════════════════════════════════
    var Particles = {
        emojis: ['✏️', '📝', '📚', '🎓', '⭐', '💫', '✨', '🌟', '📐', '🖊️'],

        createClickSpark: function(x, y) {
            var spark = document.createElement('div');
            spark.className = 'click-spark';
            spark.style.left = (x - 15) + 'px';
            spark.style.top = (y - 15) + 'px';
            document.body.appendChild(spark);
            setTimeout(function() { spark.remove(); }, 600);

            var splat = document.createElement('div');
            splat.className = 'ink-splat';
            splat.style.left = (x - 20) + 'px';
            splat.style.top = (y - 20) + 'px';
            document.body.appendChild(splat);
            setTimeout(function() { splat.remove(); }, 800);

            for (var i = 0; i < 3; i++) {
                (function(idx) {
                    var p = document.createElement('div');
                    p.style.cssText = 'position:fixed;pointer-events:none;z-index:9998;font-size:' +
                        (12 + Math.random() * 10) + 'px;left:' + x + 'px;top:' + y +
                        'px;opacity:1;transition:all ' + (0.5 + Math.random() * 0.5) + 's ease-out;';
                    p.textContent = Particles.emojis[Math.floor(Math.random() * Particles.emojis.length)];
                    document.body.appendChild(p);
                    requestAnimationFrame(function() {
                        var angle = (Math.PI * 2 / 3) * idx + Math.random() * 0.5;
                        var dist = 40 + Math.random() * 60;
                        p.style.left = (x + Math.cos(angle) * dist) + 'px';
                        p.style.top = (y + Math.sin(angle) * dist - 30) + 'px';
                        p.style.opacity = '0';
                        p.style.transform = 'scale(0.3) rotate(' + (Math.random() * 360) + 'deg)';
                    });
                    setTimeout(function() { p.remove(); }, 1000);
                })(i);
            }
        },

        createConfetti: function(container) {
            var colors = ['#4A90D9', '#F5A623', '#E74C6F', '#27AE60', '#9B59B6', '#F39C12'];
            if (!document.getElementById('confetti-keyframes')) {
                var style = document.createElement('style');
                style.id = 'confetti-keyframes';
                style.textContent = '@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg) scale(1);opacity:1}50%{transform:translateY(200px) rotate(360deg) scale(0.8)}100%{transform:translateY(400px) rotate(720deg) scale(0.3);opacity:0}}';
                document.head.appendChild(style);
            }
            for (var i = 0; i < 30; i++) {
                var c = document.createElement('div');
                var color = colors[Math.floor(Math.random() * colors.length)];
                var size = 6 + Math.random() * 8;
                var delay = Math.random() * 0.5;
                var dur = 1.5 + Math.random() * 2;
                c.style.cssText = 'position:absolute;width:' + size + 'px;height:' + (size * 0.6) +
                    'px;background:' + color + ';border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') +
                    ';left:' + (Math.random() * 100) + '%;top:-10px;opacity:1;z-index:10;pointer-events:none;' +
                    'animation:confettiFall ' + dur + 's ease-in ' + delay + 's forwards;';
                container.appendChild(c);
                (function(el, t) {
                    setTimeout(function() { el.remove(); }, t);
                })(c, (dur + delay) * 1000 + 500);
            }
        },

        createPencilTrail: function(x, y) {
            var dot = document.createElement('div');
            dot.className = 'pencil-dot';
            dot.style.left = (x - 3) + 'px';
            dot.style.top = (y - 3) + 'px';
            document.body.appendChild(dot);
            setTimeout(function() { dot.remove(); }, 1000);
        },

        createFloatingEmoji: function(emoji, x, y) {
            var el = document.createElement('div');
            el.style.cssText = 'position:fixed;pointer-events:none;z-index:9998;font-size:24px;left:' +
                x + 'px;top:' + y + 'px;opacity:1;transition:all 1.5s ease-out;';
            el.textContent = emoji;
            document.body.appendChild(el);
            requestAnimationFrame(function() {
                el.style.top = (y - 100 - Math.random() * 50) + 'px';
                el.style.left = (x + (Math.random() - 0.5) * 80) + 'px';
                el.style.opacity = '0';
                el.style.transform = 'scale(1.5) rotate(' + ((Math.random() - 0.5) * 60) + 'deg)';
            });
            setTimeout(function() { el.remove(); }, 1500);
        },

        startAmbient: function() {
            var emojis = ['✏️', '📝', '📚', '⭐', '💫'];
            setInterval(function() {
                if (document.hidden) return;
                var emoji = emojis[Math.floor(Math.random() * emojis.length)];
                var p = document.createElement('div');
                p.className = 'particle';
                p.textContent = emoji;
                p.style.left = Math.random() * window.innerWidth + 'px';
                p.style.fontSize = (14 + Math.random() * 14) + 'px';
                p.style.animationDuration = (6 + Math.random() * 8) + 's';
                p.style.animationDelay = Math.random() * 2 + 's';
                document.body.appendChild(p);
                setTimeout(function() { p.remove(); }, 15000);
            }, 4000);
        }
    };

    // ══════════════════════════════════════
    // TOAST NOTIFICATIONS
    // ══════════════════════════════════════
    function showToast(message, type) {
        type = type || 'info';
        var existing = document.querySelectorAll('.toast');
        for (var i = 0; i < existing.length; i++) existing[i].remove();

        var icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML = '<span>' + (icons[type] || 'ℹ️') + '</span><span>' + message + '</span>';
        document.body.appendChild(toast);

        if (type === 'success') SoundEngine.success();
        else if (type === 'error') SoundEngine.error();
        else SoundEngine.notification();

        setTimeout(function() { toast.remove(); }, 4000);
    }

    // ══════════════════════════════════════
    // DECORATIONS INJECTION
    // ══════════════════════════════════════
    function injectDecorations() {
        // Background shapes
        var shapesHTML = '<div class="bg-shapes">' +
            '<div class="bg-shape circle" style="top:5%;left:10%;"></div>' +
            '<div class="bg-shape square" style="top:60%;right:5%;"></div>' +
            '<div class="bg-shape triangle" style="bottom:10%;left:20%;"></div>' +
            '<div class="bg-shape circle" style="top:30%;right:15%;"></div>' +
            '<div class="bg-shape square" style="top:80%;left:60%;"></div>' +
            '<div class="bg-shape triangle" style="top:15%;left:70%;"></div>' +
            '</div>';

        // Stickers
        var stickersHTML =
            '<div class="sticker" style="top:8%;right:4%;">📐</div>' +
            '<div class="sticker" style="top:25%;left:3%;">🎨</div>' +
            '<div class="sticker" style="bottom:25%;right:6%;">📖</div>' +
            '<div class="sticker" style="bottom:8%;left:4%;">🧪</div>' +
            '<div class="sticker" style="top:50%;right:2%;">💡</div>' +
            '<div class="sticker" style="top:70%;left:6%;">🌟</div>';

        // Watercolor splashes
        var watercolorHTML =
            '<div class="watercolor-splash blue"></div>' +
            '<div class="watercolor-splash orange"></div>' +
            '<div class="watercolor-splash pink"></div>';

        // Sound toggle
        var soundToggleHTML =
            '<button class="sound-toggle" id="sound-toggle" title="تبديل الصوت">' +
            '<span id="sound-icon">🔊</span>' +
            '<div class="sound-wave" id="sound-wave"></div>' +
            '</button>';

        // Page transition
        var transitionHTML = '<div class="page-transition" id="page-transition">' +
            '<div class="slice"></div><div class="slice"></div><div class="slice"></div>' +
            '<div class="slice"></div><div class="slice"></div></div>';

        document.body.insertAdjacentHTML('afterbegin', shapesHTML);
        document.body.insertAdjacentHTML('afterbegin', stickersHTML);
        document.body.insertAdjacentHTML('afterbegin', watercolorHTML);
        document.body.insertAdjacentHTML('beforeend', soundToggleHTML);
        document.body.insertAdjacentHTML('beforeend', transitionHTML);

        // Sound toggle click handler
        document.getElementById('sound-toggle').addEventListener('click', function() {
            var muted = SoundEngine.toggleMute();
            var icon = document.getElementById('sound-icon');
            var toggle = document.getElementById('sound-toggle');
            var wave = document.getElementById('sound-wave');
            if (muted) {
                icon.textContent = '🔇';
                toggle.classList.add('muted');
                if (wave) wave.style.display = 'none';
            } else {
                icon.textContent = '🔊';
                toggle.classList.remove('muted');
                if (wave) wave.style.display = 'block';
            }
            try { localStorage.setItem('sc_sound_muted', muted ? '1' : '0'); } catch(e) {}
        });

        // Add logo image to hero
        var heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            var logoImg = document.createElement('img');
            logoImg.src = 'logo.png';
            logoImg.alt = 'SmartClass';
            logoImg.className = 'logo-image';
            logoImg.onerror = function() { this.style.display = 'none'; };
            heroContent.insertBefore(logoImg, heroContent.firstChild);
        }

        // Add paper clips to cards
        var cards = document.querySelectorAll('.login-card');
        for (var i = 0; i < cards.length; i++) {
            var clip = document.createElement('div');
            clip.className = 'paper-clip';
            clip.textContent = '📎';
            cards[i].appendChild(clip);
        }
    }

    // ══════════════════════════════════════
    // INTERACTIVE EFFECTS SETUP
    // ══════════════════════════════════════
    function setupInteractions() {
        // Init audio on first interaction
        function initAudio() {
            if (!SoundEngine.initialized) {
                SoundEngine.init();
                SoundEngine.startBgMusic();
                // Load mute preference
                try {
                    if (localStorage.getItem('sc_sound_muted') === '1') {
                        SoundEngine.toggleMute();
                        var icon = document.getElementById('sound-icon');
                        var toggle = document.getElementById('sound-toggle');
                        var wave = document.getElementById('sound-wave');
                        if (icon) icon.textContent = '🔇';
                        if (toggle) toggle.classList.add('muted');
                        if (wave) wave.style.display = 'none';
                    }
                } catch(e) {}
            }
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        }
        document.addEventListener('click', initAudio);
        document.addEventListener('touchstart', initAudio);

        // Click effects
        document.addEventListener('click', function(e) {
            Particles.createClickSpark(e.clientX, e.clientY);

            if (e.target.closest('.btn')) {
                SoundEngine.click();
                // Ripple
                var btn = e.target.closest('.btn');
                var ripple = document.createElement('span');
                ripple.className = 'ripple';
                var rect = btn.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                btn.appendChild(ripple);
                setTimeout(function() { ripple.remove(); }, 600);
            }

            if (e.target.closest('.radio-label')) {
                SoundEngine.pop();
                Particles.createFloatingEmoji('✓', e.clientX, e.clientY);
            }

            if (e.target.tagName === 'A') {
                SoundEngine.pop();
            }
        });

        // Hover sounds
        document.addEventListener('mouseover', function(e) {
            if (e.target.closest('.btn') || e.target.closest('.radio-label') || e.target.closest('a')) {
                SoundEngine.hover();
            }
        });

        // Typing sounds
        document.addEventListener('input', function(e) {
            if (e.target.tagName === 'INPUT') {
                SoundEngine.type();
            }
        });

        // Focus sounds
        document.addEventListener('focusin', function(e) {
            if (e.target.tagName === 'INPUT') {
                SoundEngine.pencilScratch();
            }
        });

        // Pencil trail (throttled)
        var lastTrailTime = 0;
        document.addEventListener('mousemove', function(e) {
            var now = Date.now();
            if (now - lastTrailTime > 100 && Math.random() > 0.7) {
                lastTrailTime = now;
                Particles.createPencilTrail(e.clientX, e.clientY);
            }
        });

        // Touch feedback
        document.addEventListener('touchstart', function(e) {
            var touch = e.touches[0];
            if (touch) Particles.createClickSpark(touch.clientX, touch.clientY);
        }, { passive: true });

        // Visibility change
        document.addEventListener('visibilitychange', function() {
            if (SoundEngine.bgMusicGain && SoundEngine.ctx) {
                if (document.hidden) {
                    SoundEngine.bgMusicGain.gain.linearRampToValueAtTime(0, SoundEngine.ctx.currentTime + 1);
                } else if (!SoundEngine.muted) {
                    SoundEngine.bgMusicGain.gain.linearRampToValueAtTime(0.6, SoundEngine.ctx.currentTime + 1);
                }
            }
        });
    }

    // ══════════════════════════════════════
    // TILT EFFECT ON CARDS
    // ══════════════════════════════════════
    function setupTiltEffect() {
        var cards = document.querySelectorAll('.login-card');
        for (var i = 0; i < cards.length; i++) {
            (function(card) {
                card.addEventListener('mousemove', function(e) {
                    var rect = this.getBoundingClientRect();
                    var x = e.clientX - rect.left;
                    var y = e.clientY - rect.top;
                    var centerX = rect.width / 2;
                    var centerY = rect.height / 2;
                    var rotateX = ((y - centerY) / centerY) * -3;
                    var rotateY = ((x - centerX) / centerX) * 3;
                    this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.01)';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1) rotate(-0.3deg)';
                    this.style.transition = 'transform 0.5s ease';
                    var self = this;
                    setTimeout(function() { self.style.transition = ''; }, 500);
                });
            })(cards[i]);
        }
    }

    // ══════════════════════════════════════
    // MOUSE PARALLAX
    // ══════════════════════════════════════
    function setupParallax() {
        if ('ontouchstart' in window) return;
        var rafId;
        document.addEventListener('mousemove', function(e) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(function() {
                var cx = window.innerWidth / 2;
                var cy = window.innerHeight / 2;
                var mx = (e.clientX - cx) / cx;
                var my = (e.clientY - cy) / cy;

                var shapes = document.querySelectorAll('.bg-shape');
                for (var i = 0; i < shapes.length; i++) {
                    var f = (i + 1) * 5;
                    shapes[i].style.transform = 'translate(' + (mx * f) + 'px,' + (my * f) + 'px)';
                }
                var stickers = document.querySelectorAll('.sticker');
                for (var j = 0; j < stickers.length; j++) {
                    var f2 = (j + 1) * 3;
                    stickers[j].style.transform = 'translate(' + (mx * f2) + 'px,' + (my * f2) + 'px)';
                }
            });
        });
    }

    // ══════════════════════════════════════
    // PASSWORD STRENGTH
    // ══════════════════════════════════════
    function setupPasswordStrength() {
        var field = document.getElementById('signup-password');
        if (!field) return;

        var container = document.createElement('div');
        container.className = 'password-strength';
        container.innerHTML = '<div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>';

        var text = document.createElement('div');
        text.className = 'password-strength-text';

        var parent = field.closest('.form-group');
        if (parent) {
            parent.appendChild(container);
            parent.appendChild(text);
        }

        field.addEventListener('input', function() {
            var val = this.value;
            var strength = 0;
            if (val.length >= 6) strength++;
            if (val.length >= 10) strength++;
            if (/[A-Z]/.test(val)) strength++;
            if (/[0-9]/.test(val)) strength++;
            if (/[^A-Za-z0-9]/.test(val)) strength++;

            var label = strength <= 1 ? 'ضعيفة' : strength <= 3 ? 'متوسطة' : 'قوية';
            var cls = strength <= 1 ? 'weak' : strength <= 3 ? 'medium' : 'strong';

            var bars = container.querySelectorAll('.bar');
            for (var i = 0; i < bars.length; i++) {
                bars[i].className = 'bar';
                if (i < strength) {
                    bars[i].classList.add('active', cls);
                }
            }

            if (val.length > 0) {
                text.textContent = 'قوة كلمة المرور: ' + label;
                text.style.color = cls === 'weak' ? 'var(--danger)' :
                    cls === 'medium' ? 'var(--warning)' : 'var(--success)';
            } else {
                text.textContent = '';
            }
        });
    }

    // ══════════════════════════════════════
    // FORM VALIDATION VISUAL FEEDBACK
    // ══════════════════════════════════════
    function setupFormValidation() {
        var signupUsername = document.getElementById('signup-username');
        if (signupUsername) {
            signupUsername.addEventListener('input', function() {
                var val = this.value.trim();
                this.style.borderColor = val.length === 0 ? '' :
                    val.length >= 3 ? 'var(--success)' : 'var(--danger)';
            });
        }

        var signupConfirm = document.getElementById('signup-confirm');
        var signupPassword = document.getElementById('signup-password');
        if (signupConfirm && signupPassword) {
            signupConfirm.addEventListener('input', function() {
                var matches = this.value === signupPassword.value && this.value.length > 0;
                this.style.borderColor = this.value.length === 0 ? '' :
                    matches ? 'var(--success)' : 'var(--danger)';
            });
        }

        var loginUsername = document.getElementById('login-username');
        if (loginUsername) {
            loginUsername.addEventListener('input', function() {
                var val = this.value.trim();
                this.style.borderColor = val.length === 0 ? '' :
                    val.length >= 3 ? 'var(--success)' : 'var(--danger)';
            });
        }

        var loginPassword = document.getElementById('login-password');
        if (loginPassword) {
            loginPassword.addEventListener('input', function() {
                this.style.borderColor = this.value.length === 0 ? '' :
                    this.value.length >= 6 ? 'var(--success)' : 'var(--danger)';
            });
        }

        var verifyCode = document.getElementById('verify-code');
        if (verifyCode) {
            verifyCode.addEventListener('input', function() {
                this.style.borderColor = this.value.length === 0 ? '' :
                    this.value.trim().length >= 4 ? 'var(--success)' : 'var(--danger)';
            });
        }
    }

    // ══════════════════════════════════════
    // TIME-BASED GREETING
    // ══════════════════════════════════════
    function applyTimeTheme() {
        var hour = new Date().getHours();
        var greeting, emoji;

        if (hour >= 5 && hour < 12) { greeting = 'صباح الخير'; emoji = '🌅'; }
        else if (hour >= 12 && hour < 17) { greeting = 'مساء النور'; emoji = '☀️'; }
        else if (hour >= 17 && hour < 21) { greeting = 'مساء الخير'; emoji = '🌆'; }
        else { greeting = 'مساء النجوم'; emoji = '🌙'; }

        var tagline = document.querySelector('.tagline');
        if (tagline) {
            var original = tagline.textContent.replace(/[«»\s]/g, '').trim();
            tagline.innerHTML = '« ' + emoji + ' ' + greeting + ' - ' + original + ' »';
        }
    }

    // ══════════════════════════════════════
    // CUSTOM CURSOR (Desktop only)
    // ══════════════════════════════════════
    function setupCustomCursor() {
        if ('ontouchstart' in window) return;

        var cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        cursor.style.cssText = 'position:fixed;width:20px;height:20px;border:2px solid var(--primary);' +
            'border-radius:50%;pointer-events:none;z-index:99999;transition:transform 0.15s ease,' +
            'width 0.2s ease,height 0.2s ease,border-color 0.2s ease;transform:translate(-50%,-50%);' +
            'mix-blend-mode:difference;opacity:0.7;';
        document.body.appendChild(cursor);

        var dot = document.createElement('div');
        dot.id = 'cursor-dot';
        dot.style.cssText = 'position:fixed;width:6px;height:6px;background:var(--primary);' +
            'border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);' +
            'transition:transform 0.05s ease;mix-blend-mode:difference;';
        document.body.appendChild(dot);

        document.addEventListener('mousemove', function(e) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';
        });

        document.addEventListener('mouseover', function(e) {
            if (e.target.closest('.btn, a, .radio-label, .sound-toggle, input, .clickable')) {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.borderColor = 'var(--secondary)';
                cursor.style.opacity = '0.5';
            }
        });

        document.addEventListener('mouseout', function(e) {
            if (e.target.closest('.btn, a, .radio-label, .sound-toggle, input, .clickable')) {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.borderColor = 'var(--primary)';
                cursor.style.opacity = '0.7';
            }
        });

        document.addEventListener('mousedown', function() {
            cursor.style.transform = 'translate(-50%,-50%) scale(0.8)';
        });
        document.addEventListener('mouseup', function() {
            cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        });
    }

    // ══════════════════════════════════════════════════════════
    //  ██████╗  █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗██████╗
    //  ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║██╔══██╗
    //  ██████╔╝███████║██║     █████╔╝ █████╗  ██╔██╗ ██║██║  ██║
    //  ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║██║  ██║
    //  ██████╔╝██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║██████╔╝
    //  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝
    //  YOUR ORIGINAL BACKEND LOGIC - PRESERVED 100%
    // ══════════════════════════════════════════════════════════

    // ── STATE ──
    var _token = null;

    var _signupData = {
        username: '',
        password: '',
        student_type: 'علمي'
    };

    var _loginData = {
        username: '',
        serverUrl: '',
        serverNum: 0
    };

    var ALL_VIEWS = [
        'loading-screen',
        'main-container',
        'signup-container',
        'verify-container',
        'login-username-container',
        'login-password-container',
        'success-container',
        'app-frame'
    ];

    // ── VIEW MANAGEMENT (Enhanced with sounds & transitions) ──
    function hideAll() {
        for (var i = 0; i < ALL_VIEWS.length; i++) {
            var el = document.getElementById(ALL_VIEWS[i]);
            if (el) el.style.display = 'none';
        }
    }

    window.showView = function(viewName) {
        // Play transition sound
        SoundEngine.whoosh();

        // Trigger page transition animation
        var transition = document.getElementById('page-transition');
        if (transition) {
            transition.classList.add('active');
            setTimeout(function() { transition.classList.remove('active'); }, 800);
        }

        hideAll();
        hideAllErrors();

        switch (viewName) {
            case 'loading':
                show('loading-screen', 'flex');
                break;
            case 'main':
                show('main-container', 'flex');
                break;
            case 'signup':
                show('signup-container', 'flex');
                focusEl('signup-username');
                break;
            case 'verify':
                show('verify-container', 'flex');
                focusEl('verify-code');
                break;
            case 'login-username':
                show('login-username-container', 'flex');
                focusEl('login-username');
                break;
            case 'login-password':
                show('login-password-container', 'flex');
                focusEl('login-password');
                break;
            case 'success':
                show('success-container', 'flex');
                SoundEngine.success();
                // Confetti on success
                setTimeout(function() {
                    var successCard = document.querySelector('#success-container .login-card');
                    if (successCard) Particles.createConfetti(successCard);
                }, 300);
                break;
            case 'app':
                show('app-frame', 'block');
                break;
        }
    };

    function show(id, displayType) {
        var el = document.getElementById(id);
        if (el) el.style.display = displayType || 'flex';
    }

    function focusEl(id) {
        setTimeout(function() {
            var el = document.getElementById(id);
            if (el) el.focus();
        }, 100);
    }

    // ── ERROR MANAGEMENT (Enhanced with sounds) ──
    var ALL_ERRORS = [
        'main-error', 'signup-error', 'verify-error',
        'login-username-error', 'login-password-error'
    ];

    function hideAllErrors() {
        for (var i = 0; i < ALL_ERRORS.length; i++) {
            var el = document.getElementById(ALL_ERRORS[i]);
            if (el) el.style.display = 'none';
        }
    }

    function showError(id, msg) {
        var el = document.getElementById(id);
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
            SoundEngine.error();

            // Shake the parent card
            var card = el.closest('.login-card');
            if (card) {
                card.style.animation = 'none';
                requestAnimationFrame(function() {
                    card.style.animation = 'shakeIn 0.5s ease';
                });
            }
        }
    }

    function showLoading(msg) {
        var el = document.getElementById('loading-text');
        if (el) el.textContent = msg || 'جاري التحميل...';
        showView('loading');
    }

    // ── TOKEN STORAGE (100% Original) ──
    function saveToken(token) {
        if (!token) return;
        try { localStorage.setItem('sc_device_token', token); } catch(e) {}
        try { sessionStorage.setItem('sc_device_token', token); } catch(e) {}
        try {
            var exp = new Date();
            exp.setFullYear(exp.getFullYear() + 1);
            document.cookie = 'sc_device_token=' + token +
                ';expires=' + exp.toUTCString() + ';path=/;SameSite=Lax;Secure';
        } catch(e) {}
    }

    function loadToken() {
        var t = null;
        try { t = localStorage.getItem('sc_device_token'); if (t) return t; } catch(e) {}
        try { t = sessionStorage.getItem('sc_device_token'); if (t) return t; } catch(e) {}
        try {
            var match = document.cookie.match(/(^| )sc_device_token=([^;]+)/);
            if (match && match[2]) return match[2];
        } catch(e) {}
        return null;
    }

    function clearTokens() {
        try { localStorage.removeItem('sc_device_token'); } catch(e) {}
        try { sessionStorage.removeItem('sc_device_token'); } catch(e) {}
        try { document.cookie = 'sc_device_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'; } catch(e) {}
    }

    function saveUserInfo(username, serverUrl, serverNum) {
        try {
            localStorage.setItem('sc_username', username);
            localStorage.setItem('sc_server_url', serverUrl);
            localStorage.setItem('sc_server_num', String(serverNum));
        } catch(e) {}
    }

    function loadUserInfo() {
        try {
            var u = localStorage.getItem('sc_username');
            var s = localStorage.getItem('sc_server_url');
            var n = localStorage.getItem('sc_server_num');
            if (u && s) return { username: u, serverUrl: s, serverNum: n };
        } catch(e) {}
        return null;
    }

    function clearUserInfo() {
        try {
            localStorage.removeItem('sc_username');
            localStorage.removeItem('sc_server_url');
            localStorage.removeItem('sc_server_num');
        } catch(e) {}
    }

    function getToken() {
        var stored = loadToken();
        if (stored && stored.trim()) {
            return stored.trim();
        }
        var newToken = DeviceFingerprint.getToken();
        saveToken(newToken);
        return newToken;
    }

    // ── AUTO-LOGIN (100% Original) ──
    function doAutoLogin(username, serverUrl, serverNum) {
        console.log('Auto-login:', username, 'on server', serverNum);

        saveToken(_token);
        saveUserInfo(username, serverUrl, serverNum);

        var autoUrl = serverUrl + '/auto-login?token=' +
            encodeURIComponent(_token) +
            '&username=' + encodeURIComponent(username);

        hideAll();
        var frame = document.getElementById('app-frame');
        frame.src = autoUrl;
        frame.style.display = 'block';
    }

    // ── SIGNUP FLOW (100% Original + Sound Effects) ──
    window.goToVerification = function() {
        hideAllErrors();

        var username = (document.getElementById('signup-username').value || '').trim();
        var password = document.getElementById('signup-password').value || '';
        var confirm = document.getElementById('signup-confirm').value || '';
        var typeEl = document.querySelector('input[name="student_type"]:checked');

        if (!username || !password || !confirm) {
            showError('signup-error', 'جميع الحقول مطلوبة!');
            return;
        }
        if (username.length < 3) {
            showError('signup-error', 'اسم المستخدم قصير جداً (3 أحرف على الأقل)');
            return;
        }
        if (password.length < 6) {
            showError('signup-error', 'كلمة المرور قصيرة جداً (6 أحرف على الأقل)');
            return;
        }
        if (password !== confirm) {
            showError('signup-error', 'كلمات المرور غير متطابقة!');
            return;
        }
        if (!typeEl) {
            showError('signup-error', 'يرجى اختيار نوع الدراسة');
            return;
        }

        _signupData.username = username;
        _signupData.password = password;
        _signupData.student_type = typeEl.value;

        SoundEngine.pop();
        showLoading('جاري التحقق من اسم المستخدم...');

        API.checkUsername(username).then(function(result) {
            if (!result.ok) {
                showView('signup');
                showError('signup-error', result.error || 'خطأ في الاتصال');
                return;
            }
            if (result.exists) {
                showView('signup');
                showError('signup-error', 'اسم المستخدم موجود مسبقاً! اختر اسماً آخر.');
                return;
            }

            SoundEngine.success();
            showToast('تم التحقق، أدخل رمز التحقق', 'success');
            showView('verify');

        }).catch(function(e) {
            showView('signup');
            showError('signup-error', 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت.');
        });
    };

    window.submitSignup = async function() {
        hideAllErrors();

        var code = (document.getElementById('verify-code').value || '').trim();
        if (!code) {
            showError('verify-error', 'يرجى إدخال رمز التحقق');
            return;
        }

        var btn = document.getElementById('btn-signup-submit');
        btn.disabled = true;
        btn.textContent = 'جاري إنشاء الحساب...';

        showLoading('جاري البحث عن خادم متاح...');

        try {
            // Step 1: Get best server
            var serverResult = await API.getBestServer();

            if (!serverResult.ok) {
                showView('verify');
                btn.disabled = false;
                btn.textContent = 'إنشاء الحساب';
                showError('verify-error', serverResult.error || 'جميع الخوادم ممتلئة حالياً.');
                return;
            }

            var serverUrl = serverResult.server_url;
            var serverNum = serverResult.server_num;

            console.log('Signup on server:', serverNum, serverUrl);
            showLoading('جاري إنشاء الحساب والتحقق...');

            // Step 2: Send to server
            var signupResp = await fetch(serverUrl + '/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: _signupData.username,
                    password: _signupData.password,
                    student_type: _signupData.student_type,
                    telegram_code: code,
                    device_token: _token,
                })
            });

            var signupData = await signupResp.json();

            if (!signupData.ok) {
                showView('verify');
                btn.disabled = false;
                btn.textContent = 'إنشاء الحساب';
                showError('verify-error', signupData.error || 'فشل إنشاء الحساب');
                return;
            }

            // Step 3: Link token in Main DB with retry
            console.log('Signup successful:', signupData.username);
            showLoading('جاري تجهيز حسابك...');

            if (!signupData.main_db_registered) {
                console.warn('Main DB registration failed on server, retrying...');
                for (var r = 0; r < 3; r++) {
                    try {
                        var retryResp = await fetch(serverUrl + '/api/retry-main-db', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: signupData.username,
                                device_token: _token,
                            })
                        });
                        var retryData = await retryResp.json();
                        if (retryData.ok && retryData.registered) {
                            console.log('Main DB retry succeeded!');
                            break;
                        }
                    } catch (re) {
                        console.warn('Retry ' + (r + 1) + ' failed:', re);
                    }
                    await new Promise(function(resolve) { setTimeout(resolve, 1500); });
                }
            }

            // Link token with retry
            var tokenLinked = false;
            for (var a = 0; a < 3; a++) {
                try {
                    var linkResult = await API.linkToken(signupData.username, _token);
                    if (linkResult && linkResult.ok) {
                        tokenLinked = true;
                        console.log('Token linked (attempt ' + (a + 1) + ')');
                        break;
                    }
                } catch (le) {
                    console.warn('linkToken attempt ' + (a + 1) + ' failed:', le);
                }
                await new Promise(function(resolve) { setTimeout(resolve, 1000); });
            }

            try { await API.loginSuccess(signupData.username, _token); } catch(e) {}

            // Step 4: Auto-login
            console.log('Going to auto-login...');
            document.getElementById('success-detail').textContent =
                'مرحباً ' + signupData.username + '! جاري تحويلك...';
            showView('success');

            setTimeout(function() {
                doAutoLogin(signupData.username, serverUrl, serverNum);
            }, 1500);

        } catch (e) {
            console.error('Signup error:', e);
            showView('verify');
            btn.disabled = false;
            btn.textContent = 'إنشاء الحساب';
            showError('verify-error', 'حدث خطأ. تحقق من اتصالك بالإنترنت.');
        }
    };

    // ── LOGIN FLOW (100% Original + Sound Effects) ──
    window.submitUsername = async function() {
        hideAllErrors();

        var username = (document.getElementById('login-username').value || '').trim();

        if (!username) {
            showError('login-username-error', 'يرجى إدخال اسم المستخدم');
            return;
        }
        if (username.length < 3) {
            showError('login-username-error', 'اسم المستخدم قصير جداً');
            return;
        }

        var btn = document.getElementById('btn-login-next');
        btn.disabled = true;
        btn.textContent = 'جاري البحث...';

        showLoading('جاري البحث عن حسابك...');

        try {
            var result = await API.lookupUser(username);

            if (!result.ok) {
                showView('login-username');
                btn.disabled = false;
                btn.textContent = 'التالي';
                showError('login-username-error', result.error || 'حدث خطأ في الاتصال');
                return;
            }

            if (!result.found) {
                showView('login-username');
                btn.disabled = false;
                btn.textContent = 'التالي';
                showError('login-username-error', 'لا يوجد حساب بهذا الاسم. هل تريد إنشاء حساب جديد؟');
                return;
            }

            _loginData.username = username;
            _loginData.serverUrl = result.server_url;
            _loginData.serverNum = result.server_num;

            console.log('User found on server:', result.server_num);

            btn.disabled = false;
            btn.textContent = 'التالي';

            SoundEngine.pop();
            document.getElementById('display-username').textContent = username;
            showView('login-password');

        } catch (e) {
            console.error('Login lookup error:', e);
            showView('login-username');
            btn.disabled = false;
            btn.textContent = 'التالي';
            showError('login-username-error', 'حدث خطأ. تحقق من اتصالك بالإنترنت.');
        }
    };

    window.submitLogin = async function() {
        hideAllErrors();

        var password = document.getElementById('login-password').value || '';

        if (!password) {
            showError('login-password-error', 'يرجى إدخال كلمة المرور');
            return;
        }

        var btn = document.getElementById('btn-login-submit');
        btn.disabled = true;
        btn.textContent = 'جاري تسجيل الدخول...';

        showLoading('جاري تسجيل الدخول...');

        try {
            // Step 1: Send login to server
            var loginResp = await fetch(_loginData.serverUrl + '/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: _loginData.username,
                    password: password,
                    device_token: _token,
                })
            });

            var loginData = await loginResp.json();

            if (!loginData.ok) {
                showView('login-password');
                btn.disabled = false;
                btn.textContent = 'تسجيل الدخول';
                showError('login-password-error', loginData.error || 'كلمة المرور خطأ');
                return;
            }

            // Step 2: Link token in Main DB with retry
            console.log('Login successful:', _loginData.username);
            showLoading('جاري تجهيز الجلسة...');

            if (!loginData.main_db_registered) {
                console.warn('Main DB notify failed, retrying...');
                for (var r = 0; r < 3; r++) {
                    try {
                        var retryResp = await fetch(_loginData.serverUrl + '/api/retry-main-db', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: _loginData.username,
                                device_token: _token,
                            })
                        });
                        var retryData = await retryResp.json();
                        if (retryData.ok && retryData.registered) {
                            console.log('Main DB retry succeeded!');
                            break;
                        }
                    } catch (re) {
                        console.warn('Retry ' + (r + 1) + ' failed:', re);
                    }
                    await new Promise(function(resolve) { setTimeout(resolve, 1500); });
                }
            }

            // Link token with retry
            var tokenLinked = false;
            for (var a = 0; a < 3; a++) {
                try {
                    var linkResult = await API.linkToken(_loginData.username, _token);
                    if (linkResult && linkResult.ok) {
                        tokenLinked = true;
                        console.log('Token linked (attempt ' + (a + 1) + ')');
                        break;
                    }
                } catch (le) {
                    console.warn('linkToken attempt ' + (a + 1) + ' failed:', le);
                }
                await new Promise(function(resolve) { setTimeout(resolve, 1000); });
            }

            try { await API.loginSuccess(_loginData.username, _token); } catch(e) {}

            // Step 3: Auto-login
            console.log('Going to auto-login...');
            document.getElementById('success-detail').textContent =
                'مرحباً ' + _loginData.username + '! جاري تحويلك...';
            showView('success');

            setTimeout(function() {
                doAutoLogin(_loginData.username, _loginData.serverUrl, _loginData.serverNum);
            }, 1500);

        } catch (e) {
            console.error('Login error:', e);
            showView('login-password');
            btn.disabled = false;
            btn.textContent = 'تسجيل الدخول';
            showError('login-password-error', 'حدث خطأ. تحقق من اتصالك بالإنترنت.');
        }
    };

    // ── IFRAME MESSAGE LISTENER (100% Original) ──
    window.addEventListener('message', function(event) {
        var origin = event.origin || '';
        var isValid = origin.includes('serverclass') && origin.includes('hf.space');
        if (!isValid) return;

        var data = event.data;
        if (!data || typeof data !== 'object') return;

        console.log('Message from server:', data.type);

        if (data.type === 'force_logout') {
            document.getElementById('app-frame').src = '';
            document.getElementById('app-frame').style.display = 'none';
            clearTokens();
            clearUserInfo();
            showView('login-username');
            showError('login-username-error', data.message || 'تم تسجيل الدخول من جهاز آخر');
            showToast(data.message || 'تم تسجيل الدخول من جهاز آخر', 'warning');
        }

        if (data.type === 'logout') {
            document.getElementById('app-frame').src = '';
            document.getElementById('app-frame').style.display = 'none';
            clearTokens();
            clearUserInfo();
            showView('main');
            showToast('تم تسجيل الخروج بنجاح', 'info');
        }

        if (data.type === 'auto_login_failed') {
            console.log('Auto-login failed:', data.reason);
            document.getElementById('app-frame').src = '';
            document.getElementById('app-frame').style.display = 'none';
            clearTokens();
            clearUserInfo();
            showView('main');
            showToast('فشل تسجيل الدخول التلقائي', 'error');
        }

        if (data.type === 'session_expired') {
            console.log('Session expired, re-trying auto-login...');
            document.getElementById('app-frame').src = '';
            document.getElementById('app-frame').style.display = 'none';
            showToast('انتهت الجلسة، جاري إعادة الاتصال...', 'warning');
            init();
        }
    });

    // ── INIT - Auto-login check on page load (100% Original + UI enhancements) ──
    async function init() {
        showLoading('جاري التحقق...');

        // Get or create token
        _token = getToken();
        console.log('Token:', _token);

        // ── METHOD 1: Check token in Main DB ──
        try {
            console.log('Checking token in Main DB...');
            var result = await API.checkToken(_token);

            if (result.ok && result.found) {
                console.log('Token found! User:', result.username, 'Server:', result.server_num);
                showToast('مرحباً بعودتك ' + result.username + '! 👋', 'success');
                doAutoLogin(result.username, result.server_url, result.server_num);
                return;
            }
            console.log('Token not found in Main DB');
        } catch (e) {
            console.error('Token check failed:', e);
        }

        // ── METHOD 2: Use saved user info (fallback) ──
        var savedInfo = loadUserInfo();
        if (savedInfo && savedInfo.username && savedInfo.serverUrl) {
            console.log('Trying saved user info:', savedInfo.username);

            try {
                var verifyResult = await API.lookupUser(savedInfo.username);

                if (verifyResult.ok && verifyResult.found) {
                    try {
                        await API.linkToken(savedInfo.username, _token);
                        console.log('Re-linked token for saved user');
                    } catch(e) {}

                    showToast('مرحباً بعودتك ' + savedInfo.username + '! 👋', 'success');
                    doAutoLogin(
                        savedInfo.username,
                        verifyResult.server_url,
                        verifyResult.server_num
                    );
                    return;
                }
            } catch (e) {
                console.error('Saved user verify failed:', e);
            }
        }

        // ── NOTHING WORKED: Show main buttons ──
        console.log('No auto-login, showing main page');
        showView('main');
    }

    // ══════════════════════════════════════
    // EASTER EGGS
    // ══════════════════════════════════════
    function setupEasterEggs() {
        var konamiCode = [];
        var konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

        document.addEventListener('keydown', function(e) {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konamiSequence.length) konamiCode.shift();

            if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
                SoundEngine.success();
                showToast('🎮 لقد اكتشفت السر!', 'success');
                var emojis = ['🎉', '🎊', '🌟', '⭐', '💫', '✨', '🎓', '📚', '🏆', '💎'];
                for (var i = 0; i < 20; i++) {
                    (function(idx) {
                        setTimeout(function() {
                            var x = Math.random() * window.innerWidth;
                            var y = Math.random() * window.innerHeight;
                            var emoji = emojis[Math.floor(Math.random() * emojis.length)];
                            Particles.createFloatingEmoji(emoji, x, y);
                        }, idx * 100);
                    })(i);
                }
                konamiCode = [];
            }
        });

        // Triple click logo for rainbow mode
        var clickCount = 0;
        var clickTimer;
        var logoEl = document.querySelector('.logo-text');
        if (logoEl) {
            logoEl.addEventListener('click', function() {
                clickCount++;
                clearTimeout(clickTimer);
                clickTimer = setTimeout(function() { clickCount = 0; }, 500);

                if (clickCount >= 3) {
                    clickCount = 0;
                    SoundEngine.success();
                    if (!document.getElementById('rainbow-keyframes')) {
                        var style = document.createElement('style');
                        style.id = 'rainbow-keyframes';
                        style.textContent = '@keyframes rainbowBg{0%{filter:hue-rotate(0deg)}25%{filter:hue-rotate(90deg)}50%{filter:hue-rotate(180deg)}75%{filter:hue-rotate(270deg)}100%{filter:hue-rotate(360deg)}}';
                        document.head.appendChild(style);
                    }
                    document.body.style.animation = 'rainbowBg 3s ease';
                    setTimeout(function() { document.body.style.animation = ''; }, 3000);
                    showToast('🌈 وضع قوس القزح!', 'success');
                }
            });
        }
    }

    // ══════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ══════════════════════════════════════
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Escape to go back
            if (e.key === 'Escape') {
                var currentVisible = null;
                for (var i = 0; i < ALL_VIEWS.length; i++) {
                    var el = document.getElementById(ALL_VIEWS[i]);
                    if (el && el.style.display !== 'none') {
                        currentVisible = ALL_VIEWS[i];
                        break;
                    }
                }

                if (currentVisible === 'verify-container') {
                    SoundEngine.whoosh();
                    showView('signup');
                } else if (currentVisible === 'login-password-container') {
                    SoundEngine.whoosh();
                    showView('login-username');
                } else if (currentVisible === 'signup-container' || currentVisible === 'login-username-container') {
                    SoundEngine.whoosh();
                    showView('main');
                }
            }

            // Ctrl+M to toggle mute
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                var toggleBtn = document.getElementById('sound-toggle');
                if (toggleBtn) toggleBtn.click();
            }
        });
    }

    // ══════════════════════════════════════
    // NETWORK STATUS
    // ══════════════════════════════════════
    function setupNetworkStatus() {
        window.addEventListener('online', function() {
            showToast('تم استعادة الاتصال بالإنترنت ✅', 'success');
            SoundEngine.success();
        });

        window.addEventListener('offline', function() {
            showToast('انقطع الاتصال بالإنترنت ❌', 'error');
            SoundEngine.error();
        });
    }

    // ══════════════════════════════════════
    // IDLE DETECTION
    // ══════════════════════════════════════
    function setupIdleDetection() {
        var idleTimer;
        var isIdle = false;
        var idleEmojis = ['😴', '💤', '🌙', '⏰', '☕'];

        function resetIdle() {
            clearTimeout(idleTimer);
            if (isIdle) {
                isIdle = false;
                var idles = document.querySelectorAll('.idle-emoji');
                for (var i = 0; i < idles.length; i++) idles[i].remove();
            }
            idleTimer = setTimeout(function() {
                isIdle = true;
                if (!document.getElementById('idle-keyframes')) {
                    var style = document.createElement('style');
                    style.id = 'idle-keyframes';
                    style.textContent = '@keyframes idleFloat{0%,100%{opacity:0;transform:translateY(0) scale(0.8)}25%{opacity:0.6;transform:translateY(-20px) scale(1)}50%{opacity:0.4;transform:translateY(-10px) scale(0.9)}75%{opacity:0.6;transform:translateY(-30px) scale(1.1)}}';
                    document.head.appendChild(style);
                }
                for (var i = 0; i < 5; i++) {
                    (function(idx) {
                        setTimeout(function() {
                            var emoji = idleEmojis[Math.floor(Math.random() * idleEmojis.length)];
                            var el = document.createElement('div');
                            el.className = 'idle-emoji';
                            el.textContent = emoji;
                            el.style.cssText = 'position:fixed;font-size:' + (20 + Math.random() * 20) +
                                'px;left:' + (Math.random() * window.innerWidth) + 'px;top:' +
                                (Math.random() * window.innerHeight) + 'px;pointer-events:none;z-index:9990;' +
                                'opacity:0;animation:idleFloat 4s ease-in-out infinite;';
                            document.body.appendChild(el);
                        }, idx * 500);
                    })(i);
                }
            }, 30000);
        }

        ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(function(evt) {
            document.addEventListener(evt, resetIdle, { passive: true });
        });
        resetIdle();
    }

    // ══════════════════════════════════════
    // AMBIENT EFFECTS (Time-based)
    // ══════════════════════════════════════
    function setupAmbientEffects() {
        var hour = new Date().getHours();

        // Night mode: stars
        if (hour >= 21 || hour < 5) {
            var container = document.createElement('div');
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';

            if (!document.getElementById('star-keyframes')) {
                var style = document.createElement('style');
                style.id = 'star-keyframes';
                style.textContent = '@keyframes starTwinkle{0%,100%{opacity:0.2;transform:scale(1)}50%{opacity:0.8;transform:scale(1.5)}}';
                document.head.appendChild(style);
            }

            for (var i = 0; i < 50; i++) {
                var star = document.createElement('div');
                var size = 1 + Math.random() * 3;
                star.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size +
                    'px;background:#fff;border-radius:50%;left:' + (Math.random() * 100) + '%;top:' +
                    (Math.random() * 100) + '%;opacity:' + (0.2 + Math.random() * 0.5) +
                    ';animation:starTwinkle ' + (2 + Math.random() * 4) + 's ease-in-out infinite ' +
                    (Math.random() * 3) + 's;';
                container.appendChild(star);
            }
            document.body.appendChild(container);
        }

        // Morning: sun rays
        if (hour >= 6 && hour < 10) {
            if (!document.getElementById('sun-keyframes')) {
                var sunStyle = document.createElement('style');
                sunStyle.id = 'sun-keyframes';
                sunStyle.textContent = '@keyframes sunPulse{0%,100%{transform:scale(1);opacity:0.08}50%{transform:scale(1.2);opacity:0.12}}';
                document.head.appendChild(sunStyle);
            }
            var rays = document.createElement('div');
            rays.style.cssText = 'position:fixed;top:-100px;right:-100px;width:400px;height:400px;' +
                'pointer-events:none;z-index:0;opacity:0.08;background:radial-gradient(circle,#FFD700 0%,transparent 70%);' +
                'animation:sunPulse 6s ease-in-out infinite;';
            document.body.appendChild(rays);
        }
    }

    // ══════════════════════════════════════
    // PERFORMANCE MONITOR
    // ══════════════════════════════════════
    function setupPerformanceMonitor() {
        var frameCount = 0;
        var lastFpsTime = performance.now();

        // Add reduce-animations style
        if (!document.getElementById('reduce-anim-style')) {
            var style = document.createElement('style');
            style.id = 'reduce-anim-style';
            style.textContent = '.reduce-animations *{animation-duration:0.1s !important;transition-duration:0.1s !important}' +
                '.reduce-animations .particle,.reduce-animations .pencil-dot,.reduce-animations .click-spark,' +
                '.reduce-animations .ink-splat,.reduce-animations .sticker,.reduce-animations .bg-shape,' +
                '.reduce-animations .watercolor-splash{display:none !important}';
            document.head.appendChild(style);
        }

        function checkFps() {
            frameCount++;
            var now = performance.now();
            if (now - lastFpsTime >= 1000) {
                var fps = frameCount;
                frameCount = 0;
                lastFpsTime = now;
                if (fps < 30) {
                    document.body.classList.add('reduce-animations');
                    console.warn('⚠️ Low FPS: ' + fps + ', reducing animations');
                } else {
                    document.body.classList.remove('reduce-animations');
                }
            }
            requestAnimationFrame(checkFps);
        }
        requestAnimationFrame(checkFps);
    }

    // ══════════════════════════════════════
    // MUSIC VISUALIZER
    // ══════════════════════════════════════
    function setupMusicVisualizer() {
        if (!SoundEngine.initialized || !SoundEngine.ctx) return;

        var canvas = document.createElement('canvas');
        canvas.id = 'music-visualizer';
        canvas.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;height:60px;' +
            'pointer-events:none;z-index:0;opacity:0.15;';
        document.body.appendChild(canvas);

        var ctx2d = canvas.getContext('2d');

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = 60;
        }
        resize();
        window.addEventListener('resize', resize);

        // roundRect polyfill
        if (!ctx2d.roundRect) {
            ctx2d.roundRect = function(x, y, w, h, r) {
                if (w < 2 * r) r = w / 2;
                if (h < 2 * r) r = h / 2;
                this.beginPath();
                this.moveTo(x + r, y);
                this.arcTo(x + w, y, x + w, y + h, r);
                this.arcTo(x + w, y + h, x, y + h, r);
                this.arcTo(x, y + h, x, y, r);
                this.arcTo(x, y, x + w, y, r);
                this.closePath();
                return this;
            };
        }

        function drawVisualizer() {
            requestAnimationFrame(drawVisualizer);

            if (SoundEngine.muted || !SoundEngine.bgMusicNode) {
                ctx2d.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx2d.clearRect(0, 0, canvas.width, canvas.height);

            var barCount = 40;
            var barWidth = canvas.width / barCount;
            var time = Date.now() * 0.002;

            for (var i = 0; i < barCount; i++) {
                var height = Math.abs(
                    Math.sin(time + i * 0.3) * 15 +
                    Math.sin(time * 1.5 + i * 0.5) * 10 +
                    Math.sin(time * 0.7 + i * 0.8) * 8
                );

                var hue = (i / barCount) * 60 + 200;
                ctx2d.fillStyle = 'hsla(' + hue + ', 70%, 60%, 0.6)';

                var x = i * barWidth;
                var y = canvas.height - height;

                ctx2d.beginPath();
                ctx2d.roundRect(x + 2, y, barWidth - 4, height, 3);
                ctx2d.fill();
            }
        }

        drawVisualizer();
    }

    // ══════════════════════════════════════
    // MAGNETIC BUTTONS
    // ══════════════════════════════════════
    function setupMagneticButtons() {
        var btns = document.querySelectorAll('.btn-lg');
        for (var i = 0; i < btns.length; i++) {
            (function(btn) {
                btn.addEventListener('mousemove', function(e) {
                    var rect = this.getBoundingClientRect();
                    var x = e.clientX - rect.left - rect.width / 2;
                    var y = e.clientY - rect.top - rect.height / 2;
                    this.style.transform = 'translate(' + (x * 0.15) + 'px,' + (y * 0.15) + 'px) rotate(-0.3deg)';
                });
                btn.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                    this.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    var self = this;
                    setTimeout(function() { self.style.transition = ''; }, 400);
                });
            })(btns[i]);
        }
    }

    // ══════════════════════════════════════
    // DEVICE ORIENTATION PARALLAX (Mobile)
    // ══════════════════════════════════════
    function setupDeviceParallax() {
        if (!window.DeviceOrientationEvent) return;

        window.addEventListener('deviceorientation', function(e) {
            var gamma = e.gamma || 0;
            var beta = e.beta || 0;
            var moveX = gamma * 0.3;
            var moveY = (beta - 45) * 0.3;

            var shapes = document.querySelectorAll('.bg-shape');
            for (var i = 0; i < shapes.length; i++) {
                var f = (i + 1) * 0.5;
                shapes[i].style.transform = 'translate(' + (moveX * f) + 'px,' + (moveY * f) + 'px)';
            }

            var stickers = document.querySelectorAll('.sticker');
            for (var j = 0; j < stickers.length; j++) {
                var f2 = (j + 1) * 0.3;
                stickers[j].style.transform = 'translate(' + (moveX * f2) + 'px,' + (moveY * f2) + 'px)';
            }
        }, { passive: true });
    }

    // ══════════════════════════════════════
    // SHAKE DETECTION (Mobile)
    // ══════════════════════════════════════
    function setupShakeDetection() {
        if (!window.DeviceMotionEvent) return;

        var lastShakeTime = 0;
        var lastX, lastY, lastZ;

        // Theme cycling
        var themeIndex = 0;
        var themeColors = [
            { primary: '#4A90D9', secondary: '#F5A623', accent: '#E74C6F', bg: '#FFF8F0' },
            { primary: '#0077B6', secondary: '#00B4D8', accent: '#90E0EF', bg: '#F0F8FF' },
            { primary: '#2D6A4F', secondary: '#95D5B2', accent: '#D8F3DC', bg: '#F0FFF4' },
            { primary: '#E76F51', secondary: '#E9C46A', accent: '#264653', bg: '#FFF5EE' },
            { primary: '#7B2CBF', secondary: '#C77DFF', accent: '#E0AAFF', bg: '#F5F0FF' }
        ];

        if (!document.getElementById('shake-keyframes')) {
            var style = document.createElement('style');
            style.id = 'shake-keyframes';
            style.textContent = '@keyframes shakeBody{0%,100%{transform:translateX(0)}10%{transform:translateX(-5px) rotate(-0.5deg)}20%{transform:translateX(5px) rotate(0.5deg)}30%{transform:translateX(-4px)}40%{transform:translateX(4px)}50%{transform:translateX(-3px)}60%{transform:translateX(3px)}70%{transform:translateX(-2px)}80%{transform:translateX(2px)}90%{transform:translateX(-1px)}}';
            document.head.appendChild(style);
        }

        window.addEventListener('devicemotion', function(e) {
            var acc = e.accelerationIncludingGravity;
            if (!acc) return;

            var now = Date.now();
            if (now - lastShakeTime < 1000) return;

            if (lastX !== undefined) {
                var delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
                if (delta > 15) {
                    lastShakeTime = now;

                    SoundEngine.notification();
                    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

                    themeIndex = (themeIndex + 1) % themeColors.length;
                    var theme = themeColors[themeIndex];
                    document.documentElement.style.setProperty('--primary', theme.primary);
                    document.documentElement.style.setProperty('--secondary', theme.secondary);
                    document.documentElement.style.setProperty('--accent', theme.accent);
                    document.documentElement.style.setProperty('--bg-paper', theme.bg);

                    document.body.style.animation = 'shakeBody 0.5s ease';
                    setTimeout(function() { document.body.style.animation = ''; }, 500);

                    showToast('🎨 تم تغيير السمة!', 'info');
                }
            }

            lastX = acc.x;
            lastY = acc.y;
            lastZ = acc.z;
        }, { passive: true });
    }

    // ══════════════════════════════════════
    // HAPTIC FEEDBACK
    // ══════════════════════════════════════
    function haptic(type) {
        if (!navigator.vibrate) return;
        switch (type) {
            case 'light': navigator.vibrate(10); break;
            case 'medium': navigator.vibrate(25); break;
            case 'heavy': navigator.vibrate(50); break;
            case 'success': navigator.vibrate([10, 50, 10, 50, 30]); break;
            case 'error': navigator.vibrate([50, 30, 50, 30, 50]); break;
        }
    }

    // ══════════════════════════════════════
    // MAIN INITIALIZATION
    // ══════════════════════════════════════
    function initUI() {
        console.log('🎓 SmartClass - Initializing UI...');

        try { injectDecorations(); console.log('✅ Decorations'); } catch(e) { console.warn('⚠️', e); }
        try { setupInteractions(); console.log('✅ Interactions'); } catch(e) { console.warn('⚠️', e); }
        try { setupPasswordStrength(); console.log('✅ Password strength'); } catch(e) { console.warn('⚠️', e); }
        try { setupFormValidation(); console.log('✅ Form validation'); } catch(e) { console.warn('⚠️', e); }
        try { setupTiltEffect(); console.log('✅ Tilt effect'); } catch(e) { console.warn('⚠️', e); }
        try { setupMagneticButtons(); console.log('✅ Magnetic buttons'); } catch(e) { console.warn('⚠️', e); }
        try { setupCustomCursor(); console.log('✅ Custom cursor'); } catch(e) { console.warn('⚠️', e); }
        try { applyTimeTheme(); console.log('✅ Time theme'); } catch(e) { console.warn('⚠️', e); }
        try { setupNetworkStatus(); console.log('✅ Network status'); } catch(e) { console.warn('⚠️', e); }
        try { setupEasterEggs(); console.log('✅ Easter eggs'); } catch(e) { console.warn('⚠️', e); }
        try { setupKeyboardShortcuts(); console.log('✅ Keyboard shortcuts'); } catch(e) { console.warn('⚠️', e); }
        try { setupIdleDetection(); console.log('✅ Idle detection'); } catch(e) { console.warn('⚠️', e); }
        try { setupAmbientEffects(); console.log('✅ Ambient effects'); } catch(e) { console.warn('⚠️', e); }
        try { setupParallax(); console.log('✅ Parallax'); } catch(e) { console.warn('⚠️', e); }
        try { setupDeviceParallax(); console.log('✅ Device parallax'); } catch(e) { console.warn('⚠️', e); }
        try { setupShakeDetection(); console.log('✅ Shake detection'); } catch(e) { console.warn('⚠️', e); }
        try { setupPerformanceMonitor(); console.log('✅ Performance monitor'); } catch(e) { console.warn('⚠️', e); }
        try { Particles.startAmbient(); console.log('✅ Ambient particles'); } catch(e) { console.warn('⚠️', e); }

        // Delayed setup
        setTimeout(function() {
            try { setupMusicVisualizer(); } catch(e) {}
        }, 5000);

        console.log('═══════════════════════════════════');
        console.log('🎓 SmartClass UI - Ready!');
        console.log('💡 Ctrl+M = Toggle sound');
        console.log('💡 Escape = Go back');
        console.log('💡 ↑↑↓↓←→←→BA = Easter egg');
        console.log('💡 Triple click logo = Rainbow');
        console.log('💡 Shake phone = Change theme');
        console.log('═══════════════════════════════════');
    }

    // ══════════════════════════════════════
    // START EVERYTHING
    // ══════════════════════════════════════
    function startApp() {
        // Initialize UI decorations & effects first
        initUI();

        // Then start backend init (auto-login check)
        init();
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }

    // ══════════════════════════════════════
    // GLOBAL ERROR HANDLER
    // ══════════════════════════════════════
    window.addEventListener('error', function(e) {
        console.error('🔴 Error:', e.message, e.filename, e.lineno);
    });

    window.addEventListener('unhandledrejection', function(e) {
        console.error('🔴 Promise rejection:', e.reason);
    });

    // ══════════════════════════════════════
    // EXPOSE GLOBAL API (for debugging)
    // ══════════════════════════════════════
    window.SmartClass = {
        sound: SoundEngine,
        particles: Particles,
        showToast: showToast,
        haptic: haptic,
        version: '2.0.0'
    };

})();
