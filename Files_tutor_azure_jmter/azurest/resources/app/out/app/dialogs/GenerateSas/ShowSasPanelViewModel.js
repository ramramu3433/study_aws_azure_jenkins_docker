"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var $ = require("jquery");
var ko = require("knockout");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var PanelViewModel_1 = require("../Common/PanelViewModel");
/**
 * View model for Show Shared Access Signature dialog
 */
var ShowSasPanelViewModel = (function (_super) {
    tslib_1.__extends(ShowSasPanelViewModel, _super);
    function ShowSasPanelViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel) || this;
        /* Labels */
        _this.titleLabel = "Shared Access Signature"; // Localize
        _this.connectionLabel = "URL:"; // Localize
        _this.sasQueryStringLabel = "Query string:"; // Localize
        _this.waitLabel = "Generating..."; // Localize
        /* Controls */
        _this.closeKey = "close";
        _this.closeButtonLabel = "Close"; // Localize
        _this.copyButtonLabel = "Copy"; // Localize
        _this.copiedButtonLabel = "Copied"; // Localize
        _this.copiedButtonDelayInMilliseconds = 1000;
        _this.copyConnectionToClipboard = function (data, event) {
            _this.onCopy(_this.sasConnection(), event);
        };
        _this.copyTokenToClipboard = function (data, event) {
            _this.onCopy(_this.sasToken(), event);
        };
        _this.connectionString = parameters.connectionString;
        _this.sasConnection = ko.observable("");
        _this.sasToken = ko.observable("");
        _this.addCustomButton("back", "Back", function () { return _this.dialogViewModel.openGenerateSasPanel(); });
        _this.addCustomButton(_this.closeKey, _this.closeButtonLabel, function () { return _this.dialogViewModel.dialogResult(null); });
        return _this;
    }
    // TODO: Move this to CSS.
    ShowSasPanelViewModel.toggleForegroundBackgroundColor = function ($element) {
        if ($element.length) {
            var color = $element.css("color");
            $element.css("color", $element.css("background-color")).css("background-color", color);
        }
    };
    ShowSasPanelViewModel.prototype.getSasDataFromResult = function (result) {
        return {
            sasUrl: result.sasUrl,
            sasToken: result.sasToken
        };
    };
    ShowSasPanelViewModel.prototype.onCopy = function (sasData, event) {
        var _this = this;
        var sourceElement = event.target || event.srcElement;
        var button = $(sourceElement);
        if (!!sasData) {
            DialogOperationRouterProxy_1.default.executeOperation("Environment.Clipboard.setClipboardData", {
                format: "text",
                data: sasData
            });
            button.text(this.copiedButtonLabel);
            ShowSasPanelViewModel.toggleForegroundBackgroundColor(button);
            setTimeout(function () {
                button.text(_this.copyButtonLabel);
                ShowSasPanelViewModel.toggleForegroundBackgroundColor(button);
            }, this.copiedButtonDelayInMilliseconds);
        }
    };
    ShowSasPanelViewModel.prototype.load = function (parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, sasData, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.executeGenerateSasOperation(parameters)];
                    case 1:
                        result = _a.sent();
                        sasData = this.getSasDataFromResult(result);
                        // Display SAS URL or connection string and token (query string).
                        if (sasData.sasUrl) {
                            this.sasConnection(sasData.sasUrl);
                        }
                        else {
                            this.sasConnection(sasData.connectionString);
                        }
                        this.sasToken("?" + sasData.sasToken);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.showError("Error when calling Azure Storage:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ShowSasPanelViewModel;
}(PanelViewModel_1.default));
exports.default = ShowSasPanelViewModel;
