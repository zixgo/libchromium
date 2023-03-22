/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Predefined DHTML animations such as slide, resize and fade.
 *
 * @see ../demos/effects.html
 */

goog.provide('goog.fx.dom');
goog.provide('goog.fx.dom.BgColorTransform');
goog.provide('goog.fx.dom.ColorTransform');
goog.provide('goog.fx.dom.Fade');
goog.provide('goog.fx.dom.FadeIn');
goog.provide('goog.fx.dom.FadeInAndShow');
goog.provide('goog.fx.dom.FadeOut');
goog.provide('goog.fx.dom.FadeOutAndHide');
goog.provide('goog.fx.dom.PredefinedEffect');
goog.provide('goog.fx.dom.Resize');
goog.provide('goog.fx.dom.ResizeHeight');
goog.provide('goog.fx.dom.ResizeWidth');
goog.provide('goog.fx.dom.Scroll');
goog.provide('goog.fx.dom.Slide');
goog.provide('goog.fx.dom.SlideFrom');
goog.provide('goog.fx.dom.Swipe');

goog.require('goog.color');
goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Transition');
goog.require('goog.style');
goog.require('goog.style.bidi');
goog.requireType('goog.events.EventHandler');



/**
 * Abstract class that provides reusable functionality for predefined animations
 * that manipulate a single DOM element
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>} start Array for start coordinates.
 * @param {Array<number>} end Array for end coordinates.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.Animation}
 * @constructor
 * @struct
 */
goog.fx.dom.PredefinedEffect = function(element, start, end, time, opt_acc) {
  'use strict';
  goog.fx.dom.PredefinedEffect.base(
      this, 'constructor', start, end, time, opt_acc);

  /**
   * DOM Node that will be used in the animation
   * @type {Element}
   */
  this.element = element;

  /**
   * Whether the element is rendered right-to-left. We cache this here for
   * efficiency.
   * @private {boolean|undefined}
   */
  this.rightToLeft_;
};
goog.inherits(goog.fx.dom.PredefinedEffect, goog.fx.Animation);


/**
 * Called to update the style of the element.
 * @protected
 */
goog.fx.dom.PredefinedEffect.prototype.updateStyle = goog.nullFunction;


/**
 * Whether the DOM element being manipulated is rendered right-to-left.
 * @return {boolean} True if the DOM element is rendered right-to-left, false
 *     otherwise.
 */
goog.fx.dom.PredefinedEffect.prototype.isRightToLeft = function() {
  'use strict';
  if (this.rightToLeft_ === undefined) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.element);
  }
  return this.rightToLeft_;
};


/** @override */
goog.fx.dom.PredefinedEffect.prototype.onAnimate = function() {
  'use strict';
  this.updateStyle();
  goog.fx.dom.PredefinedEffect.superClass_.onAnimate.call(this);
};


/** @override */
goog.fx.dom.PredefinedEffect.prototype.onEnd = function() {
  'use strict';
  this.updateStyle();
  goog.fx.dom.PredefinedEffect.superClass_.onEnd.call(this);
};


/** @override */
goog.fx.dom.PredefinedEffect.prototype.onBegin = function() {
  'use strict';
  this.updateStyle();
  goog.fx.dom.PredefinedEffect.superClass_.onBegin.call(this);
};



/**
 * Creates an animation object that will slide an element from A to B.  (This
 * in effect automatically sets up the onanimate event for an Animation object)
 *
 * Start and End should be 2 dimensional arrays
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>} start 2D array for start coordinates (X, Y).
 * @param {Array<number>} end 2D array for end coordinates (X, Y).
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @struct
 */
goog.fx.dom.Slide = function(element, start, end, time, opt_acc) {
  'use strict';
  if (start.length != 2 || end.length != 2) {
    throw new Error('Start and end points must be 2D');
  }
  goog.fx.dom.Slide.base(
      this, 'constructor', element, start, end, time, opt_acc);
};
goog.inherits(goog.fx.dom.Slide, goog.fx.dom.PredefinedEffect);


