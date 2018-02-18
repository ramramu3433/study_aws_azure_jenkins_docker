/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "es6-promise", "knockout", "Providers/Common/BaseProvider"], function (require, exports, rsvp, ko, BaseProvider) {
    "use strict";
    var Promise = rsvp.Promise;
    /**
     * Implements the basics for binding to a panel.
     */
    var BasePanelViewModel = (function (_super) {
        __extends(BasePanelViewModel, _super);
        function BasePanelViewModel(panel, hostViewModel, showDetailsPanel) {
            var _this = _super.call(this, panel.providerNamespace, hostViewModel.host) || this;
            _this._hostViewModel = ko.observable();
            _this.showDetailsPanel = ko.observable();
            _this.isActive = ko.pureComputed(function () {
                var isActive = false;
                var hostViewModel = _this._hostViewModel();
                if (hostViewModel) {
                    var selectedPanel = hostViewModel.selectedPanel();
                    if (selectedPanel) {
                        isActive = (selectedPanel.panelViewModel === _this);
                    }
                }
                return isActive;
            });
            _this.bottomPixels = ko.pureComputed(function () {
                var footerHeight = 0;
                var environment = _this._hostViewModel().environmentObservables();
                if (environment) {
                    footerHeight = environment.activePanelFooterHeight() +
                        environment.searchBarHeight() + environment.actionLinksHeight();
                }
                return footerHeight + "px";
            });
            _this.initialize = function () { return Promise.resolve(); };
            _this.refresh = function () { return Promise.resolve(null); };
            _this.reset = function () { return Promise.resolve(null); };
            _this.setInitialFocus = function () { return Promise.resolve(null); };
            _this._hostViewModel(hostViewModel);
            _this._panel = panel;
            _this.showDetailsPanel(showDetailsPanel);
            return _this;
        }
        return BasePanelViewModel;
    }(BaseProvider));
    return BasePanelViewModel;
});
