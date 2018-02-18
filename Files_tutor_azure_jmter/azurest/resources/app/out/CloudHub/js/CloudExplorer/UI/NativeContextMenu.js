/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "CloudExplorer/UI/Details/ActionViewModel", "es6-promise"], function (require, exports, ActionViewModel, rsvp) {
    "use strict";
    var Promise = rsvp.Promise;
    /*
     * ContextMenu view representation
     */
    var NativeContextMenu = (function () {
        function NativeContextMenu(host) {
            var _this = this;
            this._executeAction = function (node, action) {
                if (action.enabled()) {
                    node.triggerAction(action, "ContextMenu");
                }
            };
            this.open = function (node, e) {
                if (node.actions().length) {
                    var menuItems = [];
                    var isAnyVisible = false;
                    var promises = [];
                    node.actions().forEach(function (action) {
                        promises.push(action.displayNameBinding().updateValue().catch(function (ex) { return true; }));
                        promises.push(action.enabledBinding().updateValue().catch(function (ex) { return true; }));
                        promises.push(action.visibleBinding().updateValue().catch(function (ex) { return true; }));
                    });
                    Promise.all(promises).then(function () {
                        node.actions().forEach(function (action) {
                            menuItems.push({
                                id: action.uid,
                                type: "normal",
                                label: action.displayName(),
                                enabled: action.enabled(),
                                visible: action.visible()
                            });
                            if (action.visible()) {
                                isAnyVisible = true;
                                return;
                            }
                        });
                        _this._host.executeProviderOperation("MenuManager.showMenu", {
                            menuItems: menuItems
                        }).then(function (id) {
                            _this._executeAction(node, ActionViewModel.getAction(id));
                        });
                    });
                }
            };
            this._host = host;
        }
        return NativeContextMenu;
    }());
    return NativeContextMenu;
});
