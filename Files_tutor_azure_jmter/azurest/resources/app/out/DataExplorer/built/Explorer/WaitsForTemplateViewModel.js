define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WaitsForTemplateViewModel = (function () {
        function WaitsForTemplateViewModel() {
            this.isTemplateReady = ko.observable(false).extend({ rateLimit: 100 });
        }
        WaitsForTemplateViewModel.prototype.onTemplateReady = function (callback) {
            this.isTemplateReady.subscribe(function (value) {
                callback(value);
            });
        };
        return WaitsForTemplateViewModel;
    }());
    exports.WaitsForTemplateViewModel = WaitsForTemplateViewModel;
});
