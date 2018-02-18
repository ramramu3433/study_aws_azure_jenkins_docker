/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Contains constants for Table Query.
     */
    var TableQueryConstants;
    (function (TableQueryConstants) {
        // TODO: high constrast support.
        TableQueryConstants.clauseGroupColors = ["#ffe1ff", "#fffacd", "#f0ffff", "#ffefd5", "#f0fff0"];
        TableQueryConstants.transparentColor = "transparent";
    })(TableQueryConstants || (TableQueryConstants = {}));
    return TableQueryConstants;
});
