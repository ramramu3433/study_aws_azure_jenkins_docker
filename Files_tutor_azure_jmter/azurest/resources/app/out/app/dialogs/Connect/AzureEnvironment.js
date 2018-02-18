"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var url = require("url");
var _string = require("underscore.string");
var ConnectDialogConstants = require("./ConnectDialogConstants");
var AzureEnvironment = (function () {
    function AzureEnvironment() {
        this.environmentName = "";
        this.configuration = {
            graphResource: {
                id: undefined,
                endpoint: undefined
            },
            armResource: {
                id: undefined,
                endpoint: undefined
            },
            portalEndpoint: undefined
        };
    }
    /**
     * Creates an AzureEnvironment object from a given name and configuration.
     * This method will not validate the contents of the object. It assumes all fields are valid.
     */
    AzureEnvironment.createFromExisting = function (envrionmentName, configuration) {
        var env = new AzureEnvironment();
        env.environmentName = envrionmentName;
        env.configuration = configuration;
        return env;
    };
    AzureEnvironment.prototype.getEnvironmentName = function () {
        return this.environmentName;
    };
    AzureEnvironment.prototype.getConfiguration = function () {
        return this.configuration;
    };
    AzureEnvironment.prototype.setEnvironmentName = function (name) {
        this.environmentName = name;
    };
    AzureEnvironment.prototype.validate = function (existingEnvironmentNames) {
        if (!this.environmentName) {
            return AzureEnvironmentValidationResult.NO_NAME;
        }
        if (AzureEnvironment.nameInUse(this.environmentName, existingEnvironmentNames)) {
            return AzureEnvironmentValidationResult.NAME_IN_USE;
        }
        if (AzureEnvironment.nameIsReserved(this.environmentName)) {
            return AzureEnvironmentValidationResult.RESERVED_NAME;
        }
        if (!this.configuration.host) {
            return AzureEnvironmentValidationResult.INVALID_HOST;
        }
        if (!AzureEnvironment.isHttpsUri(this.configuration.host)) {
            return AzureEnvironmentValidationResult.INVALID_HOST;
        }
        if (!AzureEnvironment.hasNoTrailingSlashes(this.configuration.host)) {
            return AzureEnvironmentValidationResult.INVALID_HOST;
        }
        if (!this.configuration.signInResourceId) {
            return AzureEnvironmentValidationResult.SIGN_IN_RESOURCE_ID;
        }
        if (!this.configuration.graphResource.id) {
            return AzureEnvironmentValidationResult.GRAPH_RESOURCE_ID;
        }
        if (!this.configuration.graphResource.endpoint) {
            return AzureEnvironmentValidationResult.GRAPH_RESOURCE_ENDPOINT;
        }
        if (!AzureEnvironment.isHttpsUri(this.configuration.graphResource.endpoint)) {
            return AzureEnvironmentValidationResult.GRAPH_RESOURCE_ENDPOINT;
        }
        if (!this.configuration.armResource.id) {
            return AzureEnvironmentValidationResult.ARM_RESOURCE_ID;
        }
        if (!this.configuration.armResource.endpoint) {
            return AzureEnvironmentValidationResult.ARM_RESOURCE_ENDPOINT;
        }
        if (!AzureEnvironment.isHttpsUri(this.configuration.armResource.endpoint)) {
            return AzureEnvironmentValidationResult.ARM_RESOURCE_ENDPOINT;
        }
        if (!!this.configuration.adTenants && !AzureEnvironment.hasNoEmptyValues(this.configuration.adTenants)) {
            return AzureEnvironmentValidationResult.INVALID_TENANTS;
        }
        return AzureEnvironmentValidationResult.OK;
    };
    AzureEnvironment.prototype.setHost = function (host) {
        this.configuration.host = host;
    };
    AzureEnvironment.prototype.setSignInResourceId = function (signInResourceId) {
        this.configuration.signInResourceId = signInResourceId;
    };
    AzureEnvironment.prototype.setGraphResourceId = function (graphResourceId) {
        this.configuration.graphResource.id = graphResourceId;
    };
    AzureEnvironment.prototype.setGraphResourceEndpoint = function (graphResourceEndpoint) {
        this.configuration.graphResource.endpoint = graphResourceEndpoint;
    };
    AzureEnvironment.prototype.setArmResourceId = function (armResourceId) {
        this.configuration.armResource.id = armResourceId;
    };
    AzureEnvironment.prototype.setArmResourceEndpoint = function (armResourceEndpoint) {
        this.configuration.armResource.endpoint = armResourceEndpoint;
    };
    AzureEnvironment.prototype.setPortalEndpoint = function (portalEndpoint) {
        this.configuration.portalEndpoint = portalEndpoint;
    };
    AzureEnvironment.prototype.setAadTenants = function (adTenants) {
        if (adTenants.length > 0) {
            this.configuration.adTenants = adTenants.split(",").map(function (id) { return id.trim(); });
        }
        else {
            this.configuration.adTenants = undefined;
        }
    };
    AzureEnvironment.prototype.updateConfigFromArmEndpointAsync = function (host) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var endpointsUri, response, data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpointsUri = AzureEnvironment.trimTrailingSlashes(this.configuration.armResource.endpoint) + "/metadata/endpoints?api-version=1.0";
                        return [4 /*yield*/, host.executeOperation("Request.get", { uri: endpointsUri })];
                    case 1:
                        response = _a.sent();
                        try {
                            data = JSON.parse(response.body);
                            this.setHost(AzureEnvironment.trimTrailingSlashes(data.authentication.loginEndpoint));
                            this.setSignInResourceId(data.authentication.audiences[0]);
                            this.setGraphResourceEndpoint(data.graphEndpoint);
                            this.setArmResourceId(data.authentication.audiences[0]);
                            this.setPortalEndpoint(data.portalEndpoint);
                        }
                        catch (err) {
                            throw "Unable to parse info from endpoint.";
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AzureEnvironment.nameInUse = function (name, existingEnvironmentNames) {
        for (var i = 0; i < existingEnvironmentNames.length; i++) {
            if (existingEnvironmentNames[i] === name) {
                return true;
            }
        }
        return false;
    };
    AzureEnvironment.nameIsReserved = function (name) {
        // using one of these values would override the national cloud settings
        var normalAzureEnvironments = ConnectDialogConstants.azureEnvironments;
        for (var i = 0; i < normalAzureEnvironments.length; i++) {
            if (normalAzureEnvironments[i].value === name) {
                return true;
            }
        }
        // although there's nothing wrong with using a name like this one, it would
        // look confusing in the dropdown
        if (_string.startsWith(name.toLowerCase(), "Create New Environment")) {
            return true;
        }
        return false;
    };
    AzureEnvironment.trimTrailingSlashes = function (url) {
        return url.replace(/\/+$/, "");
    };
    AzureEnvironment.isHttpsUri = function (httpUrl) {
        var uri = url.parse(httpUrl);
        if (uri.protocol !== "https:") {
            return false;
        }
        if (!uri.hostname) {
            return false;
        }
        return true;
    };
    AzureEnvironment.hasNoTrailingSlashes = function (url) {
        var match = url.match(/\/+$/);
        if (!!match && match.length > 0) {
            return false;
        }
        return true;
    };
    AzureEnvironment.hasNoEmptyValues = function (values) {
        // make sure no values are empty
        for (var i = 0; i < values.length; i++) {
            if (!values[i].length) {
                return false;
            }
        }
        return true;
    };
    return AzureEnvironment;
}());
exports.default = AzureEnvironment;
var AzureEnvironmentValidationResult;
(function (AzureEnvironmentValidationResult) {
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["OK"] = 0] = "OK";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["INVALID_HOST"] = 1] = "INVALID_HOST";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["INVALID_TENANTS"] = 2] = "INVALID_TENANTS";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["SIGN_IN_RESOURCE_ID"] = 3] = "SIGN_IN_RESOURCE_ID";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["GRAPH_RESOURCE_ID"] = 4] = "GRAPH_RESOURCE_ID";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["GRAPH_RESOURCE_ENDPOINT"] = 5] = "GRAPH_RESOURCE_ENDPOINT";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["ARM_RESOURCE_ID"] = 6] = "ARM_RESOURCE_ID";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["ARM_RESOURCE_ENDPOINT"] = 7] = "ARM_RESOURCE_ENDPOINT";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["NO_NAME"] = 8] = "NO_NAME";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["NAME_IN_USE"] = 9] = "NAME_IN_USE";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["RESERVED_NAME"] = 10] = "RESERVED_NAME";
    AzureEnvironmentValidationResult[AzureEnvironmentValidationResult["NA"] = 11] = "NA";
})(AzureEnvironmentValidationResult = exports.AzureEnvironmentValidationResult || (exports.AzureEnvironmentValidationResult = {}));
;
