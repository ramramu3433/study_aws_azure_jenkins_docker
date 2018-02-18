"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Dimension_1 = require("./Dimension");
var EdgeDirection_1 = require("./EdgeDirection");
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
        if (MinSizeConstraint._doesDirectionApplyToDimension(state.direction, this._dimension)) {
            state.scalarValue = Math.max(state.scalarValue, this._minValue);
        }
    };
    MinSizeConstraint.prototype.getTarget = function () {
        return this.$container;
    };
    /**
     * Determines whether a direction (N, S, E, W) is applicable to a dimension (Width, Height)
     *   This makes sure that if we are resizing vertically, it only checks constraints that
     *   are height constraints
     */
    MinSizeConstraint._doesDirectionApplyToDimension = function (direction, dimension) {
        switch (dimension) {
            case Dimension_1.default.Height:
                return direction === EdgeDirection_1.default.Top || direction === EdgeDirection_1.default.Bottom;
            case Dimension_1.default.Width:
                return direction === EdgeDirection_1.default.Right || direction === EdgeDirection_1.default.Left;
        }
    };
    return MinSizeConstraint;
}());
exports.default = MinSizeConstraint;
