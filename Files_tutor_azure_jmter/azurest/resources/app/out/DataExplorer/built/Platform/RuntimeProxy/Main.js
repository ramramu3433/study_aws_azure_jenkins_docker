define(["require", "exports", "../../Common/Constants", "./ExplorerFactory", "../../Explorer/Tables/DataTable/DataTableBindingManager"], function (require, exports, Constants, PortalExplorerFactory) {
    "use strict";
    var Main = (function () {
        function Main() {
        }
        Main.isValidReferrer = function () {
            var referrer = window.document.referrer;
            return referrer.indexOf("dev") > 0;
        };
        Main.initializeExplorer = function () {
            var portalExplorerFactory = new PortalExplorerFactory();
            var explorer = portalExplorerFactory.createExplorer();
            return explorer;
        };
        return Main;
    }());
    Main._referrers = [
        Constants.Referrers.emulatorLocalhost
    ];
    return Main;
});
