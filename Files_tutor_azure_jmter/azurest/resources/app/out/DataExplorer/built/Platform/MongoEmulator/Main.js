define(["require", "exports", "../../Common/Constants", "./ExplorerFactory"], function (require, exports, Constants, MongoEmulatorExplorerFactory) {
    "use strict";
    var Main = (function () {
        function Main() {
        }
        Main.isValidReferrer = function () {
            var referrer = window.document.referrer;
            //As a temporal measure, we are forcing Mongo Explorer by adding a querystring "mongo" parameter while running on localhost
            if (Main._referrers.some(function (r) { return referrer.indexOf(r) === 0; }) && window.parent.location.search.indexOf('mongo') > -1) {
                return true;
            }
            return false;
        };
        Main.initializeExplorer = function () {
            var explorer = MongoEmulatorExplorerFactory.createExplorer();
            return explorer;
        };
        return Main;
    }());
    //As a temporal measure, we are forcing Mongo Explorer by adding a querystring "mongo" parameter while running on localhost
    Main._referrers = [
        Constants.Referrers.emulatorLocalhost
    ];
    return Main;
});
