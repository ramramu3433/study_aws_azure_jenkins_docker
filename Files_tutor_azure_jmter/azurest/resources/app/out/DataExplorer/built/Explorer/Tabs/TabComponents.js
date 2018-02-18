define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TabComponent = (function () {
        function TabComponent(data) {
            return data.data;
        }
        return TabComponent;
    }());
    exports.TabComponent = TabComponent;
    var DocumentsTab = (function () {
        function DocumentsTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!DocumentsTab.html"
                }
            };
        }
        return DocumentsTab;
    }());
    exports.DocumentsTab = DocumentsTab;
    var GraphTab = (function () {
        function GraphTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!GraphTab.html"
                }
            };
        }
        return GraphTab;
    }());
    exports.GraphTab = GraphTab;
    var MongoDocumentsTab = (function () {
        function MongoDocumentsTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!MongoDocumentsTab.html"
                }
            };
        }
        return MongoDocumentsTab;
    }());
    exports.MongoDocumentsTab = MongoDocumentsTab;
    var MongoQueryTab = (function () {
        function MongoQueryTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!MongoQueryTab.html"
                }
            };
        }
        return MongoQueryTab;
    }());
    exports.MongoQueryTab = MongoQueryTab;
    var MongoShellTab = (function () {
        function MongoShellTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!MongoShellTab.html"
                }
            };
        }
        return MongoShellTab;
    }());
    exports.MongoShellTab = MongoShellTab;
    var QueryTab = (function () {
        function QueryTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!QueryTab.html"
                }
            };
        }
        return QueryTab;
    }());
    exports.QueryTab = QueryTab;
    var QueryTablesTab = (function () {
        function QueryTablesTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!QueryTablesTab.html"
                }
            };
        }
        return QueryTablesTab;
    }());
    exports.QueryTablesTab = QueryTablesTab;
    var SettingsTab = (function () {
        function SettingsTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!SettingsTab.html"
                }
            };
        }
        return SettingsTab;
    }());
    exports.SettingsTab = SettingsTab;
    var StoredProcedureTab = (function () {
        function StoredProcedureTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!StoredProcedureTab.html"
                }
            };
        }
        return StoredProcedureTab;
    }());
    exports.StoredProcedureTab = StoredProcedureTab;
    var TriggerTab = (function () {
        function TriggerTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!TriggerTab.html"
                }
            };
        }
        return TriggerTab;
    }());
    exports.TriggerTab = TriggerTab;
    var UserDefinedFunctionTab = (function () {
        function UserDefinedFunctionTab() {
            return {
                viewModel: TabComponent,
                template: {
                    require: "text!UserDefinedFunctionTab.html"
                }
            };
        }
        return UserDefinedFunctionTab;
    }());
    exports.UserDefinedFunctionTab = UserDefinedFunctionTab;
});
