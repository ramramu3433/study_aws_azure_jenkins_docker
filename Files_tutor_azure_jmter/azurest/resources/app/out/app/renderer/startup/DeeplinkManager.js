"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var _string = require("underscore.string");
var constants = require("../../Constants");
var utilities = require("../../Utilities");
var DeeplinkManager = (function () {
    function DeeplinkManager(deeplinkUrl) {
        if (deeplinkUrl) {
            var queryString = this.convertDeeplinkUrlToQueryString(deeplinkUrl);
            if (queryString) {
                this._startupParameters = this.parseQueryString(queryString);
            }
        }
        else {
            this._startupParameters = this.getStartupParameters();
        }
    }
    Object.defineProperty(DeeplinkManager.prototype, "Parameters", {
        get: function () {
            return this._startupParameters;
        },
        enumerable: true,
        configurable: true
    });
    DeeplinkManager.prototype.getStartupParameters = function () {
        var cmdArgs = this.getCmdArgs();
        // The first command argument is always the app path.
        // The second command would be the deeplink URL.
        if (!cmdArgs || cmdArgs.length < 2) {
            return null;
        }
        // On OSX, sometimes the URL has an additional parameter in the process.argv. But the app paramater
        // will always be at the last index.
        var deeplinkUrl = cmdArgs[cmdArgs.length - 1];
        var queryString;
        if (deeplinkUrl) {
            queryString = this.convertDeeplinkUrlToQueryString(deeplinkUrl);
        }
        // If query string is not valid, we don't block app from opening.
        if (!queryString) {
            return null;
        }
        var startUpParameters;
        if (queryString) {
            startUpParameters = this.parseQueryString(queryString);
        }
        return startUpParameters;
    };
    DeeplinkManager.prototype.getCmdArgs = function () {
        var args;
        if (utilities.isWin()) {
            args = electron_1.remote.getGlobal(constants.sharedObjectName).args;
        }
        if (utilities.isOSX()) {
            args = electron_1.remote.getGlobal(constants.sharedObjectName).args;
            args.push(electron_1.remote.getGlobal(constants.macParams));
        }
        return args;
    };
    /**
     * Converts a given deep link URL to a query string.
     */
    DeeplinkManager.prototype.convertDeeplinkUrlToQueryString = function (deeplinkUrl) {
        // A standard Deeplink URL: storageexplorer:v=1&subscriptionid=value1&accountid=value2&resourcename=value3.
        // Hence extracting forward slashes.
        deeplinkUrl = deeplinkUrl.replace(/^[/]+/, "").replace(/[/]+$/, "");
        var queryString;
        // Verify if the deeplink respects storageexplorer protocol, i.e., starts with storageexplorer:
        if (_string.startsWith(deeplinkUrl, constants.deeplinkProtocol)) {
            // Extract the query string part, i.e., remove storageexplorer:
            queryString = deeplinkUrl.substr(constants.deeplinkProtocol.length);
        }
        return queryString;
    };
    /**
     * Parse query string v1.
     * Query strings have only protocol version, account name and subscription id.
     * E.g., storageexplorer:v=1&subscriptionid=value1&accountid=value2&resourcename=value3
     */
    DeeplinkManager.prototype.parseQueryString = function (queryString) {
        if (!queryString) {
            return null;
        }
        var querySegments = queryString.split("&");
        if (!querySegments || querySegments.length < 3) {
            return null;
        }
        var queryItems = this.getQueryItems(querySegments);
        var startupParameters;
        if (queryItems) {
            var accountId = this.getParameterFromQueryItems(constants.startupParameterNames.accountId, queryItems);
            if (accountId) {
                startupParameters = {
                    accountId: this.getParameterFromQueryItems(constants.startupParameterNames.accountId, queryItems),
                    subscriptionId: this.getParameterFromQueryItems(constants.startupParameterNames.subscriptionId, queryItems),
                    resourceType: this.getParameterFromQueryItems(constants.startupParameterNames.resourceType, queryItems),
                    resourceName: this.getParameterFromQueryItems(constants.startupParameterNames.resourceName, queryItems),
                    source: this.getParameterFromQueryItems(constants.startupParameterNames.source, queryItems)
                };
            }
        }
        return startupParameters;
    };
    DeeplinkManager.prototype.getParameterFromQueryItems = function (parameterName, queryItems) {
        return queryItems[parameterName];
    };
    /**
     * Extract all query items in the format of key value object.
     * E.g.,
     * Input:
     *  ["v=1", "subscriptionid=value1", "accountid=value2", "resourcename=value3"]
     * Output:
     *  {
     *      v: 1,
     *      subscriptionid: value1,
     *      accountid: value2,
     *      resourcename: value3
     *  }
     */
    DeeplinkManager.prototype.getQueryItems = function (items) {
        var _this = this;
        var queryItems = {};
        items.forEach(function (item) {
            var queryItem = _this.getQueryItem(item);
            if (queryItem) {
                queryItems[queryItem.key] = queryItem.value;
            }
        });
        return queryItems;
    };
    /**
     * Extract query item in the format of key value object.
     * E.g.,
     * Input:
     *  accountid=value1
     * Output:
     *  { key: accountid, value: value1 }
     */
    DeeplinkManager.prototype.getQueryItem = function (item) {
        var queryItem;
        if (item) {
            // CONSIDER: user urijs to build and parse query.
            var itemSegments = item.split("=");
            if (itemSegments && itemSegments.length === 2) {
                var queryKey = itemSegments[0].trim().toLowerCase();
                var queryValue = decodeURIComponent(itemSegments[1].trim());
                queryItem = { key: queryKey, value: queryValue };
            }
        }
        return queryItem;
    };
    return DeeplinkManager;
}());
exports.default = DeeplinkManager;
