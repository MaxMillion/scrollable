// Arguments coencide with the the arguments to the css interpolation
// function cubic-bezier().
function CubicBezier(p1x, p1y, p2x, p2y) {
	var self = this;
	var p0x = 0;
	var p0y = 0;
	var p3x = 1;
	var p3y = 1;

	var c0, c1, c2, c3;
	var p = Math.pow;

	// Compute the (x, y) value of the bezier curve at a given point.
	// As with the css varient, t \in [0..1]
	self.at = function (t) {
		// This is just math, nothing tricky.
		// http://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
		c0 =     p(1 - t, 3);
		c1 = 3 * p(1 - t, 2) * t;
		c2 = 3 * (1 - t)   *  p(t, 2);
		c3 =                  p(t, 3);

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
