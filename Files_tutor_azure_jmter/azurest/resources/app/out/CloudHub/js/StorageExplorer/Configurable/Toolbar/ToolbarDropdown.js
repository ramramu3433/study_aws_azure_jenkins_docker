/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "StorageExplorer/KeyCodes", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, ko, KeyCodes_1, StorageExplorerUtilities) {
    "use strict";
    var ToolbarDropDown = (function () {
        function ToolbarDropDown(dropdown, afterExecute) {
            var _this = this;
            this.type = "dropdown";
            this.subgroup = [];
            this.expanded = ko.observable(false);
            this.open = function () {
                if (!!window.host) {
                    var convertedMenuItem = ToolbarDropDown._convertToMenuItem(_this.subgroup);
                    window.host.executeProviderOperation("MenuManager.showMenu", {
                        iFrameStack: ["#" + window.frameElement.id],
                        anchor: "#" + _this.id,
                        menuItems: convertedMenuItem.menuItems
                    }).then(function (id) {
                        if (!!id && !!convertedMenuItem.actionMap[id]) {
                            convertedMenuItem.actionMap[id]();
                        }
                    });
                    if (!!_this._afterExecute) {
                        _this._afterExecute(_this.id);
                    }
                }
            };
            this.mouseDown = function (data, event) {
                _this.open();
                return false;
            };
            this.keyUp = function (data, event) {
                var handled = false;
                handled = StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                    _this.open();
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
            this.subgroup = dropdown.subgroup;
            this.title = ko.observable(dropdown.title);
            this.displayName = ko.observable(dropdown.displayName);
            this.id = dropdown.id;
            this.enabled = dropdown.enabled;
            this.visible = dropdown.visible ? dropdown.visible : ko.observable(true);
            this.focused = ko.observable(false);
            this.icon = dropdown.icon;
            this._afterExecute = afterExecute;
        }
        return ToolbarDropDown;
    }());
    ToolbarDropDown._convertToMenuItem = function (actionConfigs, actionMap) {
        if (actionMap === void 0) { actionMap = {}; }
        var returnValue = {
            menuItems: actionConfigs.map(function (actionConfig, index, array) {
                var menuItem;
                switch (actionConfig.type) {
                    case "action":
                        menuItem = {
                            id: actionConfig.id,
                            type: "normal",
                            label: actionConfig.displayName,
                            enabled: actionConfig.enabled(),
                            visible: actionConfig.visible ? actionConfig.visible() : true
                        };
                        actionMap[actionConfig.id] = actionConfig.action;
                        break;
                    case "dropdown":
                        menuItem = {
                            id: actionConfig.id,
                            type: "submenu",
                            label: actionConfig.displayName,
                            enabled: actionConfig.enabled(),
                            visible: actionConfig.visible ? actionConfig.visible() : true,
                            submenu: ToolbarDropDown._convertToMenuItem(actionConfig.subgroup, actionMap).menuItems
                        };
                        break;
                    case "toggle":
                        menuItem = {
                            id: actionConfig.id,
                            type: "normal",
                            label: actionConfig.checked() ? actionConfig.checkedDisplayName : actionConfig.displayName,
                            enabled: actionConfig.enabled(),
                            visible: actionConfig.visible ? actionConfig.visible() : true
                        };
                        actionMap[actionConfig.id] = function () { actionConfig.checked(!actionConfig.checked()); };
                        break;
                    case "separator":
                        menuItem = {
                            type: "separator",
                            visible: true
                        };
                        break;
                }
                return menuItem;
            }),
            actionMap: actionMap
        };
        return returnValue;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ToolbarDropDown;
});
