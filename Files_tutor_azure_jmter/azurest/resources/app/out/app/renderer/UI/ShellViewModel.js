"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var $ = require("jquery");
var CloudExplorerProxyMarshaler_1 = require("../marshalers/CloudExplorerProxyMarshaler");
var EulaManager = require("../EulaManager");
var ko = require("knockout");
var NpsManager = require("../NpsManager");
var Path = require("path");
var DaytonaPluginViewModel_1 = require("./Common/DaytonaPluginViewModel");
var DialogManagerProxy_1 = require("./DialogManagerProxy");
var HostProxyMarshaler_1 = require("../marshalers/HostProxyMarshaler");
var TabPanelViewModel_1 = require("./Tabs/TabPanelViewModel");
var MachineTelemetryReporter_1 = require("../MachineTelemetryReporter");
var StandardMarshaler_1 = require("../marshalers/StandardMarshaler");
var ThemeManager_1 = require("./ThemeManager");
var UserAccountsManager_1 = require("../UserAccountsManager");
var WebpageThemeManager_1 = require("../../common/WebpageThemeManager");
var LayoutManager_1 = require("../Components/Layout/LayoutManager");
var Relationship_1 = require("../Components/Layout/Relationship");
var MinSizeConstraint_1 = require("../Components/Layout/MinSizeConstraint");
var EdgeDirection_1 = require("../Components/Layout/EdgeDirection");
var Dimension_1 = require("../Components/Layout/Dimension");
var activityLogMarshalerFactory = require("../marshalers/ActivityLogMarshalerFactory");
var azureBlobMarshaler = require("../Azure/marshalers/AzureBlobMarshaler");
var azureFabricMarshaler = require("../Azure/marshalers/AzureFabricMarshaler");
var azureFileMarshaler = require("../Azure/marshalers/AzureFileMarshaler");
var azureMarshaler = require("../Azure/marshalers/AzureMarshaler");
var azureQueueMarshaler = require("../Azure/marshalers/AzureQueueMarshaler");
var azureTableMarshaler = require("../Azure/marshalers/AzureTableMarshaler");
var environmentMarshaler = require("../marshalers/EnvironmentMarshaler");
var InfoBarViewModel = require("./InfoBarViewModel");
var ProviderManagerMarshaler = require("../marshalers/ProviderManagerMarshaler");
var telemetryMarshaler = require("../marshalers/TelemetryMarshaler");
var IsolatedEnvironment_1 = require("./Tabs/IsolatedEnvironment");
var ZoomLevelManager_1 = require("../ZoomLevelManager");
var host = global.host;
var bottomPanelFixedHeight = 219;
var rightPanelFixedBottom = bottomPanelFixedHeight - 4;
var settingsPanelInfo = {
    displayName: {
        resource: { namespace: "CloudExplorer.Resources", resourceId: "Toolbar.Settings.Name" }
    },
    name: "Settings",
    panelNamespace: "azureFilterPanel",
    providerNamespace: "Azure.FilterPanel"
};
var ShellViewModel = (function () {
    function ShellViewModel() {
        var _this = this;
        this.bottomPanelHeight = ko.observable(bottomPanelFixedHeight + "px");
        this.rightPanelBottom = ko.observable(rightPanelFixedBottom + "px");
        this.daytonaDialogViewModel = ko.observable();
        this.showDaytonaDialog = ko.computed(function () {
            return !!_this.daytonaDialogViewModel();
        });
        this.showModal = ko.computed(function () {
            if (_this._$modal) {
                _this._$modal.fadeToggle(250);
            }
            return !!_this.daytonaDialogViewModel();
        });
        this.isDialogOpen = ko.pureComputed(function () {
            var isDialogOpen = _this.showDaytonaDialog();
            // Set the right focus on all daytona plugins.
            // Only the dialog should get focus when it is open. All other plugins should not get focus.
            _this.cloudExplorerPlugin.isFocusable(!isDialogOpen);
            if (_this.editorPanelViewModel.activeTab()) {
                _this.editorPanelViewModel.activeTab().isFocusable(!isDialogOpen);
            }
            return isDialogOpen;
        });
        this.infoBarViewModel = new InfoBarViewModel();
        this._$modal = $(".modal");
        this._$bottomContainer = $(".shell .bottom");
        this._$leftContainer = $(".shell .left");
        this._$rightContainer = $(".shell .right");
        this._leftRelationship = new Relationship_1.default(this._$leftContainer, [this._$bottomContainer, this._$rightContainer], EdgeDirection_1.default.Right, [
            new MinSizeConstraint_1.default(this._$leftContainer, Dimension_1.default.Width, 200),
            new MinSizeConstraint_1.default(this._$rightContainer, Dimension_1.default.Width, 200)
        ], undefined, undefined, function () {
            _this.editorPanelViewModel.onZoomChanged(ZoomLevelManager_1.default.zoomFactor);
        });
        this._bottomRelationship = new Relationship_1.default(this._$bottomContainer, [this._$rightContainer], EdgeDirection_1.default.Top, [
            new MinSizeConstraint_1.default(this._$bottomContainer, Dimension_1.default.Height, 45),
            new MinSizeConstraint_1.default(this._$rightContainer, Dimension_1.default.Height, 200)
        ], [
            new MinSizeConstraint_1.default(this._$bottomContainer, Dimension_1.default.Height, 40),
            new MinSizeConstraint_1.default(this._$rightContainer, Dimension_1.default.Height, 200)
        ], function () {
            _this.activityPanelViewModel.isCollapsed(false);
        }, function () {
            _this.editorPanelViewModel.onZoomChanged(ZoomLevelManager_1.default.zoomFactor);
        });
        this.closeDaytonaDialog = function () {
            var pluginViewModel = _this.daytonaDialogViewModel();
            if (pluginViewModel) {
                pluginViewModel.close();
            }
            _this.daytonaDialogViewModel(null);
        };
        this.openDaytonaDialog = function (manifestPath, parameters) {
            // Doing the require thing here to avoid loop references.
            var environmentMarshaler = require("../marshalers/EnvironmentMarshaler");
            var azureMarshaler = require("../Azure/marshalers/AzureMarshaler");
            var azureBlobMarshaler = require("../Azure/marshalers/AzureBlobMarshaler");
            var azureFileMarshaler = require("../Azure/marshalers/AzureFileMarshaler");
            var azureQueueMarshaler = require("../Azure/marshalers/AzureQueueMarshaler");
            var azureTableMarshaler = require("../Azure/marshalers/AzureTableMarshaler");
            var userAccountsMarshaler = require("../marshalers/UserAccountsMarshaler");
            var marshalers = {
                "Environment": StandardMarshaler_1.default.getStandardMarshaler(environmentMarshaler),
                "Azure": StandardMarshaler_1.default.getStandardMarshaler(azureMarshaler),
                "AzureBlobs": StandardMarshaler_1.default.getStandardMarshaler(azureBlobMarshaler),
                "AzureFiles": StandardMarshaler_1.default.getStandardMarshaler(azureFileMarshaler),
                "AzureQueues": StandardMarshaler_1.default.getStandardMarshaler(azureQueueMarshaler),
                "AzureTables": StandardMarshaler_1.default.getStandardMarshaler(azureTableMarshaler),
                "Telemetry": StandardMarshaler_1.default.getStandardMarshaler(telemetryMarshaler),
                "UserAccounts": StandardMarshaler_1.default.getStandardMarshaler(userAccountsMarshaler),
                "HostProxy": HostProxyMarshaler_1.default
            };
            var pluginViewModel = new DaytonaPluginViewModel_1.default(Path.resolve(manifestPath), parameters, marshalers);
            _this.daytonaDialogViewModel(pluginViewModel);
        };
        // Initialize Daytona plugins
        this.cloudExplorerManifest = "./app/renderer/manifests/CloudExplorer.json";
        this.cloudExplorerMarshalers = {
            "ActivityLog": activityLogMarshalerFactory.createMarshaler(),
            "Azure": StandardMarshaler_1.default.getStandardMarshaler(azureMarshaler),
            "AzureBlobs": StandardMarshaler_1.default.getStandardMarshaler(azureBlobMarshaler),
            "AzureFiles": StandardMarshaler_1.default.getStandardMarshaler(azureFileMarshaler),
            "AzureFabric": StandardMarshaler_1.default.getStandardMarshaler(azureFabricMarshaler),
            "AzureQueues": StandardMarshaler_1.default.getStandardMarshaler(azureQueueMarshaler),
            "AzureTables": StandardMarshaler_1.default.getStandardMarshaler(azureTableMarshaler),
            "Environment": StandardMarshaler_1.default.getStandardMarshaler(environmentMarshaler),
            "Telemetry": StandardMarshaler_1.default.getStandardMarshaler(telemetryMarshaler),
            "MarshalerProviderManager": StandardMarshaler_1.default.getStandardMarshaler(ProviderManagerMarshaler.instance),
            "CloudExplorerProxy": CloudExplorerProxyMarshaler_1.default.createMarshaler()
        };
        this.showEulaDialogIfNeeded = function () {
            return EulaManager.showEulaDialogIfNeeded();
        };
        this.showNpsDialogIfNeeded = function () {
            return NpsManager.showNpsDialogIfNeeded();
        };
        this.showConnectDialogIfNeeded = function () {
            UserAccountsManager_1.default.getInstance().getUserAccounts()
                .then(function (storedAccounts) {
                if (!storedAccounts.length && !_this.areThereAccountsOrServicesStored()) {
                    var params = {
                        startPage: "default-panel",
                        chainSignInPromise: true
                    };
                    host.executeOperation("StorageExplorer.OpenConnectDialog", params);
                }
            });
        };
        this.onThemeChanged = function (newTheme) {
            WebpageThemeManager_1.default.setTheme(newTheme);
            _this.cloudExplorerPlugin.setTheme(newTheme);
        };
        this.launchConfigureProxyDialog = function () {
            host.executeOperation("StorageExplorer.OpenProxySettingsDialog", {});
        };
        this.launchConnectDialog = function () {
            host.executeOperation("StorageExplorer.OpenConnectDialog", {});
        };
        this.sendFeedback = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var parameters;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DialogManagerProxy_1.default.getDialogResult("feedback", { sentiment: "frown" })];
                    case 1:
                        parameters = _a.sent();
                        if (!parameters) return [3 /*break*/, 3];
                        return [4 /*yield*/, CloudExplorerProxyMarshaler_1.default.executeOperation("CloudExplorer.Actions.Feedback.sendAFrown", parameters)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, null];
                }
            });
        }); };
        this.toggleTreeView = function () {
            _this.toggleCloudExplorerPanel("Resource Type", function () { return _this.openTreeView(); });
        };
        this.toggleAccountPanel = function () {
            _this.toggleCloudExplorerPanel("Settings", function () { return _this.openAccountPanel(); });
        };
        this.activePanel = ko.observable("Resource Type");
        this.isPanelExpanded = ko.observable(true);
        this.isTreeviewActive = ko.computed(function () {
            return _this.activePanel() === "Resource Type" && _this.isPanelExpanded();
        });
        this.isAccountManagementActive = ko.computed(function () {
            return _this.activePanel() === "Settings" && _this.isPanelExpanded();
        });
        this.openAccountPanel = function () {
            return host.executeOperation("CloudExplorer.Actions.openPanel", { panelInfo: settingsPanelInfo })
                .then(function () {
                _this.updatePanelObservables();
                _this._leftRelationship.expand();
            });
        };
        this.openTreeView = function () {
            return host.executeOperation("CloudExplorer.Actions.openPanelByName", { name: "Resource Type" })
                .then(function () {
                _this.updatePanelObservables();
                _this._leftRelationship.expand();
            });
        };
        this.toggleSideBar = function () {
            if (!_this._leftRelationship.isExpanded()) {
                _this._leftRelationship.expand();
            }
            else {
                _this._leftRelationship.collapse();
            }
            _this.updatePanelObservables();
        };
        WebpageThemeManager_1.default.setTheme(ThemeManager_1.default.theme);
        this.initializeCloudExplorerPlugin();
        this.editorPanelViewModel = new TabPanelViewModel_1.default();
        this.activityPanelViewModel = new TabPanelViewModel_1.default(false, true);
        this.activityPanelViewModel.onCollapse(function () { return _this._bottomRelationship.collapse(); });
        this.activityPanelViewModel.onExpand(function () { return _this._bottomRelationship.expand(); });
        this.activityPanelViewModel.showTab("Activities", "Activities", {
            environment: IsolatedEnvironment_1.default.DaytonaIframe,
            editorNamespace: "",
            marshalers: {
                "ActivityLog": activityLogMarshalerFactory.createMarshaler(true),
                "Environment": StandardMarshaler_1.default.getStandardMarshaler(environmentMarshaler)
            },
            source: Path.resolve("./app/renderer/manifests/ActivityLog.json")
        });
        this.setResizeBehavior();
        this.checkLoaded(function () { return _this.onLoaded(); });
        this.setFocusGuard();
        CloudExplorerProxyMarshaler_1.default.setLocalProviderFactory(ProviderManagerMarshaler.moduleProviderFactory);
    }
    ShellViewModel.prototype.initializeCloudExplorerPlugin = function () {
        this.cloudExplorerPlugin = new DaytonaPluginViewModel_1.default(Path.resolve(this.cloudExplorerManifest), null, this.cloudExplorerMarshalers);
    };
    // This is work that's done at an interval to keep our UI in sync. They're hacks, see comments below.
    ShellViewModel.prototype.uiSyncTasks = function () {
        // Working around events not being available outside of a provider.
        this.updatePanelObservables();
    };
    ShellViewModel.prototype.areThereAccountsOrServicesStored = function () {
        var accountsOrServicesStored = false;
        var i = 0;
        while (!accountsOrServicesStored && i < localStorage.length) {
            var key = localStorage.key(i);
            if (key.indexOf("StorageExplorer_AddExternalStorageAccount_SessionKey") === 0 || key.indexOf("StorageExplorer_AddStorageServiceSAS") === 0) {
                var data = JSON.parse(localStorage.getItem(key));
                accountsOrServicesStored = accountsOrServicesStored && !!data && !!data.length;
            }
            i++;
        }
        ;
        return accountsOrServicesStored;
    };
    ShellViewModel.prototype.updatePanelObservables = function () {
        var _this = this;
        return host.executeOperation("CloudExplorer.Actions.currentPanel", {})
            .then(function (currentPanel) {
            _this.activePanel(currentPanel);
            _this.isPanelExpanded(_this._leftRelationship.isExpanded());
        });
    };
    ShellViewModel.prototype.toggleCloudExplorerPanel = function (panelName, openFunction) {
        var _this = this;
        if (!this._leftRelationship.isExpanded()) {
            openFunction();
        }
        else {
            this.updatePanelObservables().then(function () {
                if (_this.activePanel() === panelName) {
                    _this._leftRelationship.collapse();
                    _this.updatePanelObservables();
                }
                else {
                    openFunction();
                }
            });
        }
    };
    ShellViewModel.prototype.setResizeBehavior = function () {
        LayoutManager_1.default.addRelationship(this._leftRelationship);
        LayoutManager_1.default.addRelationship(this._bottomRelationship);
    };
    ShellViewModel.prototype.checkLoaded = function (callback) {
        var _this = this;
        host.executeOperation("CloudExplorer.ElementInteraction.query", { selector: "*" }).then(function (queryResult) {
            var loaded = queryResult && queryResult.uids && queryResult.uids.length > 0;
            if (loaded) {
                $(".splash").hide();
                $(".shell").show();
                callback();
            }
            else {
                window.setTimeout(function () {
                    _this.checkLoaded(callback);
                }, 25);
            }
        });
    };
    ShellViewModel.prototype.onLoaded = function () {
        var _this = this;
        window.setInterval(function () { return _this.uiSyncTasks(); }, 500);
        this.uiSyncTasks();
        MachineTelemetryReporter_1.default.sendMachineInfo();
        host.executeOperation("Azure.UserAccounts.promptIfAnyAccountNeedReauth", null);
    };
    // "focus-guard" got focus: set focus to the first interactive element of the left vertical bar.
    ShellViewModel.prototype.setFocusGuard = function () {
        $(document).ready(function () {
            $(".focus-guard").on("focus", function () {
                $(".button view-resources").focus();
            });
        });
    };
    return ShellViewModel;
}());
var instance = new ShellViewModel();
exports.default = instance;
