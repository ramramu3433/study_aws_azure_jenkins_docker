define(["require", "exports", "knockout", "../../Explorer/ComponentRegisterer", "../../Bindings/BindingHandlersRegisterer", "./PaneExplorer"], function (require, exports, ko, ComponentRegisterer, BindingHandlersRegisterer_1, PaneExplorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    BindingHandlersRegisterer_1.BindingHandlersRegisterer.registerBindingHandlers();
    $(document).ready(function () {
        var tmp = ComponentRegisterer;
        var explorer = new PaneExplorer_1.default();
        ko.applyBindings(explorer.currentPane);
    });
});
