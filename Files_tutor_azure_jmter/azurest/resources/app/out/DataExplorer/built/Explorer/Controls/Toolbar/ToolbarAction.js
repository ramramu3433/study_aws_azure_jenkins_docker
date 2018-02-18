/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "./KeyCodes", "./Utilities"], function (require, exports, ko, KeyCodes_1, Utilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ToolbarAction = (function () {
        function ToolbarAction(actionItem, afterExecute) {
            var _this = this;
            this.type = "action";
            this._executeAction = function () {
                _this.action();
                if (!!_this._afterExecute) {
                    _this._afterExecute(_this.id);
                }
            };
            this.mouseDown = function (data, event) {
                _this._executeAction();
                return false;
            };
            this.keyUp = function (data, event) {
                var handled = false;
                handled = Utilities.onEnter(event, function ($sourceElement) {
                    _this._executeAction();
                    if ($sourceElement.hasClass("active")) {
                        $sourceElement.removeClass("active");
                    }
                    return true;
                });
                return !handled;
            };
            this.keyDown = function (data, event) {
                var handled = false;
                handled = Utilities.onEnter(event, function ($sourceElement) {
                    if ($sourceElement.hasClass("active")) {
                        $sourceElement.removeClass("active");
                    }
                    return true;
                });
                if (!handled) {
                    // Reset color if [shift-] tabbing, 'up/down arrowing', or 'esc'-aping away from button while holding down 'enter'
                    Utilities.onKeys(event, [KeyCodes_1.default.Tab, KeyCodes_1.default.UpArrow, KeyCodes_1.default.DownArrow, KeyCodes_1.default.Esc], function ($sourceElement) {
                        if ($sourceElement.hasClass("active")) {
                            $sourceElement.removeClass("active");
                        }
                    });
                }
                return !handled;
            };
            this.action = actionItem.action;
            this.title = ko.observable(actionItem.title);
            this.displayName = ko.observable(actionItem.displayName);
            this.id = actionItem.id;
            this.enabled = actionItem.enabled;
            this.visible = actionItem.visible ? actionItem.visible : ko.observable(true);
            this.focused = ko.observable(false);
            this.icon = actionItem.icon;
            this._afterExecute = afterExecute;
        }
        return ToolbarAction;
    }());
    exports.default = ToolbarAction;
});
