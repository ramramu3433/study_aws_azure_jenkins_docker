define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Helper class for ko component registration
     */
    var GraphStyleComponent = (function () {
        function GraphStyleComponent() {
            return {
                viewModel: GraphStyleViewModel,
                template: { require: "text!graph-style-component.html" }
            };
        }
        return GraphStyleComponent;
    }());
    exports.GraphStyleComponent = GraphStyleComponent;
    var GraphStyleViewModel = (function () {
        function GraphStyleViewModel(params) {
            this.params = params;
        }
        return GraphStyleViewModel;
    }());
});
