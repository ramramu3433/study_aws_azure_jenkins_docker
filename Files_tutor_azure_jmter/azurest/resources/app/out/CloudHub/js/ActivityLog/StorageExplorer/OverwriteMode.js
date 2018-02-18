/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var OverwriteMode;
    (function (OverwriteMode) {
        OverwriteMode[OverwriteMode["LetUserResolve"] = 0] = "LetUserResolve";
        OverwriteMode[OverwriteMode["Overwrite"] = 1] = "Overwrite";
        OverwriteMode[OverwriteMode["KeepExisting"] = 2] = "KeepExisting";
    })(OverwriteMode || (OverwriteMode = {}));
    return OverwriteMode;
});
