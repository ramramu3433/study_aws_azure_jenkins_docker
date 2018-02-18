"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var AddWithKeyPanelViewModel_1 = require("./Panels/AddWithKeyPanelViewModel");
var AddWithSasPanelViewModel_1 = require("./Panels/AddWithSasPanelViewModel");
var AwaitAuthenticationPanelViewModel_1 = require("./Panels/AwaitAuthenticationPanelViewModel");
var ConnectOptionsPanelViewModel_1 = require("./Panels/ConnectOptionsPanelViewModel");
var CustomEnvironmentViewModel_1 = require("./Panels/CustomEnvironmentViewModel");
var MultipanelDialogViewModel_1 = require("../Common/MultipanelDialogViewModel");
var SummaryPanelViewModel_1 = require("./Panels/SummaryPanelViewModel");
var DialogOperationRouterProxy_1 = require("../Common/DialogOperationRouterProxy");
var AzureStackEnvironmentPanelViewModel_1 = require("./Panels/AzureStackEnvironmentPanelViewModel");
var ConnectDialogViewModel = (function (_super) {
    tslib_1.__extends(ConnectDialogViewModel, _super);
    function ConnectDialogViewModel(args) {
        var _this = _super.call(this) || this;
        _this.host = DialogOperationRouterProxy_1.default;
        _this.addWithKeyPanel = new AddWithKeyPanelViewModel_1.default(_this);
        _this.addWithSasPanel = new AddWithSasPanelViewModel_1.default(_this);
        _this.connectOptionsPanel = new ConnectOptionsPanelViewModel_1.default(_this);
        _this.awaitAuthPanel = new AwaitAuthenticationPanelViewModel_1.default(_this);
        _this.createEnvironmentPanel = new CustomEnvironmentViewModel_1.default(_this);
        _this.azureStackEnvironmentPanel = new AzureStackEnvironmentPanelViewModel_1.default(_this);
        _this.summaryPanel = new SummaryPanelViewModel_1.default(_this);
        _this._args = args.args;
        return _this;
    }
    ConnectDialogViewModel.prototype.onShow = function () {
        if (!!this._args && !!this._args.accountId) {
            this.openAwaitAuth(this._args);
        }
        else {
            this.connectOptionsPanel.show();
        }
    };
    ConnectDialogViewModel.prototype.openConnectOptions = function () {
        this.connectOptionsPanel.show();
    };
    ConnectDialogViewModel.prototype.openAwaitAuth = function (args) {
        this.awaitAuthPanel.show(args);
    };
    ConnectDialogViewModel.prototype.openCustomEnvironment = function (args) {
        this.createEnvironmentPanel.show(args);
    };
    ConnectDialogViewModel.prototype.openAzureStackEnvironment = function (args) {
        this.azureStackEnvironmentPanel.show(args);
    };
    ConnectDialogViewModel.prototype.openSummary = function (args) {
        this.summaryPanel.show(args);
    };
    ConnectDialogViewModel.prototype.openAddWithKey = function () {
        this.addWithKeyPanel.show();
    };
    ConnectDialogViewModel.prototype.openAddWithSas = function () {
        this.addWithSasPanel.show();
    };
    return ConnectDialogViewModel;
}(MultipanelDialogViewModel_1.default));
exports.default = ConnectDialogViewModel;
