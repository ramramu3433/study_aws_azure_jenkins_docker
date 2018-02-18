/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "URIjs/URITemplate", "Common/Errors"], function (require, exports, URITemplate, Errors) {
    "use strict";
    var AttributeLoaderHelper = (function () {
        function AttributeLoaderHelper(azureConnection) {
            var _this = this;
            this.getRequest = function (urlTemplate, args) {
                return _this._executeRequest(urlTemplate, "GET", args);
            };
            this.postRequest = function (urlTemplate, args) {
                return _this._executeRequest(urlTemplate, "POST", args);
            };
            this.handleRequestError = function (err) {
                if (err.name === Errors.errorNames.ActionableError) {
                    return { results: [], error: err };
                }
                else {
                    throw err;
                }
            };
            this._executeRequest = function (urlTemplate, method, args) {
                var subscription = JSON.parse(args.subscription);
                var url = urlTemplate.expand({
                    apiVersion: args.apiVersion,
                    managementEndpoint: subscription.managementEndpoint,
                    resourceId: args.id
                });
                return _this._azureConnection.webRequest(url.toString(), subscription, method)
                    .then(function (response) { return JSON.parse(response); });
            };
            this._azureConnection = azureConnection;
        }
        return AttributeLoaderHelper;
    }());
    // Azure resources can be in one of the following states (NotInstalled, Succeeded, Failed, Updating, Creating).
    // Consider the resource to be "installed" when it is in transient state.
    // Transient states (Updating, Creating) will eventually reach either Succeeded or Failed.
    AttributeLoaderHelper.isInstalledState = function (state) {
        return state === "Succeeded" || state === "Updating" || state === "Creating";
    };
    AttributeLoaderHelper.ResourceUriTemplate = URITemplate("{+managementEndpoint}/{+resourceId}/?api-version={+apiVersion}");
    return AttributeLoaderHelper;
});
