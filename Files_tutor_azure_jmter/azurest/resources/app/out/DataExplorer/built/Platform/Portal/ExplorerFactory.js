define(["require", "exports", "../../Explorer/Explorer", "./DocumentClientUtility", "./DocumentClientFactory"], function (require, exports, Explorer, DocumentClientUtility, DocumentClientFactory) {
    "use strict";
    var DocumentDB = window.DocumentDB;
    var PortalExplorerFactory = (function () {
        function PortalExplorerFactory() {
        }
        PortalExplorerFactory.prototype.createExplorer = function () {
            var documentClientFactory = new DocumentClientFactory();
            var documentClientUtility = new DocumentClientUtility(documentClientFactory);
            var explorer = new Explorer({
                documentClientUtility: documentClientUtility,
                isEmulator: false
            });
            documentClientFactory.setExplorer(explorer);
            return explorer;
        };
        return PortalExplorerFactory;
    }());
    return PortalExplorerFactory;
});
