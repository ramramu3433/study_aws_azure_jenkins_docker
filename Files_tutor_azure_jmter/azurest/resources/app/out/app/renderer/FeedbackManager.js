"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var HttpRequest = require("./HttpRequest");
var TelemetryManager = require("./telemetry/TelemetryManager");
var electron_1 = require("electron");
var MachineTelemetryReporter_1 = require("./MachineTelemetryReporter");
var Utilities = require("../Utilities");
var packageInfo = require("../../../package.json");
var vsFeedbackUrl = "https://sendvsfeedback.cloudapp.net/api/verbatim";
var Sentiment;
(function (Sentiment) {
    Sentiment[Sentiment["Smile"] = 1] = "Smile";
    Sentiment[Sentiment["Frown"] = 0] = "Frown";
})(Sentiment || (Sentiment = {}));
var FeedbackManager = (function () {
    function FeedbackManager() {
    }
    FeedbackManager.prototype.sendASmile = function (email, text) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.submitFeedback(email, text, Sentiment.Smile)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        TelemetryManager.sendError("Standalone.FeedbackManager.sendASmile", err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FeedbackManager.prototype.sendAFrown = function (email, text) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.submitFeedback(email, text, Sentiment.Frown)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        TelemetryManager.sendError("Standalone.FeedbackManager.sendAFrown", err_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FeedbackManager.prototype.sendError = function (email, text, error) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var combinedText, err_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        combinedText = !!text && !!error ? text + "\n\n" + error : text || error;
                        return [4 /*yield*/, this.submitFeedback(email, combinedText, Sentiment.Frown, [{ type: "data", value: "error" }])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_3 = _a.sent();
                        TelemetryManager.sendError("Standalone.FeedbackManager.sendAFrown", err_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Submits feedback to VS Feedback service.
     *
     * @param tags Optional. An array of tags to apply to the feedback entry.
     */
    FeedbackManager.prototype.submitFeedback = function (email, text, sentiment, tags) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data, machineInfo, infoKey, stringData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            version: 1,
                            user: email,
                            userType: "External",
                            text: text,
                            source: "Send a smile",
                            sentiment: sentiment,
                            tags: [
                                { type: "product", value: "StorageExplorer" },
                                { type: "product-version", value: electron_1.remote.app.getVersion() },
                                { type: "int-version", value: packageInfo.intVersion },
                                { type: "support-id", value: Utilities.loadSettings("Standalone_Telemetry_UserId") }
                            ]
                        };
                        if (!!tags) {
                            data.tags = data.tags.concat(tags);
                        }
                        machineInfo = MachineTelemetryReporter_1.default.getMachineInfo();
                        for (infoKey in machineInfo) {
                            data.tags.push({
                                type: infoKey, value: machineInfo[infoKey]
                            });
                        }
                        stringData = JSON.stringify(data);
                        return [4 /*yield*/, HttpRequest.request({
                                url: vsFeedbackUrl,
                                method: "POST",
                                body: stringData,
                                headers: {
                                    "Content-Type": "application/json; charset=utf8",
                                    "Content-Length": stringData.length
                                }
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return FeedbackManager;
}());
var instance = new FeedbackManager();
exports.default = instance;
