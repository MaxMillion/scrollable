Scrollable._scrollWatcher = function (os) {
	return setupScrollWatcher;


	//NOTE: this should only be used for iOS native scrolling
	function setupScrollWatcher (scroller) {
		var willScroll         = false,
			isScrolling        = false,
			lastScrollPosition = scroller.scrollTop;

		scroller.addEventListener('touchstart' , onTouchStart );
		scroller.addEventListener('touchmove'  , onTouchMove  );
		scroller.addEventListener('touchcancel', onTouchCancel);
		scroller.addEventListener('touchend'   , onTouchEnd   );
		scroller.addEventListener('scroll'     , onScroll     );

		updateScrollingFlag();
		return;


		function updateScrollingFlag () {
			scroller._isScrolling = (isScrolling || willScroll);
		}

		function onTouchStart () {
			willScroll = false;
			updateScrollingFlag();
		}

		function onTouchMove () {
			willScroll = true;
			lastScrollPosition = scroller.scrollTop;
			updateScrollingFlag();
		}

		function onTouchCancel () {
			willScroll  = false;
			isScrolling = false;
			updateScrollingFlag();
		}

		function onTouchEnd () {
			if (willScroll) {
				var offset = Math.abs(scroller.scrollTop - lastScrollPosition);

				if (offset > 5) {
					isScrolling = true;
				}

				willScroll = false;

				updateScrollingFlag();
			}
		}

		function onScroll () {
			if (!willScroll && isScrolling) {
				isScrolling = false;
				willScroll  = false;
				updateScrollingFlag();
			}
		}
	}
}(
	Scrollable._os // from utils.js
);
