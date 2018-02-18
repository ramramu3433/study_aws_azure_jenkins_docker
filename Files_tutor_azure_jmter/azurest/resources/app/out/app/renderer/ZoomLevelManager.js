"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var host = global.host;
var ZoomLevelManager = (function () {
    function ZoomLevelManager() {
        var zoomFactor = JSON.parse(localStorage.getItem("zoom-factor"));
        if (zoomFactor) {
            this.zoomFactor = zoomFactor;
        }
    }
    Object.defineProperty(ZoomLevelManager.prototype, "zoomFactor", {
        /**
         * Gets the application's current zoom factor.
         */
        get: function () {
            return electron_1.webFrame.getZoomFactor();
        },
        /**
         * Sets the application's zoom factor.
         */
        set: function (newFactor) {
            if (newFactor < .25) {
                newFactor = .25;
            }
            else if (newFactor > 3) {
                newFactor = 3;
            }
            electron_1.webFrame.setZoomFactor(newFactor);
            localStorage.setItem("zoom-factor", JSON.stringify(electron_1.webFrame.getZoomFactor()));
            host.raiseEvent("Environment.Zoom.onZoomChanged", { zoomFactor: newFactor });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Increases the zoom level by 25%.
     */
    ZoomLevelManager.prototype.increaseZoom = function () {
        this.zoomFactor = this.zoomFactor + .25;
    };
    /**
     * Decreases the zoom level by 25%.
     */
    ZoomLevelManager.prototype.decreaseZoom = function () {
        this.zoomFactor = this.zoomFactor - .25;
    };
    /**
     * Resets the zoom level to 100%.
     */
    ZoomLevelManager.prototype.resetZoom = function () {
        this.zoomFactor = 1;
    };
    return ZoomLevelManager;
}());
var instance = new ZoomLevelManager();
exports.default = instance;
