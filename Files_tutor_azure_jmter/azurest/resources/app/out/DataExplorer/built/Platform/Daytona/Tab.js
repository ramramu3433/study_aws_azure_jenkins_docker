define(["require", "exports", "knockout", "../../Explorer/ComponentRegisterer", "../../Bindings/BindingHandlersRegisterer", "./TabExplorer", "./Bindings"], function (require, exports, ko, ComponentRegisterer, BindingHandlersRegisterer_1, TabExplorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    $(document).ready(function () {
        BindingHandlersRegisterer_1.BindingHandlersRegisterer.registerBindingHandlers();
        var tmp = ComponentRegisterer;
        var explorer = new TabExplorer_1.default();
        ko.applyBindings(explorer);
    });
});
