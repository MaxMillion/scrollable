scrollable.js - Seamless scrolling for mobile devices
=====================================================

Scrolling on mobile devices is inconsistent at best. scrollable.js provides a sane API that you're already familiar with to make scrolling easy. scrollable.js does not have any dependencies except for a custom version of [iScroll](http://cubiq.org/iscroll-4), which is privately included and not externalized at all.

scrollable.js also provides convenient bindings for ZeptoJS and jQuery to make the development process as seamless as possible.


Links
-----

[Download script (v1.0 minified)](http://code.kik.com/scrollable/1.0.min.js)

[View demo](http://code.kik.com/scrollable/demos/basic.html)


Usage with ZeptoJS or jQuery
----------------------------

### Make elements scrollable

```js
$(element).scrollable();
```


### Bind to scroll events

```js
$(element).on('scroll', function () {
	// fired on scroll
});
```


### Setting scroll offset

```js
$(element).scrollTop();    // retrieve Y offset
$(element).scrollTop(20);  // set Y offset

$(element).scrollLeft();   // retrive X offset
$(element).scrollLeft(20); // set X offset
```


### Infinite scroll

There are times when you want to continually add contents to the bottom of a list while a user scrolls down. For example a Facebook feed-style page would want to keep adding new posts as the user nears the bottom of the page. Scroll provides functionality to make this convenient.

The element that is being enabled for infinite scroll is explicitely the one that new nodes will be appended to. Scrollable will automatically look up the parent tree to find the scrolling element to bind events to.

```js
$(element).scrollableInfinite(function () {
	// This function will get called any time the user
	// gets near the bottom of the list. Simply return
	// the next element (or list of elements) to be added.
	return $('<div class="new-list-item">');
});
scroller.disable(); // disable auto loading
scroller.enable();  // re-enable auto loading
scroller.destroy(); // destroy and cleanup infinite scroll bindings
```

Often times dynamic loading like this is necessary because of network activity to fetch the items that are being added. Infinite scroll generators can be asynchronous to accomodate this.

```js
$(element).scrollableInfinite(function (callback) {
	$.ajax('url', function () {
		// Respond with items to add
		callback( $('<div class="new-list-item">') );
	});
});
```

In these network-bound scenarios we will likely want to show the user a loading spinner (or equivalent) to indicate what is happening. Infinite scroll can automatically show and hide the loading spinner for you in these cases.

```js
$(element).scrollableInfinite({
	loading : $('<div class="my-loading-elem">')
}, function (callback) {
	$.ajax('url', function () {
		// Respond with items to add
		callback( $('<div class="new-list-item">') );
	});
});
```


### Manipulating scrollable region

When native scrolling is not available we must wrap your content and use [iScroll](http://cubiq.org/iscroll-4) to simulate scrolling.

Thus, to manipulate the scrollable region we must only add or remove content from the "scrollable node".

```js
$(element).scrollableNode()
          .append('<div>more stuff</div>');
```




Standalone Usage
----------------

scrollable.js has no external dependencies and will work perfectly fine as a standalone library.


### Make elements scrollable

```js
Scrollable(element);
```


### Bind to scroll events

```js
element.addEventListener('scroll', function () {
	// fired on scroll
}, false);
```


### Setting scroll offset

```js
element._scrollTop();    // retrieve Y offset
element._scrollTop(20);  // set Y offset

element._scrollLeft();   // retrive X offset
element._scrollLeft(20); // set X offset
```

Using the regular scrollTop/scrollLeft attributes will only work on newer mobile OS's. (iOS 5+ & Android 4+)


### Infinite scroll

```js
var scroller = Scrollable.infinite(element, {
	loading : '<div class="my-loading-elem"></div>'
}, function (callback) {
	callback('<div class="new-list-item"></div>');
});
scroller.disable();
scroller.enable();
scroller.destroy();
```


### Manipulating scrollable region

```js
Scrollable.node(element).innerHTML += '<div>more stuff</div>';
```
