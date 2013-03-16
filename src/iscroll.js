/*!
 * iScroll Lite base on iScroll v4.1.6 ~ Copyright (c) 2011 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */

(function(){
	function round(n) {
		return n << 0;
	}

	function EventBus() {
		var self = this;
		var callbacks = {};

		function filter(arr, cb) {
			var filtered = [];
			for (var i = 0; i < arr.length; i++) {
				if (cb(arr[i], i, arr)) filtered.push(arr[i]);
			}
			return filtered;
		}

		function remove(arr, obj) {
			return filter(arr, function (elm) {
				if (elm === obj) return false;
				else return true;
			});
		}

		self.on = function (ev, cb) {
			var arr = callbacks[ev] || [];
			// Prevent duplicates
			arr = remove(arr, cb);
			arr.push(cb);
			callbacks[ev] = cb;
		}

		self.once = function (ev, cb) {
			function wrapper() {
				self.off(ev, wrapper);
				cb.apply(null, arguments);
			}
			self.on(ev, wrapper);
		}

		self.off = function (ev, cb) {
			callbacks[ev] = remove(callbacks[ev], cb);
		}
	}

	var MODE_3D = 1, MODE_2D = 2, MODE_DOM = 3;
	function Animator(elm) {
		var self = this;
		var steps = [];
		var frameId = -1;
		var running = false;
		var time = 0;
		var xpos = 0;
		var ypos = 0;

		elm.style[vendor + 'TransitionProperty'] = '-' + vendor.toLowerCase() +
'-transform';
		elm.style[vendor + 'TransitionDuration'] = '0';
		elm.style[vendor + 'TransformOrigin'] = '0 0';
		elm.style[vendor + 'TransitionTimingFunction'] = 'cubic-bezier(0.33, 0.66, 0.66, 1)';

		function stop() {
			cancelFrame(frameId);
			steps = [];
			cb();
		}

		self.currentPosition = currentPosition;
		function currentPosition() {
			var style = getComputedStyle(elm, null);
			var useTransform = true;
			if (useTransform) {
				// Very lame general purpose alternative to CSSMatrix
				var matrix = style[vendor + 'Transform'].replace(/[^0-9-.,]/g, '').split(',');
				return {
					x: +matrix[4] || 0,
					y: +matrix[5] || 0,
				};
			} else {
				var style = getComputedStyle(this.scroller, null);
				return {
					x: style.left.replace(/[^0-9-.,]/g, ''),
					y: style.top.replace(/[^0-9-.,]/g, ''),
				};
			}

		}

		self.moveTo = moveTo;
		function moveTo(x, y, t) {
			if (!t) {
				if (running) {
					console.log("Attempt to move while scrolling");
					// TODO: Smarter logic here
					return;
				}
				setTime(0);
				setPosition(x, y, MODE_3D);
				return;
			}
			console.log("Actuall scrolling for a time: ", t, "ms");
// 			running = false;
			steps.push({
				x: x, y: y, t: t,
			});
			start();
		}

		// Required hack to stop a scrolling animation currently in progress
		// on Android.
		function forceStop() {
			// TODO: If animating, predict landing position and interpolate
			// to there based on estimated lag.
			var endpos = that.scroller.style[vendor + 'Transform'].replace(/[^0-9,-.]/g, '').split(',');
			var end = {
				x: parseFloat(endpos[0]),
				y: parseFloat(endpos[1]),
			};
			setTime(0);
			setPosition(xpos, ypos, MODE_2D);
			setTimeout(function () {
				setPosition(xpos, ypos, MODE_3D);
				cb();
			});
		}

		function start() {
			if (running) return;
			running = false;
			if (steps.length < 1) return;

			var step = steps.shift();
			if (step.x === xpos && step.y === ypos) return;

			running = true;
			setTime(step.t);
			setPosition(stop.x, step.y, MODE_3D);
		}

		elm.addEventListener('webkitTransitionEnd', transitionEnd, false);
		elm.addEventListener('transitionend', transitionEnd, false);
		function transitionEnd() {
			running = false;
			start();
		}

		var p0 = {x: 0   , y: 0};
		var p1 = {x: 0.33, y: 0.66};
		var p2 = {x: 0.66, y: 1};
		var p3 = {x: 1   , y: 1};
		function cubicBezier(t) {
			var p = Math.pow;
			function comp(t, c) {
				return     p(1 - t, 3)           * p0[c] +
					   3 * p(1 - t, 2) *  (t)    * p1[c] +
					   3 *  (1 - t)    * p(t, 2) * p2[c] +
					                     p(t, 3) * p3[c];
			}

			return {
				x: comp(t, 'x'),
				y: comp(t, 'y'),
			};
		}

		function setTime(t) {
			if (time === round(t)) return;
			time = round(t);
			console.log("Changing transition time to ", time, "ms");
			elm.style[vendor + 'TransitionDuration'] = time + 'ms';
		}

		function setPosition(x, y, mode) {
			if (mode === MODE_3D) {
				var tr = 'translate3d(' + round(x) + 'px,' + round(y) + 'px,0px)';
				elm.style[vendor + 'Transform'] = tr;
			}
			xpos = x;
			ypos = y;
		}
	}

	// Arguments coencide with the the arguments to the css interpolation
	// function cubic-bezier().
	function CubicBezier(p1x, p1y, p2x, p2y) {
		var self = this;
		var p0x = 0;
		var p0y = 0;
		var p3x = 1;
		var p3y = 1;

		// Compute the (x, y) value of the bezier curve at a given point.
		// As with the css varient, t \in [0..1]
		self.at = function (t) {
			var p = Math.pow;

			// This is just math, nothing tricky.
			// http://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
			var c0 =     p(1 - t, 3);
			var c1 = 3 * p(1 - t, 2) * t;
			var c2 = 3 * (1 - t)   *  p(t, 2);
			var c3 =                  p(t, 3);

			return {
				x: c0*p0x + c1*p1x + c2*p2x + c3*p3x,
				y: c0*p0y + c1*p1y + c2*p2y + c3*p3y,
			};
		}

		self.css = function () {
			// p0 is fixed at (0, 0), and p3 is fixed at (1, 1) according to
			// the CSS specifications.
			return 'cubic-bezier(' + p1x + ',' + p1y + ',' + p2x + ',' + p2y + ')';
		}

		self.set = function (np0x, np0y, np1x, np1y, np2x, np2y, np3x, np3y) {
			p0x = np0x; p0y = np0y;
			p1x = np1x; p1y = np1y;
			p2x = np2x; p2y = np2y;
			p3x = np3x; p3y = np3y;
		}

		self.split = function (t) {
			// http://en.wikipedia.org/wiki/De_Casteljau's_algorithm
			var p01x = (p1x - p0x)*t + p0x
			var p01y = (p1y - p0y)*t + p0x

			var p12x = (p2x - p1x)*t + p1x
			var p12y = (p2y - p1y)*t + p1y

			var p23x = (p3x - p2x)*t + p2x
			var p23y = (p3y - p2y)*t + p2y

			var p012x = (p12x - p01x)*t + p01x
			var p012y = (p12y - p01y)*t + p01y

			var p123x = (p23x - p12x)*t + p12x
			var p123y = (p23y - p12y)*t + p12y

			var p0123x = (p123x - p012x)*t + p012x
			var p0123y = (p123y - p012y)*t + p012y

			var left = new CubicBezier();
			left.set(p0x, p0y, p01x, p01y, p012x, p012y, p0123x, p0123y);
			var right = new CubicBezier();
			right.set(p0123x, p0123y, p123x, p123y, p23x, p23y, p3x, p3y);
			return [left, right];
		}
	}

var USE_3D = 1, USE_2D = 2, USE_DOM = 3, USE_FORCE = 4;
var m = Math;
var max = Math.max;
var
	mround = function (r) { return r >> 0; },
	vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
		(/firefox/i).test(navigator.userAgent) ? 'Moz' :
		'opera' in window ? 'O' : '',

    // Browser capabilities
    isAndroid = (/android/gi).test(navigator.appVersion),
    isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
    isPlaybook = (/playbook/gi).test(navigator.appVersion),
    isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

    has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
    hasTouch = 'ontouchstart' in window && !isTouchPad,
    hasTransform = vendor + 'Transform' in document.documentElement.style,
    hasTransitionEnd = isIDevice || isPlaybook || isAndroid,

	nextFrame = (function() {
	    return window.requestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function(callback) { return setTimeout(callback, 17); }
	})(),
	cancelFrame = (function () {
	    return window.cancelRequestAnimationFrame
			|| window.webkitCancelAnimationFrame
			|| window.webkitCancelRequestAnimationFrame
			|| window.mozCancelRequestAnimationFrame
			|| window.oCancelRequestAnimationFrame
			|| window.msCancelRequestAnimationFrame
			|| clearTimeout
	})(),

	// Events
	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	START_EV = hasTouch ? 'touchstart' : 'mousedown',
	MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
	END_EV = hasTouch ? 'touchend' : 'mouseup',
	CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',

	// Helpers
	trnOpen = 'translate' + (has3d ? '3d(' : '('),
	trnClose = has3d ? ',0)' : ')',

	// Constructor
	iScroll = function (el, options) {
		var that = this,
			doc = document,
			i;

		that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
		that.wrapper.style.overflow = 'hidden';
		that.scroller = that.wrapper.children[0];
		that.eventBus = new EventBus();

		// Default options
		that.options = {
			hScroll: true,
			vScroll: true,
			x: 0,
			y: 0,
			bounce: true,
			bounceLock: false,
			momentum: true,
			lockDirection: true,
			useTransform: true,
			useTransition: false,

			// Events
			onRefresh: null,
			onBeforeScrollStart: function (e) { e.preventDefault(); },
			onScrollStart: null,
			onBeforeScrollMove: null,
			onScrollMove: null,
			onBeforeScrollEnd: null,
			onScrollEnd: null,
			onTouchEnd: null,
			onDestroy: null
		};

		// User defined options
		for (i in options) that.options[i] = options[i];

		// Set starting position
		that.x = that.options.x;
		that.y = that.options.y;

		// Normalize options
		that.options.useTransform = hasTransform ? that.options.useTransform : false;
		that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
		that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
		that.options.useTransition = hasTransitionEnd && that.options.useTransition;

		that.animator = new Animator(that.scroller);

		that.refresh();

		that._bind(RESIZE_EV, window);
		that._bind(START_EV);
		if (!hasTouch) that._bind('mouseout', that.wrapper);
	};

// Prototype
iScroll.prototype = {
	enabled: true,
	x: 0,
	y: 0,
	steps: [],
	scale: 1,

	handleEvent: function (e) {
		var that = this;
		switch(e.type) {
			case START_EV:
				if (!hasTouch && e.button !== 0) return;
				that._start(e);
				break;
			case MOVE_EV: that._move(e); break;
			case END_EV:
			case CANCEL_EV: that._end(e); break;
			case RESIZE_EV: that._resize(); break;
			case 'mouseout': that._mouseout(e); break;
			case 'webkitTransitionEnd': that._transitionEnd(e); break;
		}
	},

	_resize: function () {
		this.refresh();
	},

	_start: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e;

		if (!that.enabled) return;

		e.preventDefault();

		that.distX = 0;
		that.distY = 0;
		that.absDistX = 0;
		that.absDistY = 0;
		that.dirX = 0;
		that.dirY = 0;

		var pos = this.animator.currentPosition();

		if (pos.x != that.x || pos.y != that.y) {
			that.animator.moveTo(pos.x, pos.y);
			that.x = pos.x;
			that.y = pos.y;
		}
		afterForce();

		function afterForce() {
			that.startX = that.x;
			that.startY = that.y;
			that.pointX = point.pageX;
			that.pointY = point.pageY;

			that.startTime = e.timeStamp || Date.now();

			that._bind(MOVE_EV);
			that._bind(END_EV);
			that._bind(CANCEL_EV);
		}
	},

	_move: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			deltaX = point.pageX - that.pointX,
			deltaY = point.pageY - that.pointY,
			newX = that.x + deltaX,
			newY = that.y + deltaY,
			timestamp = e.timeStamp || Date.now();

		that.pointX = point.pageX;
		that.pointY = point.pageY;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
		}
		if (newY > 0 || newY < that.maxScrollY) {
			newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= 0 || that.maxScrollY >= 0 ? 0 : that.maxScrollY;
		}

		that.distX += deltaX;
		that.distY += deltaY;
		that.absDistX = m.abs(that.distX);
		that.absDistY = m.abs(that.distY);

		if (that.absDistX < 6 && that.absDistY < 6) {
			return;
		}

		// Lock direction
		if (that.options.lockDirection) {
			if (that.absDistX > that.absDistY + 5) {
				newY = that.y;
				deltaY = 0;
			} else if (that.absDistY > that.absDistX + 5) {
				newX = that.x;
				deltaX = 0;
			}
		}

		that.moved = true;
		that._pos(newX, newY, USE_3D);
		that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;
	},

	_end: function (e) {
		if (hasTouch && e.touches.length != 0) return;

		var that = this,
			point = hasTouch ? e.changedTouches[0] : e,
			target, ev,
			momentumX = { dist:0, time:0 },
			momentumY = { dist:0, time:0 },
			duration = (e.timeStamp || Date.now()) - that.startTime,
			newPosX = that.x,
			newPosY = that.y,
			newDuration;

		that._unbind(MOVE_EV);
		that._unbind(END_EV);
		that._unbind(CANCEL_EV);

		if (duration < 300 && that.options.momentum) {
			momentumX = that._momentum(newPosX - that.startX, duration);
			momentumY = that._momentum(newPosY - that.startY, duration);

			newPosX = that.x + momentumX.dist;
			newPosY = that.y + momentumY.dist;


			// TODO: Something better here. We should really slice the bezier
			// curve that this animation would represent at the point where
			// it would go past the end, then add a bounce transition (if on iOS)
			// or stop (if on Android).
			if (newPosX > 0) newPosX = 0;
			else if (newPosX < that.maxScrollX) newPosX = that.maxScrollX;
			if (newPosY > 0) newPosY = 0;
			else if (newPosY < that.maxScrollY) newPosY = that.maxScrollY;

			if (momentumX.dist || momentumY.dist) {
				newDuration = max(max(momentumX.time, momentumY.time), 10);
				this.scrollTo(newPosX, newPosY, newDuration);
				return;
			}
		}
		that._resetPos(200);
	},

	_momentum: function (dist, time) {
		var abs = Math.abs;
		var a = -0.0006;
		var v = dist / time;

		return {
			dist: (v * v) / (2 * a) * (v < 0 ? 1 : -1),
			time: round(abs(v / a)),
		};
	},

	_resetPos: function (time) {
		var that = this,
			resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
			resetY = that.y >= 0 ? 0 : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		if (resetX == that.x && resetY == that.y) {
			if (that.moved) {
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
				that.moved = false;
			}

			return;
		}

		that.scrollTo(resetX, resetY, time || 0);
	},

	_mouseout: function (e) {
		var t = e.relatedTarget;

		if (!t) {
			this._end(e);
			return;
		}

		while (t = t.parentNode) if (t == this.wrapper) return;

		this._end(e);
	},

	scrollTo: function (x, y, time, relative) {
		if (relative) throw "I broke relative scrolling sorry";
		this.animator.moveTo(x, y, time);
	},

	_pos: function (x, y, kind, cb) {
		x = this.hScroll ? x : 0;
		y = this.vScroll ? y : 0;

		this.animator.moveTo(x, y);
		this.x = x;
		this.y = y;
		if (cb) cb();
		return;
	},

	_offset: function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}

		return { left: left, top: top };
	},

	_bind: function (type, el, bubble) {
		(el || this.scroller).addEventListener(type, this, !!bubble);
	},

	_unbind: function (type, el, bubble) {
		(el || this.scroller).removeEventListener(type, this, !!bubble);
	},


	/**
	 *
	 * Public methods
	 *
	 */
	destroy: function () {
		var that = this;

		that.scroller.style[vendor + 'Transform'] = '';

		// Remove the event listeners
		that._unbind(RESIZE_EV, window);
		that._unbind(START_EV);
		that._unbind(MOVE_EV);
		that._unbind(END_EV);
		that._unbind(CANCEL_EV);
		that._unbind('mouseout', that.wrapper);
		if (that.options.useTransition) that._unbind('webkitTransitionEnd');

		if (that.options.onDestroy) that.options.onDestroy.call(that);
	},

	refresh: function () {
		var that = this,
			offset;

		that.wrapperW = that.wrapper.clientWidth;
		that.wrapperH = that.wrapper.clientHeight;

		that.scrollerW = that.scroller.offsetWidth;
		that.scrollerH = that.scroller.offsetHeight;
		that.maxScrollX = that.wrapperW - that.scrollerW;
		that.maxScrollY = that.wrapperH - that.scrollerH;
		that.dirX = 0;
		that.dirY = 0;

		that.hScroll = that.options.hScroll && that.maxScrollX < 0;
		that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);

		offset = that._offset(that.wrapper);
		that.wrapperOffsetLeft = -offset.left;
		that.wrapperOffsetTop = -offset.top;


		that.scroller.style[vendor + 'TransitionDuration'] = '0';

		that._resetPos(200);
	},

	disable: function () {
		this.stop();
		this._resetPos(0);
		this.enabled = false;

		// If disabled after touchstart we make sure that there are no left over events
		this._unbind(MOVE_EV);
		this._unbind(END_EV);
		this._unbind(CANCEL_EV);
	},

	enable: function () {
		this.enabled = true;
	},
};

if (typeof exports !== 'undefined') exports.iScroll = iScroll;
else window.iScroll = iScroll;

})();
