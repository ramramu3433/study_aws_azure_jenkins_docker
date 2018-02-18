/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    /*
     * ContextMenu view representation
     */
    var ContextMenu = (function () {
        function ContextMenu(actionConfigItem, selectors, afterExecute, contextMenuButtonAnchor) {
            var _this = this;
            this._executeFunction = {};
            this._convertConfigToMenuItem = function (configItem) {
                var menuItem;
                switch (configItem.type) {
                    case "action":
                        menuItem = {
                            id: configItem.id,
                            type: "normal",
                            label: configItem.displayName,
                            enabled: configItem.enabled(),
                            visible: configItem.visible ? configItem.visible() : true
                        };
                        _this._executeFunction[configItem.id] = configItem.action;
                        break;
                    case "dropdown":
                        menuItem = {
                            id: configItem.id,
                            type: "submenu",
                            label: configItem.displayName,
                            enabled: configItem.enabled(),
                            visible: configItem.visible ? configItem.visible() : true,
                            submenu: configItem.subgroup.map(_this._convertConfigToMenuItem)
                        };
                        break;
                    case "separator":
                        menuItem = {
                            type: "separator"
                        };
                        break;
                    case "toggle":
                        menuItem = {
                            id: configItem.id,
                            type: "normal",
                            label: configItem.checked() ? configItem.checked : configItem.displayName,
                            enabled: configItem.enabled(),
                            visible: configItem.visible ? configItem.visible() : true
                        };
                        _this._executeFunction[configItem.id] = function () { configItem.checked(!configItem.checked()); };
                        break;
                }
                return menuItem;
            };
            this._expandDropdown = function (anchorSelector) {
                if (!!window.host) {
                    var convertedMenuItem = _this._actionConfigItem.map(_this._convertConfigToMenuItem);
                    var args = {
                        menuItems: convertedMenuItem
                    };
                    if (!!anchorSelector) {
                        args.iFrameStack = ["#" + window.frameElement.id];
                        args.anchor = anchorSelector;
                    }
                    window.host.executeProviderOperation("MenuManager.showMenu", args).then(function (id) {
                        if (!!id && !!_this._executeFunction[id]) {
                            _this._executeFunction[id]();
                            if (!!_this._afterExecute) {
                                _this._afterExecute(id);
                            }
                        }
                    });
                }
            };
            this._actionConfigItem = actionConfigItem;
            this._afterExecute = afterExecute;
            $(window).contextmenu(function (eventObject) {
                var shouldShowMenu = selectors.some(function (selector) {
                    return !!selector && eventObject.target.matches(selector);
                });
                if (shouldShowMenu) {
                    if (eventObject.which !== 3 && contextMenuButtonAnchor) {
                        _this._expandDropdown(contextMenuButtonAnchor);
                    }
                    else {
                        _this._expandDropdown();
                    }
                }
            });
        }
        return ContextMenu;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ContextMenu;
});
