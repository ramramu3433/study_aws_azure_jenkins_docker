define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // The types of actions that the DataExplorer supports performing upon opening.
    var ActionType;
    (function (ActionType) {
        ActionType[ActionType["OpenTab"] = 0] = "OpenTab";
        ActionType[ActionType["OpenCollectionTab"] = 1] = "OpenCollectionTab";
        ActionType[ActionType["OpenPane"] = 2] = "OpenPane";
    })(ActionType = exports.ActionType || (exports.ActionType = {}));
    var TabKind;
    (function (TabKind) {
        // Collection Tab Kinds
        TabKind[TabKind["SQLDocuments"] = 0] = "SQLDocuments";
        TabKind[TabKind["MongoDocuments"] = 1] = "MongoDocuments";
        TabKind[TabKind["TableEntities"] = 2] = "TableEntities";
        TabKind[TabKind["Graph"] = 3] = "Graph";
        TabKind[TabKind["SQLQuery"] = 4] = "SQLQuery";
        // Other Tab Kinds
    })(TabKind = exports.TabKind || (exports.TabKind = {}));
});