/** @override */
goog.fx.dom.Slide.prototype.updateStyle = function() {
  'use strict';
  var pos = (this.isRightPositioningForRtlEnabled() && this.isRightToLeft()) ?
      'right' :
      'left';
  this.element.style[pos] = Math.round(this.coords[0]) + 'px';
  this.element.style.top = Math.round(this.coords[1]) + 'px';
};



/**
 * Slides an element from its current position.
 *
 * @param {Element} element DOM node to be used in the animation.
 * @param {Array<number>} end 2D array for end coordinates (X, Y).
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.Slide}
 * @constructor
 * @struct
 */
goog.fx.dom.SlideFrom = function(element, end, time, opt_acc) {
  'use strict';
  var offsetLeft = /** @type {!HTMLElement} */ (element).offsetLeft;
  var start = [offsetLeft, /** @type {!HTMLElement} */ (element).offsetTop];
  goog.fx.dom.SlideFrom.base(
      this, 'constructor', element, start, end, time, opt_acc);
  /** @type {?Array<number>} */
  this.startPoint;
};
goog.inherits(goog.fx.dom.SlideFrom, goog.fx.dom.Slide);


/** @override */
goog.fx.dom.SlideFrom.prototype.onBegin = function() {
  'use strict';
  var offsetLeft = this.isRightPositioningForRtlEnabled() ?
      goog.style.bidi.getOffsetStart(this.element) :
      /** @type {!HTMLElement} */ (this.element).offsetLeft;
  this.startPoint = [
    offsetLeft,
    /** @type {!HTMLElement} */ (this.element).offsetTop
  ];
  goog.fx.dom.SlideFrom.superClass_.onBegin.call(this);
};



/**
 * Creates an animation object that will slide an element into its final size.
 * Requires that the element is absolutely positioned.
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>} start 2D array for start size (W, H).
 * @param {Array<number>} end 2D array for end size (W, H).
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @struct
 */
goog.fx.dom.Swipe = function(element, start, end, time, opt_acc) {
  'use strict';
  if (start.length != 2 || end.length != 2) {
    throw new Error('Start and end points must be 2D');
  }
  goog.fx.dom.Swipe.base(
      this, 'constructor', element, start, end, time, opt_acc);

  /**
   * Maximum width for element.
   * @type {number}
   * @private
   */
  this.maxWidth_ = Math.max(this.endPoint[0], this.startPoint[0]);

  /**
   * Maximum height for element.
   * @type {number}
   * @private
   */
  this.maxHeight_ = Math.max(this.endPoint[1], this.startPoint[1]);
};
goog.inherits(goog.fx.dom.Swipe, goog.fx.dom.PredefinedEffect);


/**
 * Animation event handler that will resize an element by setting its width,
 * height and clipping.
 * @protected
 * @override
 */
goog.fx.dom.Swipe.prototype.updateStyle = function() {
  'use strict';
  var x = this.coords[0];
  var y = this.coords[1];
  this.clip_(Math.round(x), Math.round(y), this.maxWidth_, this.maxHeight_);
  this.element.style.width = Math.round(x) + 'px';
  var marginX =
      (this.isRightPositioningForRtlEnabled() && this.isRightToLeft()) ?
      'marginRight' :
      'marginLeft';

  this.element.style[marginX] = Math.round(x) - this.maxWidth_ + 'px';
  this.element.style.marginTop = Math.round(y) - this.maxHeight_ + 'px';
};


/**
 * Helper function for setting element clipping.
 * @param {number} x Current element width.
 * @param {number} y Current element height.
 * @param {number} w Maximum element width.
 * @param {number} h Maximum element height.
 * @private
 */
goog.fx.dom.Swipe.prototype.clip_ = function(x, y, w, h) {
  'use strict';
  this.element.style.clip =
      'rect(' + (h - y) + 'px ' + w + 'px ' + h + 'px ' + (w - x) + 'px)';
};



/**
 * Creates an animation object that will scroll an element from A to B.
 *
 * Start and End should be 2 dimensional arrays
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>} start 2D array for start scroll left and top.
 * @param {Array<number>} end 2D array for end scroll left and top.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @struct
 */
