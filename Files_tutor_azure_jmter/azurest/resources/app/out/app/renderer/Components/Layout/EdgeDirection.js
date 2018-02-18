"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The edge of a panel that can be grabbed for resizing
 */
var EdgeDirection;
(function (EdgeDirection) {
    EdgeDirection[EdgeDirection["Top"] = 0] = "Top";
    EdgeDirection[EdgeDirection["Right"] = 1] = "Right";
    EdgeDirection[EdgeDirection["Bottom"] = 2] = "Bottom";
    EdgeDirection[EdgeDirection["Left"] = 3] = "Left";
})(EdgeDirection || (EdgeDirection = {}));
exports.default = EdgeDirection;
