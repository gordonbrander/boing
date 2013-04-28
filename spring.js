/* 
Notes:

* It takes fewer steps to animate fast springs than slow springs. In other words,
  steps-per-ms is constant. What changes is how drastically the states
  change at each step.

*/

function spring(options) {
  /* Create a new spring object. Override any property with your own options
  object.

  Returns an object with all required spring properties. */
  return {
    distance: options.distance || 0,
    mass: options.mass || 1,
    stiffness: options.stiffness || 0,
    friction: options.friction || 1,
    speed: options.speed || 0    
  };
}

function tickSpring(spring) {
  /* Mutates a spring object, updating it to its next state. */
  var dampingForce = (-1 * spring.friction) * spring.speed;
  var springForce = (-1 * spring.stiffness) * spring.distance;
  var totalForce = springForce + dampingForce;
  var acceleration = totalForce / spring.mass;
  
  spring.speed += acceleration;
  // Update distance from 0 (resting).
  spring.distance += spring.speed / 100;
  
  return spring;
}

function isSpringResting(spring) {
  /* Find out whether a spring is at rest. A spring is at rest when near 0
  distance at a speed less than 0.2.

  Returns a boolean. */
  return Math.round(spring.distance) === 0 && Math.abs(spring.speed) < 0.2;
}

function animateSpring(spring, callback) {
  /* Animate a spring from its current state to resting state.
  Takes a callback which will be called with the spring object over and over
  and over until the spring is at rest. */
  spring = Object.create(spring);

  var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

  function looper() {
    tickSpring(spring);
    if(isSpringResting(spring)) return;
    callback(spring.distance);
    requestAnimationFrame(looper);
  }

  looper();
}

/*
module.exports = {
  extend: extend,
  spring: spring,
  tickSpring: tickSpring,
  isSpringAtRest: isSpringAtRest,
};
*/