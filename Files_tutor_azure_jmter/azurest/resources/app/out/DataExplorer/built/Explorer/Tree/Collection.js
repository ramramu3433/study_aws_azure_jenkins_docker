define(["require", "exports", "knockout", "../../Contracts/ViewModels", "../Tabs/DocumentsTab", "../Tabs/MongoDocumentsTab", "../Tabs/SettingsTab", "../Tabs/QueryTab", "../Tabs/MongoQueryTab", "../Tabs/QueryTablesTab", "../Tabs/GraphTab", "../Tabs/MongoShellTab", "./StoredProcedure", "./UserDefinedFunction", "./Trigger", "../Menus/ContextMenu"], function (require, exports, ko, ViewModels, DocumentsTab, MongoDocumentsTab, SettingsTab, QueryTab, MongoQueryTab, QueryTablesTab_1, GraphTab, MongoShellTab, StoredProcedure, UserDefinedFunction, Trigger, ContextMenu) {
    "use strict";
    var Collection = (function () {
        function Collection(container, database, data, quotaInfo, offer) {
            var _this = this;
            this.onKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.expandCollapseCollection();
                    return false;
                }
                return true;
            };
            this.onKeyDown = function (source, event) {
                if (event.key === "Delete") {
                    _this.onDeleteCollectionContextMenuClick(source, event);
                    return false;
                }
                if (event.key === "ArrowRight" && !_this.isCollectionExpanded()) {
                    _this.expandCollection();
                    return false;
                }
                if (event.key === "ArrowDown" && !_this.isCollectionExpanded()) {
                    _this.expandCollection();
                    return false;
                }
                if (event.key === "ArrowLeft" && _this.isCollectionExpanded()) {
                    _this.collapseCollection();
                    return false;
                }
                return true;
            };
            this.onDocumentDBDocumentsKeyDown = function (source, event) {
                return true;
            };
            this.onDocumentDBDocumentsKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.onDocumentDBDocumentsClick();
                    return false;
                }
                return true;
            };
            this.onMongoDBDocumentsKeyDown = function (source, event) {
                return true;
            };
            this.onMongoDBDocumentsKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.onMongoDBDocumentsClick();
                    return false;
                }
                return true;
            };
            this.onSettingsKeyDown = function (source, event) {
                return true;
            };
            this.onSettingsKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.onSettingsClick();
                    return false;
                }
                return true;
            };
            this.onStoredProceduresKeyDown = function (source, event) {
                if (event.key === "ArrowRight" && !_this.isStoredProceduresExpanded()) {
                    _this.expandStoredProcedures();
                    return false;
                }
                if (event.key === "ArrowDown" && !_this.isStoredProceduresExpanded()) {
                    _this.expandStoredProcedures();
                    return false;
                }
                if (event.key === "ArrowLeft" && _this.isStoredProceduresExpanded()) {
                    _this.collapseStoredProcedures();
                    return false;
                }
                return true;
            };
            this.onStoredProceduresKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.expandCollapseStoredProcedures();
                    return false;
                }
                return true;
            };
            this.onUserDefinedFunctionsKeyDown = function (source, event) {
                if (event.key === "ArrowRight" && !_this.isUserDefinedFunctionsExpanded()) {
                    _this.expandUserDefinedFunctions();
                    return false;
                }
                if (event.key === "ArrowDown" && !_this.isUserDefinedFunctionsExpanded()) {
                    _this.expandUserDefinedFunctions();
                    return false;
                }
                if (event.key === "ArrowLeft" && _this.isUserDefinedFunctionsExpanded()) {
                    _this.collapseUserDefinedFunctions();
                    return false;
                }
                return true;
            };
            this.onUserDefinedFunctionsKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.expandCollapseUserDefinedFunctions();
                    return false;
                }
                return true;
            };
            this.onTriggersKeyDown = function (source, event) {
                if (event.key === "ArrowRight" && !_this.isTriggersExpanded()) {
                    _this.expandTriggers();
                    return false;
                }
                if (event.key === "ArrowDown" && !_this.isTriggersExpanded()) {
                    _this.expandTriggers();
                    return false;
                }
                if (event.key === "ArrowLeft" && _this.isTriggersExpanded()) {
                    _this.collapseTriggers();
                    return false;
                }
                return true;
            };
            this.onTriggersKeyPress = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.expandCollapseTriggers();
                    return false;
                }
                return true;
            };
            this.nodeKind = "Collection";
            this.container = container;
            this.self = data._self;
            this.rid = data._rid;
            this.database = database;
            this.partitionKey = data.partitionKey;
            this.partitionKeyPropertyHeader = this.partitionKey && this.partitionKey.paths && this.partitionKey.paths.length > 0 && this.partitionKey.paths[0] || null;
            this.id = ko.observable(data.id);
            this.defaultTtl = ko.observable(data.defaultTtl);
            this.indexingPolicy = ko.observable(data.indexingPolicy);
            this.quotaInfo = ko.observable(quotaInfo);
            this.offer = ko.observable(offer);
            // TODO fix this to only replace non-excaped single quotes
            this.partitionKeyProperty = this.partitionKey && this.partitionKey.paths && this.partitionKey.paths.length && this.partitionKey.paths.length > 0 && this.partitionKey.paths[0].replace(/[/]+/g, ".").substr(1).replace(/[']+/g, '') || null;
            this.documentIds = ko.observableArray([]);
            this.isCollectionExpanded = ko.observable(false);
            this.selectedSubnodeKind = ko.observable();
            this.focusedSubnodeKind = ko.observable();
            this.documentsFocused = ko.observable();
            this.documentsFocused.subscribe(function (focus) {
                console.log("Focus set on Documents: " + focus);
                _this.focusedSubnodeKind(ViewModels.CollectionTabKind.Documents);
            });
            this.settingsFocused = ko.observable(false);
            this.settingsFocused.subscribe(function (focus) {
                _this.focusedSubnodeKind(ViewModels.CollectionTabKind.Settings);
            });
            this.storedProceduresFocused = ko.observable(false);
            this.storedProceduresFocused.subscribe(function (focus) {
                _this.focusedSubnodeKind(ViewModels.CollectionTabKind.StoredProcedures);
            });
            this.userDefinedFunctionsFocused = ko.observable(false);
            this.userDefinedFunctionsFocused.subscribe(function (focus) {
                _this.focusedSubnodeKind(ViewModels.CollectionTabKind.UserDefinedFunctions);
            });
            this.triggersFocused = ko.observable(false);
            this.triggersFocused.subscribe(function (focus) {
                _this.focusedSubnodeKind(ViewModels.CollectionTabKind.Triggers);
            });
            this.children = ko.observableArray([]);
            this.storedProcedures = ko.computed(function () {
                return _this.children().filter(function (node) { return node.nodeKind === "StoredProcedure"; }).map(function (node) { return node; });
            });
            this.userDefinedFunctions = ko.computed(function () {
                return _this.children().filter(function (node) { return node.nodeKind === "UserDefinedFunction"; }).map(function (node) { return node; });
            });
            this.triggers = ko.computed(function () {
                return _this.children().filter(function (node) { return node.nodeKind === "Trigger"; }).map(function (node) { return node; });
            });
            this.isStoredProceduresExpanded = ko.observable(false);
            this.isUserDefinedFunctionsExpanded = ko.observable(false);
            this.isTriggersExpanded = ko.observable(false);
            this.contextMenu = new ContextMenu(this.container, this.rid);
            this.documentsContextMenu = new ContextMenu(this.container, this.rid + "/documents");
        }
        Collection.prototype.expandCollapseCollection = function () {
            this.container.selectedNode(this);
            if (this.isCollectionExpanded()) {
                this.collapseCollection();
            }
            else {
                this.expandCollection();
            }
        };
        Collection.prototype.collapseCollection = function () {
            if (!this.isCollectionExpanded()) {
                return;
            }
            this.isCollectionExpanded(false);
        };
        Collection.prototype.expandCollection = function () {
            if (this.isCollectionExpanded()) {
                return;
            }
            this.loadStoredProcedures();
            this.loadUserDefinedFunctions();
            this.loadTriggers();
            this.isCollectionExpanded(true);
        };
        Collection.prototype.onDocumentDBDocumentsClick = function () {
            var _this = this;
            this.container.selectedNode(this);
            this.selectedSubnodeKind(ViewModels.CollectionTabKind.Documents);
            // create documents tab if not created yet
            var openedTabs = this.container.openedTabs();
            var documentsTab = openedTabs
                .filter(function (tab) { return tab.collection.rid === _this.rid; })
                .filter(function (tab) { return tab.tabKind === ViewModels.CollectionTabKind.Documents; })[0];
            if (!documentsTab) {
                this.documentIds([]);
                documentsTab = new DocumentsTab({
                    partitionKey: this.partitionKey,
                    documentIds: ko.observableArray([]),
                    tabKind: ViewModels.CollectionTabKind.Documents,
                    title: "Documents",
                    documentClientUtility: this.container.documentClientUtility,
                    isRunningOnDaytona: false,
                    selfLink: this.self,
                    isActive: ko.observable(false),
                    collection: this,
                    node: this,
                    tabPath: this.database.id() + ">" + this.id() + ">Documents"
                });
                this.container.openedTabs.push(documentsTab);
            }
            // Activate
            documentsTab.onTabClick();
        };
        Collection.prototype.onTableEntitiesClick = function () {
            var _this = this;
            this.container.selectedNode(this);
            this.selectedSubnodeKind(ViewModels.CollectionTabKind.QueryTables);
            // create entities tab if not created yet
            var openedTabs = this.container.openedTabs();
            var documentsTab = openedTabs
                .filter(function (tab) { return tab.collection.rid === _this.rid; })
                .filter(function (tab) { return tab.tabKind === ViewModels.CollectionTabKind.QueryTables; })[0];
            if (!documentsTab) {
                this.documentIds([]);
                documentsTab = new QueryTablesTab_1.default({
                    tabKind: ViewModels.CollectionTabKind.Documents,
                    title: "Entities",
                    tabPath: "",
                    documentClientUtility: this.container.documentClientUtility,
                    isRunningOnDaytona: false,
                    selfLink: this.self,
                    isActive: ko.observable(false)
                });
                this.container.openedTabs.push(documentsTab);
            }
            // Activate
            documentsTab.onTabClick();
        };
        Collection.prototype.onGraphDocumentsClick = function () {
            var _this = this;
            this.container.selectedNode(this);
            this.selectedSubnodeKind(ViewModels.CollectionTabKind.Graph);
            // create documents tab if not created yet
            var openedTabs = this.container.openedTabs();
            var documentsTab = openedTabs
                .filter(function (tab) { return tab.collection.rid === _this.rid; })
                .filter(function (tab) { return tab.tabKind === ViewModels.CollectionTabKind.Graph; })[0];
            if (!documentsTab) {
                this.documentIds([]);
                documentsTab = new GraphTab({
                    tabKind: ViewModels.CollectionTabKind.Graph,
                    title: "Graph",
                    tabPath: "",
                    documentClientUtility: this.container.documentClientUtility,
                    isRunningOnDaytona: false,
                    selfLink: this.self,
                    isActive: ko.observable(false)
                });
                this.container.openedTabs.push(documentsTab);
            }
            // Activate
            documentsTab.onTabClick();
        };
        Collection.prototype.onMongoDBDocumentsClick = function () {
            var _this = this;
            this.container.selectedNode(this);
            this.selectedSubnodeKind(ViewModels.CollectionTabKind.Query);
            // create documents tab if not created yet
            var openedTabs = this.container.openedTabs();
            var documentsTab = openedTabs
                .filter(function (tab) { return tab.collection.rid === _this.rid; })
                .filter(function (tab) { return tab.tabKind === ViewModels.CollectionTabKind.Query; })[0];
            if (!documentsTab) {
                this.documentIds([]);
                documentsTab = new MongoDocumentsTab({
                    partitionKey: { kind: "", paths: [] },
                    documentIds: this.documentIds,
                    tabKind: ViewModels.CollectionTabKind.Graph,
                    title: "Mongo Documents",
                    tabPath: "",
                    documentClientUtility: this.container.documentClientUtility,
                    isRunningOnDaytona: false,
                    selfLink: this.self,
                    isActive: ko.observable(false)
                });
                this.container.openedTabs.push(documentsTab);
            }
            // Activate
            documentsTab.onTabClick();
        };
        Collection.prototype.onSettingsClick = function () {
            var _this = this;
            this.container.selectedNode(this);
            this.selectedSubnodeKind(ViewModels.CollectionTabKind.Settings);
            // create settings tab if not created yet
            var openedTabs = this.container.openedTabs();
            var settingsTab = openedTabs
                .filter(function (tab) { return tab.collection.rid === _this.rid; })
                .filter(function (tab) { return tab.tabKind === ViewModels.CollectionTabKind.Settings; })[0];
            if (!settingsTab) {
                settingsTab = new SettingsTab({
                    tabKind: ViewModels.CollectionTabKind.Settings,
                    title: "Settings",
                    tabPath: "",
                    documentClientUtility: this.container.documentClientUtility,
                    isRunningOnDaytona: false,
                    selfLink: this.self,
                    isActive: ko.observable(false)
                });
                this.container.openedTabs.push(settingsTab);
            }
            // Activate
            settingsTab.onTabClick();
        };
        Collection.prototype.onNewQueryClick = function (source, event, queryText) {
            var collection = source.collection || source;
            var explorer = source.container;
            var openedTabs = explorer.openedTabs();
            var id = openedTabs.filter(function (t) { return t.tabKind === ViewModels.CollectionTabKind.Query; }).length + 1;
            var queryTab = new QueryTab({
                tabKind: ViewModels.CollectionTabKind.Query,
                title: "Query " + id,
                tabPath: "",
                documentClientUtility: this.container.documentClientUtility,
                isRunningOnDaytona: false,
                selfLink: this.self,
                isActive: ko.observable(false)
            });
            this.container.openedTabs.push(queryTab);
            // Activate
            queryTab.onTabClick();
            // Hide Context Menu (if necessary)
            collection.contextMenu.hide(this, null);
        };
        Collection.prototype.onNewMongoQueryClick = function (source, event, queryText) {
            var collection = source.collection || source;
            var explorer = source.container;
            var openedTabs = explorer.openedTabs();
            var id = openedTabs.filter(function (t) { return t.tabKind === ViewModels.CollectionTabKind.Query; }).length + 1;
            var queryTab = new MongoQueryTab({
                tabKind: ViewModels.CollectionTabKind.Query,
                title: "Mongo Query " + id,
                tabPath: "",
                documentClientUtility: this.container.documentClientUtility,
                isRunningOnDaytona: false,
                selfLink: this.self,
                isActive: ko.observable(false)
            });
            this.container.openedTabs.push(queryTab);
            // Activate
            queryTab.onTabClick();
            // Hide Context Menu (if necessary)
            collection.contextMenu.hide(this, null);
        };
        Collection.prototype.onNewGraphClick = function () {
            var id = this.container.openedTabs().filter(function (t) { return t.tabKind === ViewModels.CollectionTabKind.Graph; }).length + 1;
            var graphTab = new GraphTab({
                tabKind: ViewModels.CollectionTabKind.Graph,
                title: "Graph Query " + id,
                tabPath: "",
                documentClientUtility: this.container.documentClientUtility,
                isRunningOnDaytona: false,
                selfLink: this.self,
                isActive: ko.observable(false)
            });
            this.container.openedTabs.push(graphTab);
            // Activate
            graphTab.onTabClick();
            // Hide Context Menu (if necessary)
            this.contextMenu.hide(this, null);
        };
        Collection.prototype.onNewMongoShellClick = function () {
            var id = this.container.openedTabs().filter(function (t) { return t.tabKind === ViewModels.CollectionTabKind.MongoShell; }).length + 1;
            var mongoShellTab = new MongoShellTab({
                tabKind: ViewModels.CollectionTabKind.MongoShell,
                title: "Mongo Shell " + id,
                tabPath: "",
                documentClientUtility: this.container.documentClientUtility,
                isRunningOnDaytona: false,
                selfLink: this.self,
                isActive: ko.observable(false)
            });
            this.container.openedTabs.push(mongoShellTab);
            // Activate
            mongoShellTab.onTabClick();
            // Hide Context Menu (if necessary)
            this.contextMenu.hide(this, null);
        };
        Collection.prototype.onNewStoredProcedureClick = function (source, event) {
            StoredProcedure.create(source, event);
        };
        Collection.prototype.onNewUserDefinedFunctionClick = function (source, event) {
            UserDefinedFunction.create(source, event);
        };
        Collection.prototype.onNewTriggerClick = function (source, event) {
            Trigger.create(source, event);
        };
        Collection.prototype.createStoredProcedureNode = function (data) {
            var node = new StoredProcedure(this.container, this, data);
            this.container.selectedNode(node);
            this.children.push(node);
            return node;
        };
        Collection.prototype.createUserDefinedFunctionNode = function (data) {
            var node = new UserDefinedFunction(this.container, this, data);
            this.container.selectedNode(node);
            this.children.push(node);
            return node;
        };
        Collection.prototype.createTriggerNode = function (data) {
            var node = new Trigger(this.container, this, data);
            this.container.selectedNode(node);
            this.children.push(node);
            return node;
        };
        Collection.prototype.expandCollapseStoredProcedures = function () {
            this.selectedSubnodeKind(ViewModels.CollectionTabKind.StoredProcedures);
            if (this.isStoredProceduresExpanded()) {
                this.collapseStoredProcedures();
            }
            else {
                this.expandStoredProcedures();
            }
        };
        Collection.prototype.expandStoredProcedures = function () {
            if (this.isStoredProceduresExpanded()) {
                return;
            }
            this.isStoredProceduresExpanded(true);
        };
        Collection.prototype.collapseStoredProcedures = function () {
            if (!this.isStoredProceduresExpanded()) {
                return;
            }
            this.isStoredProceduresExpanded(false);
        };
        Collection.prototype.expandCollapseUserDefinedFunctions = function () {
            this.selectedSubnodeKind(ViewModels.CollectionTabKind.UserDefinedFunctions);
            if (this.isUserDefinedFunctionsExpanded()) {
                this.collapseUserDefinedFunctions();
            }
            else {
                this.expandUserDefinedFunctions();
            }
        };
        Collection.prototype.expandUserDefinedFunctions = function () {
            if (this.isUserDefinedFunctionsExpanded()) {
                return;
            }
            this.isUserDefinedFunctionsExpanded(true);
        };
        Collection.prototype.collapseUserDefinedFunctions = function () {
            if (!this.isUserDefinedFunctionsExpanded()) {
                return;
            }
            this.isUserDefinedFunctionsExpanded(false);
        };
        Collection.prototype.expandCollapseTriggers = function () {
            this.selectedSubnodeKind(ViewModels.CollectionTabKind.Triggers);
            if (this.isTriggersExpanded()) {
                this.collapseTriggers();
            }
            else {
                this.expandTriggers();
            }
        };
        Collection.prototype.expandTriggers = function () {
            if (this.isTriggersExpanded()) {
                return;
            }
            this.isTriggersExpanded(true);
        };
        Collection.prototype.collapseTriggers = function () {
            if (!this.isTriggersExpanded()) {
                return;
            }
            this.isTriggersExpanded(false);
        };
        Collection.prototype.loadStoredProcedures = function () {
            var _this = this;
            return this.container.documentClientUtility.readStoredProcedures(this, null /*options*/)
                .then(function (storedProcedures) {
                var storedProceduresNodes = storedProcedures.map(function (storedProcedure) { return new StoredProcedure(_this.container, _this, storedProcedure); });
                var otherNodes = _this.children().filter(function (node) { return node.nodeKind !== "StoredProcedure"; });
                var allNodes = otherNodes.concat(storedProceduresNodes);
                _this.children(allNodes);
            });
        };
        Collection.prototype.loadUserDefinedFunctions = function () {
            var _this = this;
            return this.container.documentClientUtility.readUserDefinedFunctions(this, null /*options*/)
                .then(function (userDefinedFunctions) {
                var userDefinedFunctionsNodes = userDefinedFunctions.map(function (udf) { return new UserDefinedFunction(_this.container, _this, udf); });
                var otherNodes = _this.children().filter(function (node) { return node.nodeKind !== "UserDefinedFunction"; });
                var allNodes = otherNodes.concat(userDefinedFunctionsNodes);
                _this.children(allNodes);
            });
        };
        Collection.prototype.loadTriggers = function () {
            var _this = this;
            return this.container.documentClientUtility.readTriggers(this, null /*options*/)
                .then(function (triggers) {
                var triggerNodes = triggers.map(function (trigger) { return new Trigger(_this.container, _this, trigger); });
                var otherNodes = _this.children().filter(function (node) { return node.nodeKind !== "Trigger"; });
                var allNodes = otherNodes.concat(triggerNodes);
                _this.children(allNodes);
            });
        };
        Collection.prototype.onDragOver = function (source, event) {
            event.originalEvent.stopPropagation();
            event.originalEvent.preventDefault();
        };
        Collection.prototype.onDrop = function (source, event) {
            event.originalEvent.stopPropagation();
            event.originalEvent.preventDefault();
            this._uploadFiles(event.originalEvent.dataTransfer.files);
        };
        Collection.prototype.isCollectionNodeSelected = function () {
            return !this.isCollectionExpanded() && this.container.selectedNode && this.container.selectedNode() && this.container.selectedNode().rid === this.rid && this.container.selectedNode().nodeKind === "Collection";
        };
        Collection.prototype.isSubNodeSelected = function (nodeKind) {
            return this.container.selectedNode && this.container.selectedNode() && this.container.selectedNode().rid === this.rid && this.selectedSubnodeKind() === nodeKind;
        };
        Collection.prototype.onDeleteCollectionContextMenuClick = function (source, event) {
            this._onContextMenuClick(source, event);
            this.container.deleteCollectionConfirmationPane.open();
        };
        Collection.prototype._onContextMenuClick = function (source, event) {
            this.container.selectedNode(this);
            this.contextMenu.hide(source, event);
        };
        Collection.prototype._uploadFiles = function (fileList) {
            for (var index = 0; index < fileList.length; index++) {
                var file = fileList[index];
                var reader = new FileReader();
                reader.onload = this._onFileLoaded.bind(this, file);
                reader.readAsText(file);
            }
        };
        Collection.prototype._onFileLoaded = function (file, e) {
            console.log(file.name + " loaded.");
            try {
                var content = JSON.parse(e.target.result);
                console.log(file.name + " parsed.");
                if (Array.isArray(content)) {
                    for (var index = 0; index < content.length; index++) {
                        var document_1 = content[index];
                        this.container.documentClientUtility.createDocument(this, document_1, null /*options*/).then(function () {
                            console.log(file.name + "[" + index + "] uploaded.");
                        });
                    }
                }
                else {
                    this.container.documentClientUtility.createDocument(this, content, null /*options*/).then(function () {
                        console.log(file.name + " uploaded.");
                    });
                }
            }
            catch (parseException) {
                console.log("Error parsing file \"" + file.name + "\"");
            }
        };
        return Collection;
    }());
    return Collection;
});
