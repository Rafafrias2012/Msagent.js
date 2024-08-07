(function (window) {
    "use strict";

    var MSAgent = {
        loaded: false,
        agents: {},

        load: function (agentName, callback) {
            if (this.agents[agentName]) {
                if (callback) callback(this.agents[agentName]);
                return;
            }

            var self = this;
            var path = 'agents/' + agentName + '/';

            this.loadJSON(path + 'agent.acs', function (data) {
                var agent = new Agent(data, path);
                self.agents[agentName] = agent;

                if (callback) callback(agent);
            });
        },

        loadJSON: function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.overrideMimeType('application/json');
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    callback(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(null);
        },

        ready: function (callback) {
            if (this.loaded) {
                callback();
            } else {
                this.loadAgents(callback);
            }
        },

        loadAgents: function (callback) {
            var self = this;
            var agentsToLoad = ['Merlin', 'Clippy', 'Rover'];
            var loadedCount = 0;

            function agentLoaded() {
                loadedCount++;
                if (loadedCount === agentsToLoad.length) {
                    self.loaded = true;
                    if (callback) callback();
                }
            }

            for (var i = 0; i < agentsToLoad.length; i++) {
                this.load(agentsToLoad[i], agentLoaded);
            }
        },

        show: function (agentName, callback) {
            this.load(agentName, function (agent) {
                agent.show();
                if (callback) callback(agent);
            });
        },

        hide: function (agentName) {
            if (this.agents[agentName]) {
                this.agents[agentName].hide();
            }
        },

        animate: function (agentName, animation, callback) {
            if (this.agents[agentName]) {
                this.agents[agentName].animate(animation, callback);
            }
        },

        speak: function (agentName, text, hold) {
            if (this.agents[agentName]) {
                this.agents[agentName].speak(text, hold);
            }
        },

        playSound: function (agentName, sound) {
            if (this.agents[agentName]) {
                this.agents[agentName].playSound(sound);
            }
        }
    };

    window.MSAgent = MSAgent;
})(window);
                  
