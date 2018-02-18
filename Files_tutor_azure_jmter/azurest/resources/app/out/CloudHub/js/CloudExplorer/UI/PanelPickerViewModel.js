/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore", "Providers/CloudExplorer/Actions/CloudExplorerActions"], function (require, exports, ko, underscore, CloudExplorerActions) {
    "use strict";
    var PanelPickerViewModel = (function () {
        function PanelPickerViewModel(host) {
            var _this = this;
            this.panelInfos = ko.observableArray([]);
            this.dropDownVisible = ko.observable(false);
            this.top = ko.observable(0);
            this.left = ko.observable(0);
            this._selectedPanelInfoViewModel = ko.observable();
            this.selectedPanelInfo = ko.computed({
                read: function () {
                    return _this._selectedPanelInfoViewModel() && _this._selectedPanelInfoViewModel().panelInfo;
                },
                write: function (value) {
                    var selectedPanelName = (value && value.name) || "";
                    _this._host.executeAction(CloudExplorerActions.setSettingsNamespace, {
                        settings: {
                            namespace: PanelPickerViewModel.uiSettingsNamespace,
                            properties: {
                                selectedPanelName: selectedPanelName
                            }
                        }
                    });
                    var panelViewModel = underscore.findWhere(_this.panelInfos(), { name: selectedPanelName });
                    return _this._selectedPanelInfoViewModel(panelViewModel);
                }
            });
            this.displayText = ko.pureComputed(function () {
                var panelViewModel = _this._selectedPanelInfoViewModel();
                return (panelViewModel)
                    ? panelViewModel.displayName()
                    : "";
            });
            this.isSelected = function (panel) {
                var panelViewModel = _this._selectedPanelInfoViewModel();
                return panelViewModel && panel.name === panelViewModel.name;
            };
            this.toggleDropdown = function () {
                _this.dropDownVisible(true);
            };
            this._host = host;
            this.panelInfos.subscribe(function (panels) {
                _this._host.executeAction(CloudExplorerActions.getSettingsNamespace, { namespace: PanelPickerViewModel.uiSettingsNamespace })
                    .then(function (settings) {
                    var panelViewModel;
                    if (settings && settings.selectedPanelName) {
                        panelViewModel = underscore.findWhere(panels, { name: settings.selectedPanelName });
                    }
                    _this._selectedPanelInfoViewModel(panelViewModel ? panelViewModel : panels[0]);
                }).then(null, function (err) {
                    _this._selectedPanelInfoViewModel(panels[0]);
                });
            });
        }
        return PanelPickerViewModel;
    }());
    PanelPickerViewModel.uiSettingsNamespace = "uiSettings";
    return PanelPickerViewModel;
});
