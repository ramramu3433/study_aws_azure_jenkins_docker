/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "./DaytonaContext", "../../Explorer/Tabs/DocumentsTab", "../../Explorer/Tabs/MongoDocumentsTab", "../../Explorer/Tabs/StoredProcedureTab", "../../Explorer/Tabs/SettingsTab", "../../Explorer/Tabs/TriggerTab", "../../Explorer/Tabs/UserDefinedFunctionTab", "./DocumentClientFactory", "./DocumentClientUtility", "../../Contracts/ViewModels", "./ToolbarViewModel"], function (require, exports, ko, DaytonaContext_1, DocumentsTab, MongoDocumentsTab, StoredProcedureTab, SettingsTab, TriggerTab, UserDefinedFunctionTab, DocumentClientFactory, DocumentClientUtility, ViewModels, ToolbarViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TabExplorer = (function () {
        function TabExplorer() {
            this.toolbarViewModel = ko.observable();
            this.toolbarViewModel(new ToolbarViewModel_1.default());
            this.tabContext = new DaytonaContext_1.default();
            var endpoint = this.tabContext.parameters.endpoint.slice(0, -1);
            var masterKey = this.tabContext.parameters.masterKey;
            var selfLink = this.tabContext.parameters.selfLink;
            var resourceType = this.tabContext.parameters.resourceType;
            var theme = this.tabContext.parameters.theme;
            var documentClientFactory = new DocumentClientFactory();
            documentClientFactory.setHost(this.tabContext.hostProxy);
            var documentClientUtility = new DocumentClientUtility(documentClientFactory, {
                endpoint: endpoint,
                masterKey: masterKey
            });
            switch (resourceType) {
                case "DocumentDB":
                    var partitionKeyPath = this.tabContext.parameters.partitionKeyPath;
                    var partitionKeyKind = this.tabContext.parameters.partitionKeyKind;
                    var partitionKey = partitionKeyPath ? {
                        kind: partitionKeyKind,
                        paths: [partitionKeyPath]
                    } : null;
                    this.currentTab = new DocumentsTab({
                        documentClientUtility: documentClientUtility,
                        selfLink: selfLink,
                        documentIds: ko.observableArray([]),
                        partitionKey: partitionKey,
                        tabKind: ViewModels.CollectionTabKind.Documents,
                        title: "Documents",
                        tabPath: "",
                        isActive: ko.observable(true),
                        isRunningOnDaytona: true,
                        daytonaContext: this.tabContext,
                        theme: theme
                    });
                    break;
                case "MongoDB":
                    partitionKeyPath = this.tabContext.parameters.partitionKeyPath;
                    partitionKeyKind = this.tabContext.parameters.partitionKeyKind;
                    partitionKey = partitionKeyPath ? {
                        kind: partitionKeyKind,
                        paths: [partitionKeyPath]
                    } : null;
                    this.currentTab = new MongoDocumentsTab({
                        documentClientUtility: documentClientUtility,
                        selfLink: selfLink,
                        documentIds: ko.observableArray([]),
                        partitionKey: partitionKey,
                        tabKind: ViewModels.CollectionTabKind.MongoDocuments,
                        title: "Documents",
                        tabPath: "",
                        isActive: ko.observable(true),
                        isRunningOnDaytona: true,
                        daytonaContext: this.tabContext,
                        theme: theme
                    });
                    break;
                case "Settings":
                    // TODO add SettingsTab options include indexingPolicy, defaultTTL and partitionKey
                    this.currentTab = new SettingsTab({
                        documentClientUtility: documentClientUtility,
                        selfLink: selfLink,
                        tabKind: ViewModels.CollectionTabKind.Settings,
                        title: "Settings",
                        tabPath: "",
                        isActive: ko.observable(true),
                        isRunningOnDaytona: true,
                        daytonaContext: this.tabContext,
                        theme: theme
                    });
                    break;
                case "UDF":
                    var script = {
                        _rid: this.tabContext.parameters.id,
                        _self: selfLink,
                        _etag: "",
                        _ts: 0,
                        id: this.tabContext.parameters.id,
                        body: this.tabContext.parameters.body
                    };
                    this.currentTab = new UserDefinedFunctionTab({
                        documentClientUtility: documentClientUtility,
                        selfLink: selfLink,
                        tabKind: ViewModels.CollectionTabKind.UserDefinedFunctions,
                        title: "UserDefinedFunction",
                        tabPath: "",
                        isActive: ko.observable(true),
                        isRunningOnDaytona: true,
                        daytonaContext: this.tabContext,
                        resource: script,
                        isNew: this.tabContext.parameters.isNew,
                        collectionSelfLink: this.tabContext.parameters.collectionSelfLink,
                        theme: theme,
                        isPartition: this.tabContext.parameters.isPartition
                    });
                    break;
                case "Trigger":
                    var triggerData = {
                        _rid: this.tabContext.parameters.id,
                        _self: selfLink,
                        _etag: "",
                        _ts: 0,
                        id: this.tabContext.parameters.id,
                        body: this.tabContext.parameters.body,
                        triggerOperation: this.tabContext.parameters.triggerOperation,
                        triggerType: this.tabContext.parameters.triggerType
                    };
                    this.currentTab = new TriggerTab({
                        documentClientUtility: documentClientUtility,
                        selfLink: selfLink,
                        tabKind: ViewModels.CollectionTabKind.Triggers,
                        title: "Trigger",
                        tabPath: "",
                        isActive: ko.observable(true),
                        isRunningOnDaytona: true,
                        daytonaContext: this.tabContext,
                        resource: triggerData,
                        isNew: this.tabContext.parameters.isNew,
                        triggerOperation: this.tabContext.parameters.triggerOperation,
                        triggerType: this.tabContext.parameters.triggerType,
                        collectionSelfLink: this.tabContext.parameters.collectionSelfLink,
                        theme: theme,
                        isPartition: this.tabContext.parameters.isPartition
                    });
                    break;
                case "StoredProcedure":
                    script = {
                        _rid: this.tabContext.parameters.id,
                        _self: selfLink,
                        _etag: "",
                        _ts: 0,
                        id: this.tabContext.parameters.id,
                        body: this.tabContext.parameters.body
                    };
                    this.currentTab = new StoredProcedureTab({
                        documentClientUtility: documentClientUtility,
                        selfLink: selfLink,
                        tabKind: ViewModels.CollectionTabKind.StoredProcedures,
                        title: "StoredProcedure",
                        tabPath: "",
                        isActive: ko.observable(true),
                        isRunningOnDaytona: true,
                        daytonaContext: this.tabContext,
                        resource: script,
                        isNew: this.tabContext.parameters.isNew,
                        collectionSelfLink: this.tabContext.parameters.collectionSelfLink,
                        theme: theme,
                        isPartition: this.tabContext.parameters.isPartition
                    });
                    break;
            }
        }
        return TabExplorer;
    }());
    exports.default = TabExplorer;
});
