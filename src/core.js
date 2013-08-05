Scrollable._enableScrolling = function (os, isDOMNode, onReady, forEachInArray, scrollWatcher, iScroll, window, document) {
	var nativeScrolling = shouldUseNativeScrolling();
	return enableScrolling;

	function shouldUseNativeScrolling () {
		if ((os.ios && (os.version >= 5)) ||
				(os.android && (os.version >= 4))) {
			return true;
		}
		else {
			return false;
		}
	}

	function enableScrolling (elem, forceIScroll) {
		if ( !isDOMNode(elem) ) {
			throw elem + ' is not a DOM element';
		}

		if (elem._scrollable) {
			return;
		}
		elem._scrollable = true;

		var scroller;

		elem._scrollTop = function (top) {
			if (typeof top === 'undefined') {
				return scroller ? Math.max(parseInt(-scroller.y), 0) : elem.scrollTop;
			}

			if (!scroller && (!os.mobile || nativeScrolling)) {
				elem.scrollTop = top;
				return;
			}

			onReady(function () {
				scroller.scrollTo(scroller.x, Math.min(-top, 0), 1);
			});
		};

		elem._scrollLeft = function (left) {
			if (typeof left === 'undefined') {
				return scroller ? Math.max(parseInt(-scroller.x), 0) : elem.scrollLeft;
			}

			if (!scroller && (!os.mobile || nativeScrolling)) {
				elem.scrollLeft = left;
				return;
			}

			onReady(function () {
				scroller.scrollTo(Math.min(-left, 0), scroller.y, 1);
			});
		};

		elem.style.overflow = 'scroll';

		if ( !forceIScroll ) {
			if ( !os.mobile ) {
				return;
			}

			if (nativeScrolling) {
				elem.style['-webkit-overflow-scrolling'] = 'touch';

				if (os.ios) {
					scrollWatcher(elem);
				}

				return;
			}
		}

		createIScroller(elem, function (s) {
			scroller = s;
		});
	}

	function createIScroller (elem, callback) {
		elem._iScroll = true;

		wrapElement(elem);

		var onScroll = createScrollHandler(elem);

		onReady(function () {
			var scroller = new iScroll(elem, {
				checkDOMChanges     : true,
				useTransform        : true,
				useTransition       : true,
				hScrollbar          : false,
				vScrollbar          : false,
				bounce              : !!os.ios,
				onScrollMove        : onScroll,
				onBeforeScrollEnd   : onScroll,
				onScrollEnd         : onScroll,
				onBeforeScrollStart : inputScrollFix
			});
			elem._iScroll = scroller;

			callback(scroller);
		});
	}

	function wrapElement (elem) {
		var wrapper  = document.createElement('div'),
			children = Array.prototype.slice.call(elem.childNodes || []);

		forEachInArray(children, function (child) {
			var oldChild = elem.removeChild(child);
			wrapper.appendChild(oldChild);
		});

		elem.appendChild(wrapper);

		elem.style.position = 'relative';
		wrapper.style['min-height'] = '100%';
		wrapper.style['min-width' ] = '100%';
	}

	function createScrollHandler (elem) {
		var lastTop, lastLeft;

		return function () {
			var top  = elem._scrollTop(),
				left = elem._scrollLeft();

			if ((top === lastTop) && (left === lastLeft)) {
				return;
			}

			lastTop  = top;
			lastLeft = left;

			fireScrollEvent(elem);
		};
	}

	function fireScrollEvent (elem) {
		if (elem.dispatchEvent) {
			var evt = document.createEvent('MouseEvents');
			evt.initMouseEvent(
				'scroll', false, false, window,
				0       , 0    , 0    , 0     , 0,
				false   , false, false, false ,
				0       , null
			);
			elem.dispatchEvent(evt);
		}
	}

	function inputScrollFix (e) {
		var target = e.target;

		while (target.nodeType !== 1) {
			target = target.parentNode;
		}

		if ((target.tagName !== 'SELECT') && (target.tagName !== 'INPUT') && (target.tagName !== 'TEXTAREA')) {
			e.preventDefault();
		}
	}
}(
	Scrollable._os             , // from utils.js
	Scrollable._isDOMNode      , // from utils.js
	Scrollable._onReady        , // from utils.js
	Scrollable._forEachInArray , // from utils.js
	Scrollable._scrollWatcher  , // from scrollWatcher.js
	iScroll                    , // from iscroll.js
	window                     ,
	document
);



Scrollable._getScrollableNode = function (isDOMNode) {
	return function (elem) {
		if (isDOMNode(elem) && elem._iScroll) {
			return elem.childNodes[0];
		}
		else {
			return elem;
		}
	};
}(Scrollable._isDOMNode);
