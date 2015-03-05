# AfterMax

## Introduction
Complex animation in HTML has traditionally been a very abstracted process.  An animator develops storyboards and passes them along to developers for implementation.  The developer codes the animation and provides the result back to the animator. The animator provides feedback, usually via text, and the process continues until the desired result is achieved.

## A better way
AfterMax provides a pipeline directly from Adobe After Effects to Greensock TweenMax / TimelineMax.


## Requirements

* [After Effects CC](http://www.adobe.com/products/aftereffects.html)

## Dependencies
* [GreenSock TweenMax](http://greensock.com/tweenmax)
* [GreenSock TimelineMax](http://greensock.com/timelinemax)
* [JSON2](https://github.com/douglascrockford/JSON-js)

## Usage

* Create your After Effects document.
* Name your layers to match your dom elements (include # & . classifiers)
* Run export script
* Choose a filename
* Resolve DOM dependencies
	* Name your elements to match the
	* Make sure the container has CSS perspective turned on.
	* Include the TweenMax library
		* Either download from: https://github.com/greensock/GreenSock-JS/
		* Or link to via CDN at: http://cdnjs.cloudflare.com/ajax/libs/gsap/1.16.0/TweenMax.min.js

## Questions

**Why TweenMax / TimelineMax? Why not (TweenLite / TimelineLite / 3rd Party tweening library)?
**
It's what I'm most familiar with.  Would love to see things forked to other libraries.

**Why the Max versions of the libraries?
**
One dependency @ ~100k supports all of our animation needs.
TweenMax cleanly animates CSS properties in a very readable, simple format.

**Why doesn't this work w/ After Effects < CC?
**
Adobe changed up the ExtendScript format creating incompatibilities for earlier versions.

**How buggy is this?
**
There are only six bugs, but they're pretty much all-encompassing.





## Version History

* 1.0 - Initial commit


