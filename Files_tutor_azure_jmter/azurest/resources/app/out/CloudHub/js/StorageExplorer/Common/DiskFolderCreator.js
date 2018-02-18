/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /*
     * Ensures that disk folder exist, and creates them if they don't (optimized to avoid unnecessary backend calls when
     * called frequently with the same path)
     */
    var DiskFolderCreator = (function () {
        function DiskFolderCreator(host) {
            this._createdFolders = {};
            this._host = host;
        }
        DiskFolderCreator.prototype.ensureLocalFolderExists = function (folderPath) {
            var _this = this;
            if (!this._createdFolders[folderPath]) {
                return this._host.executeOperation("Environment.ensureFolderExists", [folderPath]).then(function () {
                    _this._createdFolders[folderPath] = true;
                });
            }
            else {
                return Promise.resolve();
            }
        };
        return DiskFolderCreator;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DiskFolderCreator;
});
