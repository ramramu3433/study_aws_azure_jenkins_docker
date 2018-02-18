/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "CloudExplorer/CloudExplorerHost", "Providers/Common/AzureConstants", "CloudExplorer/UI/AzureFilterPanelViewModel", "CloudExplorer/TreeNode/BindingHandler", "CloudExplorer/CloudExplorerConstants", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Providers/CloudExplorer/Resources/CloudExplorerResources", "CloudExplorer/UI/ContextMenuViewModel", "CloudExplorer/UI/NativeContextMenu", "CloudExplorer/UI/Details/DetailsPanelViewModel", "CloudExplorer/UI/EnvironmentObservables", "knockout", "CloudExplorer/UI/PanelInfoViewModel", "CloudExplorer/UI/PanelPickerViewModel", "CloudExplorer/UI/ToolbarViewModel", "CloudExplorer/UI/TreeViewPanelViewModel", "es6-promise", "Common/Utilities"], function (require, exports, CloudExplorerHost_1, AzureConstants, AzureFilterPanelViewModel, BindingHandler_1, CloudExplorerConstants, CloudExplorerActions, CloudExplorerResources, ContextMenuViewModel, NativeContextMenu, DetailsPanelViewModel, EnvironmentObservables, ko, PanelInfoViewModel, PanelPickerViewModel, ToolbarViewModel, TreeViewPanelViewModel, rsvp, Utilities) {
    "use strict";
    var Promise = rsvp.Promise;
    var LightSearchIconPath = "../../images/CloudExplorer/SearchIcon_whiteNoHalo_16x.png";
    var DarkSearchIconPath = "../../images/CloudExplorer/SearchIcon.png";
    /**
     * Main Cloud Explorer ViewModel
     */
    var CloudExplorerViewModel = (function () {
        function CloudExplorerViewModel() {
            var _this = this;
            this.environment = Utilities.isRunningOnElectron() ? "electron" : "vs";
            this.largeSpinnerIconData = {
                environment: this.environment,
                height: "36px",
                width: "36px",
                svg: "../../images/Common/Halo_ProgressSpinner.svg",
                dark: "../../images/Common/ProgressSpinner_DarkTheme_36x.gif",
                light: "../../images/Common/ProgressSpinner_LightTheme_36x.gif"
            };
            this.smallSpinnerIconData = {
                environment: this.environment,
                height: "16px",
                width: "16px",
                svg: "../../images/Common/Halo_ProgressSpinner.svg",
                dark: "../../images/Common/ProgressSpinner_DarkTheme_16x.gif",
                light: "../../images/Common/ProgressSpinner_LightTheme_16x.gif"
            };
            this.collapsedIconData = {
                environment: this.environment,
                height: "16px",
                width: "16px",
                svg: "../../images/CloudExplorer/Halo_GlyphRight.svg",
                dark: "../../images/CloudExplorer/ScrollbarArrowsCollapsed_noHaloWhite_16x.png",
                light: "../../images/CloudExplorer/ScrollbarArrowsCollapsed_noHalo1E_16x.png"
            };
            this.expandedIconData = {
                environment: this.environment,
                height: "16px",
                width: "16px",
                svg: "../../images/CloudExplorer/Halo_GlyphDownRight.svg",
                dark: "../../images/CloudExplorer/ScrollbarArrowsDownRight_noHaloWhite_16x.png",
                light: "../../images/CloudExplorer/ScrollbarArrowsDownRight_noHalo1E_16x.png"
            };
            this.searchIconData = {
                /*
                    Search icon colors (these are somewhat of an exception to how other icons are handled
                    due to IE's handling of high contrast themes in the treeview)
        
                    Theme               | Unselected nodes            | Selected node
                    --------------------|-----------------------------|----------------------------
                    High contrast white | Light background, dark icon | Light background, dark icon (selection rectangle)
                    High contrast black | Dark background, light icon | Dark background, light icon (selection rectangle)
                    Dark theme          | Dark background, light icon | Blue background, light icon
                    Light/Blue          | Light background, dark icon | Blue background, light icon
        
                */
                selected: function () { return ko.pureComputed(function () {
                    return _this.isHighContrastBlackTheme() ? LightSearchIconPath :
                        _this.isHighContrastWhiteTheme() ? DarkSearchIconPath :
                            _this.isDarkTheme() ? LightSearchIconPath :
                                /* light or blue theme */ LightSearchIconPath;
                }); },
                unselected: function () { return ko.pureComputed(function () {
                    return _this.isHighContrastBlackTheme() ? LightSearchIconPath :
                        _this.isHighContrastWhiteTheme() ? DarkSearchIconPath :
                            _this.isDarkTheme() ? LightSearchIconPath :
                                /* light or blue theme */ DarkSearchIconPath;
                }); }
            };
            /* Resource text */
            this.titleText = ko.observable();
            this.refreshText = ko.observable();
            this.sendAFrownText = ko.observable();
            this.sendASmileText = ko.observable();
            this.changePanel = function (panelInfo) {
                var previousLoadingPanelKey = "__previousLoadingPanel";
                if (_this[previousLoadingPanelKey] !== panelInfo) {
                    // Track the last loading panel so we can avoid showing a panel that was loading
                    // but then while it was loading another panel was selected.
                    _this[previousLoadingPanelKey] = panelInfo;
                    // Set selected panel to null so the loading page is shown
                    _this.selectedPanel(null);
                    if (panelInfo) {
                        // Show panel
                        return panelInfo.panelViewModel
                            .initialize()
                            .then(function () {
                            if (_this[previousLoadingPanelKey] === panelInfo) {
                                _this.selectedPanel(panelInfo);
                                if (panelInfo.panelViewModel.showDetailsPanel()) {
                                    _this.detailsPanelViewModel().show();
                                }
                                else {
                                    _this.detailsPanelViewModel().hide();
                                }
                                new BindingHandler_1.default(panelInfo.displayName, null, _this.host).updateValue()
                                    .then(function (value) { return _this.titleText(value); });
                                if (Utilities.isRunningOnElectron()) {
                                    panelInfo.panelViewModel.setInitialFocus();
                                }
                                _this.environmentObservables().updateScrollableArea();
                                _this.environmentObservables().updateActivePanel();
                                delete _this[previousLoadingPanelKey];
                            }
                        }).then(function () {
                            // Telemetry: Event for changing views.
                            var telemetrytype = "PanelName";
                            var telemetryproperties = {};
                            telemetryproperties[telemetrytype] = panelInfo.name;
                            telemetryproperties[telemetrytype + "space"] = panelInfo.panelNamespace;
                            _this.host.telemetry.sendEvent("CloudHub.changePanel", telemetryproperties);
                        });
                    }
                }
                return Promise.resolve();
            };
            this.executeElementQuery = function (selector, caseInsensitive) {
                var selectedPanel = _this.selectedPanel();
                if (selectedPanel && selectedPanel.panelNamespace === CloudExplorerConstants.panelNamespaces.treeViewPanel) {
                    var treeViewPanel = selectedPanel.panelViewModel;
                    return treeViewPanel.executeElementQuery(selector, caseInsensitive);
                }
                return Promise.resolve({ uids: [] });
            };
            /**
             * True if we're running under the dark theme (and not high contrast)
             */
            this.isDarkTheme = function () {
                var background = _this.environmentObservables().backgroundColor();
                var backgroundRgb = CloudExplorerViewModel._convertRgbtoHex(background);
                return backgroundRgb.toUpperCase() === CloudExplorerConstants.theme.dark.toUpperCase()
                    && !_this.isHighContrast();
            };
            /**
             * True if we're running under any high constrast white theme
             */
            this.isHighContrastWhiteTheme = function () {
                return _this.environmentObservables().isHighContrastWhite();
            };
            /**
             * True if we're running under any high constrast black theme (Black, #1 or #2, or custom with black background)
             */
            this.isHighContrastBlackTheme = function () {
                return _this.environmentObservables().isHighContrastBlack();
            };
            /**
             * True if we're running under any high constrast theme
             */
            this.isHighContrast = function () {
                return _this.environmentObservables().isHighContrast();
            };
            this.isLoading = ko.pureComputed(function () {
                // We assume we are loading when there is no panel being shown.
                return !_this.selectedPanel();
            });
            this.shouldShowDetailsPanel = function () {
                var selectedPanel = _this.selectedPanel();
                return selectedPanel && selectedPanel.panelViewModel.showDetailsPanel();
            };
            this.showTreeViews = function () {
                var nextPanel = _this.toolbarViewModel().panelPicker().selectedPanelInfo();
                return _this.changePanel(nextPanel);
            };
            this.openPanelByName = function (panelName) {
                var matchingPanel = _this.cachedPanelInfos().filter(function (cpi) { return cpi.name === panelName; })[0];
                if (!matchingPanel) {
                    matchingPanel = _this.toolbarViewModel().panelPicker().panelInfos().filter(function (pi) { return pi.name === panelName; })[0].panelInfo;
                }
                if (matchingPanel) {
                    return _this.changePanel(matchingPanel);
                }
                return Promise.resolve();
            };
            this.currentPanel = function () {
                if (_this.selectedPanel()) {
                    return Promise.resolve(_this.selectedPanel().name);
                }
                return Promise.resolve();
            };
            this.openContextMenu = function (node, e) {
                _this._openContextMenu(node, e);
                // Telemetry: Get information on context menu activation
                var telemetryType = "ResourceType";
                var telemetryproperties = {};
                telemetryproperties[telemetryType] = node.getAttributeValueIfLoaded("type");
                _this.host.telemetry.sendEvent("CloudHub.openContext", telemetryproperties);
            };
            this.panelsContainerTopPixels = ko.pureComputed(function () {
                var height = _this.environmentObservables().headerHeight();
                return height + "px";
            });
            this.panelsContainerBottomPixels = ko.pureComputed(function () {
                var height = _this.environmentObservables().footerHeight();
                return height + "px";
            });
            this.refresh = function () {
                _this.host.telemetry.sendEvent("CloudHub.refresh", null);
                _this._refreshPanel();
            };
            /**
             * Opens the Feedback dialog to allow the user to send compliments.
             */
            this.sendAFrown = function () {
                var options = {
                    id: AzureConstants.registeredDialogs.feedback,
                    parameters: { sentiment: "frown" }
                };
                return _this.host.executeProviderOperation("Environment.Dialogs.getDialogResult", options)
                    .then(function (parameters) {
                    if (parameters) {
                        return _this.host.executeAction("CloudExplorer.Actions.Feedback.sendAFrown", parameters);
                    }
                });
            };
            /**
             * Opens the Feedback dialog to allow the user to send suggestions.
             */
            this.sendASmile = function () {
                var options = {
                    id: AzureConstants.registeredDialogs.feedback,
                    parameters: { sentiment: "smile" }
                };
                return _this.host.executeProviderOperation("Environment.Dialogs.getDialogResult", [options])
                    .then(function (parameters) {
                    if (parameters) {
                        return _this.host.executeAction("CloudExplorer.Actions.Feedback.sendASmile", parameters);
                    }
                });
            };
            this.openPanel = function (panelInfo) {
                // Try to find if the panel has been cached
                // from a previous call
                var matchingPanel = _this.cachedPanelInfos().filter(function (cpi) { return cpi.name === panelInfo.name; })[0];
                if (matchingPanel) {
                    return _this.changePanel(matchingPanel);
                }
                // We didn't find the panel so far.
                // If the caller specified the proper information,
                // we can create it and cache it.
                if (panelInfo) {
                    panelInfo.panelViewModel = _this._createPanelViewModel(panelInfo);
                    _this.cachedPanelInfos.push(panelInfo);
                    return _this.changePanel(panelInfo);
                }
                return Promise.resolve();
            };
            this.resetPanel = function (name) {
                var panelPicker = _this.toolbarViewModel().panelPicker();
                // Reset all resource views so we execute the query for the next account.
                var matchingPanels = panelPicker.panelInfos().filter(function (rv) {
                    return rv.name === name;
                });
                matchingPanels.forEach(function (panel) {
                    panel.panelViewModel.reset();
                });
                return Promise.resolve();
            };
            this.refreshPanel = function () {
                var refreshPromise = Promise.resolve();
                if (_this.selectedPanel()) {
                    refreshPromise = _this.selectedPanel().panelViewModel.refresh();
                }
                return refreshPromise;
            };
            this.getTheme = function () {
                // Note: Ignores high contrast
                var theme = null;
                var environmentObservables = _this.environmentObservables();
                if (environmentObservables) {
                    var hexValue = CloudExplorerViewModel._convertRgbtoHex(environmentObservables.backgroundColor());
                    theme = CloudExplorerConstants.themeName[hexValue];
                }
                return Promise.resolve(theme);
            };
            this._createPanelViewModel = function (panel) {
                var panelViewModel;
                switch (panel.panelNamespace) {
                    case AzureConstants.panelInfos.settingsPanel.panelNamespace:
                        panelViewModel = new AzureFilterPanelViewModel(panel, _this);
                        break;
                    case CloudExplorerConstants.panelNamespaces.treeViewPanel:
                        panelViewModel = new TreeViewPanelViewModel(panel, _this, _this.detailsPanelViewModel());
                        // CONSIDER: In the future we need to make this a user configurable setting. For now we simply turn on single-click mode for Storage Explorer.
                        panelViewModel.defaultActionMode = Utilities.isRunningOnElectron() ?
                            0 /* SingleClick */ :
                            1 /* DoubleClick */;
                        break;
                    default:
                        throw new Error("Unsupported panel namespace: " + panel.panelNamespace);
                }
                _this.host.addPanelProvider(panelViewModel);
                return panelViewModel;
            };
            this._refreshPanel = function () {
                var refreshPromise;
                var selectedPanel = _this.selectedPanel();
                if (selectedPanel && selectedPanel.panelViewModel) {
                    refreshPromise = selectedPanel.panelViewModel.refresh();
                }
                else {
                    refreshPromise = Promise.resolve();
                }
                return refreshPromise;
            };
            var startTelemetryTimer = Date.now();
            var environmentObservables = new EnvironmentObservables();
            var host = new CloudExplorerHost_1.default(this, this, this);
            this.contextMenu = ko.observable();
            if (Utilities.isRunningOnElectron()) {
                this._nativeContextMenu = new NativeContextMenu(host);
                this._openContextMenu = this._nativeContextMenu.open;
            }
            else {
                this.contextMenu(new ContextMenuViewModel(environmentObservables));
                this._openContextMenu = this.contextMenu().open;
            }
            this.detailsPanelViewModel = ko.observable(new DetailsPanelViewModel(environmentObservables, host));
            this.environmentObservables = ko.observable(environmentObservables);
            this.host = host;
            this.selectedPanel = ko.observable();
            this.cachedPanelInfos = ko.observableArray();
            this.toolbarViewModel = ko.observable();
            this.host.executeAction(CloudExplorerActions.themeImagesNamespace);
            this.host.resolveResources(CloudExplorerResources.namespace, ["Toolbar.Refresh.Name", "CloudExplorer.SendAFrown", "CloudExplorer.SendASmile"])
                .then(function (values) {
                _this.refreshText(values["Toolbar.Refresh.Name"]);
                _this.sendAFrownText(values["CloudExplorer.SendAFrown"]);
                _this.sendASmileText(values["CloudExplorer.SendASmile"]);
            });
            this.host.getAppearances().then(function (appearances) {
                var appearance = appearances[0]; // TODO: We only support first appearance
                // Instantiate the view models associated with every resource view.
                var panelInfoViewModels = [];
                appearance.panelInfos.forEach(function (panelInfo) {
                    panelInfo.panelViewModel = _this._createPanelViewModel(panelInfo);
                    panelInfo.panelNamespace = "treeViewPanel";
                    panelInfoViewModels.push(new PanelInfoViewModel(panelInfo, panelInfo.panelViewModel, _this.host));
                });
                var panelPicker = new PanelPickerViewModel(_this.host);
                panelPicker.selectedPanelInfo.subscribe(_this.changePanel);
                panelPicker.panelInfos(panelInfoViewModels);
                _this.toolbarViewModel(new ToolbarViewModel(panelPicker, appearance.toolbarItems, _this.host, _this.host));
            }).then(function () {
                // Telemetry: Send an initialization telemetry event
                var telemetryName = "ElapsedTime";
                var telemetryProperties = {};
                telemetryProperties[telemetryName] = (Date.now() - startTelemetryTimer).toString();
                _this.host.telemetry.sendEvent("CloudHub.initialized", telemetryProperties);
            }, function (err) {
                var telemetryError = {
                    name: "CloudExplorerViewModel.Initialize",
                    error: err
                };
                _this.host.telemetry.sendError(telemetryError);
                _this.host.executeAction(CloudExplorerActions.showErrorMessageBox, { message: "Unable to retrieve subscriptions. Click Refresh and try reentering your credentials." });
            });
        }
        CloudExplorerViewModel._convertRgbtoHex = function (rgb) {
            // If given a hex rgb string just return it
            if (rgb.indexOf("#") === 0 && rgb.length === 7) {
                return rgb;
            }
            var rgbHexString = "0";
            // Extract the rgb values from the string "rgb(37, 37, 38)"
            rgb = rgb.substring(rgb.indexOf("(") + 1, rgb.indexOf(")"));
            var rgbValues = rgb.split(",");
            // Convert the extracted rgb values to hex
            if (rgbValues.length === 3) {
                var toPaddedHex = function (n) {
                    var s = parseInt(n.trim(), 10).toString(16);
                    return s.length === 1 ? ("0" + s) : s;
                };
                rgbHexString = "#" + toPaddedHex(rgbValues[0]) +
                    toPaddedHex(rgbValues[1]) + toPaddedHex(rgbValues[2]);
            }
            return rgbHexString;
        };
        return CloudExplorerViewModel;
    }());
    return CloudExplorerViewModel;
});
