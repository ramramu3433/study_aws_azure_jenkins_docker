"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ko = require("knockout");
var q = require("q");
var $ = require("jquery");
var InfoBarViewModel = (function () {
    function InfoBarViewModel() {
        var _this = this;
        this._defaultCloseText = "Close";
        // Observables
        this.isShowing = ko.observable(false);
        this.links = ko.observableArray();
        this.message = ko.observable();
        this.closeText = ko.observable(this._defaultCloseText);
        /**
         * Resolves the promise to the index of what message was clicked. An index of
         * -1 means that close was clicked.
         */
        this.close = function (linkClicked) {
            if (linkClicked === void 0) { linkClicked = -1; }
            if (_this._promiseResolveHandle) {
                // Unresolved promise.
                // Resolve to false as the message is about to be closed.
                _this._promiseResolveHandle(linkClicked);
                _this._promiseResolveHandle = null;
            }
            // Hide the info bar
            _this.isShowing(false);
        };
        this.closeClicked = function () {
            _this.close(-1);
        };
        this.linkClicked = function (index) {
            _this.close(index);
        };
        this.showSingleLink = function (message, link, infobarType, closeText) {
            return _this.showMultiLink(message, link ? [link] : [], infobarType, closeText);
        };
        this.showMultiLink = function (message, links, infobarType, closeText) {
            if (_this.isShowing()) {
                // Close the prev info bar.
                _this.close(-2);
            }
            _this.closeText(_this._defaultCloseText);
            if (!!closeText) {
                _this.closeText(closeText);
            }
            // Set the text for the info bar.
            _this.links(links);
            _this.message(message);
            // Show the info bar now
            _this.isShowing(true);
            _this._infoBarType = infobarType;
            setTimeout(function () {
                $(".infoBar").attr("tabindex", 0).focus();
            }, 0);
            return q.Promise(function (resolve) {
                _this._promiseResolveHandle = resolve;
            });
        };
        this.updateMessage = function (newMessage) {
            _this.message(newMessage);
            return Promise.resolve(null);
        };
        this.getInfoBarType = function () {
            if (_this.isShowing()) {
                return _this._infoBarType;
            }
            return null;
        };
        this._promiseResolveHandle = null;
    }
    return InfoBarViewModel;
}());
module.exports = InfoBarViewModel;
