define(["require", "exports", "../../Common/Constants", "./ExplorerFactory"], function (require, exports, Constants, PortalExplorerFactory) {
    "use strict";
    var Main = (function () {
        function Main() {
        }
        Main.isValidReferrer = function () {
            var referrer = window.document.referrer;
            if (Main._referrers.some(function (r) { return referrer.indexOf(r) === 0; })) {
                return true;
            }
            return false;
        };
        Main.initializeExplorer = function () {
            var portalExplorerFactory = new PortalExplorerFactory();
            var explorer = portalExplorerFactory.createExplorer();
            window.addEventListener("message", explorer.handleMessage.bind(explorer), false);
            return explorer;
        };
        return Main;
    }());
    Main._referrers = [
        Constants.Referrers.productionPortal,
        Constants.Referrers.blackforestPortal,
        Constants.Referrers.fairfaxPortal,
        Constants.Referrers.mooncakePortal,
        Constants.Referrers.dogfoodPortal,
        Constants.Referrers.inTunePortal,
        Constants.Referrers.mpacPortal,
        Constants.Referrers.previewPortal,
        Constants.Referrers.rcPortal,
        Constants.Referrers.s2Portal
    ];
    return Main;
});
