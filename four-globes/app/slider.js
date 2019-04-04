"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CircleSlider = function (_EventEmitter) {
  _inherits(CircleSlider, _EventEmitter);

  /**
   * Creates an instance of CircleSlider inside the element with the id `targetId`
   * @param {String} targetId              The id of the element to contain the circle slider.
   * @param {Object} [options]             An object containing options for the slider.
   * @param {Number} [options.snap]        Makes the handle snap to every multiple of this number.
   * @param {Boolean} [options.clockwise]  True to make clockwise the positive direction.
   * @param {"top"|"bottom"|"left"|"right"} [options.startPos]
   *    Which side the handle should start at.
   * @memberof CircleSlider
   */
  function CircleSlider(targetId, options) {
    _classCallCheck(this, CircleSlider);

    // allow both "id" or "#id"
    var _this2 = _possibleConstructorReturn(this, (CircleSlider.__proto__ || Object.getPrototypeOf(CircleSlider)).call(this));

    _this2.root = document.getElementById(targetId) || document.getElementById(targetId.slice(1));
    _this2.outputAngle = 0;

    if (options) {
      _this2.clockwise = options.clockwise; // affects _formatOutputAngle
      _this2.snapMultiplier = options.snap;
      _this2.startPos = options.startPos;
    } else {
      _this2.clockwise = false;
      _this2.snapMultiplier = 0;
      _this2.startPos = "right";
    }

    _this2.startOffset = 0; // "right" is default

    switch (_this2.startPos) {
      case "top":
        _this2.startOffset = 270;
        break;
      case "left":
        _this2.startOffset = 180;
        break;
      case "bottom":
        _this2.startOffset = 90;
        break;
      default:
        break;
    }

    // validation
    if (!_this2.root) {
      console.error("CircleSlider: Didn't find any element with id " + targetId);
    }

    // create the child elements and append them
    _this2.hc = CircleSlider._createHandleContainerElem();
    _this2.handle = CircleSlider._createHandleElem();
    _this2.hc.appendChild(_this2.handle);
    _this2.root.appendChild(_this2.hc);

    // put the handle at the correct position
    _this2.hc.style.cssText = "transform: rotate(" + _this2.startOffset + "deg);";

    // just to keep track of all event names
    _this2.events = {
      sliderMove: "sliderMove",
      sliderUp: "sliderUp"
    };

    // active is true when user is holding down handle
    _this2.active = false;
    // mouse events
    _this2._addEventListeners("mousedown", "mousemove", "mouseup");
    // touch events
    _this2._addEventListeners("touchstart", "touchmove", "touchend");

    // bind methods
    _this2._mouseMoveHandler = _this2._mouseMoveHandler.bind(_this2);
    return _this2;
  }

  // public methods

  /**
   * Returns the angle/value of the slider.
   *
   * @returns The current value
   * @memberof CircleSlider
   */


  _createClass(CircleSlider, [{
    key: "getAngle",
    value: function getAngle() {
      return this.outputAngle;
    }

    /**
     * Manually sets the angle/value of the slider.
     *
     * @param {Number} angle  The new value for the slider
     * @memberof CircleSlider
     */

  }, {
    key: "setAngle",
    value: function setAngle(angle) {
      var rawAngle = this._formatInputAngle(angle);
      this._moveHandle(rawAngle);
    }
  }, {
    key: "_formatInputAngle",
    value: function _formatInputAngle(angle) {
      var rawAngle = this.clockwise === true ? CircleSlider.modulo(Math.round(angle) - 360 + this.startOffset, 360) : CircleSlider.modulo(360 - Math.round(angle) + this.startOffset, 360);
      return rawAngle;
    }

    // "private" methods

  }, {
    key: "_addEventListeners",
    value: function _addEventListeners(startEvent, moveEvent, endEvent) {
      var _this3 = this;

      // user presses handle
      this.handle.addEventListener(startEvent, function (e) {
        // prevent text selection
        e.preventDefault();

        if (!_this3.active) {
          _this3.active = true;

          // user moves handle
          document.addEventListener(moveEvent, _this3._mouseMoveHandler, false);

          // user lets go
          var _this = _this3;
          document.addEventListener(endEvent, function endFunc(ev) {
            _this.active = false;
            document.removeEventListener(moveEvent, _this._mouseMoveHandler, false);
            _this.emit(_this.events.sliderUp, _this.outputAngle);

            // remove event listener after this has been fired once
            ev.currentTarget.removeEventListener(endEvent, endFunc, false);
          });
        }
      });
    }
  }, {
    key: "_mouseMoveHandler",
    value: function _mouseMoveHandler(e) {
      e.preventDefault();
      this._moveHandle(this._getRawAngle(e));
    }
  }, {
    key: "_moveHandle",
    value: function _moveHandle(rawAngle) {
      var angle = rawAngle;
      // snap handle to multiples of snapMultiplier
      if (this.snapMultiplier) {
        var sm = this.snapMultiplier;
        var delta = Math.abs(angle - Math.round(angle / sm) * sm);
        if (delta <= 5) {
          angle = Math.round(angle / sm) * sm;
        }
      }

      // move the handle visually
      this.hc.style.cssText = "transform: rotate(" + angle + "deg);";

      this.outputAngle = this._formatOutputAngle(angle);

      this.emit(this.events.sliderMove, this.outputAngle);
    }
  }, {
    key: "_formatOutputAngle",
    value: function _formatOutputAngle(angle) {
      var outputAngle = this.clockwise === true ? CircleSlider.modulo(360 + Math.round(angle) - this.startOffset, 360) : CircleSlider.modulo(360 - Math.round(angle) + this.startOffset, 360);
      return outputAngle;
    }
  }, {
    key: "_getRawAngle",
    value: function _getRawAngle(e) {
      var pivot = CircleSlider._getCenter(this.root);
      var mouse = void 0;
      if (e.type === "touchmove") {
        mouse = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      } else {
        mouse = {
          x: e.clientX,
          y: e.clientY
        };
      }

      var angle = CircleSlider._radToDeg(Math.atan2(mouse.y - pivot.y, mouse.x - pivot.x)) % 360;
      return angle;
    }
  }], [{
    key: "_getCenter",
    value: function _getCenter(elem) {
      var rect = elem.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  }, {
    key: "_radToDeg",
    value: function _radToDeg(rad) {
      return rad * (180 / Math.PI);
    }

    // % can return negative numbers

  }, {
    key: "modulo",
    value: function modulo(n, m) {
      return (n % m + m) % m;
    }

    // Uninteresting methods

  }, {
    key: "_createHandleContainerElem",
    value: function _createHandleContainerElem() {
      var hc = document.createElement("div");
      hc.className = "cs-handle-container";
      return hc;
    }
  }, {
    key: "_createHandleElem",
    value: function _createHandleElem() {
      var h = document.createElement("div");
      h.className = "cs-handle";
      return h;
    }
  }]);

  return CircleSlider;
}(EventEmitter3);

define([], function() {
  return CircleSlider;
})
