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
define(["require", "exports", "../../Contracts/ViewModels", "../../Common/MongoUtility", "./QueryTab"], function (require, exports, ViewModels, MongoUtility, QueryTab) {
    "use strict";
    var MongoQueryTab = (function (_super) {
        __extends(MongoQueryTab, _super);
        function MongoQueryTab(options) {
            var _this = _super.call(this, options) || this;
            _this.sqlQueryEditorContent(""); // override sql query editor content for now so we only display mongo related help items
            _this.monacoSettings = new ViewModels.MonacoEditorSettings('plaintext', false);
            return _this;
        }
        /** Renders a Javascript object to be displayed inside Monaco Editor */
        MongoQueryTab.prototype.renderObjectForEditor = function (value, replacer, space) {
            return MongoUtility.tojson(value, null, false);
        };
        return MongoQueryTab;
    }(QueryTab));
    return MongoQueryTab;
});
