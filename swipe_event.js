;(function($) {
  $.browser.supportTouch = (function() {
    return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
  })();

  if (!$.browser.supportTouch) {
    return;
  }

  var doc = document;

  var boolScrolling = false;

  var scrollStartPos = [];

  window.addEventListener('touchstart', function(e) {
      scrollStartPos = [doc.body.scrollLeft, doc.body.scrollTop];
  }, false);

  window.addEventListener('touchmove', function(e) {
      if (doc.body.scrollLeft !== scrollStartPos[0]
       || doc.body.scrollTop !== scrollStartPos[1]) {
        boolScrolling = true;
      }
  }, false);

  window.addEventListener('scroll', function(e) {
      boolScrolling = false;
      scrollStartPos = [];
  }, false);

  var defaultOption = {
    direction: 'horizontal'
  };

  var proxy = function(fn, context) {
    return function() {
      fn.apply(context, arguments);
    };
  };

  var getAngle = function(pos1, pos2) {
    var x = pos2[0] - pos1[0];
    var y = pos2[1] - pos1[1];
    return Math.atan2(y, x) * 180 / Math.PI;
  };

  var getDirectionFromAngle = function(angle) {
    var directions = {
      up:    angle < -45 && angle > -135,
      down:  angle > 45 && angle < 135,
      right: angle >= -45 && angle <= 45,
      left:  angle >= 135 || angle <= -135
    };

    var direction, key;
    for (key in directions) {
      if (directions.hasOwnProperty(key) && directions[key]) {
         direction = key;
         break;
      }
    }
    return direction;
  };


  var Swipe = function(node, options) {
    this.start = null;
    this.node = node;
    this.options = options;
    this.valid = false;
    node[0].addEventListener('touchstart', proxy(this.handleTouchStart, this), false);
    node[0].addEventListener('touchmove', proxy(this.handleTouchMove, this), false);
    node[0].addEventListener('touchcancel', proxy(this.handleTouchEnd, this), false);
    node[0].addEventListener('touchend', proxy(this.handleTouchEnd, this), false);
  };

  Swipe.prototype = {
    handleTouchStart: function(e) {
      if (boolScrolling) {
        return;
      }
      this.offset = 0;
      this.end = null;
      this.start = [e.touches[0].pageX, e.touches[0].pageY];
      this.valid = true;
      this.startMove = true;
      this.savePrevDirection = '';
      document.documentElement.scrollTop = 0;
      var params = { 
        originEvent: e 
      };
      if (this.options.start) {
         this.options.start.call(this.node, params);
      }
      this.node.trigger('swipe::start', params);
    },

    handleTouchMove: function(e) {
      if (!this.valid || boolScrolling) {
        return;
      }
      var options = this.options;
      var point = e.touches[0];
      var angle = getAngle(this.start, [point.pageX, point.pageY]);
      var direction = getDirectionFromAngle(angle);
      var offset = (options.direction === 'horizontal') ? point.pageX - this.start[0] : point.pageY - this.start[1];
      var invalidDirection = (options.direction === 'horizontal' && (/up|down/.test(direction)))
        || (options.direction === 'vertical' && (/left|right/.test(direction)));

      if ( invalidDirection && this.startMove ) {
        this.valid = false;
        return;
      }

      e.preventDefault();

      this.offset = offset;
      this.valid = true;
      this.startMove = false;

      if (invalidDirection) {
         direction = this.savePrevDirection;
      }

      var params = { 
        originEvent: e, 
        point:       point,  
        offset:      this.offset,
        direction:   direction, 
        angle:       angle
       };

      if (this.options.move) {
         this.options.move.call(this.node, params);
      }
      this.node.trigger('swipe::move', params);
      this.end = this.offset;
      this.savePrevDirection = direction;
    },

    handleTouchEnd: function(e) {
      if (boolScrolling) {
          return;
      }

      if (!this.valid || !this.end) {
        this.end = null;
        this.start = null;
        return;
      }

      e.preventDefault();

      var params = { 
        originEvent: e, 
        offset:      this.end
       };

      if (this.options.end) {
         this.options.end.call(this.node, params);
      }
      this.node.trigger('swipe::end', params);
      this.end = null;
      this.start = null;
      this.valid = false;
    }

  };

  $.fn.swipeEvent = function(options) {
    return $.each(this, function() {
      var node = $(this);
      node.data('swipe', new Swipe(node, $.extend({}, defaultOption, options || {})));
    });
  };

})(jQuery);
