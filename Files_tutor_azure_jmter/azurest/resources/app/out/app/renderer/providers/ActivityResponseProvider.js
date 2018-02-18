"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var _this = this;
var tslib_1 = require("tslib");
require("../marshalers/CloudExplorerProxyMarshaler");
var FeedbackManager_1 = require("../FeedbackManager");
var host = global.host;
module.exports = {
    "Activities.handleError": function (args) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var parameters;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, host.executeOperation("Environment.Dialogs.getDialogResult", {
                        id: "errorDetails",
                        parameters: {
                            sentiment: "frown",
                            title: "Error Details",
                            instructions: "You can help us improve by sending this error to Microsoft. " +
                                "Please provide a contact email in case we need more information and any additional details that can help us diagnose the problem.",
                            data: args.error
                        }
                    })];
                case 1:
                    parameters = _a.sent();
                    if (!parameters) return [3 /*break*/, 3];
                    return [4 /*yield*/, FeedbackManager_1.default.sendError(parameters.email, parameters.text, parameters.data)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); }
};
