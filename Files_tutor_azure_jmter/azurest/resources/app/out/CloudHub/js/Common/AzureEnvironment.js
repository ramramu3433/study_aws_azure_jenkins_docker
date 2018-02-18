/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "URIjs/URI", "underscore.string", "Providers/Common/AzureStorageConstants", "jquery"], function (require, exports, URI, _string, AzureStorageConstants, $) {
    "use strict";
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
                }
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
        AzureEnvironment.prototype.validate = function (existingEnvironments) {
            if (!this.environmentName) {
                return AzureEnvironmentValidationResult.NO_NAME;
            }
            if (AzureEnvironment.nameInUse(this.environmentName, existingEnvironments)) {
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
        AzureEnvironment.prototype.updateConfigFromArmEndpointAsync = function () {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, $.get(AzureEnvironment.trimTrailingSlashes(this.configuration.armResource.endpoint) + "/metadata/endpoints?api-version=1.0")];
                        case 1:
                            data = _a.sent();
                            this.setHost(AzureEnvironment.trimTrailingSlashes(data.authentication.loginEndpoint));
                            this.setSignInResourceId(data.authentication.audiences[0]);
                            this.setGraphResourceEndpoint(data.graphEndpoint);
                            this.setArmResourceId(data.authentication.audiences[0]);
                            this.setPortalEndpoint(data.portalEndpoint);
                            return [2 /*return*/];
                    }
                });
            });
        };
        AzureEnvironment.nameInUse = function (name, existingEnvironments) {
            for (var i = 0; i < existingEnvironments.length; i++) {
                if (existingEnvironments[i].environmentName === name) {
                    return true;
                }
            }
        };
        AzureEnvironment.nameIsReserved = function (name) {
            // using one of these values would override the national cloud settings
            var normalAzureEnvironments = AzureStorageConstants.azureEnvironments;
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
        AzureEnvironment.isHttpsUri = function (url) {
            var uri = URI(url);
            if (uri.protocol() !== "https") {
                return false;
            }
            if (!uri.hostname()) {
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
    Object.defineProperty(exports, "__esModule", { value: true });
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
});
