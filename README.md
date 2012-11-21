SwipeEvent
===================
这不是一个大而全的手势库。它要做的只是更好识别swipe动作。

*  依赖
jQuery 1.4 +

*  用法

        node.swipeEvent({
          start: function(sw) {
            // 其实大多数情况下不需要它
          },

          move: function(sw) {
            // sw参数说明见下面 
          },
          end: function(sw) {
            // 重置一些东西
          }
        });


*  实际用例：（大部分是业务代码是你不需要的）

        node.swipeEvent({
        move: function(sw) {
            var offset = sw.offset;
            direction = sw.direction;
            if (
              (carousel.currentIndex === carousel.config.totalPageNum - 1 && direction === 'left') || 
              (carousel.currentIndex === 0 && direction === 'right')) 
            {
              offset = (offset > screen.width/3) ? Math.log(offset) * 20 + offset/10 : offset / 2;
              rebound = true;
            }
            bd[0].style.webkitTransform = 'translate3d(' + offset + 'px, 0, 0)';
        },
        end: function(sw) {
            bd[0].style.webkitTransform = 'translate3d(0, 0, 0)';
            if (rebound) {
              bd[0].style.webkitTransitionDuration = '600ms';
              rebound = false;
              return;
            }
        
           if (Math.abs(sw.offset) < carousel.config.width) {
             bd.css('left', bd.position().left + sw.offset);
           } else {
             bd[0].style.webkitTransitionDuration = '600ms';
             return;
           }
           
           if (direction === 'left') {
             carousel.next();
           } else {
             carousel.prev();
           }
         }
        });

*  sw参数说明

        { 
          originEvent: e, 
          point:       point,  
          offset:      this.offset,
          direction:   direction, 
          angle:       angle
        }


*  自定义事件

    *  node.bind('swipe::start', fn);
    *  node.bind('swipe::move', fn);
    *  node.bind('swipe::end', fn);
