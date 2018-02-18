/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    // TODO: This system should probably be changed to use percentages instead of fixed pixel values
    //   However, this has problems with smaller window sizes (and ends up needing minimum sizes
    //   in pixels as well). More UX guidance is needed to finalize the behavior of resizing
    var _relationships = [];
    var _constraints = [];
    var _activeRelationship;
    var $window = $(window);
    var _$dragSurfaces = $(".drag-surface");
    /**
     * The edge of a panel that can be grabbed for resizing
     */
    var EdgeDirection;
    (function (EdgeDirection) {
        EdgeDirection[EdgeDirection["Top"] = 0] = "Top";
        EdgeDirection[EdgeDirection["Right"] = 1] = "Right";
        EdgeDirection[EdgeDirection["Bottom"] = 2] = "Bottom";
        EdgeDirection[EdgeDirection["Left"] = 3] = "Left";
    })(EdgeDirection = exports.EdgeDirection || (exports.EdgeDirection = {}));
    /**
     * The dimension for which a minimum or maximum constraint is relevent
     */
    var Dimension;
    (function (Dimension) {
        Dimension[Dimension["Height"] = 0] = "Height";
        Dimension[Dimension["Width"] = 1] = "Width";
    })(Dimension = exports.Dimension || (exports.Dimension = {}));
    /**
     * A state for a panel that represents the result of a resize operation
     */
    var ResizeState = (function () {
        function ResizeState(direction, value) {
            this.direction = direction;
            this.scalarValue = value;
        }
        ResizeState.invert = function (state) {
            switch (state.direction) {
                case EdgeDirection.Top:
                    return new ResizeState(EdgeDirection.Bottom, Math.abs($window.height() - state.scalarValue));
                case EdgeDirection.Right:
                    return new ResizeState(EdgeDirection.Left, Math.abs($window.width() - state.scalarValue));
                case EdgeDirection.Bottom:
                    return new ResizeState(EdgeDirection.Top, Math.abs($window.height() - state.scalarValue));
                case EdgeDirection.Left:
                    return new ResizeState(EdgeDirection.Right, Math.abs($window.width() - state.scalarValue));
            }
        };
        return ResizeState;
    }());
    exports.ResizeState = ResizeState;
    /**
     * A constraint that prevents a panel from being resized below a minimum value
     */
    var MinSizeConstraint = (function () {
        function MinSizeConstraint($container, dimension, minValue) {
            this.$container = $container;
            this._dimension = dimension;
            this._minValue = minValue;
        }
        MinSizeConstraint.prototype.modifyStateToConform = function (state) {
            if (_doesDirectionApplyToDimension(state.direction, this._dimension)) {
                state.scalarValue = Math.max(state.scalarValue, this._minValue);
            }
        };
        MinSizeConstraint.prototype.getTarget = function () {
            return this.$container;
        };
        return MinSizeConstraint;
    }());
    exports.MinSizeConstraint = MinSizeConstraint;
    /**
     * A constraint that prevents a panel from being resized above a maximum value
     */
    var MaxSizeConstraint = (function () {
        function MaxSizeConstraint($container, dimension, maxValue) {
            this.$container = $container;
            this._dimension = dimension;
            this._maxValue = maxValue;
        }
        MaxSizeConstraint.prototype.modifyStateToConform = function (state) {
            if (_doesDirectionApplyToDimension(state.direction, this._dimension)) {
                state.scalarValue = Math.min(state.scalarValue, this._maxValue);
            }
        };
        MaxSizeConstraint.prototype.getTarget = function () {
            return this.$container;
        };
        return MaxSizeConstraint;
    }());
    exports.MaxSizeConstraint = MaxSizeConstraint;
    /**
     * Represents a resize relationship between two panels. When the $container gets resized along the direction,
     *  any dependent panels get resized along that panel too.
     */
    var Relationship = (function () {
        function Relationship($container, dependents, direction, resizeStartHandler) {
            this.$container = $container;
            this.$dependents = dependents;
            this._direction = direction;
            this.$divider = this.$container.find(".divider");
            this.$container.parent().add(this.$divider);
            this.resizeStartHandler = resizeStartHandler;
        }
        /**
         * Changes the $container based on the resize state. This depends on the resize direction,
         *   since any panels that resize on their Top or Left edge also have to change their
         *   positioning in addition to their width/height
         */
        Relationship.changeDimension = function ($container, state) {
            switch (state.direction) {
                case EdgeDirection.Top:
                    $container.height(state.scalarValue);
                    $container.css({
                        top: Math.abs($window.height() - state.scalarValue) + 1
                    });
                    break;
                case EdgeDirection.Right:
                    $container.width(state.scalarValue - $container.position().left);
                    break;
                case EdgeDirection.Bottom:
                    $container.height(state.scalarValue - $container.position().top);
                    break;
                case EdgeDirection.Left:
                    $container.width(state.scalarValue);
                    $container.css({
                        left: Math.abs($window.width() - state.scalarValue) + 1
                    });
                    break;
            }
        };
        /**
         * Figures out the new state of a panel based on mouse coordinates and the resize direction.
         *  e.g. if the panel resizes on the Bottom edge, the new height will just be the mouse y position
         */
        Relationship.prototype.getState = function (x, y) {
            var scalarValue;
            switch (this._direction) {
                case EdgeDirection.Top:
                    scalarValue = $window.height() - y;
                    break;
                case EdgeDirection.Right:
                    scalarValue = x;
                    break;
                case EdgeDirection.Bottom:
                    scalarValue = y;
                    break;
                case EdgeDirection.Left:
                    scalarValue = $window.width() - x;
                    break;
            }
            return new ResizeState(this._direction, scalarValue);
        };
        /**
         * Applies a new state to the panel and its dependents. Also stores this state for when the
         *   window resizes.
         */
        Relationship.prototype.applyState = function (state) {
            this._lastAppliedState = state;
            var invertedState = ResizeState.invert(state);
            Relationship.changeDimension(this.$container, state);
            for (var i = 0; i < this.$dependents.length; i++) {
                Relationship.changeDimension(this.$dependents[i], invertedState);
            }
        };
        Relationship.prototype.handleWindowResize = function () {
            if (this._lastAppliedState) {
                var state = this.applyConstraints(this._lastAppliedState);
                this.applyState(state);
            }
        };
        Relationship.prototype.applyConstraints = function (state) {
            var newState = state;
            // Make sure that the constraints aren't violated
            for (var i = 0; i < _constraints.length; i++) {
                var target = _constraints[i].getTarget();
                // Check the constraints for the currently resizing panel
                if (target === this.$container) {
                    _constraints[i].modifyStateToConform(newState);
                }
                var invertedState = ResizeState.invert(newState);
                // Check the constraints for any dependent panels
                for (var j = 0; j < this.$dependents.length; j++) {
                    if (target === this.$dependents[j]) {
                        _constraints[i].modifyStateToConform(invertedState);
                    }
                }
                newState = ResizeState.invert(invertedState);
            }
            return newState;
        };
        Relationship.prototype.collapse = function () {
            this.$container.addClass(Relationship.collapseClass);
            this.$dependents.forEach(function ($element) { return $element.addClass(Relationship.collapseClass); });
        };
        Relationship.prototype.expand = function () {
            this.$container.removeClass(Relationship.collapseClass);
            this.$dependents.forEach(function ($element) { return $element.removeClass(Relationship.collapseClass); });
        };
        return Relationship;
    }());
    Relationship.collapseClass = "collapsed";
    exports.Relationship = Relationship;
    /**
     * Sets the constraints and relationships for panels. This will setup the listeners to listen for
     *   window mouse movement and dragging.
     */
    function setConstraints(relationships, constraints) {
        var isMouseDown = false;
        _relationships = relationships;
        _constraints = constraints;
        // For each relationship, start listening to mousedown events on the divider between the
        // panels
        for (var i = 0; i < _relationships.length; i++) {
            (function (i) {
                var relationship = _relationships[i];
                relationship.$divider.mousedown(function (eventObject) {
                    isMouseDown = true;
                    _activeRelationship = relationship;
                    // Since each panel contains an iframe, they capture mouse events and prevent
                    // us from handling the mousemove events. Once the user clicks on the dividers,
                    // we show elements that appear over iframes. This also has the benefit of preventing
                    // accidental mouse events inside each iframe during a panel resize.
                    _$dragSurfaces.show();
                });
            })(i);
        }
        // Whenever the mouse moves, first check if we are currently dragging. If so, handle the
        // event based on the mouse position
        $window.mousemove(function (eventObject) {
            if (isMouseDown && eventObject.which === 1) {
                _handleDrag(Math.max(0, eventObject.pageX), Math.max(0, eventObject.pageY));
                _activeRelationship.resizeStartHandler();
            }
            else {
                _$dragSurfaces.hide();
            }
        }).mouseup(function (eventObject) {
            isMouseDown = false;
            _activeRelationship = null;
            _$dragSurfaces.hide();
        });
        // Listen for window resize events
        $window.resize(_handleWindowResize);
    }
    exports.setConstraints = setConstraints;
    /**
     * Determines whether a direction (N, S, E, W) is applicable to a dimension (Width, Height)
     *   This makes sure that if we are resizing vertically, it only checks constraints that
     *   are height constraints
     */
    function _doesDirectionApplyToDimension(direction, dimension) {
        switch (dimension) {
            case Dimension.Height:
                return direction === EdgeDirection.Top || direction === EdgeDirection.Bottom;
            case Dimension.Width:
                return direction === EdgeDirection.Right || direction === EdgeDirection.Left;
        }
    }
    /**
     * Handles when the window itself resizes, and tells each child to go re-apply their
     *   CSS changes and make sure that we don't only cover part of the window
     */
    function _handleWindowResize() {
        for (var i = 0; i < _relationships.length; i++) {
            _relationships[i].handleWindowResize();
        }
    }
    /**
     * Handles when the user is dragging a divider between
     */
    function _handleDrag(x, y) {
        // Figure out the state based on the mouse x and y values
        var newState = _activeRelationship.getState(x, y);
        // Figure out the state for the dependent elements (which is the remaining space in the window)
        newState = _activeRelationship.applyConstraints(newState);
        _activeRelationship.applyState(newState);
    }
});
