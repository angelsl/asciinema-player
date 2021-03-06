function registerAsciinemaPlayerElement() {
  function attribute(element, attrName, optName, defaultValue, coerceFn) {
    var obj = {};
    var value = element.getAttribute(attrName);
    if (value !== null) {
      if (value === '' && defaultValue !== undefined) {
        value = defaultValue;
      } else if (coerceFn) {
        value = coerceFn(value);
      }
      obj[optName] = value;
    }
    return obj;
  };

  function fixEscapeCodes(text) {
    if (text) {
      var f = function(match, p1, offset, string) {
        return String.fromCodePoint(parseInt(p1, 16));
      };

      return text.
        replace(/\\u([a-z0-9]{4})/gi, f).
        replace(/\\x([a-z0-9]{2})/gi, f).
        replace(/\\e/g, "\x1b");
    } else {
      return text;
    }
  }

  class AsciinemaPlayer extends HTMLElement {
    constructor() {
      super();

      var self = this;

      var opts = Object.assign({},
        attribute(this, 'cols', 'width', 0, parseInt),
        attribute(this, 'rows', 'height', 0, parseInt),
        attribute(this, 'autoplay', 'autoPlay', true, Boolean),
        attribute(this, 'preload', 'preload', true, Boolean),
        attribute(this, 'loop', 'loop', true, Boolean),
        attribute(this, 'start-at', 'startAt', 0, parseInt),
        attribute(this, 'speed', 'speed', 1, parseFloat),
        attribute(this, 'idle-time-limit', 'idleTimeLimit', null, parseFloat),
        attribute(this, 'poster', 'poster', null, fixEscapeCodes),
        attribute(this, 'font-size', 'fontSize'),
        attribute(this, 'theme', 'theme'),
        attribute(this, 'title', 'title'),
        attribute(this, 'author', 'author'),
        attribute(this, 'author-url', 'authorURL'),
        attribute(this, 'author-img-url', 'authorImgURL'),
        {
          onCanPlay: function() {
            self.dispatchEvent(new CustomEvent("loadedmetadata"));
            self.dispatchEvent(new CustomEvent("loadeddata"));
            self.dispatchEvent(new CustomEvent("canplay"));
            self.dispatchEvent(new CustomEvent("canplaythrough"));
          },

          onPlay: function() {
            self.dispatchEvent(new CustomEvent("play"));
          },

          onPause: function() {
            self.dispatchEvent(new CustomEvent("pause"));
          }
        }
      );

      this.player = asciinema.player.js.CreatePlayer(this, this.getAttribute('src'), opts);
    }

    connectedCallback() {
      var self = this;
      if (!self.isConnected) {
        return;
      }
      setTimeout(function() {
        self.dispatchEvent(new CustomEvent("attached"));
      }, 0);
    }

    disconnectedCallback() {
      asciinema.player.js.UnmountPlayer(this);
      this.player = undefined;
    }

    play() {
      this.player.play();
    }

    pause() {
      this.player.pause();
    }
  }

  Object.defineProperty(AsciinemaPlayer.prototype, "duration", {
    get: function() {
      return this.player.getDuration() || 0;
    },

    set: function(value) {}
  });

  Object.defineProperty(AsciinemaPlayer.prototype, "currentTime", {
    get: function() {
      return this.player.getCurrentTime();
    },

    set: function(value) {
      this.player.setCurrentTime(value);
    }
  });

  customElements.define('asciinema-player', AsciinemaPlayer);
};
