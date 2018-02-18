"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var WizardPanelViewModel_1 = require("../../Common/WizardPanelViewModel");
var ConnectDialogPanelViewModel = (function (_super) {
    tslib_1.__extends(ConnectDialogPanelViewModel, _super);
    function ConnectDialogPanelViewModel(dialogViewModel, title) {
        var _this = _super.call(this, dialogViewModel) || this;
        _this.title(title);
        return _this;
    }
    return ConnectDialogPanelViewModel;
}(WizardPanelViewModel_1.default));
exports.default = ConnectDialogPanelViewModel;