goog.fx.dom.Scroll = function(element, start, end, time, opt_acc) {
  'use strict';
  if (start.length != 2 || end.length != 2) {
    throw new Error('Start and end points must be 2D');
  }
  goog.fx.dom.Scroll.base(
      this, 'constructor', element, start, end, time, opt_acc);
};
goog.inherits(goog.fx.dom.Scroll, goog.fx.dom.PredefinedEffect);


/**
 * Animation event handler that will set the scroll position of an element.
 * @protected
 * @override
 */
goog.fx.dom.Scroll.prototype.updateStyle = function() {
  'use strict';
  if (this.isRightPositioningForRtlEnabled()) {
    goog.style.bidi.setScrollOffset(this.element, Math.round(this.coords[0]));
  } else {
    this.element.scrollLeft = Math.round(this.coords[0]);
  }
  this.element.scrollTop = Math.round(this.coords[1]);
};



/**
 * Creates an animation object that will resize an element between two widths
 * and heights.
 *
 * Start and End should be 2 dimensional arrays
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>} start 2D array for start width and height.
 * @param {Array<number>} end 2D array for end width and height.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @struct
 */
goog.fx.dom.Resize = function(element, start, end, time, opt_acc) {
  'use strict';
  if (start.length != 2 || end.length != 2) {
    throw new Error('Start and end points must be 2D');
  }
  goog.fx.dom.Resize.base(
      this, 'constructor', element, start, end, time, opt_acc);
};
goog.inherits(goog.fx.dom.Resize, goog.fx.dom.PredefinedEffect);


/**
 * Animation event handler that will resize an element by setting its width and
 * height.
 * @protected
 * @override
 */
goog.fx.dom.Resize.prototype.updateStyle = function() {
  'use strict';
  this.element.style.width = Math.round(this.coords[0]) + 'px';
  this.element.style.height = Math.round(this.coords[1]) + 'px';
};



/**
 * Creates an animation object that will resize an element between two widths
 *
 * Start and End should be numbers
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {number} start Start width.
 * @param {number} end End width.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @struct
 */
goog.fx.dom.ResizeWidth = function(element, start, end, time, opt_acc) {
  'use strict';
  goog.fx.dom.ResizeWidth.base(
      this, 'constructor', element, [start], [end], time, opt_acc);
};
goog.inherits(goog.fx.dom.ResizeWidth, goog.fx.dom.PredefinedEffect);


/**
 * Animation event handler that will resize an element by setting its width.
 * @protected
 * @override
 */
goog.fx.dom.ResizeWidth.prototype.updateStyle = function() {
  'use strict';
  this.element.style.width = Math.round(this.coords[0]) + 'px';
};



/**
 * Creates an animation object that will resize an element between two heights
 *
 * Start and End should be numbers
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {number} start Start height.
 * @param {number} end End height.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @struct
 */
goog.fx.dom.ResizeHeight = function(element, start, end, time, opt_acc) {
  'use strict';
  goog.fx.dom.ResizeHeight.base(
      this, 'constructor', element, [start], [end], time, opt_acc);
};
goog.inherits(goog.fx.dom.ResizeHeight, goog.fx.dom.PredefinedEffect);


/**
 * Animation event handler that will resize an element by setting its height.
 * @protected
 * @override
 */
goog.fx.dom.ResizeHeight.prototype.updateStyle = function() {
  'use strict';
  this.element.style.height = Math.round(this.coords[0]) + 'px';
};



/**
 * Creates an animation object that fades the opacity of an element between two
 * limits.
 *
 * Start and End should be floats between 0 and 1
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>|number} start 1D Array or Number with start opacity.
 * @param {Array<number>|number} end 1D Array or Number for end opacity.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @struct
 */
goog.fx.dom.Fade = function(element, start, end, time, opt_acc) {
  'use strict';
  if (typeof start === 'number') start = [start];
  if (typeof end === 'number') end = [end];

  goog.fx.dom.Fade.base(
      this, 'constructor', element, start, end, time, opt_acc);

  if (start.length != 1 || end.length != 1) {
    throw new Error('Start and end points must be 1D');
  }

  /**
   * The last opacity we set, or -1 for not set.
   * @private {number}
   */
  this.lastOpacityUpdate_ = goog.fx.dom.Fade.OPACITY_UNSET_;
};
goog.inherits(goog.fx.dom.Fade, goog.fx.dom.PredefinedEffect);


