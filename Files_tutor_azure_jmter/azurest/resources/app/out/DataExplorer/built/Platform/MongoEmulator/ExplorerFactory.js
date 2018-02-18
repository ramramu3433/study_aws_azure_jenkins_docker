define(["require", "exports", "../../Explorer/Explorer", "./DocumentClientUtility", "./DocumentClientFactory"], function (require, exports, Explorer, DocumentClientUtility, DocumentClientFactory) {
    "use strict";
    var MongoEmulatorExplorerFactory = (function () {
        function MongoEmulatorExplorerFactory() {
        }
        MongoEmulatorExplorerFactory.createDocumentClientUtility = function () {
            var documentClientFactory = new DocumentClientFactory();
            return new DocumentClientUtility(documentClientFactory);
        };
        MongoEmulatorExplorerFactory.createExplorer = function () {
            var trustedParentOrigins = [];
            var documentClientUtility = MongoEmulatorExplorerFactory.createDocumentClientUtility();
            var explorer = new Explorer({
                documentClientUtility: documentClientUtility,
                isEmulator: true
            });
            explorer.databaseAccount({
                documentEndpoint: "",
                name: "",
                resourceId: "",
                kind: "MongoDB",
                tags: {}
            });
            explorer.isAccountReady(true);
            return explorer;
        };
        return MongoEmulatorExplorerFactory;
    }());
    return MongoEmulatorExplorerFactory;
});
