"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Assert_1 = require("../Components/TestManager/Assert");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var SasToken_1 = require("../Components/AzureStorage/Sas/Parsers/SasToken");
var SasTokenValidator_1 = require("../Components/AzureStorage/Sas/Validators/SasTokenValidator");
var SasTokenValidationError_1 = require("../Components/AzureStorage/Sas/Validators/SasTokenValidationError");
var SasTests = (function (_super) {
    tslib_1.__extends(SasTests, _super);
    function SasTests(activityManager) {
        var _this = _super.call(this, "SAS Token Validation Tests", activityManager) || this;
        _this._valid_expiry = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=c&sig=0123456789abcdef", true)];
            });
        }); };
        _this._valid_identifier = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("si=policy-id&sv=2017-04-17&sr=c&sig=0123456789abcdef", true)];
            });
        }); };
        _this._valid_account = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&ss=bqtf&srt=sco&sig=0123456789abcdef", true)];
            });
        }); };
        _this._invalid_empty = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("", false, SasTokenValidationError_1.default.TokenEmpty)];
            });
        }); };
        _this._invalid_missingSignature = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=c", false, SasTokenValidationError_1.default.MissingParamSignature)];
            });
        }); };
        _this._invalid_missingVersion = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sr=c&sig=0123456789abcdef", false, SasTokenValidationError_1.default.MissingParamVersion)];
            });
        }); };
        _this._invalid_missingExpiryOrIdentifier = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("sp=rwl&sv=2017-04-17&sr=c&sig=0123456789abcdef", false, SasTokenValidationError_1.default.MissingParamExpiryOrIdentifier)];
            });
        }); };
        _this._invalid_missingPermissions = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sv=2017-04-17&sr=c&sig=0123456789abcdef", false, SasTokenValidationError_1.default.MissingParamPermissions)];
            });
        }); };
        _this._invalid_expired = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getExpiredExpiry() + "&sp=rwl&sv=2017-04-17&sr=c&sig=0123456789abcdef", false, SasTokenValidationError_1.default.Expired)];
            });
        }); };
        _this._invalid_missingServices = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&srt=sco&sig=0123456789abcdef", false, SasTokenValidationError_1.default.MissingParamServices)];
            });
        }); };
        _this._invalid_missingResourceTypes = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&ss=bqtf&sig=0123456789abcdef", false, SasTokenValidationError_1.default.MissingParamResourceTypes)];
            });
        }); };
        _this._invalid_accountServiceAccess = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&ss=bqtf&srt=co&sig=0123456789abcdef", false, SasTokenValidationError_1.default.InadequateAccountResourceTypeAccess)];
            });
        }); };
        _this._invalid_accountPermissions = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rw&sv=2017-04-17&ss=bqtf&srt=sco&sig=0123456789abcdef", false, SasTokenValidationError_1.default.InadequateAccountPermissions)];
            });
        }); };
        _this._invalid_blobAttach = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=b&sig=0123456789abcdef", false, SasTokenValidationError_1.default.UnsupportedAttach)];
            });
        }); };
        _this._invalid_blobPermissions = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "sp=rw&sv=2017-04-17&sr=c&sig=0123456789abcdef", false, SasTokenValidationError_1.default.InadequateBlobPermissions)];
            });
        }); };
        _this._invalid_fileAttach = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=f&sig=0123456789abcdef", false, SasTokenValidationError_1.default.UnsupportedAttach)];
            });
        }); };
        _this._invalid_filePermissions = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=rw&sv=2017-04-17&sr=s&sig=0123456789abcdef", false, SasTokenValidationError_1.default.InadequateFilePermissions)];
            });
        }); };
        _this._invalid_queuePermissions = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=w&sv=2017-04-17&sig=0123456789abcdef", false, SasTokenValidationError_1.default.InadequateQueuePermissions)];
            });
        }); };
        _this._invalid_tablePermissions = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("se=" + this._getCurrentExpiry() + "&sp=a&sv=2017-04-17&tn=resource&sig=0123456789abcdef", false, SasTokenValidationError_1.default.InadequateTablePermissions)];
            });
        }); };
        _this.addTest(new Test_1.default("Valid SAS Token (Expiry)", _this._valid_expiry, _this, activityManager));
        _this.addTest(new Test_1.default("Valid SAS Token (Identifier)", _this._valid_identifier, _this, activityManager));
        _this.addTest(new Test_1.default("Valid SAS Token (Account)", _this._valid_account, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Empty)", _this._invalid_empty, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Missing Signature)", _this._invalid_missingSignature, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Missing Version)", _this._invalid_missingVersion, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Missing Expiry or Identifier)", _this._invalid_missingExpiryOrIdentifier, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Missing Permissions)", _this._invalid_missingPermissions, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Expired)", _this._invalid_expired, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Missing Services)", _this._invalid_missingServices, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Missing Resource Types)", _this._invalid_missingResourceTypes, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Account Service Access)", _this._invalid_accountServiceAccess, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Account Permissions)", _this._invalid_accountPermissions, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Blob Attach)", _this._invalid_blobAttach, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Blob Permissions)", _this._invalid_blobPermissions, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (File Attach)", _this._invalid_fileAttach, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (File Permissions)", _this._invalid_filePermissions, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Queue Permissions)", _this._invalid_queuePermissions, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Token (Table Permissions)", _this._invalid_tablePermissions, _this, activityManager));
        return _this;
    }
    SasTests.prototype._runTest = function (token, expectedResult, expectedCode) {
        try {
            var validation = SasTokenValidator_1.default.validate(new SasToken_1.default(token));
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
    SasTests.prototype._getExpiredExpiry = function () {
        var expiry = new Date();
        expiry.setHours(expiry.getHours() - 1);
        return encodeURIComponent(expiry.toISOString());
    };
    return SasTests;
}(TestGroup_1.default));
exports.default = SasTests;
