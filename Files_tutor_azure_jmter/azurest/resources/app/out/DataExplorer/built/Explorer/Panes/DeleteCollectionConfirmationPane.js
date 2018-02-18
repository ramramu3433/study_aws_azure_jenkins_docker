var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "knockout", "../../Common/ErrorParserUtility", "./ContextualPaneBase"], function (require, exports, ko, ErrorParserUtility, ContextualPaneBase_1) {
    "use strict";
    var DeleteCollectionConfirmationPane = (function (_super) {
        __extends(DeleteCollectionConfirmationPane, _super);
        function DeleteCollectionConfirmationPane(options) {
            var _this = _super.call(this, options) || this;
            _this.collectionIdConfirmation = ko.observable();
            _this.container = options.container;
            _this.resetData();
            return _this;
        }
        DeleteCollectionConfirmationPane.prototype.submit = function () {
            var _this = this;
            if (!this._isValid()) {
                return;
            }
            this.formErrors("");
            this.close();
            var selectedNode = this.container.selectedNode();
            if (!selectedNode) {
                return;
            }
            if (selectedNode.nodeKind !== "Collection") {
                return;
            }
            var selectedCollection = this.container.selectedNode();
            this.container.documentClientUtility.deleteCollection(selectedCollection, null /*options*/)
                .then(function () {
                _this.close();
                _this.container.refreshAllDatabases();
                _this.resetData();
            }, function (reason) {
                var message = ErrorParserUtility.parse(reason);
                _this.formErrors(message[0].message);
                _this.formErrorsDetails(message[0].message);
            });
        };
        DeleteCollectionConfirmationPane.prototype.resetData = function () {
            this.collectionIdConfirmation("");
            _super.prototype.resetData.call(this);
        };
        DeleteCollectionConfirmationPane.prototype._isValid = function () {
            var selectedNode = this.container.selectedNode();
            if (!selectedNode) {
                return false;
            }
            if (selectedNode.nodeKind !== "Collection") {
                return false;
            }
            var selectedCollection = this.container.selectedNode();
            return (this.collectionIdConfirmation() === selectedCollection.id());
        };
        DeleteCollectionConfirmationPane.prototype.showErrorDetails = function () {
            this.errorDetailsVisible(true);
        };
        DeleteCollectionConfirmationPane.prototype.hideErrorDetails = function () {
            this.errorDetailsVisible(false);
        };
        return DeleteCollectionConfirmationPane;
    }(ContextualPaneBase_1.ContextualPaneBase));
    return DeleteCollectionConfirmationPane;
});
