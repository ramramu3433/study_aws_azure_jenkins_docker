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
    var DeleteDatabaseConfirmationPane = (function (_super) {
        __extends(DeleteDatabaseConfirmationPane, _super);
        function DeleteDatabaseConfirmationPane(options) {
            var _this = _super.call(this, options) || this;
            _this.container = options.container;
            _this.databaseIdConfirmation = ko.observable();
            _this.resetData();
            return _this;
        }
        DeleteDatabaseConfirmationPane.prototype.submit = function () {
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
            if (selectedNode.nodeKind !== "Database") {
                return;
            }
            var selectedDatabase = this.container.selectedNode();
            this.container.documentClientUtility.deleteDatabase(selectedDatabase, null /*options*/)
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
        DeleteDatabaseConfirmationPane.prototype.resetData = function () {
            this.databaseIdConfirmation("");
            _super.prototype.resetData.call(this);
        };
        DeleteDatabaseConfirmationPane.prototype._isValid = function () {
            var selectedNode = this.container.selectedNode();
            if (!selectedNode) {
                return false;
            }
            if (selectedNode.nodeKind !== "Database") {
                return false;
            }
            var selectedDatabase = this.container.selectedNode();
            return (this.databaseIdConfirmation() === selectedDatabase.id());
        };
        return DeleteDatabaseConfirmationPane;
    }(ContextualPaneBase_1.ContextualPaneBase));
    return DeleteDatabaseConfirmationPane;
});
