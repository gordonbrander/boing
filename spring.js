/* 
Notes on springs:

* It takes fewer steps to animate fast springs than slow springs. In other words,
  steps-per-ms is constant. What changes is how drastically the states
  change at each step.

*/
var reduce = Array.reduce;

function roundTo(number, decimals) {
  // Round a number to a given number of decimal places.
  var d = Math.pow(10, decimals);
	return Math.round(number * d) / d;
}

function id() {
  return Math.random().toString(16).substring(2, 10);
}

function dampenedHookeForce(displacement, stiffness, damping, velocity) {
  //
  // @TODO look at proper Verlet integration.
  //
  // Hooke's Law -- the basic spring force.
  // <http://en.wikipedia.org/wiki/Hooke%27s_law>
  //
  //     F = -kx
  //
  // Where:
  // x is the vector displacement of the end of the spring from its equilibrium,
  // k is a constant describing the tightness of the spring.
  var hookeForce = -1 * (stiffness * displacement);

  // Applying friction to Hooke's Law for realistic physics
  // <http://gafferongames.com/game-physics/spring-physics/>
  //
  //     F = -kx - bv
  //
  // Where:
  // b is damping (friction),
  // v is the relative velocity between the 2 points.
  return hookeForce - (damping * velocity);
}

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
  /* Mutates a spring object, updating it to its next state.

  @TODO make integrator a function that recieves the requisit variables and
  spits out a state.
  */
  var force = dampenedHookeForce(spring.distance, spring.stiffness, spring.friction, spring.speed);

  var acceleration = force / spring.mass;

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

function accumulateCurvePoints(spring) {
  // Accumulate all states of a spring as an array of points.

  // Create a temporary spring object so we don't mutate the original.
  spring = Object.create(spring);

  // Create a points array to accumulate into.
  var points = [];

  while(!isSpringResting(spring)) {
    points.push(tickSpring(spring).distance);
  }

  return points;
}

var noPrefix = [''];

// List in order of cascade.
var stdPrefixes = [
  '-moz-',
  ''
];

function rule(key, value, prefixes) {
  prefixes = prefixes || noPrefix;
  return reduce(prefixes, function reduceRule(string, prefix) {
    return string + prefix + key + ':' + value + ';';
  }, '');
}

function asCssStatement(identifier, cssString, prefixes) {
  prefixes = prefixes || noPrefix;
  return reduce(prefixes, function (string, prefix) {
    return string + prefix + identifier +  '{' + cssString + '}';
  }, '');
}

function prependAtSymbol(string) {
  return '@' + string;
}

function generateCssKeyframes(points, name, mapper, prefixes) {
  // Create a hardware-accelarated CSS Keyframe animation from a series of points,
  // an animation name and a mapper function that returns a CSS string for
  // a given point distance.

  // Convert to range from 0 - 100 (for 0% - 100% keyframes).
  var frameSize = 100 / (points.length - 1);

  // Build keyframe string
  var keyframes = reduce(points, function(frames, point, i) {
    // Create the percentage key for the frame. Round to nearest 5 decimals.
    var percent = roundTo(frameSize * i, 5);
    // Wrap the mapped point value in a keyframe. Mapper is expected to return
    // a valid set of CSS properties as a string.
    return frames + asCssStatement(percent + '%', mapper(point));
  }, '');

  prefixes = prefixes.map(prependAtSymbol);

  return asCssStatement('keyframes ' + name + ' ', keyframes, prefixes);
}

function generateAnimationCss(points, name, duration, mapper, prefixes) {
  var keyframeStatement = generateCssKeyframes(points, name, mapper, prefixes);

  var properties = [
    rule('animation-duration', duration, prefixes),
    rule('animation-name', name, prefixes),
    rule('animation-timing-function', 'linear', prefixes),
    rule('animation-fill-mode', 'both', prefixes)
  ].join('');

  var animationStatement = asCssStatement('.' + name, properties);

  return keyframeStatement + animationStatement;
}

function animateCurveViaCss(document, el, points, mapper, prefixes, fps) {
  fps = fps || 60;

  // Generate a unique name for this animation
  var name = 'animation-' + id();

  // Compute the timespan of the animation based on the number of frames we
  // have and the fps we desire.
  var duration = (points.length / fps) * 1000;

  // Create CSS animation classname
  var css = generateAnimationCss(points, name, duration + 'ms', mapper, prefixes);

  // Create a new style element.
  var styleEl = document.createElement('style');
  // Assign it the id.
  styleEl.id = name;
  // Assign the text content.
  styleEl.textContent = css;
  // Append style to head.
  document.head.appendChild(styleEl);

  // Add animation classname to element.
  el.classList.add(name);

  setTimeout(function () {
    // Remove animation classname and styles.
    document.head.removeChild(styleEl);
    el.classList.remove(name);
  }, duration + 1);
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

