/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "./DaytonaContext", "../../Explorer/Panes/AddCollectionPane", "./DocumentClientFactory", "./DocumentClientUtility"], function (require, exports, ko, DaytonaContext_1, AddCollectionPane, DocumentClientFactory, DocumentClientUtility) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PaneExplorer = (function () {
        function PaneExplorer() {
            this.paneContext = new DaytonaContext_1.default();
            var endpoint = this.paneContext.parameters.args.documentEndpoint.slice(0, -1);
            var masterKey = this.paneContext.parameters.args.primaryMasterKey;
            var documentClientFactory = new DocumentClientFactory();
            var documentClientUtility = new DocumentClientUtility(documentClientFactory, {
                endpoint: endpoint,
                masterKey: masterKey
            });
            var addCollectionPane = new AddCollectionPane({
                id: "id",
                isPreferredApiTable: ko.computed(function () { return false; }),
                visible: ko.observable(true),
                daytonaContext: this.paneContext,
                documentClientUtility: documentClientUtility,
                isRunningOnDaytona: true,
                databaseId: this.paneContext.parameters.args.databaseId || "",
                databaseSelfLink: this.paneContext.parameters.args.databaseSelfLink || ""
            });
            addCollectionPane.title = ko.observable("Add Collection");
            documentClientUtility.readDatabases(null /*options*/).then(function (_databases) {
                addCollectionPane.databasesIds(_databases.map(function (database) { return database.id; }));
            });
            addCollectionPane.collectionIdTitle("Collection Id");
            this.currentPane = addCollectionPane;
        }
        return PaneExplorer;
    }());
    exports.default = PaneExplorer;
});
