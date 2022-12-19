var settings = {
        particles: {
          length: 10000, // maximum amount of particles
          duration: 15, // particle duration in sec
          velocity: 0, // particle velocity in pixels/sec
          effect: 8, // play with this for a nice effect
          size: 20, // particle size in pixels
        },
      };
      (function () {
        var b = 0;
        var c = ["ms", "moz", "webkit", "o"];
        for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
          window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
          window.cancelAnimationFrame =
            window[c[a] + "CancelAnimationFrame"] ||
            window[c[a] + "CancelRequestAnimationFrame"];
        }
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = function (h, e) {
            var d = new Date().getTime();
            var f = Math.max(0, 16 - (d - b));
            var g = window.setTimeout(function () {
              h(d + f);
            }, f);
            b = d + f;
            return g;
          };
        }
        if (!window.cancelAnimationFrame) {
          window.cancelAnimationFrame = function (d) {
            clearTimeout(d);
          };
        }
      })();
      var Point = (function () {
        function Point(x, y) {
          this.x = typeof x !== "undefined" ? x : 0;
          this.y = typeof y !== "undefined" ? y : 0;
        }
        Point.prototype.clone = function () {
          return new Point(this.x, this.y);
        };
        Point.prototype.length = function (length) {
          if (typeof length == "undefined")
            return Math.sqrt(this.x * this.x + this.y * this.y);
          this.normalize();
          this.x *= length;
          this.y *= length;
          return this;
        };
        Point.prototype.normalize = function () {
          var length = this.length();
          this.x /= length;
          this.y /= length;
          return this;
        };
        return Point;
      })();
      var Particle = (function () {
        function Particle() {
          this.position = new Point();
          this.velocity = new Point();
          this.acceleration = new Point();
          this.age = 0;
        }
        Particle.prototype.initialize = function (x, y, dx, dy) {
          this.position.x = x;
          this.position.y = y;
          this.velocity.x = dx;
          this.velocity.y = dy;
          this.acceleration.x = dx * settings.particles.effect;
          this.acceleration.y = dy * settings.particles.effect;
          this.age = 0;
        };
        Particle.prototype.update = function (deltaTime) {
          this.position.x += this.velocity.x * deltaTime;
          this.position.y += this.velocity.y * deltaTime;
          this.velocity.x += this.acceleration.x * deltaTime;
          this.velocity.y += this.acceleration.y * deltaTime;
          this.age += deltaTime;
        };
        Particle.prototype.draw = function (context, image) {
          function ease(t) {
            return --t * t * t + 1;
          }
          var size = image.width * ease(this.age / settings.particles.duration);
          context.globalAlpha = 1 - this.age / settings.particles.duration;
          context.drawImage(
            image,
            this.position.x - size / 2,
            this.position.y - size / 2,
            size,
            size
          );
        };
        return Particle;
      })();
      var ParticlePool = (function () {
        var particles,
          firstActive = 0,
          firstFree = 0,
          duration = settings.particles.duration;
        function ParticlePool(length) {
          particles = new Array(length);
          for (var i = 0; i < particles.length; i++)
            particles[i] = new Particle();
        }
        ParticlePool.prototype.add = function (x, y, dx, dy) {
          particles[firstFree].initialize(x, y, dx, dy);
          firstFree++;
          if (firstFree == particles.length) firstFree = 0;
          if (firstActive == firstFree) firstActive++;
          if (firstActive == particles.length) firstActive = 0;
        };
        ParticlePool.prototype.update = function (deltaTime) {
          var i;
          if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
              particles[i].update(deltaTime);
          }
          if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
              particles[i].update(deltaTime);
            for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
          }
          while (
            particles[firstActive].age >= duration &&
            firstActive != firstFree
          ) {
            firstActive++;
            if (firstActive == particles.length) firstActive = 0;
          }
        };
        ParticlePool.prototype.draw = function (context, image) {
          if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
              particles[i].draw(context, image);
          }
          if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
              particles[i].draw(context, image);
            for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
          }
        };
        return ParticlePool;
      })();