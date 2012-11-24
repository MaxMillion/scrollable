Scrollable._os = function (userAgent, parseFloat) {
	var name, version, match;

	if (match = /\bCPU.*OS (\d+(_\d+)?)/i.exec(userAgent)) {
		name    = 'ios';
		version = match[1].replace('_', '.');
	}
	else if (match = /\bAndroid (\d+(\.\d+)?)/.exec(userAgent)) {
		name    = 'android';
		version = match[1];
	}

	var data = {
		name    : name ,
		version : version && parseFloat(version) ,
		mobile  : !!name
	};

	data[ name ] = true;

	return data;
}(navigator.userAgent, parseFloat);



Scrollable._isDOMNode = function (Node, HTMLElement) {
	return function (elem) {
		if ( !elem ) {
			return false;
		}

		try {
			return (elem instanceof Node) || (elem instanceof HTMLElement);
		} catch (err) {}

		if (typeof elem !== 'object') {
			return false;
		}

		if (typeof elem.nodeType !== 'number') {
			return false;
		}

		if (typeof elem.nodeName !== 'string') {
			return false;
		}

		return true;
	};
}(Node, HTMLElement);



Scrollable._findInArray = function (indexOf) {
	return function (arr, item, startIndex) {
		if (indexOf) {
			return indexOf.call(arr, item, startIndex);
		}

		for (var i=startIndex||0, len=arr.length; i<len; i++) {
			if ((i in arr) && (arr[i] === item)) {
				return i;
			}
		}

		return -1;
	};
}(Array.prototype.indexOf);



Scrollable._forEachInArray = function (forEach) {
	return function (arr, callback, self) {
		if (forEach) {
			return forEach.call(arr, callback, self);
		}

		for (var i=0, len=arr.length; i<len; i++) {
			if (i in arr) {
				callback.call(self, arr[i], i, arr);
			}
		}
	};
}(Array.prototype.forEach);



Scrollable._onReady = function (document, window, forEachInArray) {
	var readyCallbacks = [],
		isReady        = false;

	fireOnReady(fireReadyEvent);

	return function (callback) {
		if (isReady) {
			setTimeout(callback, 0);
		}
		else {
			readyCallbacks.push(callback);
		}
	};

	function fireReadyEvent () {
		if (isReady) {
			return;
		}
		isReady = true;

		forEachInArray(readyCallbacks, function (callback) {
			setTimeout(callback, 0);
		});
	}

	function doScrollCheck (callback) {
		try {
			document.documentElement.doScroll('left');
		}

		catch (err) {
			setTimeout(function () {
				doScrollCheck(callback);
			}, 1);
			return;
		}

		callback();
	}

	function fireOnReady (callback) {
		if (document.readyState === 'complete') {
			setTimeout(callback, 0);
			return;
		}

		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', callback, false);
			window.addEventListener('load', callback, false);
		}

		else if (document.attachEvent) {
			document.attachEvent('onreadystatechange', callback);
			window.attachEvent('onload', callback);

			var toplevel = false;

			try {
				toplevel = (window.frameElement === null);
			} catch(e) {}

			if (document.documentElement.doScroll && toplevel) {
				setTimeout(function () {
					doScrollCheck(callback);
				}, 0);
			}
		}
	}
}(document, window, Scrollable._forEachInArray);
