define(["require", "exports", "knockout", "../Common/Constants", "../Common/Splitter", "./Tree/Database", "./Panes/AddCollectionPane", "./Panes/DeleteCollectionConfirmationPane", "./Panes/DeleteDatabaseConfirmationPane", "./Panes/GraphStylingPane", "./Panes/Tables/AddTableEntityPane", "./Panes/Tables/EditTableEntityPane", "./Panes/Tables/TableColumnOptionsPane", "./Panes/Tables/QuerySelectPane", "./Panes/NewVertexPane", "./ComponentRegisterer", "./CommandBarButtonFactory", "./Menus/CommandBar/CommandBarOptions", "./OpenActions", "../Bindings/BindingHandlersRegisterer"], function (require, exports, ko, Constants, Splitter, Database, AddCollectionPane, DeleteCollectionConfirmationPane, DeleteDatabaseConfirmationPane, GraphStylingPane, AddTableEntityPane, EditTableEntityPane, TableColumnOptionsPane_1, QuerySelectPane_1, NewVertexPane, ComponentRegisterer, CommandBarButtonFactory_1, CommandBarOptions_1, OpenActions_1, BindingHandlersRegisterer_1) {
    "use strict";
    BindingHandlersRegisterer_1.BindingHandlersRegisterer.registerBindingHandlers();
    // Hold a reference to ComponentRegisterer to prevent transpiler to ignore import
    var tmp = ComponentRegisterer;
    var DocumentDB = window.DocumentDB;
    var Explorer = (function () {
        function Explorer(options) {
            var _this = this;
            this.addCollectionText = ko.observable("New Collection");
            this.collectionTitle = ko.observable("Collections");
            this.collectionTreeNodeAltText = ko.observable("Collection");
            this.refreshTreeTitle = ko.observable("Refresh collections");
            this.databaseAccount = ko.observable();
            this.isAccountReady = ko.observable(false);
            this.isAccountReady.subscribe(function (isAccountReady) {
                if (isAccountReady) {
                    _this.refreshAllDatabases();
                    var mainCommandBarButtonOptions = CommandBarButtonFactory_1.CommandBarButtonFactory.createMainCommandBarButtonOptions(_this);
                    _this.mainCommandBarOptions.options(mainCommandBarButtonOptions);
                }
            });
            this.documentClientUtility = options.documentClientUtility;
            this.isEmulator = options.isEmulator;
            this.features = ko.observable();
            this.serverId = ko.observable();
            this.isGraphsEnabled = ko.computed(function () {
                var features = _this.features();
                return _this.isFeatureEnabled(features, Constants.Features.graphs);
            });
            this.databases = ko.observableArray();
            this.mainCommandBarOptions = new CommandBarOptions_1.CommandBarOptions([]);
            this.isLeftPaneExpanded = ko.observable(true);
            this.selectedNode = ko.observable();
            this.selectedNode.subscribe(function (tab) {
                // Make sure switching tabs restores tabs display
                _this.isTabsContentExpanded(false);
            });
            this.defaultExperience = ko.observable();
            this.databaseAccount.subscribe(function (databaseAccount) {
                var accountKind = !!databaseAccount && databaseAccount.kind || Constants.AccountKind.Default;
                if (accountKind.toLowerCase() === Constants.AccountKind.MongoDB.toLowerCase()) {
                    _this.defaultExperience(Constants.DefaultAccountExperience.MongoDB);
                    return;
                }
                if (!databaseAccount.tags) {
                    _this.defaultExperience(Constants.DefaultAccountExperience.Default);
                    return;
                }
                if (!(Constants.TagNames.defaultExperience in databaseAccount.tags)) {
                    _this.defaultExperience(Constants.DefaultAccountExperience.Default);
                    return;
                }
                _this.defaultExperience(databaseAccount.tags[Constants.TagNames.defaultExperience]);
            });
            this.isPreferredApiDocumentDB = ko.computed(function () {
                var defaultExperience = _this.defaultExperience && _this.defaultExperience() || "";
                return (defaultExperience.toLowerCase() === Constants.DefaultAccountExperience.DocumentDB.toLowerCase());
            });
            this.isPreferredApiGraph = ko.computed(function () {
                var defaultExperience = _this.defaultExperience && _this.defaultExperience() || "";
                return (defaultExperience.toLowerCase() === Constants.DefaultAccountExperience.Graph.toLowerCase());
            });
            this.isPreferredApiTable = ko.computed(function () {
                var defaultExperience = _this.defaultExperience && _this.defaultExperience() || "";
                return (defaultExperience.toLowerCase() === Constants.DefaultAccountExperience.Table.toLowerCase());
            });
            this.isPreferredApiMongoDB = ko.computed(function () {
                var defaultExperience = _this.defaultExperience && _this.defaultExperience() || "";
                if (defaultExperience.toLowerCase() === Constants.DefaultAccountExperience.MongoDB.toLowerCase()) {
                    return true;
                }
                if (_this.databaseAccount && _this.databaseAccount() && _this.databaseAccount().kind.toLowerCase() === Constants.AccountKind.MongoDB) {
                    return true;
                }
                return false;
            });
            this.selectedDatabaseId = ko.computed(function () {
                var selectedNode = _this.selectedNode();
                if (!selectedNode) {
                    return "";
                }
                switch (selectedNode.nodeKind) {
                    case "Collection":
                        return selectedNode.database.id() || "";
                    case "Database":
                        return selectedNode.id() || "";
                    case "DocumentId":
                    case "StoredProcedure":
                    case "Trigger":
                    case "UserDefinedFunction":
                        return selectedNode.collection.database.id() || "";
                    default:
                        return "";
                }
            });
            this.splitter = new Splitter("h_splitter1", "resourcetree", "content");
            // TODO need to refactor
            this.addCollectionPane = new AddCollectionPane({
                isPreferredApiTable: ko.computed(function () { return false; }),
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.deleteCollectionConfirmationPane = new DeleteCollectionConfirmationPane({
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.deleteDatabaseConfirmationPane = new DeleteDatabaseConfirmationPane({
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.graphStylingPane = new GraphStylingPane({
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.addTableEntityPane = new AddTableEntityPane({
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.editTableEntityPane = new EditTableEntityPane({
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.tableColumnOptionsPane = new TableColumnOptionsPane_1.TableColumnOptionsPane({
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.querySelectPane = new QuerySelectPane_1.QuerySelectPane({
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.newVertexPane = new NewVertexPane({
                documentClientUtility: this.documentClientUtility,
                id: "",
                visible: ko.computed(function () { return false; }),
                isRunningOnDaytona: false,
                container: this
            });
            this.openedTabs = ko.observableArray([]);
            this.isTabsContentExpanded = ko.observable(false);
            document.addEventListener('contextmenu', function (e) {
                e.preventDefault();
            }, false);
            this.defaultExperience.subscribe(function (defaultExperience) {
                var defaultExperienceNormalizedString = (defaultExperience || Constants.DefaultAccountExperience.Default).toLowerCase();
                switch (defaultExperienceNormalizedString) {
                    case Constants.DefaultAccountExperience.DocumentDB.toLowerCase():
                    case Constants.DefaultAccountExperience.MongoDB.toLowerCase():
                        _this.addCollectionText("New Collection");
                        _this.collectionTitle("Collections");
                        _this.collectionTreeNodeAltText("Collection");
                        _this.addCollectionPane.title("Add Collection");
                        _this.addCollectionPane.collectionIdTitle("Collection Id");
                        _this.refreshTreeTitle("Refresh collections");
                        break;
                    case Constants.DefaultAccountExperience.Graph.toLowerCase():
                        _this.addCollectionText("New Graph");
                        _this.collectionTitle("Graphs");
                        _this.collectionTreeNodeAltText("Graph");
                        _this.addCollectionPane.title("Add Graph");
                        _this.addCollectionPane.collectionIdTitle("Graph Id");
                        _this.refreshTreeTitle("Refresh graphs");
                        break;
                    case Constants.DefaultAccountExperience.Table.toLowerCase():
                        _this.addCollectionText("New Table");
                        _this.collectionTitle("Tables");
                        _this.collectionTreeNodeAltText("Table");
                        _this.addCollectionPane.title("Add Table");
                        _this.addCollectionPane.collectionIdTitle("Table Id");
                        _this.refreshTreeTitle("Refresh tables");
                        break;
                }
            });
        }
        Explorer.prototype.isDatabaseNodeOrNoneSelected = function () {
            return this.selectedNode() == null || this.selectedNode() && this.selectedNode().nodeKind === "Database";
        };
        Explorer.prototype.isFeatureEnabled = function (features, feature) {
            if (!features) {
                return false;
            }
            if (feature in features && features[feature]) {
                return true;
            }
            return false;
        };
        Explorer.prototype.toggleLeftPaneExpanded = function () {
            this.isLeftPaneExpanded(!this.isLeftPaneExpanded());
            if (this.isLeftPaneExpanded()) {
                this.splitter.expandLeft();
            }
            else {
                this.splitter.collapseLeft();
            }
        };
        Explorer.prototype.refreshAllDatabases = function () {
            var _this = this;
            this.documentClientUtility.readDatabases(null /*options*/).then(function (databases) {
                _this.databases(databases.map(function (database) { return new Database(_this, database); }));
                _this.databases().forEach(function (db) { return db.expandCollapseDatabase(); });
            });
        };
        // Facade
        Explorer.prototype.graphStyling_open = function () {
            this.graphStylingPane.open();
        };
        Explorer.prototype.graphStyling_submit = function () {
            this.graphStylingPane.submit();
        };
        Explorer.prototype.graphStyling_cancel = function () {
            this.graphStylingPane.cancel();
        };
        Explorer.prototype.graphStyling_showErrorDetails = function () {
            this.graphStylingPane.showErrorDetails();
        };
        Explorer.prototype.graphStyling_hideErrorDetails = function () {
            this.graphStylingPane.hideErrorDetails();
        };
        Explorer.prototype.addTableEntity_open = function (viewModel) {
            this.addTableEntityPane.tableViewModel = viewModel;
            this.addTableEntityPane.open();
        };
        Explorer.prototype.addTableEntity_submit = function () {
            this.addTableEntityPane.submit();
        };
        Explorer.prototype.addTableEntity_cancel = function () {
            this.addTableEntityPane.cancel();
        };
        Explorer.prototype.addTableEntity_showErrorDetails = function () {
            this.addTableEntityPane.showErrorDetails();
        };
        Explorer.prototype.addTableEntity_hideErrorDetails = function () {
            this.addTableEntityPane.hideErrorDetails();
        };
        Explorer.prototype.editTableEntity_open = function (entityToUpdate, tableViewModel, originalListOfProperties) {
            this.editTableEntityPane.originEntity = entityToUpdate;
            this.editTableEntityPane.tableViewModel = tableViewModel;
            this.editTableEntityPane.originalNumberOfProperties = originalListOfProperties;
            this.editTableEntityPane.open();
        };
        Explorer.prototype.editTableEntity_submit = function () {
            this.editTableEntityPane.submit();
        };
        Explorer.prototype.editTableEntity_cancel = function () {
            this.editTableEntityPane.cancel();
        };
        Explorer.prototype.editTableEntity_showErrorDetails = function () {
            this.editTableEntityPane.showErrorDetails();
        };
        Explorer.prototype.editTableEntity_hideErrorDetails = function () {
            this.editTableEntityPane.hideErrorDetails();
        };
        Explorer.prototype.tableColumnOptions_open = function (parameters, tableViewModel) {
            this.tableColumnOptionsPane.tableViewModel = tableViewModel;
            this.tableColumnOptionsPane.parameters = parameters;
            this.tableColumnOptionsPane.open();
        };
        Explorer.prototype.tableColumnOptions_submit = function () {
            this.tableColumnOptionsPane.submit();
        };
        Explorer.prototype.tableColumnOptions_cancel = function () {
            this.tableColumnOptionsPane.cancel();
        };
        Explorer.prototype.tableColumnOptions_showErrorDetails = function () {
            this.tableColumnOptionsPane.showErrorDetails();
        };
        Explorer.prototype.tableColumnOptions_hideErrorDetails = function () {
            this.tableColumnOptionsPane.hideErrorDetails();
        };
        Explorer.prototype.querySelect_open = function (queryViewModel) {
            this.querySelectPane.queryViewModel = queryViewModel;
            this.querySelectPane.open();
        };
        Explorer.prototype.querySelect_submit = function () {
            this.querySelectPane.submit();
        };
        Explorer.prototype.querySelect_cancel = function () {
            this.querySelectPane.cancel();
        };
        Explorer.prototype.querySelect_showErrorDetails = function () {
            this.querySelectPane.showErrorDetails();
        };
        Explorer.prototype.querySelect_hideErrorDetails = function () {
            this.querySelectPane.hideErrorDetails();
        };
        Explorer.prototype.newvertex_open = function () {
            this.newVertexPane.open();
        };
        Explorer.prototype.newvertex_submit = function () {
            this.newVertexPane.submit();
        };
        Explorer.prototype.newvertex_cancel = function () {
            this.newVertexPane.cancel();
        };
        Explorer.prototype.newvertex_showErrorDetails = function () {
            this.newVertexPane.showErrorDetails();
        };
        Explorer.prototype.newvertex_hideErrorDetails = function () {
            this.newVertexPane.hideErrorDetails();
        };
        Explorer.prototype.postMessage = function (data) {
            if (window.parent !== window) {
                window.parent.postMessage({
                    signature: "pcIframe",
                    data: data
                }, window.document.referrer);
            }
        };
        Explorer.prototype.postReadyMessage = function () {
            this.postMessage("ready");
        };
        Explorer.prototype.handleMessage = function (event) {
            if (typeof event.data !== "object" || event.data["signature"] !== "pcIframe")
                return;
            if (typeof event.data !== "object" || !("data" in event.data))
                return;
            if (typeof event.data["data"] !== "object" || !("inputs" in event.data["data"]))
                return;
            var message = event.data.data;
            var inputs = message.inputs;
            var authorizationToken = inputs.authorizationToken || "";
            var databaseAccount = inputs.databaseAccount || null;
            this.features(inputs.features);
            this.serverId(inputs.serverId);
            this.databaseAccount(databaseAccount);
            DocumentDB.RequestHandler._authorizationToken(authorizationToken);
            DocumentDB.RequestHandler._databaseAccount(databaseAccount);
            var openAction = message.openAction;
            if (!!openAction) {
                var subscription_1 = this.databases.subscribe(function (databases) {
                    OpenActions_1.handleOpenAction(openAction, databases);
                    subscription_1.dispose();
                });
            }
            this.isAccountReady(true);
        };
        Explorer.prototype.findSelectedCollection = function () {
            if (this.selectedNode().nodeKind === "Collection") {
                return this.findSelectedCollectionForSelectedNode();
            }
            else {
                return this.findSelectedCollectionForSubNode();
            }
        };
        Explorer.prototype.findSelectedCollectionForSelectedNode = function () {
            for (var i = 0; i < this.databases().length; i++) {
                var database = this.databases()[i];
                for (var j = 0; j < database.collections().length; j++) {
                    var collection = database.collections()[j];
                    if (collection.rid === this.selectedNode().rid) {
                        return collection;
                    }
                }
            }
            return null;
        };
        Explorer.prototype.findSelectedCollectionForSubNode = function () {
            for (var i = 0; i < this.databases().length; i++) {
                var database = this.databases()[i];
                for (var j = 0; j < database.collections().length; j++) {
                    var collection = database.collections()[j];
                    if (collection.rid === this.selectedNode().collection.rid) {
                        return collection;
                    }
                }
            }
            return null;
        };
        return Explorer;
    }());
    return Explorer;
});
