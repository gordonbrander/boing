# Boing

A bare-bones spring physics animation library for CSS and the DOM.

## How?

Animate an element with requestAnimationFrame:

    var springyEl = document.getElementById('springy');
    animateSpring(200, 0, 50, 700, 10, function (x) {
      springyEl.style.left = x + 'px';
    });

Animate an element using hardware-acclerated CSS keyframes:

    var springyEl = document.getElementById('springy');
    animateSpringViaCss(springyEl, 200, 0, 50, 700, 10, function (x) {
      return 'left: ' + x + 'px;';
    });

Check out the code. It's simple and there are literate comments throughout.

## Why?

If it can be swiped, thrown or dragged, it should be a spring. If you want
realistic physical interactions, you need to model physics.

CSS animations are bounded by a fixed time and use Bezier curves to describe
animation easing.

    .animated {
      transition: left 500ms cubic-bezier(0.000, 0.405, 0.000, 1.285);
    }

This approach has a couple of problems:

* When resources become scarce, browsers have to drop animation frames to make
sure they deliver an animation on-time. This results in choppy animations.
* A single Cubic Bezier can only describe a single curve, meaning "bounciness"
ain't gonna happen.

Spring physics offers an interesting alternative. Rather than defining an
animation by time & easing, springs define animations using tension,
friction and mass, simulating the reaction a real spring would have.

The result feels, well... physical. Springs respond in very tangible ways —
the velocity and distance of your actions are taken into account.

