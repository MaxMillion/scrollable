Scrollable._enableInfiniteScrolling = function (isDOMNode, isArray, forEach, enableScrolling, getScrollableNode, jQuery) {
	var DEFAULT_RADIUS = 320;

	return enableInfiniteScrolling;


	function enableInfiniteScrolling (elem, options, generator) {
		if ( !isDOMNode(elem) ) {
			throw elem + ' is not a DOM element';
		}
		if ( !generator ) {
			generator = options;
			options   = undefined;
		}
		options = options || {};
		if ((typeof options !== 'object') || (options === null)) {
			throw TypeError('options must be an object if defined, got ' + options);
		}
		if (typeof generator !== 'function') {
			throw generator + ' is not a function';
		}
		if (options.scroller && !isDOMNode(options.scroller)) {
			throw TypeError('options.scroller must be a DOM node, got ' + options.scroller);
		}

		var scroller = options.scroller || findParentScroller(elem),
			loading  = options.loading,
			radius   = options.triggerRadius,
			enabled  = false,
			done     = false,
			lock     = false,
			loadingElem;

		if (loading === null) {
			loading = undefined;
		}
		if (typeof loading !== 'undefined') {
			loadingElem = prepareElements([loading])[0];
		}
		if (radius === null) {
			radius = undefined;
		}
		switch (typeof radius) {
			case 'undefined':
				radius = DEFAULT_RADIUS;
			case 'number':
				break;
			default:
				throw TypeError('trigger radius must be a number if defined, got ' + radius);
		}

		if ( !scroller ) {
			enableScrolling(elem);
			scroller = elem;
		}
		if (loadingElem) {
			getScrollableNode(elem).appendChild(loadingElem);
		}

		bindListeners();
		if (options.autoStart) {
			tryToAddItems();
		}

		return {
			layout      : tryToAddItems      ,
			forceLayout : forcefullyAddItems ,
			enable      : bindListeners      ,
			disable     : unbindListeners    ,
			destroy     : destroyInfiniteScroll
		};

		function bindListeners () {
			if (enabled) {
				return;
			}
			if (done) {
				throw Error('cannot enable infinite scroller that has been destroyed');
			}
			enabled = true;
			scroller.addEventListener('scroll', tryToAddItems, false);
		}

		function unbindListeners () {
			if ( !enabled ) {
				return;
			}
			enabled = false;
			scroller.removeEventListener('scroll', tryToAddItems);
		}

		function tryToAddItems () {
			if (!enabled || done || lock || !shouldAddMoreItems(scroller, radius)) {
				return;
			}
			lock = true;

			addMoreItems(function (numAdded) {
				lock = false;

				if (numAdded) {
					tryToAddItems();
				} else {
					destroyInfiniteScroll();
				}
			});
		}

		function forcefullyAddItems () {
			if (!enabled || done || lock) {
				return;
			}
			lock = true;

			addMoreItems(function (numAdded) {
				lock = false;

				if (numAdded) {
					tryToAddItems();
				} else {
					destroyInfiniteScroll();
				}
			});
		}

		function addMoreItems (callback) {
			var newElems = generator(finish);
			if (typeof newElems !== 'undefined') {
				finish(newElems);
			}

			function finish (newElems) {
				if (done) {
					return;
				}

				if (newElems) {
					if (!isArray(newElems) && !((typeof newElems === 'object') && (newElems.constructor === jQuery))) {
						newElems = [ newElems ];
					}
					newElems = prepareElements(newElems);
					forEach(newElems, function (newElem) {
						getScrollableNode(elem).appendChild(newElem);
					});
					if (loadingElem) {
						getScrollableNode(elem).appendChild(loadingElem);
					}
					callback(newElems.length);
				} else {
					callback(0);
				}
			}
		}

		function destroyInfiniteScroll () {
			if (done) {
				return;
			}
			unbindListeners();
			done = true;
			if (loadingElem && loadingElem.parentNode) {
				loadingElem.parentNode.removeChild(loadingElem);
			}
		}
	}

	function findParentScroller (elem) {
		do {
			if (elem._scrollable) {
				return elem;
			}
			elem = elem.parentNode;
		} while (elem);
	}

	function shouldAddMoreItems (scroller, radius) {
		var elem = scroller;
		while (elem !== document.documentElement) {
			if (elem.parentNode) {
				elem = elem.parentNode;
			} else {
				return false;
			}
		}

		var clientHeight = scroller.clientHeight,
			scrollTop    = scroller._scrollTop(),
			scrollHeight = scroller.scrollHeight;
		return (scrollHeight-scrollTop-clientHeight <= radius);
	}

	function prepareElements (elemList) {
		var newList = [];

		forEach(elemList, function (rawElem) {
			switch (typeof rawElem) {
				case 'undefined':
					return;
				case 'string':
					var wrapper = document.createElement('div');
					wrapper.innerHTML = rawElem;
					if (wrapper.childNodes) {
						forEach(prepareElements(wrapper.childNodes), function (elem) {
							newList.push(elem);
						});
					}
					return;
				case 'object':
					if (rawElem === null) {
						return;
					} else if ( isDOMNode(rawElem) ) {
						newList.push(rawElem);
						return;
					}
				default:
					throw TypeError('expected an element, got ' + rawElem);
			}
		});

		return newList;
	}
}(
	Scrollable._isDOMNode         , // from utils.js
	Scrollable._isArray           , // from utils.js
	Scrollable._forEachInArray    , // from utils.js
	Scrollable._enableScrolling   , // from core.js
	Scrollable._getScrollableNode , // from core.js
	window.jQuery
);
