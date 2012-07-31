/**
 * scrollable.js v1.0
 * Seamless scrolling for mobile devices
 * Copyright (c) 2012 Kik Interactive, github.com/kikinteractive
 * All rights reserved
 */
/**
 * iScroll v4.1.6 ~ Copyright (c) 2011 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */

var Scrollable = function (window, document, clik, Zepto, jQuery) {
	var readyCallbacks  = [],
		isReady         = false,
		nativeScrolling = false,
		bounce          = false,
		os              = mobileOS(),
		isMobile        = !!os.name,
		Scroller;

	function mobileOS () {
		var ua = navigator.userAgent,
			name, version,
			m;

		if ((m = /\bCPU.*OS (\d+(_\d+)?)/i.exec(ua))) {
			name = 'ios';
			version = m[1].replace('_', '.');
		}

		else if ((m = /\bAndroid (\d+(\.\d+)?)/.exec(ua))) {
			name = 'android';
			version = m[1];
		}

		var data = {
			name    : name,
			version : version && window.parseFloat(version)
		};

		data[ name ] = true;

		return data;
	}

	function isDOMNode (elem) {
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
	}

	function findInArray (arr, item, startIndex) {
		if (arr.indexOf) {
			return Array.prototype.indexOf.call(arr, item, startIndex);
		}

		else {
			for (var i=startIndex || 0, len=arr.length; i<len; i++) {
				if ((i in arr) && (arr[i] === item)) {
					return i;
				}
			}

			return -1;
		}
	}

	function forEachInArray (arr, callback, self) {
		if (Array.prototype.forEach) {
			Array.prototype.forEach.call(arr, callback, self);
		}

		else {
			for (var i=0, len=arr.length; i<len; i++) {
				if (i in arr) {
					callback.call(self, arr[i], i, arr);
				}
			}
		}
	}

	function onReady (callback) {
		if (isReady) {
			setTimeout(callback, 0);
		}
		else {
			readyCallbacks.push(callback);
		}
	}

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

	function setupClik () {
		if ( !clik ) {
			return;
		}

		function Scrollable () {
			enableScrolling.apply(this, arguments);
		}
		Scrollable.node = getScrollerNode;

		clik.plugin('scrollable', Scrollable);
	}

	function setupZepto () {
		if ( !Zepto ) {
			return;
		}

		Zepto.extend(Zepto.fn, {
			scrollable : function () {
				this.forEach(function (elem) {
					enableScrolling(elem);
				});
				return this;
			},
			scrollableNode : function () {
				var nodes = $();

				this.forEach(function (elem) {
					var node = getScrollerNode(elem);

					if (node) {
						nodes.push(node);
					}
				});

				return nodes;
			}
		});

		var oldScrollTop  = Zepto.fn.scrollTop,
			oldScrollLeft = Zepto.fn.scrollLeft;

		Zepto.fn.scrollTop = function (top) {
			if (typeof top === 'undefined') {
				var elem       = this[0],
					elemIsNode = isDOMNode(elem);

				if (elemIsNode && elem._scrollTop) {
					return elem._scrollTop();
				}
				else if (oldScrollTop) {
					return oldScrollTop.apply(this, arguments);
				}
				else if (elemIsNode) {
					return elem.scrollTop;
				}
				else {
					return null;
				}
			}

			this.forEach(function (elem) {
				var elemIsNode = isDOMNode(elem);

				if (elemIsNode && elem._scrollTop) {
					elem._scrollTop(top);
				}
				else if (oldScrollTop) {
					oldScrollTop.call(Zepto(elem), top);
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
					elemIsNode = isDOMNode(elem);

				if (elemIsNode && elem._scrollLeft) {
					return elem._scrollLeft();
				}
				else if (oldScrollTop) {
					return oldScrollLeft.apply(this, arguments);
				}
				else if (elemIsNode) {
					return elem.scrollLeft;
				}
				else {
					return null;
				}
			}

			this.forEach(function (elem) {
				var elemIsNode = isDOMNode(elem);

				if (elemIsNode && elem._scrollLeft) {
					elem._scrollLeft(left);
				}
				else if (oldScrollLeft) {
					oldScrollLeft.call(Zepto(elem), left);
				}
				else if (elemIsNode) {
					elem.scrollLeft = left;
				}
			});

			return this;
		};
	}

	function setupJQuery () {
		if ( !jQuery ) {
			return;
		}

		jQuery.fn.scrollable = function () {
			this.each(function () {
				enableScrolling(this);
			});
			return this;
		};
		jQuery.fn.scrollableNode = function () {
			var nodes = $();

			this.each(function () {
				var node = getScrollerNode(this);

				if (node) {
					nodes = nodes.add(node);
				}
			});

			return nodes;
		};

		var oldScrollTop  = jQuery.fn.scrollTop,
			oldScrollLeft = jQuery.fn.scrollLeft;

		jQuery.fn.scrollTop = function (top) {
			if (typeof top === 'undefined') {
				var elem = this[0];

				if (isDOMNode(elem) && elem._scrollTop) {
					return elem._scrollTop();
				}
				else {
					return oldScrollTop.apply(this, arguments);
				}
			}

			this.each(function () {
				if (isDOMNode(this) && this._scrollTop) {
					this._scrollTop(top);
				}
				else {
					oldScrollTop.call(jQuery(this), top);
				}
			});

			return this;
		};

		jQuery.fn.scrollLeft = function (left) {
			if (typeof left === 'undefined') {
				var elem = this[0];

				if (isDOMNode(elem) && elem._scrollLeft) {
					return elem._scrollLeft();
				}
				else {
					return oldScrollLeft.apply(this, arguments);
				}
			}

			this.each(function () {
				if (isDOMNode(this) && this._scrollLeft) {
					this._scrollLeft(left);
				}
				else {
					oldScrollLeft.call(jQuery(this), left);
				}
			});

			return this;
		};
	}

	function publicise () {
		setupClik();
		setupZepto();
		setupJQuery();

		function Scrollable () {
			enableScrolling.apply(this, arguments);
		}
		Scrollable.node = getScrollerNode;
		return Scrollable;
	}

	function main () {
		if (os.ios) {
			if (os.version >= 5) {
				nativeScrolling = true;
			}
			else {
				bounce = true;
			}
		}
		else if (os.android) {
			if (os.version >= 4) {
				nativeScrolling = true;
			}
			else {
				bounce = false;
			}
		}

		if (!nativeScrolling && isMobile) {
			setupIScroll();
		}

		fireOnReady(fireReadyEvent);

		return publicise();
	}

	function setupIScroll () {
		var iScroll=function(h,t){function p(b){if(""===j)return b;b=b.charAt(0).toUpperCase()+b.substr(1);return j+b}var f=Math,y=t.createElement("div").style,j;a:{for(var n=["t","webkitT","MozT","msT","OT"],E,u=0,J=n.length;u<J;u++)if(E=n[u]+"ransform",E in y){j=n[u].substr(0,n[u].length-1);break a}j=!1}var m=j?"-"+j.toLowerCase()+"-":"",o=p("transform"),K=p("transitionProperty"),r=p("transitionDuration"),L=p("transformOrigin"),M=p("transitionTimingFunction"),z=p("transitionDelay"),A=/android/gi.test(navigator.appVersion),
		F=/iphone|ipad/gi.test(navigator.appVersion),n=/hp-tablet/gi.test(navigator.appVersion),G=p("perspective")in y,l="ontouchstart"in h&&!n,H=!!j,N=p("transition")in y,B="onorientationchange"in h?"orientationchange":"resize",C=l?"touchstart":"mousedown",v=l?"touchmove":"mousemove",w=l?"touchend":"mouseup",x=l?"touchcancel":"mouseup",D="Moz"==j?"DOMMouseScroll":"mousewheel",s;s=!1===j?!1:{"":"transitionend",webkit:"webkitTransitionEnd",Moz:"transitionend",O:"oTransitionEnd",ms:"MSTransitionEnd"}[j];var O=
		h.requestAnimationFrame||h.webkitRequestAnimationFrame||h.mozRequestAnimationFrame||h.oRequestAnimationFrame||h.msRequestAnimationFrame||function(b){return setTimeout(b,1)},I=h.cancelRequestAnimationFrame||h.webkitCancelAnimationFrame||h.webkitCancelRequestAnimationFrame||h.mozCancelRequestAnimationFrame||h.oCancelRequestAnimationFrame||h.msCancelRequestAnimationFrame||clearTimeout,q=G?" translateZ(0)":"",n=function(b,a){var c=this,d;c.wrapper="object"==typeof b?b:t.getElementById(b);c.wrapper.style.overflow=
		"hidden";c.scroller=c.wrapper.children[0];c.options={hScroll:!0,vScroll:!0,x:0,y:0,bounce:!0,bounceLock:!1,momentum:!0,lockDirection:!0,useTransform:!0,useTransition:!1,topOffset:0,checkDOMChanges:!1,handleClick:!0,hScrollbar:!0,vScrollbar:!0,fixedScrollbar:A,hideScrollbar:F,fadeScrollbar:F&&G,scrollbarClass:"",zoom:!1,zoomMin:1,zoomMax:4,doubleTapZoom:2,wheelAction:"scroll",snap:!1,snapThreshold:1,onRefresh:null,onBeforeScrollStart:function(a){a.preventDefault()},onScrollStart:null,onBeforeScrollMove:null,
		onScrollMove:null,onBeforeScrollEnd:null,onScrollEnd:null,onTouchEnd:null,onDestroy:null,onZoomStart:null,onZoom:null,onZoomEnd:null};for(d in a)c.options[d]=a[d];c.x=c.options.x;c.y=c.options.y;c.options.useTransform=H&&c.options.useTransform;c.options.hScrollbar=c.options.hScroll&&c.options.hScrollbar;c.options.vScrollbar=c.options.vScroll&&c.options.vScrollbar;c.options.zoom=c.options.useTransform&&c.options.zoom;c.options.useTransition=N&&c.options.useTransition;c.options.zoom&&A&&(q="");c.scroller.style[K]=
		c.options.useTransform?m+"transform":"top left";c.scroller.style[r]="0";c.scroller.style[L]="0 0";c.options.useTransition&&(c.scroller.style[M]="cubic-bezier(0.33,0.66,0.66,1)");c.options.useTransform?c.scroller.style[o]="translate("+c.x+"px,"+c.y+"px)"+q:c.scroller.style.cssText+=";position:absolute;top:"+c.y+"px;left:"+c.x+"px";c.options.useTransition&&(c.options.fixedScrollbar=!0);c.refresh();c._bind(B,h);c._bind(C);l||(c._bind("mouseout",c.wrapper),"none"!=c.options.wheelAction&&c._bind(D));c.options.checkDOMChanges&&
		(c.checkDOMTime=setInterval(function(){c._checkDOMChanges()},500))};n.prototype={enabled:!0,x:0,y:0,steps:[],scale:1,currPageX:0,currPageY:0,pagesX:[],pagesY:[],aniTime:null,wheelZoomCount:0,handleEvent:function(b){switch(b.type){case C:if(!l&&0!==b.button)break;this._start(b);break;case v:this._move(b);break;case w:case x:this._end(b);break;case B:this._resize();break;case D:this._wheel(b);break;case "mouseout":this._mouseout(b);break;case s:this._transitionEnd(b)}},_checkDOMChanges:function(){!this.moved&&
		(!this.zoomed&&!(this.animating||this.scrollerW==this.scroller.offsetWidth*this.scale&&this.scrollerH==this.scroller.offsetHeight*this.scale))&&this.refresh()},_scrollbar:function(b){var a;this[b+"Scrollbar"]?(this[b+"ScrollbarWrapper"]||(a=t.createElement("div"),this.options.scrollbarClass?a.className=this.options.scrollbarClass+b.toUpperCase():a.style.cssText="position:absolute;z-index:100;"+("h"==b?"height:7px;bottom:1px;left:2px;right:"+(this.vScrollbar?"7":"2")+"px":"width:7px;bottom:"+(this.hScrollbar?
		"7":"2")+"px;top:2px;right:1px"),a.style.cssText+=";pointer-events:none;"+m+"transition-property:opacity;"+m+"transition-duration:"+(this.options.fadeScrollbar?"350ms":"0")+";overflow:hidden;opacity:"+(this.options.hideScrollbar?"0":"1"),this.wrapper.appendChild(a),this[b+"ScrollbarWrapper"]=a,a=t.createElement("div"),this.options.scrollbarClass||(a.style.cssText="position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);"+m+"background-clip:padding-box;"+m+"box-sizing:border-box;"+
		("h"==b?"height:100%":"width:100%")+";"+m+"border-radius:3px;border-radius:3px"),a.style.cssText+=";pointer-events:none;"+m+"transition-property:"+m+"transform;"+m+"transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);"+m+"transition-duration:0;"+m+"transform: translate(0,0)"+q,this.options.useTransition&&(a.style.cssText+=";"+m+"transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)"),this[b+"ScrollbarWrapper"].appendChild(a),this[b+"ScrollbarIndicator"]=a),"h"==b?(this.hScrollbarSize=this.hScrollbarWrapper.clientWidth,
		this.hScrollbarIndicatorSize=f.max(f.round(this.hScrollbarSize*this.hScrollbarSize/this.scrollerW),8),this.hScrollbarIndicator.style.width=this.hScrollbarIndicatorSize+"px",this.hScrollbarMaxScroll=this.hScrollbarSize-this.hScrollbarIndicatorSize,this.hScrollbarProp=this.hScrollbarMaxScroll/this.maxScrollX):(this.vScrollbarSize=this.vScrollbarWrapper.clientHeight,this.vScrollbarIndicatorSize=f.max(f.round(this.vScrollbarSize*this.vScrollbarSize/this.scrollerH),8),this.vScrollbarIndicator.style.height=
		this.vScrollbarIndicatorSize+"px",this.vScrollbarMaxScroll=this.vScrollbarSize-this.vScrollbarIndicatorSize,this.vScrollbarProp=this.vScrollbarMaxScroll/this.maxScrollY),this._scrollbarPos(b,!0)):this[b+"ScrollbarWrapper"]&&(H&&(this[b+"ScrollbarIndicator"].style[o]=""),this[b+"ScrollbarWrapper"].parentNode.removeChild(this[b+"ScrollbarWrapper"]),this[b+"ScrollbarWrapper"]=null,this[b+"ScrollbarIndicator"]=null)},_resize:function(){var b=this;setTimeout(function(){b.refresh()},A?200:0)},_pos:function(b,
		a){this.zoomed||(b=this.hScroll?b:0,a=this.vScroll?a:0,this.options.useTransform?this.scroller.style[o]="translate("+b+"px,"+a+"px) scale("+this.scale+")"+q:(b=f.round(b),a=f.round(a),this.scroller.style.left=b+"px",this.scroller.style.top=a+"px"),this.x=b,this.y=a,this._scrollbarPos("h"),this._scrollbarPos("v"))},_scrollbarPos:function(b,a){var c="h"==b?this.x:this.y;this[b+"Scrollbar"]&&(c*=this[b+"ScrollbarProp"],0>c?(this.options.fixedScrollbar||(c=this[b+"ScrollbarIndicatorSize"]+f.round(3*c),
		8>c&&(c=8),this[b+"ScrollbarIndicator"].style["h"==b?"width":"height"]=c+"px"),c=0):c>this[b+"ScrollbarMaxScroll"]&&(this.options.fixedScrollbar?c=this[b+"ScrollbarMaxScroll"]:(c=this[b+"ScrollbarIndicatorSize"]-f.round(3*(c-this[b+"ScrollbarMaxScroll"])),8>c&&(c=8),this[b+"ScrollbarIndicator"].style["h"==b?"width":"height"]=c+"px",c=this[b+"ScrollbarMaxScroll"]+(this[b+"ScrollbarIndicatorSize"]-c))),this[b+"ScrollbarWrapper"].style[z]="0",this[b+"ScrollbarWrapper"].style.opacity=a&&this.options.hideScrollbar?
		"0":"1",this[b+"ScrollbarIndicator"].style[o]="translate("+("h"==b?c+"px,0)":"0,"+c+"px)")+q)},_start:function(b){var a=l?b.touches[0]:b,c,d;if(this.enabled){this.options.onBeforeScrollStart&&this.options.onBeforeScrollStart.call(this,b);(this.options.useTransition||this.options.zoom)&&this._transitionTime(0);this.zoomed=this.animating=this.moved=!1;this.dirY=this.dirX=this.absDistY=this.absDistX=this.distY=this.distX=0;this.options.zoom&&(l&&1<b.touches.length)&&(d=f.abs(b.touches[0].pageX-b.touches[1].pageX),
		c=f.abs(b.touches[0].pageY-b.touches[1].pageY),this.touchesDistStart=f.sqrt(d*d+c*c),this.originX=f.abs(b.touches[0].pageX+b.touches[1].pageX-2*this.wrapperOffsetLeft)/2-this.x,this.originY=f.abs(b.touches[0].pageY+b.touches[1].pageY-2*this.wrapperOffsetTop)/2-this.y,this.options.onZoomStart&&this.options.onZoomStart.call(this,b));if(this.options.momentum&&(this.options.useTransform?(c=getComputedStyle(this.scroller,null)[o].replace(/[^0-9\-.,]/g,"").split(","),d=1*c[4],c=1*c[5]):(d=1*getComputedStyle(this.scroller,
		null).left.replace(/[^0-9-]/g,""),c=1*getComputedStyle(this.scroller,null).top.replace(/[^0-9-]/g,"")),d!=this.x||c!=this.y))this.options.useTransition?this._unbind(s):I(this.aniTime),this.steps=[],this._pos(d,c);this.absStartX=this.x;this.absStartY=this.y;this.startX=this.x;this.startY=this.y;this.pointX=a.pageX;this.pointY=a.pageY;this.startTime=b.timeStamp||Date.now();this.options.onScrollStart&&this.options.onScrollStart.call(this,b);this._bind(v);this._bind(w);this._bind(x)}},_move:function(b){var a=
		l?b.touches[0]:b,c=a.pageX-this.pointX,d=a.pageY-this.pointY,e=this.x+c,g=this.y+d,i=b.timeStamp||Date.now();this.options.onBeforeScrollMove&&this.options.onBeforeScrollMove.call(this,b);if(this.options.zoom&&l&&1<b.touches.length)e=f.abs(b.touches[0].pageX-b.touches[1].pageX),g=f.abs(b.touches[0].pageY-b.touches[1].pageY),this.touchesDist=f.sqrt(e*e+g*g),this.zoomed=!0,a=1/this.touchesDistStart*this.touchesDist*this.scale,a<this.options.zoomMin?a=0.5*this.options.zoomMin*Math.pow(2,a/this.options.zoomMin):
		a>this.options.zoomMax&&(a=2*this.options.zoomMax*Math.pow(0.5,this.options.zoomMax/a)),this.lastScale=a/this.scale,e=this.originX-this.originX*this.lastScale+this.x,g=this.originY-this.originY*this.lastScale+this.y,this.scroller.style[o]="translate("+e+"px,"+g+"px) scale("+a+")"+q,this.options.onZoom&&this.options.onZoom.call(this,b);else{this.pointX=a.pageX;this.pointY=a.pageY;if(0<e||e<this.maxScrollX)e=this.options.bounce?this.x+c/2:0<=e||0<=this.maxScrollX?0:this.maxScrollX;if(g>this.minScrollY||
		g<this.maxScrollY)g=this.options.bounce?this.y+d/2:g>=this.minScrollY||0<=this.maxScrollY?this.minScrollY:this.maxScrollY;this.distX+=c;this.distY+=d;this.absDistX=f.abs(this.distX);this.absDistY=f.abs(this.distY);6>this.absDistX&&6>this.absDistY||(this.options.lockDirection&&(this.absDistX>this.absDistY+5?(g=this.y,d=0):this.absDistY>this.absDistX+5&&(e=this.x,c=0)),this.moved=!0,this._pos(e,g),this.dirX=0<c?-1:0>c?1:0,this.dirY=0<d?-1:0>d?1:0,300<i-this.startTime&&(this.startTime=i,this.startX=
		this.x,this.startY=this.y),this.options.onScrollMove&&this.options.onScrollMove.call(this,b))}},_end:function(b){if(!(l&&0!==b.touches.length)){var a=this,c=l?b.changedTouches[0]:b,d,e,g={dist:0,time:0},i={dist:0,time:0},h=(b.timeStamp||Date.now())-a.startTime,k=a.x,j=a.y;a._unbind(v);a._unbind(w);a._unbind(x);a.options.onBeforeScrollEnd&&a.options.onBeforeScrollEnd.call(a,b);if(a.zoomed)k=a.scale*a.lastScale,k=Math.max(a.options.zoomMin,k),k=Math.min(a.options.zoomMax,k),a.lastScale=k/a.scale,a.scale=
		k,a.x=a.originX-a.originX*a.lastScale+a.x,a.y=a.originY-a.originY*a.lastScale+a.y,a.scroller.style[r]="200ms",a.scroller.style[o]="translate("+a.x+"px,"+a.y+"px) scale("+a.scale+")"+q,a.zoomed=!1,a.refresh(),a.options.onZoomEnd&&a.options.onZoomEnd.call(a,b);else{if(a.moved){if(300>h&&a.options.momentum){g=k?a._momentum(k-a.startX,h,-a.x,a.scrollerW-a.wrapperW+a.x,a.options.bounce?a.wrapperW:0):g;i=j?a._momentum(j-a.startY,h,-a.y,0>a.maxScrollY?a.scrollerH-a.wrapperH+a.y-a.minScrollY:0,a.options.bounce?
		a.wrapperH:0):i;k=a.x+g.dist;j=a.y+i.dist;if(0<a.x&&0<k||a.x<a.maxScrollX&&k<a.maxScrollX)g={dist:0,time:0};if(a.y>a.minScrollY&&j>a.minScrollY||a.y<a.maxScrollY&&j<a.maxScrollY)i={dist:0,time:0}}g.dist||i.dist?(g=f.max(f.max(g.time,i.time),10),a.options.snap&&(i=k-a.absStartX,h=j-a.absStartY,f.abs(i)<a.options.snapThreshold&&f.abs(h)<a.options.snapThreshold?a.scrollTo(a.absStartX,a.absStartY,200):(i=a._snap(k,j),k=i.x,j=i.y,g=f.max(i.time,g))),a.scrollTo(f.round(k),f.round(j),g)):a.options.snap?
		(i=k-a.absStartX,h=j-a.absStartY,f.abs(i)<a.options.snapThreshold&&f.abs(h)<a.options.snapThreshold?a.scrollTo(a.absStartX,a.absStartY,200):(i=a._snap(a.x,a.y),(i.x!=a.x||i.y!=a.y)&&a.scrollTo(i.x,i.y,i.time))):a._resetPos(200)}else l&&(a.doubleTapTimer&&a.options.zoom?(clearTimeout(a.doubleTapTimer),a.doubleTapTimer=null,a.options.onZoomStart&&a.options.onZoomStart.call(a,b),a.zoom(a.pointX,a.pointY,1==a.scale?a.options.doubleTapZoom:1),a.options.onZoomEnd&&setTimeout(function(){a.options.onZoomEnd.call(a,
		b)},200)):this.options.handleClick&&(a.doubleTapTimer=setTimeout(function(){a.doubleTapTimer=null;for(d=c.target;1!=d.nodeType;)d=d.parentNode;"SELECT"!=d.tagName&&("INPUT"!=d.tagName&&"TEXTAREA"!=d.tagName)&&(e=t.createEvent("MouseEvents"),e.initMouseEvent("click",!0,!0,b.view,1,c.screenX,c.screenY,c.clientX,c.clientY,b.ctrlKey,b.altKey,b.shiftKey,b.metaKey,0,null),e._fake=!0,d.dispatchEvent(e))},a.options.zoom?250:0))),a._resetPos(200);a.options.onTouchEnd&&a.options.onTouchEnd.call(a,b)}}},_resetPos:function(b){var a=
		0<=this.x?0:this.x<this.maxScrollX?this.maxScrollX:this.x,c=this.y>=this.minScrollY||0<this.maxScrollY?this.minScrollY:this.y<this.maxScrollY?this.maxScrollY:this.y;if(a==this.x&&c==this.y){if(this.moved&&(this.moved=!1,this.options.onScrollEnd&&this.options.onScrollEnd.call(this)),this.hScrollbar&&this.options.hideScrollbar&&("webkit"==j&&(this.hScrollbarWrapper.style[z]="300ms"),this.hScrollbarWrapper.style.opacity="0"),this.vScrollbar&&this.options.hideScrollbar)"webkit"==j&&(this.vScrollbarWrapper.style[z]=
		"300ms"),this.vScrollbarWrapper.style.opacity="0"}else this.scrollTo(a,c,b||0)},_wheel:function(b){var a=this,c,d;if("wheelDeltaX"in b)c=b.wheelDeltaX/12,d=b.wheelDeltaY/12;else if("wheelDelta"in b)c=d=b.wheelDelta/12;else if("detail"in b)c=d=3*-b.detail;else return;if("zoom"==a.options.wheelAction){if(d=a.scale*Math.pow(2,1/3*(d?d/Math.abs(d):0)),d<a.options.zoomMin&&(d=a.options.zoomMin),d>a.options.zoomMax&&(d=a.options.zoomMax),d!=a.scale)!a.wheelZoomCount&&a.options.onZoomStart&&a.options.onZoomStart.call(a,
		b),a.wheelZoomCount++,a.zoom(b.pageX,b.pageY,d,400),setTimeout(function(){a.wheelZoomCount--;!a.wheelZoomCount&&a.options.onZoomEnd&&a.options.onZoomEnd.call(a,b)},400)}else c=a.x+c,d=a.y+d,0<c?c=0:c<a.maxScrollX&&(c=a.maxScrollX),d>a.minScrollY?d=a.minScrollY:d<a.maxScrollY&&(d=a.maxScrollY),0>a.maxScrollY&&a.scrollTo(c,d,0)},_mouseout:function(b){var a=b.relatedTarget;if(a)for(;a=a.parentNode;)if(a==this.wrapper)return;this._end(b)},_transitionEnd:function(b){b.target==this.scroller&&(this._unbind(s),
		this._startAni())},_startAni:function(){var b=this,a=b.x,c=b.y,d=Date.now(),e,g,i;b.animating||(b.steps.length?(e=b.steps.shift(),e.x==a&&e.y==c&&(e.time=0),b.animating=!0,b.moved=!0,b.options.useTransition)?(b._transitionTime(e.time),b._pos(e.x,e.y),b.animating=!1,e.time?b._bind(s):b._resetPos(0)):(i=function(){var h=Date.now(),j;if(h>=d+e.time){b._pos(e.x,e.y);b.animating=false;b.options.onAnimationEnd&&b.options.onAnimationEnd.call(b);b._startAni()}else{h=(h-d)/e.time-1;g=f.sqrt(1-h*h);h=(e.x-
		a)*g+a;j=(e.y-c)*g+c;b._pos(h,j);if(b.animating)b.aniTime=O(i)}},i()):b._resetPos(400))},_transitionTime:function(b){b+="ms";this.scroller.style[r]=b;this.hScrollbar&&(this.hScrollbarIndicator.style[r]=b);this.vScrollbar&&(this.vScrollbarIndicator.style[r]=b)},_momentum:function(b,a,c,d,e){var a=f.abs(b)/a,g=a*a/0.0012;0<b&&g>c?(c+=e/(6/(6E-4*(g/a))),a=a*c/g,g=c):0>b&&g>d&&(d+=e/(6/(6E-4*(g/a))),a=a*d/g,g=d);return{dist:g*(0>b?-1:1),time:f.round(a/6E-4)}},_offset:function(b){for(var a=-b.offsetLeft,
		c=-b.offsetTop;b=b.offsetParent;)a-=b.offsetLeft,c-=b.offsetTop;b!=this.wrapper&&(a*=this.scale,c*=this.scale);return{left:a,top:c}},_snap:function(b,a){var c,d,e;e=this.pagesX.length-1;c=0;for(d=this.pagesX.length;c<d;c++)if(b>=this.pagesX[c]){e=c;break}e==this.currPageX&&(0<e&&0>this.dirX)&&e--;b=this.pagesX[e];d=(d=f.abs(b-this.pagesX[this.currPageX]))?500*(f.abs(this.x-b)/d):0;this.currPageX=e;e=this.pagesY.length-1;for(c=0;c<e;c++)if(a>=this.pagesY[c]){e=c;break}e==this.currPageY&&(0<e&&0>this.dirY)&&
		e--;a=this.pagesY[e];c=(c=f.abs(a-this.pagesY[this.currPageY]))?500*(f.abs(this.y-a)/c):0;this.currPageY=e;e=f.round(f.max(d,c))||200;return{x:b,y:a,time:e}},_bind:function(b,a,c){(a||this.scroller).addEventListener(b,this,!!c)},_unbind:function(b,a,c){(a||this.scroller).removeEventListener(b,this,!!c)},destroy:function(){this.scroller.style[o]="";this.vScrollbar=this.hScrollbar=!1;this._scrollbar("h");this._scrollbar("v");this._unbind(B,h);this._unbind(C);this._unbind(v);this._unbind(w);this._unbind(x);
		this.options.hasTouch||(this._unbind("mouseout",this.wrapper),this._unbind(D));this.options.useTransition&&this._unbind(s);this.options.checkDOMChanges&&clearInterval(this.checkDOMTime);this.options.onDestroy&&this.options.onDestroy.call(this)},refresh:function(){var b,a,c,d=0;a=0;this.scale<this.options.zoomMin&&(this.scale=this.options.zoomMin);this.wrapperW=this.wrapper.clientWidth||1;this.wrapperH=this.wrapper.clientHeight||1;this.minScrollY=-this.options.topOffset||0;this.scrollerW=f.round(this.scroller.offsetWidth*
		this.scale);this.scrollerH=f.round((this.scroller.offsetHeight+this.minScrollY)*this.scale);this.maxScrollX=this.wrapperW-this.scrollerW;this.maxScrollY=this.wrapperH-this.scrollerH+this.minScrollY;this.dirY=this.dirX=0;this.options.onRefresh&&this.options.onRefresh.call(this);this.hScroll=this.options.hScroll&&0>this.maxScrollX;this.vScroll=this.options.vScroll&&(!this.options.bounceLock&&!this.hScroll||this.scrollerH>this.wrapperH);this.hScrollbar=this.hScroll&&this.options.hScrollbar;this.vScrollbar=
		this.vScroll&&this.options.vScrollbar&&this.scrollerH>this.wrapperH;b=this._offset(this.wrapper);this.wrapperOffsetLeft=-b.left;this.wrapperOffsetTop=-b.top;if("string"==typeof this.options.snap){this.pagesX=[];this.pagesY=[];c=this.scroller.querySelectorAll(this.options.snap);b=0;for(a=c.length;b<a;b++)d=this._offset(c[b]),d.left+=this.wrapperOffsetLeft,d.top+=this.wrapperOffsetTop,this.pagesX[b]=d.left<this.maxScrollX?this.maxScrollX:d.left*this.scale,this.pagesY[b]=d.top<this.maxScrollY?this.maxScrollY:
		d.top*this.scale}else if(this.options.snap){for(this.pagesX=[];d>=this.maxScrollX;)this.pagesX[a]=d,d-=this.wrapperW,a++;this.maxScrollX%this.wrapperW&&(this.pagesX[this.pagesX.length]=this.maxScrollX-this.pagesX[this.pagesX.length-1]+this.pagesX[this.pagesX.length-1]);a=d=0;for(this.pagesY=[];d>=this.maxScrollY;)this.pagesY[a]=d,d-=this.wrapperH,a++;this.maxScrollY%this.wrapperH&&(this.pagesY[this.pagesY.length]=this.maxScrollY-this.pagesY[this.pagesY.length-1]+this.pagesY[this.pagesY.length-1])}this._scrollbar("h");
		this._scrollbar("v");this.zoomed||(this.scroller.style[r]="0",this._resetPos(200))},scrollTo:function(b,a,c,d){var e=b;this.stop();e.length||(e=[{x:b,y:a,time:c,relative:d}]);b=0;for(a=e.length;b<a;b++)e[b].relative&&(e[b].x=this.x-e[b].x,e[b].y=this.y-e[b].y),this.steps.push({x:e[b].x,y:e[b].y,time:e[b].time||0});this._startAni()},scrollToElement:function(b,a){var c;if(b=b.nodeType?b:this.scroller.querySelector(b))c=this._offset(b),c.left+=this.wrapperOffsetLeft,c.top+=this.wrapperOffsetTop,c.left=
		0<c.left?0:c.left<this.maxScrollX?this.maxScrollX:c.left,c.top=c.top>this.minScrollY?this.minScrollY:c.top<this.maxScrollY?this.maxScrollY:c.top,a=void 0===a?f.max(2*f.abs(c.left),2*f.abs(c.top)):a,this.scrollTo(c.left,c.top,a)},scrollToPage:function(b,a,c){c=void 0===c?400:c;this.options.onScrollStart&&this.options.onScrollStart.call(this);if(this.options.snap)b="next"==b?this.currPageX+1:"prev"==b?this.currPageX-1:b,a="next"==a?this.currPageY+1:"prev"==a?this.currPageY-1:a,b=0>b?0:b>this.pagesX.length-
		1?this.pagesX.length-1:b,a=0>a?0:a>this.pagesY.length-1?this.pagesY.length-1:a,this.currPageX=b,this.currPageY=a,b=this.pagesX[b],a=this.pagesY[a];else if(b*=-this.wrapperW,a*=-this.wrapperH,b<this.maxScrollX&&(b=this.maxScrollX),a<this.maxScrollY)a=this.maxScrollY;this.scrollTo(b,a,c)},disable:function(){this.stop();this._resetPos(0);this.enabled=!1;this._unbind(v);this._unbind(w);this._unbind(x)},enable:function(){this.enabled=!0},stop:function(){this.options.useTransition?this._unbind(s):I(this.aniTime);
		this.steps=[];this.animating=this.moved=!1},zoom:function(b,a,c,d){var e=c/this.scale;this.options.useTransform&&(this.zoomed=!0,d=void 0===d?200:d,b=b-this.wrapperOffsetLeft-this.x,a=a-this.wrapperOffsetTop-this.y,this.x=b-b*e+this.x,this.y=a-a*e+this.y,this.scale=c,this.refresh(),this.x=0<this.x?0:this.x<this.maxScrollX?this.maxScrollX:this.x,this.y=this.y>this.minScrollY?this.minScrollY:this.y<this.maxScrollY?this.maxScrollY:this.y,this.scroller.style[r]=d+"ms",this.scroller.style[o]="translate("+
		this.x+"px,"+this.y+"px) scale("+c+")"+q,this.zoomed=!1)},isReady:function(){return!this.moved&&!this.zoomed&&!this.animating}};y=null;return n}(window,document);

		Scroller = iScroll;
	}

	function enableScrolling (elem) {
		if ( !isDOMNode(elem) ) {
			throw elem + ' is not a DOM element';
		}

		if (elem._scrollable) {
			return;
		}
		elem._scrollable = true;

		elem.style.overflow = 'scroll';

		elem._scrollTop = function (top) {
			if (typeof top === 'undefined') {
				return scroller ? Math.max(-scroller.y, 0) : elem.scrollTop;
			}

			if (!isMobile || nativeScrolling) {
				elem.scrollTop = top;
				return;
			}

			onReady(function () {
				scroller.scrollTo(scroller.x, Math.max(-top, 0), 1);
			});
		};
		elem._scrollLeft = function (left) {
			if (typeof left === 'undefined') {
				return scroller ? Math.max(-scroller.x, 0) : elem.scrollLeft;
			}

			if (!isMobile || nativeScrolling) {
				elem.scrollLeft = left;
				return;
			}

			onReady(function () {
				scroller.scrollTo(Math.max(-left, 0), scroller.y, 1);
			});
		};

		if ( !isMobile ) {
			return;
		}

		if (nativeScrolling) {
			elem.style['-webkit-overflow-scrolling'] = 'touch';
			return;
		}

		var wrapper  = document.createElement('div'),
			children = Array.prototype.slice.call(elem.childNodes || []);
		forEachInArray(children, function (child) {
			var oldChild = elem.removeChild(child);
			wrapper.appendChild(oldChild);
		});
		elem.appendChild(wrapper);

		var scroller;

		elem._iScroll = true;

		onReady(function () {
			scroller = new Scroller(elem, {
				checkDOMChanges   : true,
				useTransform      : true,
				useTransition     : true,
				hScrollbar        : false,
				vScrollbar        : false,
				bounce            : bounce,
				onBeforeScrollEnd : onScroll,
				onScrollEnd       : onScroll
			});
		});

		function onScroll () {
			if (elem.dispatchEvent) {
				var evt = document.createEvent('MouseEvents');
				evt.initMouseEvent(
					'scroll', true , true , window,
					0       , 0    , 0    , 0     , 0,
					false   , false, false, false ,
					0       , null
				);
				elem.dispatchEvent(evt);
			}
		}
	}

	function getScrollerNode (elem) {
		if (!isDOMNode(elem) || !elem._scrollable) {
			return;
		}

		if (elem._iScroll) {
			return elem.childNodes[0];
		}
		else {
			return elem;
		}
	}

	return main();
}(window, document, window.clik, window.Zepto, window.jQuery);