/**
 * The quantization of opacity values to use.
 * @private {number}
 */
goog.fx.dom.Fade.TOLERANCE_ = 1.0 / 0x400;  // 10-bit color


/**
 * Value indicating that the opacity must be set on next update.
 * @private {number}
 */
goog.fx.dom.Fade.OPACITY_UNSET_ = -1;


/**
 * Animation event handler that will set the opacity of an element.
 * @protected
 * @override
 */
goog.fx.dom.Fade.prototype.updateStyle = function() {
  'use strict';
  var opacity = this.coords[0];
  var delta = Math.abs(opacity - this.lastOpacityUpdate_);
  // In order to keep eager browsers from over-rendering, only update
  // on a potentially visible change in opacity.
  if (delta >= goog.fx.dom.Fade.TOLERANCE_) {
    goog.style.setOpacity(this.element, opacity);
    this.lastOpacityUpdate_ = opacity;
  }
};


/** @override */
goog.fx.dom.Fade.prototype.onBegin = function() {
  'use strict';
  this.lastOpacityUpdate_ = goog.fx.dom.Fade.OPACITY_UNSET_;
  goog.fx.dom.Fade.base(this, 'onBegin');
};


/** @override */
goog.fx.dom.Fade.prototype.onEnd = function() {
  'use strict';
  this.lastOpacityUpdate_ = goog.fx.dom.Fade.OPACITY_UNSET_;
  goog.fx.dom.Fade.base(this, 'onEnd');
};


/**
 * Animation event handler that will show the element.
 */
goog.fx.dom.Fade.prototype.show = function() {
  'use strict';
  this.element.style.display = '';
};


/**
 * Animation event handler that will hide the element
 */
goog.fx.dom.Fade.prototype.hide = function() {
  'use strict';
  this.element.style.display = 'none';
};



/**
 * Fades an element out from full opacity to completely transparent.
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.Fade}
 * @constructor
 * @struct
 */
goog.fx.dom.FadeOut = function(element, time, opt_acc) {
  'use strict';
  goog.fx.dom.FadeOut.base(this, 'constructor', element, 1, 0, time, opt_acc);
};
goog.inherits(goog.fx.dom.FadeOut, goog.fx.dom.Fade);



/**
 * Fades an element in from completely transparent to fully opacity.
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.Fade}
 * @constructor
 * @struct
 */
goog.fx.dom.FadeIn = function(element, time, opt_acc) {
  'use strict';
  goog.fx.dom.FadeIn.base(this, 'constructor', element, 0, 1, time, opt_acc);
};
goog.inherits(goog.fx.dom.FadeIn, goog.fx.dom.Fade);



/**
 * Fades an element out from full opacity to completely transparent and then
 * sets the display to 'none'
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.Fade}
 * @constructor
 * @struct
 */
goog.fx.dom.FadeOutAndHide = function(element, time, opt_acc) {
  'use strict';
  goog.fx.dom.FadeOutAndHide.base(
      this, 'constructor', element, 1, 0, time, opt_acc);
};
goog.inherits(goog.fx.dom.FadeOutAndHide, goog.fx.dom.Fade);


/** @override */
goog.fx.dom.FadeOutAndHide.prototype.onBegin = function() {
  'use strict';
  this.show();
  goog.fx.dom.FadeOutAndHide.superClass_.onBegin.call(this);
};


/** @override */
goog.fx.dom.FadeOutAndHide.prototype.onEnd = function() {
  'use strict';
  this.hide();
  goog.fx.dom.FadeOutAndHide.superClass_.onEnd.call(this);
};



/**
 * Sets an element's display to be visible and then fades an element in from
 * completely transparent to fully opaque.
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.Fade}
 * @constructor
 * @struct
 */
