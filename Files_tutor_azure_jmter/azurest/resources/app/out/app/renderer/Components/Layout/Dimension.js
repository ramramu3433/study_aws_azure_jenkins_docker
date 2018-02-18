"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The dimension for which a minimum or maximum constraint is relevent
 */
var Dimension;
(function (Dimension) {
    Dimension[Dimension["Height"] = 0] = "Height";
    Dimension[Dimension["Width"] = 1] = "Width";
})(Dimension || (Dimension = {}));
exports.default = Dimension;
