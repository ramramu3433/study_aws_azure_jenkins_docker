define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PaneComponent = (function () {
        function PaneComponent(data) {
            return data.data;
        }
        return PaneComponent;
    }());
    exports.PaneComponent = PaneComponent;
    var AddCollectionPaneComponent = (function () {
        function AddCollectionPaneComponent() {
            return {
                viewModel: PaneComponent,
                template: {
                    require: "text!AddCollectionPane.html"
                }
            };
        }
        return AddCollectionPaneComponent;
    }());
    exports.AddCollectionPaneComponent = AddCollectionPaneComponent;
    var DeleteCollectionConfirmationPaneComponent = (function () {
        function DeleteCollectionConfirmationPaneComponent() {
            return {
                viewModel: PaneComponent,
                template: {
                    require: "text!DeleteCollectionConfirmationPane.html"
                }
            };
        }
        return DeleteCollectionConfirmationPaneComponent;
    }());
    exports.DeleteCollectionConfirmationPaneComponent = DeleteCollectionConfirmationPaneComponent;
    var DeleteDatabaseConfirmationPaneComponent = (function () {
        function DeleteDatabaseConfirmationPaneComponent() {
            return {
                viewModel: PaneComponent,
                template: {
                    require: "text!DeleteDatabaseConfirmationPane.html"
                }
            };
        }
        return DeleteDatabaseConfirmationPaneComponent;
    }());
    exports.DeleteDatabaseConfirmationPaneComponent = DeleteDatabaseConfirmationPaneComponent;
});
