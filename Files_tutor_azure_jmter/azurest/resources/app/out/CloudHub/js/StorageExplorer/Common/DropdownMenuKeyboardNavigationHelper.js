/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "jquery", "StorageExplorer/KeyCodes", "StorageExplorer/Common/StorageExplorerUtilities"], function (require, exports, $, KeyCodes_1, StorageExplorerUtilities) {
    "use strict";
    /**
     * A class that handles the keyboard interactions for a dropdown button like the "Select All" on in blob containers.
     *
     * We're expecting this HTML:
     *
     *   <div class="dropdown">
     *     <div class="dropdown-toggle">...</div>
     *     <div class="dropdown-menu popup">
     *       <div class="dropdown-menu-item">...</div>
     *       ...
     *     </div>
     *   </div>
     */
    var DropdownMenuKeyboardNavigationHelper = (function () {
        function DropdownMenuKeyboardNavigationHelper(dropdownButtonSelector, toggleDropdown) {
            this._toggleSelector = dropdownButtonSelector + " .dropdown-toggle";
            this._menuItemsSelector = dropdownButtonSelector + " .dropdown-menu-item";
            this._toggleDropdown = toggleDropdown;
        }
        DropdownMenuKeyboardNavigationHelper.prototype.attachEventHandlers = function () {
            var _this = this;
            var $toggle = $(this._toggleSelector), $menuItems = $(this._menuItemsSelector), menuItemsCount = $menuItems.length, $firstMenuItem = $menuItems.first(), $lastMenuItem = $menuItems.last();
            this.removeEventHandlersIfNeeded();
            var onToggleKeyHandler = function (eventObject) {
                var handled = false;
                // Toggle 'tab' event
                handled = StorageExplorerUtilities.onTab(eventObject, function ($sourceElement) {
                    $firstMenuItem.focus();
                }, /* metaKey*/ null, /* shiftKey */ false, /* altKey */ null);
                // Toggle 'shift+tab' event
                handled = handled || StorageExplorerUtilities.onTab(eventObject, function ($sourceElement) {
                    _this.collapseDropdown($toggle, eventObject, /* focusToggle */ false);
                }, /* metaKey */ null, /* shiftKey */ true, /* altKey */ null);
                // Toggle 'up arrow' / 'down arrow' events
                handled = handled || StorageExplorerUtilities.onKeys(eventObject, [KeyCodes_1.default.UpArrow, KeyCodes_1.default.DownArrow], function ($sourceElement) {
                    $firstMenuItem.focus();
                });
                // 'esc' event
                handled = handled || StorageExplorerUtilities.onEsc(eventObject, function ($sourceElement) {
                    _this.collapseDropdown($toggle, eventObject, /* focusToggle */ false);
                });
                if (handled) {
                    eventObject.preventDefault();
                }
            };
            this._onToggle = this.attachEvent($toggle, "keydown", onToggleKeyHandler);
            var onFirstMenuItemKeyHandler = function (eventObject) {
                // First menu item 'shift+tab' event
                var handled = StorageExplorerUtilities.onTab(eventObject, function ($sourceElement) {
                    _this.collapseDropdown($toggle, eventObject);
                }, /* metaKey */ null, /* shiftKey */ true, /* altKey */ null);
                if (handled) {
                    eventObject.preventDefault();
                }
            };
            this._onFirstMenuItem = this.attachEvent($firstMenuItem, "keydown", onFirstMenuItemKeyHandler);
            var onLastMenuItemKeyHandler = function (eventObject) {
                // Last menu item 'tab' event
                var handled = StorageExplorerUtilities.onTab(eventObject, function ($sourceElement) {
                    _this.collapseDropdown($toggle, eventObject);
                }, /* metaKey*/ null, /* shiftKey */ false, /* altKey */ null);
                if (handled) {
                    eventObject.preventDefault();
                }
            };
            this._onLastMenuItem = this.attachEvent($lastMenuItem, "keydown", onLastMenuItemKeyHandler);
            var onMenuItemKeyHandler = function (eventObject) {
                var handled = false;
                // 'down arrow' event
                handled = StorageExplorerUtilities.onDownArrow(eventObject, function ($sourceElement) {
                    var index = $menuItems.index($sourceElement), nextIndex = index + 1;
                    if (nextIndex < menuItemsCount) {
                        $($menuItems.get(nextIndex)).focus();
                    }
                    else {
                        $firstMenuItem.focus();
                    }
                });
                // 'up arrow' event
                handled = handled || StorageExplorerUtilities.onUpArrow(eventObject, function ($sourceElement) {
                    var index = $menuItems.index($sourceElement), nextIndex = index - 1;
                    if (nextIndex < 0) {
                        $lastMenuItem.focus();
                    }
                    else {
                        $($menuItems.get(nextIndex)).focus();
                    }
                });
                // 'esc' event
                handled = handled || StorageExplorerUtilities.onEsc(eventObject, function ($sourceElement) {
                    _this.collapseDropdown($toggle, eventObject);
                });
                if (handled) {
                    eventObject.preventDefault();
                }
            };
            this._onMenuItem = this.attachEvent($menuItems, "keydown", onMenuItemKeyHandler);
        };
        DropdownMenuKeyboardNavigationHelper.prototype.removeEventHandlers = function () {
            this.removeEventHandlersIfNeeded();
        };
        DropdownMenuKeyboardNavigationHelper.prototype.collapseDropdown = function ($toggle, eventObject, focusToggle) {
            if (focusToggle === void 0) { focusToggle = true; }
            if ($.isFunction(this._toggleDropdown)) {
                this._toggleDropdown();
                if (focusToggle) {
                    $toggle.focus();
                }
                this.removeEventHandlersIfNeeded();
            }
        };
        DropdownMenuKeyboardNavigationHelper.prototype.removeEventHandlersIfNeeded = function () {
            if (this._onToggle) {
                this.removeEvent(this._onToggle);
                this._onToggle = null;
            }
            if (this._onFirstMenuItem) {
                this.removeEvent(this._onFirstMenuItem);
                this._onFirstMenuItem = null;
            }
            if (this._onLastMenuItem) {
                this.removeEvent(this._onLastMenuItem);
                this._onLastMenuItem = null;
            }
            if (this._onMenuItem) {
                this.removeEvent(this._onMenuItem);
                this._onMenuItem = null;
            }
        };
        DropdownMenuKeyboardNavigationHelper.prototype.attachEvent = function ($element, event, handler) {
            var elementEventHandler = null;
            if ($element && $element.length && !!event && $.isFunction(handler)) {
                $element.on(event, handler);
                elementEventHandler = { $element: $element, event: event, handler: handler };
            }
            return elementEventHandler;
        };
        DropdownMenuKeyboardNavigationHelper.prototype.removeEvent = function (elementEventHandler) {
            if (elementEventHandler) {
                elementEventHandler.$element.off(elementEventHandler.event, elementEventHandler.handler);
            }
        };
        return DropdownMenuKeyboardNavigationHelper;
    }());
    return DropdownMenuKeyboardNavigationHelper;
});
