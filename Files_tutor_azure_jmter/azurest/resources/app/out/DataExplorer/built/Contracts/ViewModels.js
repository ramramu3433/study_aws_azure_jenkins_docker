define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DocumentExplorerState;
    (function (DocumentExplorerState) {
        DocumentExplorerState[DocumentExplorerState["noDocumentSelected"] = 0] = "noDocumentSelected";
        DocumentExplorerState[DocumentExplorerState["newDocumentValid"] = 1] = "newDocumentValid";
        DocumentExplorerState[DocumentExplorerState["newDocumentInvalid"] = 2] = "newDocumentInvalid";
        DocumentExplorerState[DocumentExplorerState["exisitingDocumentNoEdits"] = 3] = "exisitingDocumentNoEdits";
        DocumentExplorerState[DocumentExplorerState["exisitingDocumentDirtyValid"] = 4] = "exisitingDocumentDirtyValid";
        DocumentExplorerState[DocumentExplorerState["exisitingDocumentDirtyInvalid"] = 5] = "exisitingDocumentDirtyInvalid";
    })(DocumentExplorerState = exports.DocumentExplorerState || (exports.DocumentExplorerState = {}));
    var IndexingPolicyEditorState;
    (function (IndexingPolicyEditorState) {
        IndexingPolicyEditorState[IndexingPolicyEditorState["noCollectionSelected"] = 0] = "noCollectionSelected";
        IndexingPolicyEditorState[IndexingPolicyEditorState["noEdits"] = 1] = "noEdits";
        IndexingPolicyEditorState[IndexingPolicyEditorState["dirtyValid"] = 2] = "dirtyValid";
        IndexingPolicyEditorState[IndexingPolicyEditorState["dirtyInvalid"] = 3] = "dirtyInvalid";
    })(IndexingPolicyEditorState = exports.IndexingPolicyEditorState || (exports.IndexingPolicyEditorState = {}));
    var ScriptEditorState;
    (function (ScriptEditorState) {
        ScriptEditorState[ScriptEditorState["newInvalid"] = 0] = "newInvalid";
        ScriptEditorState[ScriptEditorState["newValid"] = 1] = "newValid";
        ScriptEditorState[ScriptEditorState["exisitingNoEdits"] = 2] = "exisitingNoEdits";
        ScriptEditorState[ScriptEditorState["exisitingDirtyValid"] = 3] = "exisitingDirtyValid";
        ScriptEditorState[ScriptEditorState["exisitingDirtyInvalid"] = 4] = "exisitingDirtyInvalid";
    })(ScriptEditorState = exports.ScriptEditorState || (exports.ScriptEditorState = {}));
    var CollectionTabKind;
    (function (CollectionTabKind) {
        CollectionTabKind[CollectionTabKind["Documents"] = 0] = "Documents";
        CollectionTabKind[CollectionTabKind["Settings"] = 1] = "Settings";
        CollectionTabKind[CollectionTabKind["StoredProcedures"] = 2] = "StoredProcedures";
        CollectionTabKind[CollectionTabKind["UserDefinedFunctions"] = 3] = "UserDefinedFunctions";
        CollectionTabKind[CollectionTabKind["Triggers"] = 4] = "Triggers";
        CollectionTabKind[CollectionTabKind["Query"] = 5] = "Query";
        CollectionTabKind[CollectionTabKind["Graph"] = 6] = "Graph";
        CollectionTabKind[CollectionTabKind["QueryTables"] = 9] = "QueryTables";
        CollectionTabKind[CollectionTabKind["MongoShell"] = 10] = "MongoShell";
        CollectionTabKind[CollectionTabKind["MongoDocuments"] = 11] = "MongoDocuments";
    })(CollectionTabKind = exports.CollectionTabKind || (exports.CollectionTabKind = {}));
    var MonacoEditorSettings = (function () {
        function MonacoEditorSettings(supportedLanguage, isReadOnly) {
            this.language = supportedLanguage;
            this.readOnly = isReadOnly;
        }
        return MonacoEditorSettings;
    }());
    exports.MonacoEditorSettings = MonacoEditorSettings;
});
