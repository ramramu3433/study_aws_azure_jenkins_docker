"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Assert_1 = require("../Components/TestManager/Assert");
var TestGroup_1 = require("../Components/TestManager/TestGroup");
var Test_1 = require("../Components/TestManager/Test");
var ConnectionStringValidationError_1 = require("../Components/AzureStorage/ConnectionString/Validators/ConnectionStringValidationError");
var ConnectionString_1 = require("../Components/AzureStorage/ConnectionString/Parsers/ConnectionString");
var ConnectionStringValidator_1 = require("../Components/AzureStorage/ConnectionString/Validators/ConnectionStringValidator");
var ConnectionStringKey_1 = require("../Components/AzureStorage/ConnectionString/Parsers/ConnectionStringKey");
var ConnectionStringTests = (function (_super) {
    tslib_1.__extends(ConnectionStringTests, _super);
    function ConnectionStringTests(activityManager) {
        var _this = _super.call(this, "Connection String Validation Tests", activityManager) || this;
        _this._valid_key = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("AccountName=test;AccountKey=keykeykey", true)];
            });
        }); };
        _this._valid_sasMultipleEndpoints = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var connectionString;
            return tslib_1.__generator(this, function (_a) {
                connectionString = "BlobEndpoint=https://davidlisb1234.blob.core.windows.net/;" +
                    "FileEndpoint=https://davidlisb1234.file.core.windows.net/;" +
                    "QueueEndpoint=https://davidlisb1234.queue.core.windows.net/;" +
                    "TableEndpoint=https://davidlisb1234.table.core.windows.net/;" +
                    ("SharedAccessSignature=sv=2017-04-17&ss=bfqt&srt=sco&sp=l&st=2017-09-26T10%3A11%3A00Z&se=" + this._getCurrentExpiry() + "&sig=0123456789abcdef;");
                return [2 /*return*/, this._runTest(connectionString, true)];
            });
        }); };
        _this._valid_sas = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("BlobEndpoint=https://test.blob.core.windows.net;" +
                        ("SharedAccessSignature=se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&ss=bqtf&srt=sco&sig=0123456789abcdef;"), true)];
            });
        }); };
        _this._invalid_empty = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("", false, ConnectionStringValidationError_1.default.ConnectionStringEmpty)];
            });
        }); };
        _this._invalid_missingKeyOrToken = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("AccountName=test;", false, ConnectionStringValidationError_1.default.MissingAccountKeyOrToken)];
            });
        }); };
        _this._invalid_missingName = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("AccountKey=keykeykey", false, ConnectionStringValidationError_1.default.MissingAccountName)];
            });
        }); };
        _this._invalid_missingEndpoint = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("SharedAccessSignature=se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&ss=bqtf&srt=sco&sig=0123456789abcdef;", false, ConnectionStringValidationError_1.default.MissingEndpoint)];
            });
        }); };
        _this._invalid_endpointWithPath = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("BlobEndpoint=https://test.blob.core.windows.net/resource;" +
                        ("SharedAccessSignature=se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&ss=bqtf&srt=sco&sig=0123456789abcdef;"), false, ConnectionStringValidationError_1.default.InvalidEndpoint)];
            });
        }); };
        _this._invalid_endpointWithQuery = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("BlobEndpoint=https://test.blob.core.windows.net?a=b;" +
                        ("SharedAccessSignature=se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&ss=bqtf&srt=sco&sig=0123456789abcdef;"), false, ConnectionStringValidationError_1.default.InvalidEndpoint)];
            });
        }); };
        _this._invalid_endpointAccountTokenMismatch = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("BlobEndpoint=https://test.blob.core.windows.net?a=b;" +
                        ("SharedAccessSignature=se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&ss=qtf&srt=sco&sig=0123456789abcdef;"), false, ConnectionStringValidationError_1.default.InadequateAccountServiceAccess)];
            });
        }); };
        _this._invalid_endpointServiceTokenMismatch = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this._runTest("BlobEndpoint=https://test.blob.core.windows.net?a=b;" +
                        ("SharedAccessSignature=se=" + this._getCurrentExpiry() + "&sp=rwl&sv=2017-04-17&sr=s&sig=0123456789abcdef;"), false, ConnectionStringValidationError_1.default.InvalidEndpoint)];
            });
        }); };
        _this._createFromObjWithUndefineds = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var connectionStringValues, parsedConnectionString;
            return tslib_1.__generator(this, function (_a) {
                connectionStringValues = {
                    BlobEndpoint: undefined,
                    FileEndpoint: "https://davidlisb1234.file.core.windows.net/",
                    QueueEndpoint: null,
                    TableEndpoint: "https://davidlisb1234.table.core.windows.net/"
                };
                parsedConnectionString = new ConnectionString_1.default(ConnectionString_1.default.createFromValues(connectionStringValues));
                Assert_1.default(parsedConnectionString.hasConnectionStringKey(ConnectionStringKey_1.default.fileEndpoint), "Missing file endpoint");
                Assert_1.default(parsedConnectionString.hasConnectionStringKey(ConnectionStringKey_1.default.tableEndpoint), "Missing table endpoint");
                Assert_1.default(!parsedConnectionString.hasConnectionStringKey(ConnectionStringKey_1.default.blobEndpoint), "Should not have blob endpoint");
                Assert_1.default(!parsedConnectionString.hasConnectionStringKey(ConnectionStringKey_1.default.queueEndpoint), "Should not have queue endpoint");
                return [2 /*return*/, true];
            });
        }); };
        _this.addTest(new Test_1.default("Valid Key Connection String", _this._valid_key, _this, activityManager));
        _this.addTest(new Test_1.default("Valid SAS Connection String", _this._valid_sas, _this, activityManager));
        _this.addTest(new Test_1.default("Valid SAS Connection String (Multiple Endpoints)", _this._valid_sasMultipleEndpoints, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid Connection String (Empty)", _this._invalid_empty, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid Key Connection String (Missing Key)", _this._invalid_missingKeyOrToken, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid Key Connection String (Missing Name)", _this._invalid_missingName, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Connection String (Missing Endpoint)", _this._invalid_missingEndpoint, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Connection String (Endpoint with Path)", _this._invalid_endpointWithPath, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Connection String (Endpoint with Query)", _this._invalid_endpointWithQuery, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Connection String (Endpoint Account Token Mismatch)", _this._invalid_endpointAccountTokenMismatch, _this, activityManager));
        _this.addTest(new Test_1.default("Invalid SAS Connection String (Endpoint Service Token Mismatch)", _this._invalid_endpointServiceTokenMismatch, _this, activityManager));
        _this.addTest(new Test_1.default("Create Connection String From Key/Value Pair Obj, With Some Key/Value Pairs Having No Value", _this._createFromObjWithUndefineds, _this, activityManager));
        return _this;
        // TODO: [cralvord] Add tests for key/name strings
    }
    ConnectionStringTests.prototype._runTest = function (connectionString, expectedResult, expectedCode) {
        try {
            var validation = ConnectionStringValidator_1.default.validate(new ConnectionString_1.default(connectionString));
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
    ConnectionStringTests.prototype._getCurrentExpiry = function () {
        var expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        return encodeURIComponent(expiry.toISOString());
    };
    return ConnectionStringTests;
}(TestGroup_1.default));
exports.default = ConnectionStringTests;
