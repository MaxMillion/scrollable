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

		var scroller = findParentScroller(elem),
			loading  = options.loading,
			radius   = options.triggerRadius,
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

		tryToAddItems();
		scroller.addEventListener('scroll', tryToAddItems, false);

		function tryToAddItems () {
			if (done || lock || !shouldAddMoreItems(scroller, radius) ) {
				return;
			}
			lock = true;

			addMoreItems(elem, loadingElem, generator, function (numAdded) {
				lock = false;

				if ( !numAdded ) {
					done = true;
					return;
				}

				tryToAddItems();
			});
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

	function addMoreItems (elem, loadingElem, generator, callback) {
		var newElems = generator(finish);

		if (typeof newElems !== 'undefined') {
			finish(newElems);
			return;
		}

		if (loadingElem) {
			getScrollableNode(elem).appendChild(loadingElem);
		}

		function finish (newElems) {
			var noResponse = false;

			if (loadingElem && loadingElem.parentNode) {
				loadingElem.parentNode.removeChild(loadingElem);
			}

			if (newElems) {
				if (!isArray(newElems) && !((typeof newElems === 'object') && (newElems.constructor === jQuery))) {
					newElems = [ newElems ];
				}
				newElems = prepareElements(newElems);
				forEach(newElems, function (newElem) {
					getScrollableNode(elem).appendChild(newElem);
				});
				callback(newElems.length);
			} else {
				callback(0);
			}
		}
	}
}(
	Scrollable._isDOMNode         , // from utils.js
	Scrollable._isArray           , // from utils.js
	Scrollable._forEachInArray    , // from utils.js
	Scrollable._enableScrolling   , // from core.js
	Scrollable._getScrollableNode , // from core.js
	window.jQuery
);
