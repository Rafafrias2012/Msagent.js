(function (window) {
    "use strict";

    function Balloon(agent) {
        this.agent = agent;
        this.balloon = null;
        this.content = null;
        this.hideTimer = null;
        this.WORD_SPEAK_TIME = 200;
        this.CLOSE_BALLOON_DELAY = 2000;
    }

    Balloon.prototype = {
        init: function (container) {
            this.balloon = document.createElement('div');
            this.balloon.className = 'msagent-balloon';
            this.balloon.style.display = 'none';

            this.content = document.createElement('div');
            this.content.className = 'msagent-balloon-content';

            this.balloon.appendChild(this.content);
            container.appendChild(this.balloon);

            this.balloon.addEventListener('click', this.hide.bind(this));
        },

        speak: function (text, hold) {
            this.show();
            this.content.innerHTML = '';
            this.stopHideTimer();

            var self = this;
            var words = text.split(' ');
            var i = 0;

            function addWord() {
                if (i >= words.length) {
                    if (!hold) {
                        self.hideDelayed();
                    }
                    return;
                }

                self.content.innerHTML += (i > 0 ? ' ' : '') + words[i];
                i++;

                setTimeout(addWord, self.WORD_SPEAK_TIME);
            }

            addWord();
        },

        show: function () {
            if (this.balloon.style.display !== 'block') {
                this.balloon.style.display = 'block';
                this.position();
            }
        },

        hide: function () {
            this.balloon.style.display = 'none';
            this.stopHideTimer();
        },

        hideDelayed: function () {
            this.stopHideTimer();
            this.hideTimer = setTimeout(this.hide.bind(this), this.CLOSE_BALLOON_DELAY);
        },

        stopHideTimer: function () {
            if (this.hideTimer) {
                clearTimeout(this.hideTimer);
                this.hideTimer = null;
            }
        },

        position: function () {
            if (!this.agent.visible) return;

            var agentRect = this.agent.container.getBoundingClientRect();
            var balloonRect = this.balloon.getBoundingClientRect();

            var top = agentRect.top - balloonRect.height;
            var left = agentRect.left + (agentRect.width - balloonRect.width) / 2;

            if (top < 0) {
                top = agentRect.bottom;
            }

            if (left < 0) {
                left = 0;
            } else if (left + balloonRect.width > window.innerWidth) {
                left = window.innerWidth - balloonRect.width;
            }

            this.balloon.style.top = top + 'px';
            this.balloon.style.left = left + 'px';
        }
    };

    window.Balloon = Balloon;
})(window);

