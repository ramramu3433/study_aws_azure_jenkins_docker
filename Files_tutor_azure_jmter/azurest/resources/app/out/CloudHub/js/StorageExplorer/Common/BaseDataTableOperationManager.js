/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /*
     * Base class for data table row selection.
     */
    var BaseDataTableOperationManager = (function () {
        function BaseDataTableOperationManager(table) {
            this.dataTable = table;
        }
        BaseDataTableOperationManager.prototype.bind = function () {
            // Nothing to do in base
        };
        BaseDataTableOperationManager.prototype.focusTable = function () {
            this.dataTable.focus();
        };
        return BaseDataTableOperationManager;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BaseDataTableOperationManager;
});
