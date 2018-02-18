"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var Assert_1 = require("../Components/TestManager/Assert");
var AzureEnvironment_1 = require("../../dialogs/Connect/AzureEnvironment");
var ConnectDialogConstants = require("../../dialogs/Connect/ConnectDialogConstants");
var AzureEnvironment_2 = require("../../dialogs/Connect/AzureEnvironment");
var AzureEnvironmentTests = (function (_super) {
    tslib_1.__extends(AzureEnvironmentTests, _super);
    function AzureEnvironmentTests(activityManager) {
        var _this = _super.call(this, "Azure Environment Tests", activityManager) || this;
        _this._goodEnvironment = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.OK, "Validation failed.");
                return [2 /*return*/, true];
            });
        }); };
        _this._missingName = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.NO_NAME, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._httpHost = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost("fasdfasd");
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.INVALID_HOST, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._hostWithSlashes = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host + "/");
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.INVALID_HOST, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._noHost = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.INVALID_HOST, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._noSignInResourceId = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.SIGN_IN_RESOURCE_ID, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._noGraphResourceId = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.GRAPH_RESOURCE_ID, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._httpGraphEndpoint = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint("http://graph.windows.net");
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.GRAPH_RESOURCE_ENDPOINT, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._noGraphEndpoint = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.GRAPH_RESOURCE_ENDPOINT, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._noArmResourceId = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.ARM_RESOURCE_ID, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._noArmEndpoint = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.ARM_RESOURCE_ENDPOINT, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._httpArmEndpoint = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("http://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.ARM_RESOURCE_ENDPOINT, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this._badTenantValues = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var env, validationResult;
            return tslib_1.__generator(this, function (_a) {
                env = new AzureEnvironment_1.default();
                env.setHost(ConnectDialogConstants.azureStackEnvironmentDefaults.host);
                env.setSignInResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.signInResourceId);
                env.setGraphResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setGraphResourceEndpoint(ConnectDialogConstants.azureStackEnvironmentDefaults.graphResource);
                env.setArmResourceId(ConnectDialogConstants.azureStackEnvironmentDefaults.armId);
                env.setArmResourceEndpoint("https://managment.azure.com");
                env.setEnvironmentName("test");
                env.setAadTenants("123,123,9847969,,32156");
                validationResult = env.validate([]);
                Assert_1.default(validationResult === AzureEnvironment_2.AzureEnvironmentValidationResult.INVALID_TENANTS, "Validation failed for the wrong reason");
                return [2 /*return*/, true];
            });
        }); };
        _this.addTest(new Test_1.default("Good Environment", _this._goodEnvironment, _this, activityManager));
        _this.addTest(new Test_1.default("Missing Name", _this._missingName, _this, activityManager));
        _this.addTest(new Test_1.default("Http Host", _this._httpHost, _this, activityManager));
        _this.addTest(new Test_1.default("Host Has Trailing Slash", _this._hostWithSlashes, _this, activityManager));
        _this.addTest(new Test_1.default("No Host", _this._noHost, _this, activityManager));
        _this.addTest(new Test_1.default("No Sign In Resource Id", _this._noSignInResourceId, _this, activityManager));
        _this.addTest(new Test_1.default("No Graph Resource Id", _this._noGraphResourceId, _this, activityManager));
        _this.addTest(new Test_1.default("Http Graph Endpoint", _this._httpGraphEndpoint, _this, activityManager));
        _this.addTest(new Test_1.default("No Graph Endpoint", _this._noGraphEndpoint, _this, activityManager));
        _this.addTest(new Test_1.default("No ARM Resource Id", _this._noArmResourceId, _this, activityManager));
        _this.addTest(new Test_1.default("No ARM Endpoint", _this._noArmEndpoint, _this, activityManager));
        _this.addTest(new Test_1.default("Http ARM Endpoint", _this._httpArmEndpoint, _this, activityManager));
        _this.addTest(new Test_1.default("Bad Tenant Values", _this._badTenantValues, _this, activityManager));
        return _this;
    }
    return AzureEnvironmentTests;
}(TestGroup_1.default));
exports.default = AzureEnvironmentTests;
