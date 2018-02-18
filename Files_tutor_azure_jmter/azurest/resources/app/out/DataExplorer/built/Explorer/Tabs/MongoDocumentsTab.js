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
define(["require", "exports", "knockout", "q", "../Tree/ObjectId", "../../Contracts/ViewModels", "../../Common/Constants", "../../Common/MongoUtility", "../Tree/DocumentId", "../../Common/ErrorParserUtility", "./DocumentsTab"], function (require, exports, ko, Q, ObjectId, ViewModels, Constants, MongoUtility, DocumentId, ErrorParserUtility, DocumentsTab) {
    "use strict";
    var MongoDocumentsTab = (function (_super) {
        __extends(MongoDocumentsTab, _super);
        function MongoDocumentsTab(options) {
            var _this = _super.call(this, options) || this;
            _this.lastFilterContents = ko.observableArray([
                '{"id":"foo"}', '{ qty: { $gte: 20 } }'
            ]);
            _this.monacoSettings = new ViewModels.MonacoEditorSettings('json', false);
            _this.isFilterExpanded = ko.observable(true);
            return _this;
        }
        MongoDocumentsTab.prototype.onSaveNewDocumentClick = function () {
            var _this = this;
            var documentContent = this.selectedDocumentContent();
            this.displayedError("");
            if (this.partitionKeyProperty && !this._hasShardKeySpecified(documentContent)) {
                var message = "Mongo document is lacking the shard property: " + this.partitionKeyProperty;
                if (!this.isRunningOnDaytona) {
                    this.displayedError("Mongo document is lacking the shard property: " + this.partitionKeyProperty);
                    var that_1 = this;
                    setTimeout(function () {
                        that_1.displayedError("");
                    }, Constants.ClientDefaults.errorNotificationTimeoutMs);
                }
                else {
                    this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptOK", {
                        title: "Error",
                        message: message,
                        messageBoxType: "error"
                    });
                }
                return Q.reject("Document without shard key");
            }
            return this.documentClientUtility.createDocument({ self: this._selfLink }, documentContent, null /*options*/).then(function (savedDocument) {
                var partitionKeyValue = _this.documentClientUtility.extractPartitionKey(savedDocument, _this.partitionKey);
                var id = new ObjectId(_this, savedDocument, partitionKeyValue);
                var ids = _this.documentIds();
                id.partitionKeyValue = _this.documentClientUtility.extractPartitionKey(savedDocument, _this.partitionKey);
                id.stringPartitionKeyValue = id.partitionKeyValue;
                ids.push(id);
                delete savedDocument._self;
                var value = _this.renderObjectForEditor(savedDocument || {}, null, 4);
                var documentEditorModel = _this.editor.getModel();
                documentEditorModel.setValue(value);
                _this.selectedDocumentContent.setBaseline(savedDocument);
                _this.selectedDocumentId(id);
                _this.documentIds(ids);
                _this.editorState(ViewModels.DocumentExplorerState.exisitingDocumentNoEdits);
            }, function (reason) {
                var message = ErrorParserUtility.parse(reason)[0].message;
                if (_this.isRunningOnDaytona) {
                    _this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptOK", {
                        title: "Error",
                        message: message,
                        messageBoxType: "error"
                    });
                }
                else {
                    window.alert(message);
                }
            });
        };
        ;
        MongoDocumentsTab.prototype.onSaveExisitingDocumentClick = function () {
            var _this = this;
            var selectedDocumentId = this.selectedDocumentId();
            return this.documentClientUtility.updateDocument(selectedDocumentId, this.selectedDocumentContent(), null /*options*/).then(function (updatedDocument) {
                _this.selectedDocumentContent.setBaseline(updatedDocument);
                var value = _this.renderObjectForEditor(_this.selectedDocumentContent() || {}, null, 4);
                var documentEditorModel = _this.editor.getModel();
                documentEditorModel.setValue(value);
                _this.documentIds().forEach(function (documentId) {
                    if (documentId.rid === updatedDocument._rid) {
                        var partitionKeyValue = _this.documentClientUtility.extractPartitionKey(updatedDocument, _this.partitionKey);
                        var id = new ObjectId(_this, updatedDocument, partitionKeyValue);
                        documentId.id(id.id());
                    }
                });
                _this.editorState(ViewModels.DocumentExplorerState.exisitingDocumentNoEdits);
            }, function (reason) {
                var message = ErrorParserUtility.parse(reason)[0].message;
                if (_this.isRunningOnDaytona) {
                    _this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptOK", {
                        title: "Error",
                        message: message,
                        messageBoxType: "error"
                    });
                }
                else {
                    window.alert(message);
                }
            });
        };
        ;
        MongoDocumentsTab.prototype._buildQuery = function (filter) {
            // TODO adjust query to be able to retrieve multiple paths of partition keys
            var query = (this.partitionKeyProperty)
                ? "select c.id, c._self, c._rid, c._ts, c." + this.partitionKeyProperty + " as _partitionKeyValue from c"
                : "select c.id, c._self, c._rid, c._ts from c";
            return filter || query;
        };
        MongoDocumentsTab.prototype.loadNextPage = function () {
            var _this = this;
            return this._loadNextPageInternal().then(function (documentsIdsData) {
                var currentDocuments = _this.documentIds();
                var currentDocumentsRids = currentDocuments.map(function (currentDocument) { return currentDocument.rid; });
                var nextDocumentIds = documentsIdsData
                    .filter(function (d) {
                    return currentDocumentsRids.indexOf(d._rid) < 0;
                })
                    .map(function (rawDocument) {
                    var partitionKeyValue = rawDocument._partitionKeyValue;
                    return new DocumentId(_this, rawDocument, partitionKeyValue);
                });
                var merged = currentDocuments.concat(nextDocumentIds);
                _this.documentIds(merged);
                currentDocuments = _this.documentIds();
                if (_this.filterContent().length > 0 && currentDocuments.length > 0) {
                    currentDocuments[0].click();
                }
                else {
                    _this.selectedDocumentContent(null);
                    _this.selectedDocumentId(null);
                    _this._getEditorContainer().innerHTML = "";
                    _this.editorState(ViewModels.DocumentExplorerState.noDocumentSelected);
                }
            });
        };
        /** Renders a Javascript object to be displayed inside Monaco Editor */
        MongoDocumentsTab.prototype.renderObjectForEditor = function (value, replacer, space) {
            return MongoUtility.tojson(value, null, false);
        };
        MongoDocumentsTab.prototype._hasShardKeySpecified = function (document) {
            var extraction = this.documentClientUtility.extractPartitionKey(document, this.partitionKey);
            return extraction && typeof extraction !== 'object';
        };
        return MongoDocumentsTab;
    }(DocumentsTab));
    return MongoDocumentsTab;
});
