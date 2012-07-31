scrollable.js - Seamless scrolling for mobile devices
=====================================================

// quick description and why
Scrolling on mobile devices is inconsistent at best. scrollable.js provides a sane API that you're already familiar with to make scrolling easy. scrollable.js does not have any dependencies except for a custom version of [iScroll](http://cubiq.org/iscroll-4), which is privately included and not externalized at all.


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


### Manipulating scrollable region

When native scrolling is not available we must wrap your content and use [iScroll](http://cubiq.org/iscroll-4) to simulate scrolling.

```js
$(element).scrollableNode()
                .append('<div>more stuff</div>');
```




Standalone Usage
================

scrollable.js has no external dependencies and will work perfectly fine as a standalone library.


### Make elements scrollable

```js
Scrollable(element);
```


### Setting scroll offset

```js
element._scrollTop();    // retrieve Y offset
element._scrollTop(20);  // set Y offset

element._scrollLeft();   // retrive X offset
element._scrollLeft(20); // set X offset

// Using the regular scrollTop / scrollLeft attributes
// will only work on newer mobile OS's.
```


### Manipulating scrollable region

```js
Scrollable.node(element);
```
