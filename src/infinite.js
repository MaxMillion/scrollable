Scrollable._enableInfiniteScrolling = function (os, isDOMNode, isArray, forEach, enableScrolling, getScrollableNode, jQuery) {
	var DEFAULT_RADIUS = 320;

	return enableInfiniteScrolling;


	function enableInfiniteScrolling (elem, options, downGeneratorConvenience) {
		if ( !isDOMNode(elem) ) {
			throw elem + ' is not a DOM element';
		}

		if ( !downGeneratorConvenience  && typeof options === 'function') {
			downGeneratorConvenience = options;
			options   = {};
		}

		if (downGeneratorConvenience) {
			if (options.downGenerator) {
				throw Error('Two downGenerator functions specified');
			}
			options.downGenerator = downGeneratorConvenience;
		}

		if ((typeof options !== 'object') || (options === null)) {
			throw TypeError('options must be an object if defined, got ' + options);
		}

		if (!options.downGenerator && !options.upGenerator) {
			throw Error('No generators specified. What are you even scrolling?')
		}

		if (typeof options.autoStart === 'undefined') {
			options.autoStart = true;
		}

		if (options.downGenerator && typeof options.downGenerator !== 'function') {
			throw 'downGenerator ' + downGenerator + ' is not a function';
		}

		if (options.upGenerator && typeof options.upGenerator !== 'function') {
			throw 'upGenerator ' + upGenerator + ' is not a function';
		}

		if (options.scroller && !isDOMNode(options.scroller)) {
			throw TypeError('options.scroller must be a DOM node, got ' + options.scroller);
		}



		var scroller = options.scroller || findParentScroller(elem),
			loading  = options.loading,
			radius   = options.triggerRadius,
			enabled  = false,
			doneUp   = !options.upGenerator,
			doneDown = !options.downGenerator,
			done     = false,
			lock     = false,
			loadingElem,
			loadingElemTop,
			doneScrollTimer;

		if (loading === null) {
			loading = undefined;
		}
		if (typeof loading !== 'undefined') {
			if (options.downGenerator) {
				loadingElem = prepareElements([loading])[0];
				if (options.downGenerator) {
					loadingElemTop = loadingElem.cloneNode(true); // mwhaha
				}
			} else {
				loadingElemTop = prepareElements([loading])[0];
			}
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
			if (!enabled || lock || done) {
				return;
			}

			var direction = shouldAddMoreItems(scroller, radius);
			if (!direction) {
				return;
			}

			var goingUp = (direction === 'up');

			// work arouhd shitty iPhone scrolling.
			// we can't actually add stuff above while you are scrolling
			// or everythign goes to hell. So, do it when you are done.
			if (goingUp && (elem._isScrolling || elem._iScrolling)) {
				if (doneScrollTimer) {
					clearTimeout(doneScrollTimer);
				}
				doneScrollTimer = setTimeout(function(){
					tryToAddItems();
				}, 100)
				return;
			}

			lock = true;
			addMoreItems(goingUp, function (moreToFetch) {
				lock = false;
				if (moreToFetch) {
					tryToAddItems();
				} else {
					destroyInfiniteScroll(goingUp);
				}
			});
		}

		function forcefullyAddItems (goingUp) {
			if (!enabled || done || lock) {
				return;
			}
			lock = true;

			if (typeof goingUp === 'undefined') {
				goingUp = !options.downGenerator;
			}

			addMoreItems(goingUp, function (moreToFetch) {
				lock = false;

				if (moreToFetch) {
					tryToAddItems();
				} else {
					destroyInfiniteScroll(goingUp);
				}
			});
		}

		function addMoreItems (goingUp, callback) {
			var generator = goingUp ? options.upGenerator : options.downGenerator;

			var newElems = generator(finish);
			if (typeof newElems !== 'undefined') {
				finish(newElems);
			}

			function finish (newElems, isLast) {
				if (done || (doneUp && goingUp) || (doneDown && !goingUp)) {
					return;
				}

				var loading = goingUp ? loadingElemTop : loadingElem;
				var moreToFetch = newElems && newElems.length && !isLast;

				if (newElems) {
					if (!isArray(newElems) && !((typeof newElems === 'object') && (newElems.constructor === jQuery))) {
						newElems = [ newElems ];
					}
					newElems = prepareElements(newElems);

					var scrollableNode = getScrollableNode(elem);
					var originalHeight = scroller.scrollHeight;

					forEach(newElems, function (newElem) {
						insert(scrollableNode, newElem);
					});

					if (loading) {
						insert(scrollableNode,loading);
					}

					var endHeight = scroller.scrollHeight;
					if (goingUp) {
						var delta = endHeight - originalHeight;
						scroller._scrollTop(scroller._scrollTop() + delta, function(){
							// force shitty new iphones to redraw
							if (!!os.ios && !scroller._iScroll) {
								toggle3d(newElems);
							}
							callback(moreToFetch);
						});
					} else {
						callback(moreToFetch);
					}
				} else {
					callback(moreToFetch);
				}
			}

			function insert(target, elem) {
				if (goingUp) {
					target.insertBefore(elem, target.firstChild);
				} else {
					target.appendChild(elem);
				}
			}
		}

		function destroyInfiniteScroll (goingUp) {
			if (done) {
				return;
			}

			if (goingUp) {
				doneUp = true;
				if (loadingElemTop && loadingElemTop.parentNode) {
					loadingElemTop.parentNode.removeChild(loadingElemTop);
				}
			}
			else {
				doneDown = true;
				if (loadingElem && loadingElem.parentNode) {
					loadingElem.parentNode.removeChild(loadingElem);
				}
			}
			done = (doneDown || !options.downGenerator) && (doneUp || !options.upGenerator);

			if (done){
				unbindListeners();
			}
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
				scrollTop    = (scroller._scrollTop ? scroller._scrollTop() : scroller.scrollTop),
				scrollHeight = scroller.scrollHeight;
			if (!doneDown && scrollHeight-scrollTop-clientHeight <= radius) {
				return 'down';
			} else if (!doneUp && scrollTop < radius) {
				return 'up';
			} else {
				return false;
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

	function toggle3d (elemList) {
		forEach(elemList, function(elem) {
			var old = elem.style.webkitTransform;
			elem.style.webkitTransform = 'translate3d(0,0,0)';
			setTimeout(function(){
				elem.style.webkitTransform = old;
			},0);
		});
	}
}(
	Scrollable._os                , // from utils.js
	Scrollable._isDOMNode         , // from utils.js
	Scrollable._isArray           , // from utils.js
	Scrollable._forEachInArray    , // from utils.js
	Scrollable._enableScrolling   , // from core.js
	Scrollable._getScrollableNode , // from core.js
	window.jQuery
);
