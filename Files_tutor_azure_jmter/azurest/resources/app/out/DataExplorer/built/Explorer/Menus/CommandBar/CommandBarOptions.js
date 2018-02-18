define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CommandBarOptions = (function () {
        function CommandBarOptions(buttonOptions) {
            this.options = ko.observableArray(buttonOptions);
        }
        return CommandBarOptions;
    }());
    exports.CommandBarOptions = CommandBarOptions;
});
