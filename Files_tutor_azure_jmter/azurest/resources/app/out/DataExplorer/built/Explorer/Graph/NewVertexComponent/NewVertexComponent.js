define(["require", "exports", "knockout", "../GraphExplorerComponent"], function (require, exports, ko, GraphExplorerComponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Helper class for ko component registration
     */
    var NewVertexComponent = (function () {
        function NewVertexComponent() {
            return {
                viewModel: NewVertexViewModel,
                template: { require: "text!new-vertex-component.html" }
            };
        }
        return NewVertexComponent;
    }());
    exports.NewVertexComponent = NewVertexComponent;
    var NewVertexViewModel = (function () {
        function NewVertexViewModel(params) {
            this.newVertexData = params.newVertexData || ko.observable({
                label: '',
                properties: []
            });
            this.propertyTypes = GraphExplorerComponent_1.VERTEX_PROPERTY_TYPES;
        }
        NewVertexViewModel.prototype.addNewVertexProperty = function () {
            var ap = this.newVertexData().properties;
            var n = ap.length;
            ap.push({ key: '', value: '', type: NewVertexViewModel.DEFAULT_PROPERTY_TYPE });
            this.newVertexData.valueHasMutated();
        };
        NewVertexViewModel.prototype.removeNewVertexProperty = function (index) {
            var ap = this.newVertexData().properties;
            ap.splice(index, 1);
            this.newVertexData.valueHasMutated();
        };
        return NewVertexViewModel;
    }());
    NewVertexViewModel.DEFAULT_PROPERTY_TYPE = 'string';
});
