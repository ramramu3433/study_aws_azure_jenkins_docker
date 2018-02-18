/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    var DragDropManager = (function () {
        function DragDropManager() {
            this.setupGlobalHandlers();
        }
        /**
         * Setups global dragover & drop event handlers on the current document,
         * ensuring that drag & drop behavior is handled appropriately.
         * By default, Chromium will attempt to navigate/open dropped files.
         */
        DragDropManager.prototype.setupGlobalHandlers = function () {
            var _this = this;
            if ($.isReady) {
                this._setupEventListeners();
            }
            else {
                $(document).ready(function () { return _this._setupEventListeners(); });
            }
        };
        DragDropManager.prototype._setupEventListeners = function () {
            document.addEventListener("dragover", function (event) {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                event.dataTransfer.effectAllowed = "copy";
                return false;
            }, false);
            document.addEventListener("drop", function (event) {
                event.preventDefault();
                return false;
            }, false);
        };
        return DragDropManager;
    }());
    return DragDropManager;
});
