"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var EdgeDirection_1 = require("./EdgeDirection");
var ResizeState_1 = require("./ResizeState");
var $ = require("jquery");
/**
 * Represents a resize relationship between two panels. When the $container gets resized along the direction,
 *  any dependent panels get resized along that panel too.
 */
var Relationship = (function () {
    function Relationship($container, dependents, direction, constraints, collapsedConstraints, resizeStartHandler, sizeChangeHandler) {
        this._fireSizeChangeHandlerTime = Number.MAX_VALUE;
        this.$container = $container;
        this.$dependents = dependents;
        this._direction = direction;
        this._constraints = constraints;
        this._collapsedConstraints = collapsedConstraints;
        this.$divider = this.$container.find(".divider");
        this.$container.parent().add(this.$divider);
        this.resizeStartHandler = resizeStartHandler;
        this.sizeChangeHandler = sizeChangeHandler;
    }
    /**
     * Changes the $container based on the resize state. This depends on the resize direction,
     *   since any panels that resize on their Top or Left edge also have to change their
     *   positioning in addition to their width/height
     */
    Relationship.changeDimension = function ($container, state) {
        switch (state.direction) {
            case EdgeDirection_1.default.Top:
                $container.height(state.scalarValue);
                $container.css({
                    top: Math.abs(Relationship._$window.height() - state.scalarValue) + 1
                });
                break;
            case EdgeDirection_1.default.Right:
                $container.width(state.scalarValue - $container.position().left);
                break;
            case EdgeDirection_1.default.Bottom:
                $container.height(state.scalarValue - $container.position().top);
                break;
            case EdgeDirection_1.default.Left:
                $container.width(state.scalarValue);
                $container.css({
                    left: Math.abs(Relationship._$window.width() - state.scalarValue) + 1
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
            case EdgeDirection_1.default.Top:
                scalarValue = Relationship._$window.height() - y;
                break;
            case EdgeDirection_1.default.Right:
                scalarValue = x;
                break;
            case EdgeDirection_1.default.Bottom:
                scalarValue = y;
                break;
            case EdgeDirection_1.default.Left:
                scalarValue = Relationship._$window.width() - x;
                break;
        }
        return new ResizeState_1.default(this._direction, scalarValue);
    };
    Relationship.prototype.isExpanded = function () {
        return !this._collapsed;
    };
    Relationship.prototype._getCollapsedState = function () {
        var scalarValue;
        switch (this._direction) {
            case EdgeDirection_1.default.Top:
                scalarValue = 0;
                break;
            case EdgeDirection_1.default.Right:
                scalarValue = this.$container.position().left;
                break;
            case EdgeDirection_1.default.Bottom:
                scalarValue = this.$container.position().top;
                break;
            case EdgeDirection_1.default.Left:
                scalarValue = 0;
                break;
        }
        return this.applyConstraints(new ResizeState_1.default(this._direction, scalarValue));
    };
    Relationship.prototype._getExpandedState = function () {
        if (this._lastAppliedState) {
            return this.applyConstraints(this._lastAppliedState);
        }
        var scalarValue;
        switch (this._direction) {
            case EdgeDirection_1.default.Top:
                scalarValue = this.$container.height();
                break;
            case EdgeDirection_1.default.Right:
                scalarValue = this.$container.width() + this.$container.position().left;
                break;
            case EdgeDirection_1.default.Bottom:
                scalarValue = this.$container.height() + this.$container.position().top;
                break;
            case EdgeDirection_1.default.Left:
                scalarValue = this.$container.width();
                break;
        }
        return this.applyConstraints(new ResizeState_1.default(this._direction, scalarValue));
    };
    /**
     * Applies a new state to the panel and its dependents. Also stores this state for when the
     *   window resizes.
     */
    Relationship.prototype.applyState = function (state) {
        this._lastAppliedState = state;
        var invertedState = ResizeState_1.default.invert(state);
        Relationship.changeDimension(this.$container, state);
        for (var i = 0; i < this.$dependents.length; i++) {
            Relationship.changeDimension(this.$dependents[i], invertedState);
        }
        this._fireSizeChangeHandler();
    };
    /**
     *  Throttles and delays firing of sizeChange event to give the DOM time to update.
     */
    Relationship.prototype._fireSizeChangeHandler = function () {
        var _this = this;
        var waitTime = 50;
        this._fireSizeChangeHandlerTime = Date.now() + waitTime;
        if (!!this.sizeChangeHandler) {
            setTimeout(function () {
                if (Date.now() > _this._fireSizeChangeHandlerTime) {
                    _this._fireSizeChangeHandlerTime = Number.MAX_VALUE;
                    _this.sizeChangeHandler();
                }
            }, waitTime + 5);
        }
    };
    Relationship.prototype.applyLastState = function () {
        if (this._lastAppliedState) {
            var state = this.applyConstraints(this._lastAppliedState);
            this.applyState(state);
        }
    };
    Relationship.prototype.applyConstraints = function (state) {
        if (!this._collapsed) {
            return this._applyConstraints(state, this._constraints);
        }
        else if (this._collapsed && this._collapsedConstraints) {
            return this._applyConstraints(state, this._collapsedConstraints);
        }
        else {
            return state;
        }
    };
    Relationship.prototype._applyConstraints = function (state, constraints) {
        var newState = state;
        // Make sure that the constraints aren't violated
        for (var i = 0; i < constraints.length; i++) {
            var target = constraints[i].getTarget();
            // Check the constraints for the currently resizing panel
            if (target === this.$container) {
                constraints[i].modifyStateToConform(newState);
            }
            var invertedState = ResizeState_1.default.invert(newState);
            // Check the constraints for any dependent panels
            for (var j = 0; j < this.$dependents.length; j++) {
                if (target === this.$dependents[j]) {
                    constraints[i].modifyStateToConform(invertedState);
                }
            }
            newState = ResizeState_1.default.invert(invertedState);
        }
        return newState;
    };
    Relationship.prototype.collapse = function () {
        if (!this._collapsed) {
            this._collapsed = true;
            this._expandedState = this._getExpandedState();
            this.applyState(this._getCollapsedState());
            this.$container.addClass(Relationship.collapseClass);
        }
    };
    Relationship.prototype.expand = function (state) {
        if (this._collapsed) {
            this._collapsed = false;
            this.$container.removeClass(Relationship.collapseClass);
            if (state) {
                this.applyState(state);
            }
            else {
                this.applyState(this._expandedState);
            }
        }
    };
    return Relationship;
}());
Relationship.collapseClass = "collapsed";
Relationship._$window = $(window);
exports.default = Relationship;
