/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "CloudExplorer/UI/Details/BaseDetailsViewModel", "jquery"], function (require, exports, BaseDetailsViewModel, $) {
    "use strict";
    /**
     * NodeActions view representation
     */
    var ActionDetailsViewModel = (function (_super) {
        __extends(ActionDetailsViewModel, _super);
        function ActionDetailsViewModel(resourceResolver) {
            var _this = _super.call(this, "Actions", "actionDetailsTemplate", "View.ActionDetails.Name", resourceResolver) || this;
            _this.executeAction = function (action) {
                if (action.enabled()) {
                    var originalRefreshFrequency = _this.refreshFrequency;
                    _this.refreshFrequency = ActionDetailsViewModel._fastRefreshFrequency;
                    setTimeout(function () { return _this.refreshFrequency = originalRefreshFrequency; }, ActionDetailsViewModel._fastRefreshCount * ActionDetailsViewModel._fastRefreshFrequency);
                    _this.node().triggerAction(action, "ActionsPanel");
                }
            };
            _this._updateActionStatus = function () {
                if (_this.active() && _this.node()) {
                    _this.node().actions().forEach(function (action) {
                        action.updateStatus();
                    });
                }
            };
            _this.updateHandler = _this._updateActionStatus;
            return _this;
        }
        Object.defineProperty(ActionDetailsViewModel.prototype, "actions", {
            get: function () {
                var node = this.node();
                return node ? node.actions() : [];
            },
            enumerable: true,
            configurable: true
        });
        ActionDetailsViewModel.prototype.setFocus = function () {
            var firstActionElem = $(".action-details .action-link").first();
            if (!!firstActionElem) {
                firstActionElem.focus();
            }
        };
        return ActionDetailsViewModel;
    }(BaseDetailsViewModel));
    ActionDetailsViewModel._fastRefreshCount = 10;
    ActionDetailsViewModel._fastRefreshFrequency = 2000;
    return ActionDetailsViewModel;
});
