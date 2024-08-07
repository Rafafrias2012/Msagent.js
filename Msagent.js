(function (window) {
    "use strict";

    function Agent(data, path) {
        this.data = data;
        this.path = path;
        this.currentAnimation = null;
        this.queue = new Queue();
        this.animator = new Animator(this);
        this.balloon = new Balloon(this);
        this.speak_audio = null;
        this.soundPlayer = null;
        this.idleTimer = null;
        this.visible = false;
        this.container = null;
        this.overlayContainer = null;
        this.setup();
    }

    Agent.prototype = {
        setup: function () {
            var self = this;

            this.container = document.createElement('div');
            this.container.className = 'msagent';
            this.container.style.display = 'none';
            document.body.appendChild(this.container);

            this.overlayContainer = document.createElement('div');
            this.overlayContainer.className = 'msagent-overlay';
            document.body.appendChild(this.overlayContainer);

            this.setupElement();
            this.setupAudio();

            this.balloon.init(this.overlayContainer);

            this.setupEvents();
        },

        setupElement: function () {
            var self = this;

            this.agent = document.createElement('div');
            this.agent.className = 'msagent-agent';

            this.container.appendChild(this.agent);

            this.agent.addEventListener('mousedown', function (e) {
                e.preventDefault();
                self.startDrag(e);
            });

            this.agent.addEventListener('mousemove', function (e) {
                self.drag(e);
            });

            this.agent.addEventListener('mouseup', function (e) {
                self.stopDrag(e);
            });
        },

        setupAudio: function () {
            if (!this.data.sounds) return;

            this.soundPlayer = new Audio();
            this.soundPlayer.autoplay = true;
            this.soundPlayer.addEventListener('ended', function () {
                this.currentTime = 0;
                this.src = '';
            });
        },

        setupEvents: function () {
            var self = this;

            window.addEventListener('resize', function () {
                self.reposition();
            });
        },

        startDrag: function (e) {
            this.dragging = true;
            this.dragOffset = {
                x: e.clientX - this.container.offsetLeft,
                y: e.clientY - this.container.offsetTop
            };
        },

        drag: function (e) {
            if (!this.dragging) return;

            var left = e.clientX - this.dragOffset.x;
            var top = e.clientY - this.dragOffset.y;

            this.setPosition(left, top);
        },

        stopDrag: function () {
            this.dragging = false;
        },

        setPosition: function (x, y) {
            this.container.style.left = x + 'px';
            this.container.style.top = y + 'px';
        },

        reposition: function () {
            if (!this.visible) return;

            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            var agentRect = this.container.getBoundingClientRect();

            if (agentRect.right > windowWidth) {
                this.setPosition(windowWidth - agentRect.width, agentRect.top);
            }

            if (agentRect.bottom > windowHeight) {
                this.setPosition(agentRect.left, windowHeight - agentRect.height);
            }
        },

        show: function () {
            if (this.visible) return;

            this.visible = true;
            this.container.style.display = 'block';

            this.reposition();
            this.animate('Show');
        },

        hide: function () {
            if (!this.visible) return;

            var self = this;
            this.animate('Hide', function () {
                self.visible = false;
                self.container.style.display = 'none';
                self.balloon.hide();
                self.stopCurrentAnimation();
            });
        },

        animate: function (animation, callback) {
            this.queue.queue(function (complete) {
                this.animator.animate(animation, complete);
            }.bind(this));

            this.queue.queue(function (complete) {
                if (callback) callback();
                complete();
            });
        },

        stopCurrentAnimation: function () {
            this.animator.stop();
            this.queue.clear();
        },

        speak: function (text, hold) {
            this.stopCurrentAnimation();
            this.balloon.speak(text, hold);
        },

        playSound: function (name) {
            if (!this.soundPlayer || !this.data.sounds) return;

            var sound = this.data.sounds[name];
            if (!sound) return;

            this.soundPlayer.src = this.path + sound;
            this.soundPlayer.play();
        },

        gestureAt: function (x, y) {
            var d = this.getDirection(x, y);
            var gAnim = 'Gesture' + d;
            var lookAnim = 'Look' + d;

            var animation = this.hasAnimation(gAnim) ? gAnim : lookAnim;
            this.animate(animation);
        },

        getDirection: function (x, y) {
            var h = window.innerHeight;
            var w = window.innerWidth;

            var directions = ['Down', 'Left', 'Top', 'Right'];

            var i = 0;
            var minValue = Infinity;
            var minIndex = -1;

            for (i = 0; i < directions.length; i++) {
                var distance = 0;

                switch (directions[i]) {
                    case 'Down':
                        distance = h - y;
                        break;
                    case 'Left':
                        distance = x;
                        break;
                    case 'Top':
                        distance = y;
                        break;
                    case 'Right':
                        distance = w - x;
                        break;
                }

                if (distance < minValue) {
                    minValue = distance;
                    minIndex = i;
                }
            }

            return directions[minIndex];
        },

        hasAnimation: function (name) {
            return this.data.animations && this.data.animations[name];
        },

        idle: function () {
            var self = this;
            var idleSequence = ['Blink', 'Wave', 'Acknowledge', 'Thinking', 'LookLeft', 'LookRight'];

            function playIdleAnimation() {
                var anim = idleSequence[Math.floor(Math.random() * idleSequence.length)];
                self.animate(anim);
            }

            this.idleTimer = setInterval(playIdleAnimation, 10000);
        },

        stopIdle: function () {
            if (this.idleTimer) {
                clearInterval(this.idleTimer);
                this.idleTimer = null;
            }
        }
    };

    window.Agent = Agent;
})(window);
