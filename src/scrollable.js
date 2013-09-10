var Scrollable = function (Zepto, jQuery) {
	// import Scrollable._isDOMNode         from utils.js
	// import Scrollable._enableScrolling   from core.js
	// import Scrollable._getScrollableNode from core.js



	// window.Scrollable exports

	function Scrollable () {
		Scrollable._enableScrolling.apply(this, arguments);
	}

	Scrollable.node = function () {
		return Scrollable._getScrollableNode.apply(this, arguments);
	};

	Scrollable.infinite = function () {
		return Scrollable._enableInfiniteScrolling.apply(this, arguments);
	};



	// Zepto exports

	if (Zepto && Zepto.fn) {
		Zepto.extend(Zepto.fn, {
			scrollable : function (forceIScroll) {
				this.forEach(function (elem) {
					Scrollable._enableScrolling(elem, forceIScroll);
				});
				return this;
			},
			scrollableNode : function () {
				return Zepto(this.map(function () {
					return Scrollable._getScrollableNode(this);
				}));
			},
			scrollableInfinite : function (options, generator) {
				var scroller;
				this.forEach(function (elem) {
					var s = Scrollable._enableInfiniteScrolling(elem, options, generator);
					if ( !scroller ) {
						scroller = s;
					}
				});
				return scroller;
			}
		});

		var zeptoScrollTop  = Zepto.fn.scrollTop,
			zeptoScrollLeft = Zepto.fn.scrollLeft;

		Zepto.fn.scrollTop = function (top) {
			if (typeof top === 'undefined') {
				var elem       = this[0],
					elemIsNode = Scrollable._isDOMNode(elem);

				if (elemIsNode && elem._scrollTop) {
					return elem._scrollTop();
				}
				else if (zeptoScrollTop) {
					return zeptoScrollTop.apply(this, arguments);
				}
				else if (elemIsNode) {
					return elem.scrollTop;
				}
				else {
					return null;
				}
			}

			this.forEach(function (elem) {
				var elemIsNode = Scrollable._isDOMNode(elem);

				if (elemIsNode && elem._scrollTop) {
					elem._scrollTop(top);
				}
				else if (zeptoScrollTop) {
					zeptoScrollTop.call(Zepto(elem), top);
				}
				else if (elemIsNode) {
					elem.scrollTop = top;
				}
			});

			return this;
		};

		Zepto.fn.scrollLeft = function (left) {
			if (typeof left === 'undefined') {
				var elem       = this[0],
					elemIsNode = Scrollable._isDOMNode(elem);

				if (elemIsNode && elem._scrollLeft) {
					return elem._scrollLeft();
				}
				else if (zeptoScrollTop) {
					return zeptoScrollLeft.apply(this, arguments);
				}
				else if (elemIsNode) {
					return elem.scrollLeft;
				}
				else {
					return null;
				}
			}

			this.forEach(function (elem) {
				var elemIsNode = Scrollable._isDOMNode(elem);

				if (elemIsNode && elem._scrollLeft) {
					elem._scrollLeft(left);
				}
				else if (zeptoScrollLeft) {
					zeptoScrollLeft.call(Zepto(elem), left);
				}
				else if (elemIsNode) {
					elem.scrollLeft = left;
				}
			});

			return this;
		};
	}



	// jQuery exports

	if (jQuery && jQuery.fn) {
		jQuery.fn.scrollable = function (forceIScroll) {
			this.each(function () {
				Scrollable._enableScrolling(this, forceIScroll);
			});
			return this;
		};

		jQuery.fn.scrollableNode = function () {
			return jQuery(this.map(function () {
				return Scrollable._getScrollableNode(this);
			}));
		};

		jQuery.fn.scrollableInfinite = function (options, generator) {
			var scroller;
			this.each(function () {
				var s = Scrollable._enableInfiniteScrolling(this, options, generator);
				if ( !scroller ) {
					scroller = s;
				}
			});
			return scroller;
		};

		var jQueryScrollTop  = jQuery.fn.scrollTop,
			jQueryScrollLeft = jQuery.fn.scrollLeft;

		jQuery.fn.scrollTop = function (top) {
			if (typeof top === 'undefined') {
				var elem = this[0];

				if (Scrollable._isDOMNode(elem) && elem._scrollTop) {
					return elem._scrollTop();
				}
				else {
					return jQueryScrollTop.apply(this, arguments);
				}
			}

			this.each(function () {
				if (Scrollable._isDOMNode(this) && this._scrollTop) {
					this._scrollTop(top);
				}
				else {
					jQueryScrollTop.call(jQuery(this), top);
				}
			});

			return this;
		};

		jQuery.fn.scrollLeft = function (left) {
			if (typeof left === 'undefined') {
				var elem = this[0];

				if (Scrollable._isDOMNode(elem) && elem._scrollLeft) {
					return elem._scrollLeft();
				}
				else {
					return jQueryScrollLeft.apply(this, arguments);
				}
			}

			this.each(function () {
				if (Scrollable._isDOMNode(this) && this._scrollLeft) {
					this._scrollLeft(left);
				}
				else {
					jQueryScrollLeft.call(jQuery(this), left);
				}
			});

			return this;
		};
	}



	return Scrollable;
}(window.Zepto, window.jQuery);
