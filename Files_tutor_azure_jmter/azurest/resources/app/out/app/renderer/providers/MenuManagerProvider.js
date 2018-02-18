"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var electron_1 = require("electron");
var Q = require("q");
var $ = require("jquery");
var convertMenuItemsToMenuItemConstructorOptions = function (menuItems, click) {
    return menuItems.map(function (menuItem) {
        return {
            id: menuItem.id,
            type: menuItem.type,
            label: menuItem.label,
            enabled: menuItem.enabled,
            visible: menuItem.visible,
            click: function () {
                click(menuItem.id);
            },
            submenu: menuItem.submenu ? convertMenuItemsToMenuItemConstructorOptions(menuItem.submenu, click) : undefined
        };
    });
};
var determineOffsetFromFramePositionsAndAnchor = function (anchor, iFrameStack) {
    var x;
    var y;
    if (anchor) {
        var $parent = $(document);
        var offsetX = 0;
        var offsetY = 0;
        if (iFrameStack) {
            iFrameStack.forEach(function (iFrameSelector) {
                var iFrame = $parent.find(iFrameSelector);
                var iFrameOffset = iFrame.offset();
                offsetX += iFrameOffset.left;
                offsetY += iFrameOffset.top;
                $parent = iFrame.contents();
            });
        }
        var $anchor = $parent.find(anchor);
        x = Math.round(offsetX + $anchor.offset().left);
        y = Math.round(offsetY + $anchor.offset().top + $anchor.height());
    }
    return { x: x, y: y };
};
var openMenuDeferred;
var menuManagerProvider = {
    "MenuManager.showMenu": function (args) {
        // Only one menu can exist at a time. Resolve pre-exisiting deferred.
        if (openMenuDeferred) {
            var oldDeferred = openMenuDeferred;
            openMenuDeferred = null;
            oldDeferred.resolve();
        }
        // If none of the menu items are visible, we shouldn't display the menu at all.
        if (args.menuItems.every(function (menuItem) { return !menuItem.visible; })) {
            return Q.resolve(undefined);
        }
        openMenuDeferred = Q.defer();
        var anchorOffset = determineOffsetFromFramePositionsAndAnchor(args.anchor, args.iFrameStack);
        var x = anchorOffset.x;
        var y = anchorOffset.y;
        var convertedItems = convertMenuItemsToMenuItemConstructorOptions(args.menuItems, function (id) {
            var oldDeferred = openMenuDeferred;
            openMenuDeferred = null;
            oldDeferred.resolve(id);
        });
        var menu = electron_1.remote.Menu.buildFromTemplate(convertedItems);
        // Handle zoom
        if (x && y) {
            var zoomFactor = electron_1.webFrame.getZoomFactor();
            x = Math.round(zoomFactor * x);
            y = Math.round(zoomFactor * y);
        }
        menu.popup(undefined, { async: true, x: x, y: y });
        return openMenuDeferred.promise;
    }
};
module.exports = menuManagerProvider;
