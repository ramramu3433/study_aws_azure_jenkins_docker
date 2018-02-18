/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "StorageExplorer/KeyCodes", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, ko, KeyCodes_1, StorageExplorerUtilities) {
    "use strict";
    var ToolbarToggle = (function () {
        function ToolbarToggle(toggleItem, afterExecute) {
            var _this = this;
            this.type = "toggle";
            this.title = ko.pureComputed(function () {
                if (_this.checked()) {
                    return _this._checkedTitle;
                }
                else {
                    return _this._title;
                }
            });
            this.displayName = ko.pureComputed(function () {
                if (_this.checked()) {
                    return _this._checkedDisplayName;
                }
                else {
                    return _this._displayName;
                }
            });
            this.toggle = function () {
                _this.checked(!_this.checked());
                if (_this.checked() && !!_this._afterExecute) {
                    _this._afterExecute(_this.id);
                }
            };
            this.mouseDown = function (data, event) {
                _this.toggle();
                return false;
            };
            this.keyUp = function (data, event) {
                var handled = false;
                handled = StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                    _this.toggle();
                    if ($sourceElement.hasClass("active")) {
                        $sourceElement.removeClass("active");
                    }
                    return true;
                });
                return !handled;
            };
            this.keyDown = function (data, event) {
                var handled = false;
                handled = StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                    if ($sourceElement.hasClass("active")) {
                        $sourceElement.removeClass("active");
                    }
                    return true;
                });
                if (!handled) {
                    // Reset color if [shift-] tabbing, 'up/down arrowing', or 'esc'-aping away from button while holding down 'enter'
                    StorageExplorerUtilities.onKeys(event, [KeyCodes_1.default.Tab, KeyCodes_1.default.UpArrow, KeyCodes_1.default.DownArrow, KeyCodes_1.default.Esc], function ($sourceElement) {
                        if ($sourceElement.hasClass("active")) {
                            $sourceElement.removeClass("active");
                        }
                    });
                }
                return !handled;
            };
            this._title = toggleItem.title;
            this._displayName = toggleItem.displayName;
            this.id = toggleItem.id;
            this.enabled = toggleItem.enabled;
            this.visible = toggleItem.visible ? toggleItem.visible : ko.observable(true);
            this.focused = ko.observable(false);
            this.icon = toggleItem.icon;
            this.checked = toggleItem.checked;
            this._checkedTitle = toggleItem.checkedTitle;
            this._checkedDisplayName = toggleItem.checkedDisplayName;
            this._afterExecute = afterExecute;
        }
        return ToolbarToggle;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ToolbarToggle;
});
