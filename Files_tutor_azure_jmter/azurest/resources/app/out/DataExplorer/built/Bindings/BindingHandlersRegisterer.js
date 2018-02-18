define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BindingHandlersRegisterer = (function () {
        function BindingHandlersRegisterer() {
        }
        BindingHandlersRegisterer.registerBindingHandlers = function () {
            ko.bindingHandlers.setTemplateReady = {
                init: function (element, wrappedValueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var value = ko.unwrap(wrappedValueAccessor());
                    bindingContext.$data.isTemplateReady(value);
                }
            };
        };
        return BindingHandlersRegisterer;
    }());
    exports.BindingHandlersRegisterer = BindingHandlersRegisterer;
});
