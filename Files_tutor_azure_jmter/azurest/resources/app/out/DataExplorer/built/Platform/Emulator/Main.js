define(["require", "exports", "../../Common/Constants", "./ExplorerFactory"], function (require, exports, Constants, EmulatorExplorerFactory) {
    "use strict";
    var Main = (function () {
        function Main() {
        }
        Main.isValidReferrer = function () {
            var referrer = window.document.referrer;
            if (Main._referrers.some(function (r) { return referrer.indexOf(r) === 0; })) {
                return true;
            }
            if (!referrer) {
                return true;
            }
            return false;
        };
        Main.initializeExplorer = function () {
            var explorer = EmulatorExplorerFactory.createExplorer();
            return explorer;
        };
        return Main;
    }());
    Main._referrers = [
        Constants.Referrers.emulatorLocalhost
    ];
    return Main;
});
