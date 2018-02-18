define(["require", "exports", "knockout", "./Common/Constants", "./Shared/Ajax"], function (require, exports, ko, Constants_1, Ajax) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Index = (function () {
        function Index() {
            var _this = this;
            this.navigationSelection = ko.observable("quickstart");
            this.correlationSrc = ko.observable("");
            Ajax.get("/_explorer/installation_id.txt").then(function (result) {
                // TODO: Detect correct URL for each environment automatically.
                var url = Constants_1.CorrelationBackend.Url + "?emulator_id=" + result;
                _this.correlationSrc(url);
            });
        }
        Index.prototype.quickstart_click = function () {
            this.navigationSelection("quickstart");
        };
        Index.prototype.explorer_click = function () {
            this.navigationSelection("explorer");
        };
        return Index;
    }());
    var index = new Index();
    ko.applyBindings(index);
});
