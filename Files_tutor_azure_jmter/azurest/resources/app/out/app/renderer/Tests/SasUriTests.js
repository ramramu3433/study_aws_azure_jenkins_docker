"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Assert_1 = require("../Components/TestManager/Assert");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var SasUri_1 = require("../Components/AzureStorage/Sas/Parsers/SasUri");
var SasUriValidator_1 = require("../Components/AzureStorage/Sas/Validators/SasUriValidator");
var SasUriValidationError_1 = require("../Components/AzureStorage/Sas/Validators/SasUriValidationError");
var SasTests = (function (_super) {
    tslib_1.__extends(SasTests, _super);
    function SasTests(activityManager) {
        var _this = _super.call(this, "SAS URI Validation Tests", activityManager) || this;
        _this._valid_service = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("https://test.blob.core.windows.net/resource?se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=c&sig=0123456789abcdef", true)];
            });
        }); };
        _this._valid_account = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("https://test.blob.core.windows.net?se=" + this._getCurrentExpiry() + "&ss=b&srt=s&sp=rwl&sv=2017-04-17&sig=0123456789abcdef", true)];
            });
        }); };
        _this._valid_accountWithSlash = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("https://test.blob.core.windows.net/?se=" + this._getCurrentExpiry() + "&ss=b&srt=s&sp=rwl&sv=2017-04-17&sig=0123456789abcdef", true)];
            });
        }); };
        _this._invalid_empty = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("", false, SasUriValidationError_1.default.UriEmpty)];
            });
        }); };
        _this._invalid_missingProtocol = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("/test.blob.core.windows.net?se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=c&sig=0123456789abcdef", false, SasUriValidationError_1.default.UriMissingProtocol)];
            });
        }); };
        _this._invalid_missingHostname = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("https:///resource?se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=c&sig=0123456789abcdef", false, SasUriValidationError_1.default.UriMissingHost)];
            });
        }); };
        _this._invalid_serviceMissingPath = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("https://test.blob.core.windows.net?se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=c&sig=0123456789abcdef", false, SasUriValidationError_1.default.UriMissingPath)];
            });
        }); };
        _this.addTest(new Test_1.default("Valid Service SAS URI", _this._valid_service, _this, activityManager));
        _this.addTest(new Test_1.default("Valid Account SAS URI", _this._valid_account, _this, activityManager));
        _this.addTest(new Test_1.default("Valid Account SAS URI (Trailing Slash)", _this._valid_accountWithSlash, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS URI (Empty)", _this._invalid_empty, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS URI (Missing Protocol)", _this._invalid_missingProtocol, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS URI (Missing Hostname)", _this._invalid_missingHostname, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid Service SAS URI (Missing Path)", _this._invalid_serviceMissingPath, _this, activityManager));
        return _this;
    }
    SasTests.prototype._runTest = function (uri, expectedResult, expectedCode) {
        try {
            var validation = SasUriValidator_1.default.validate(new SasUri_1.default(uri));
            if (expectedResult) {
                Assert_1.default(validation.isValid, "Expected validation result to be valid.");
                Assert_1.default(validation.errors.length === 0, "Expected validation result to have 0 errors; actual " + validation.errors.length + ".");
            }
            else {
                Assert_1.default(!validation.isValid, "Expected validation result be invalid.");
                Assert_1.default(validation.errors.length > 0, "Expected validation result to have at least 1 error; actual " + validation.errors.length + ".");
            }
            if (!!expectedCode) {
                Assert_1.default(validation.errors.some(function (error) { return error.code === expectedCode; }), "Expected validation to have error with code '" + expectedCode + "'.");
            }
        }
        catch (error) {
            Assert_1.default(false, error);
        }
        return true;
    };
    SasTests.prototype._getCurrentExpiry = function () {
        var expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        return encodeURIComponent(expiry.toISOString());
    };
    return SasTests;
}(TestGroup_1.default));
exports.default = SasTests;
