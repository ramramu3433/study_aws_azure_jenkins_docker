define(["require", "exports", "../../Common/Constants", "../../Explorer/Explorer", "./DocumentClientUtility", "./DocumentClientFactory"], function (require, exports, Constants_1, Explorer, DocumentClientUtility, DocumentClientFactory) {
    "use strict";
    var EmulatorExplorerFactory = (function () {
        function EmulatorExplorerFactory() {
        }
        EmulatorExplorerFactory.createDocumentClientUtility = function () {
            var documentClientFactory = new DocumentClientFactory();
            return new DocumentClientUtility(documentClientFactory);
        };
        EmulatorExplorerFactory.createExplorer = function () {
            var trustedParentOrigins = [];
            var documentClientUtility = EmulatorExplorerFactory.createDocumentClientUtility();
            var explorer = new Explorer({
                documentClientUtility: documentClientUtility,
                isEmulator: true
            });
            explorer.databaseAccount({
                documentEndpoint: "",
                name: "",
                resourceId: "",
                kind: Constants_1.AccountKind.DocumentDB,
                tags: (_a = {},
                    _a[Constants_1.TagNames.defaultExperience] = Constants_1.DefaultAccountExperience.DocumentDB,
                    _a)
            });
            explorer.isAccountReady(true);
            return explorer;
            var _a;
        };
        return EmulatorExplorerFactory;
    }());
    return EmulatorExplorerFactory;
});
