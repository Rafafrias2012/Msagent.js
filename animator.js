(function (window) {
    "use strict";

    function Animator(agent) {
        this.agent = agent;
        this.currentAnimation = null;
        this.currentFrameIndex = 0;
        this.frameTimer = null;
    }

    Animator.prototype = {
        animate: function (animationName, callback) {
            var self = this;
            var animation = this.agent.data.animations[animationName];

            if (!animation) {
                if (callback) callback();
                return;
            }

            this.stop();

            this.currentAnimation = animation;
            this.currentFrameIndex = 0;

            function nextFrame() {
                if (self.currentFrameIndex >= animation.frames.length) {
                    self.stop();
                    if (callback) callback();
                    return;
                }

                var frame = animation.frames[self.currentFrameIndex];
                self.renderFrame(frame);

                self.currentFrameIndex++;
                self.frameTimer = setTimeout(nextFrame, frame.duration);
            }

            nextFrame();
        },

        renderFrame: function (frame) {
            var image = new Image();
            image.src = this.agent.path + frame.image;
            
            this.agent.agent.innerHTML = '';
            this.agent.agent.appendChild(image);

            this.agent.agent.style.left = frame.x + 'px';
            this.agent.agent.style.top = frame.y + 'px';
        },

        stop: function () {
            if (this.frameTimer) {
                clearTimeout(this.frameTimer);
                this.frameTimer = null;
            }

            this.currentAnimation = null;
            this.currentFrameIndex = 0;
        }
    };

    window.Animator = Animator;
})(window);
