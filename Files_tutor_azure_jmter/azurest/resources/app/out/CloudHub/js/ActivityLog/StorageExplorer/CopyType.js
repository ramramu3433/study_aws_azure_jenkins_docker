/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var CopyType;
    (function (CopyType) {
        CopyType[CopyType["Copy"] = 0] = "Copy";
        CopyType[CopyType["Rename"] = 1] = "Rename";
        CopyType[CopyType["Promote"] = 2] = "Promote";
    })(CopyType || (CopyType = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CopyType;
});
