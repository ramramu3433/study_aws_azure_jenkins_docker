"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var EdgeDirection_1 = require("./EdgeDirection");
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
            case EdgeDirection_1.default.Top:
                return new ResizeState(EdgeDirection_1.default.Bottom, Math.abs(ResizeState._$window.height() - state.scalarValue));
            case EdgeDirection_1.default.Right:
                return new ResizeState(EdgeDirection_1.default.Left, Math.abs(ResizeState._$window.width() - state.scalarValue));
            case EdgeDirection_1.default.Bottom:
                return new ResizeState(EdgeDirection_1.default.Top, Math.abs(ResizeState._$window.height() - state.scalarValue));
            case EdgeDirection_1.default.Left:
                return new ResizeState(EdgeDirection_1.default.Right, Math.abs(ResizeState._$window.width() - state.scalarValue));
        }
    };
    return ResizeState;
}());
ResizeState._$window = $(window);
exports.default = ResizeState;
