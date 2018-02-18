/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "StorageExplorer/Common/BaseDataTableOperationManager"], function (require, exports, BaseDataTableOperationManager_1) {
    "use strict";
    /*
     * Base class for data table row selection.
     */
    var FlobDataTableOperationManager = (function (_super) {
        __extends(FlobDataTableOperationManager, _super);
        function FlobDataTableOperationManager(table, listViewModel, flobCommands) {
            var _this = _super.call(this, table) || this;
            _this.itemDropped = function (event) {
                var handled = false;
                var items = event.originalEvent.dataTransfer.items;
                var filePaths = [];
                if (!items) {
                    // On browsers outside of Chromium
                    // we can't discern between dirs and files
                    // so we will disable drag & drop for now
                    return;
                }
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var entry = item.webkitGetAsEntry();
                    if (entry.isFile) {
                        filePaths.push(item.getAsFile().path);
                    }
                    else if (entry.isDirectory) {
                        _this.uploadDroppedFolder(item.getAsFile().path);
                    }
                }
                if (filePaths.length > 0) {
                    _this.tryHandleUploadDroppedFiles(filePaths);
                    handled = true;
                }
                return !handled;
            };
            _this._flobCommands = flobCommands;
            _this._listViewModel = listViewModel;
            return _this;
        }
        FlobDataTableOperationManager.prototype.tryHandleRenameSelected = function () {
            var selectedBlobs = this._listViewModel.selected();
            var handled = false;
            if (this._flobCommands.canRename(selectedBlobs)) {
                this._flobCommands.startRenameTask(this._listViewModel);
                handled = true;
            }
            return handled;
        };
        FlobDataTableOperationManager.prototype.bind = function () {
            _super.prototype.bind.call(this);
            // Bind drag & drop behavior
            $("body").on("drop", this.itemDropped);
        };
        return FlobDataTableOperationManager;
    }(BaseDataTableOperationManager_1.default));
    exports.FlobDataTableOperationManager = FlobDataTableOperationManager;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlobDataTableOperationManager;
});
