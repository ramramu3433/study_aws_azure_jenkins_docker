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
define(["require", "exports", "knockout", "./ContextualPaneBase"], function (require, exports, ko, ContextualPaneBase_1) {
    "use strict";
    var NewVertexPane = (function (_super) {
        __extends(NewVertexPane, _super);
        function NewVertexPane(container) {
            var _this = _super.call(this, container) || this;
            _this.newVertexData = ko.observable();
            _this.tempVertexData = ko.observable(null);
            _this.resetData();
            return _this;
        }
        NewVertexPane.prototype.open = function () {
            $("#newvertexpane").fadeIn().find(".contextual-pane-in").animate({ "right": 0 }, 10);
            _super.prototype.open.call(this);
        };
        NewVertexPane.prototype.close = function () {
            $("#newvertexpane").fadeOut(10);
            _super.prototype.close.call(this);
        };
        NewVertexPane.prototype.clickOutside = function () {
            this.cancel();
        };
        NewVertexPane.prototype.submit = function () {
            // Commit edited changes
            this.newVertexData(this.tempVertexData());
            this.formErrors("");
            // this.close();
        };
        NewVertexPane.prototype.resetData = function () {
            _super.prototype.resetData.call(this);
            // Generate new blank vertex data
            this.newVertexData(null);
            this.tempVertexData({
                label: '',
                properties: []
            });
        };
        return NewVertexPane;
    }(ContextualPaneBase_1.ContextualPaneBase));
    return NewVertexPane;
});