goog.fx.dom.FadeInAndShow = function(element, time, opt_acc) {
  'use strict';
  goog.fx.dom.FadeInAndShow.base(
      this, 'constructor', element, 0, 1, time, opt_acc);
};
goog.inherits(goog.fx.dom.FadeInAndShow, goog.fx.dom.Fade);


/** @override */
goog.fx.dom.FadeInAndShow.prototype.onBegin = function() {
  'use strict';
  this.show();
  goog.fx.dom.FadeInAndShow.superClass_.onBegin.call(this);
};



/**
 * Provides a transformation of an elements background-color.
 *
 * Start and End should be 3D arrays representing R,G,B
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>} start 3D Array for RGB of start color.
 * @param {Array<number>} end 3D Array for RGB of end color.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @struct
 */
goog.fx.dom.BgColorTransform = function(element, start, end, time, opt_acc) {
  'use strict';
  if (start.length != 3 || end.length != 3) {
    throw new Error('Start and end points must be 3D');
  }
  goog.fx.dom.BgColorTransform.base(
      this, 'constructor', element, start, end, time, opt_acc);
};
goog.inherits(goog.fx.dom.BgColorTransform, goog.fx.dom.PredefinedEffect);


/**
 * Animation event handler that will set the background-color of an element
 */
goog.fx.dom.BgColorTransform.prototype.setColor = function() {
  'use strict';
  var coordsAsInts = [];
  for (var i = 0; i < this.coords.length; i++) {
    coordsAsInts[i] = Math.round(this.coords[i]);
  }
  var color = 'rgb(' + coordsAsInts.join(',') + ')';
  this.element.style.backgroundColor = color;
};


/** @override */
goog.fx.dom.BgColorTransform.prototype.updateStyle = function() {
  'use strict';
  this.setColor();
};


/**
 * Fade elements background color from start color to the element's current
 * background color.
 *
 * Start should be a 3D array representing R,G,B
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>} start 3D Array for RGB of start color.
 * @param {number} time Length of animation in milliseconds.
 * @param {goog.events.EventHandler=} opt_eventHandler Optional event handler
 *     to use when listening for events.
 */
goog.fx.dom.bgColorFadeIn = function(element, start, time, opt_eventHandler) {
  'use strict';
  var initialBgColor = element.style.backgroundColor || '';
  var computedBgColor = goog.style.getBackgroundColor(element);
  var end;

  if (computedBgColor && computedBgColor != 'transparent' &&
      computedBgColor != 'rgba(0, 0, 0, 0)') {
    end = goog.color.hexToRgb(goog.color.parse(computedBgColor).hex);
  } else {
    end = [255, 255, 255];
  }

  var anim = new goog.fx.dom.BgColorTransform(element, start, end, time);

  function setBgColor() {
    element.style.backgroundColor = initialBgColor;
  }

  if (opt_eventHandler) {
    opt_eventHandler.listen(anim, goog.fx.Transition.EventType.END, setBgColor);
  } else {
    goog.events.listen(anim, goog.fx.Transition.EventType.END, setBgColor);
  }

  anim.play();
};



/**
 * Provides a transformation of an elements color.
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array<number>} start 3D Array representing R,G,B.
 * @param {Array<number>} end 3D Array representing R,G,B.
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @constructor
 * @struct
 * @extends {goog.fx.dom.PredefinedEffect}
 */
goog.fx.dom.ColorTransform = function(element, start, end, time, opt_acc) {
  'use strict';
  if (start.length != 3 || end.length != 3) {
    throw new Error('Start and end points must be 3D');
  }
  goog.fx.dom.ColorTransform.base(
      this, 'constructor', element, start, end, time, opt_acc);
};
goog.inherits(goog.fx.dom.ColorTransform, goog.fx.dom.PredefinedEffect);


/**
 * Animation event handler that will set the color of an element.
 * @protected
 * @override
 */
goog.fx.dom.ColorTransform.prototype.updateStyle = function() {
  'use strict';
  var coordsAsInts = [];
  for (var i = 0; i < this.coords.length; i++) {
    coordsAsInts[i] = Math.round(this.coords[i]);
  }
  var color = 'rgb(' + coordsAsInts.join(',') + ')';
  this.element.style.color = color;
};
