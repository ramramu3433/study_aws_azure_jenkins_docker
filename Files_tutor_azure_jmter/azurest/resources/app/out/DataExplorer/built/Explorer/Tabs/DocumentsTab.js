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
define(["require", "exports", "knockout", "q", "../../Contracts/ViewModels", "../Tree/AccessibleVerticalList", "../../Common/ErrorParserUtility", "../Tree/DocumentId", "../../Common/EditableUtility", "./TabsBase", "../Menus/CommandBar/CommandBarOptions", "../Controls/Toolbar/Toolbar", "../../Common/ThemeUtility"], function (require, exports, ko, Q, ViewModels, AccessibleVerticalList_1, ErrorParserUtility, DocumentId, editable, TabsBase, CommandBarOptions_1, Toolbar_1, ThemeUtility_1) {
    "use strict";
    var DocumentsTab = (function (_super) {
        __extends(DocumentsTab, _super);
        function DocumentsTab(options) {
            var _this = _super.call(this, options) || this;
            _this.commandBarOptions = {};
            _this.toolbarViewModel = ko.observable();
            _this._isIgnoreDirtyEditor = function () {
                var msg = "Changes will be lost. Do you want to continue?";
                if (_this.isRunningOnDaytona) {
                    return true;
                }
                else {
                    return window.confirm(msg);
                }
            };
            _this.onLoadMoreKeyInput = function (source, event) {
                if (event.key === " " || event.key === "Enter") {
                    _this.loadNextPage();
                    document.getElementById(_this.documentContentsGridId).focus();
                    event.stopPropagation();
                }
            };
            if (_this.isRunningOnDaytona) {
                _this.daytonaContext.hostProxy.onThemeChange(function (newTheme) {
                    _this._theme = ThemeUtility_1.default.getMonacoTheme(newTheme);
                    if (_this.editor) {
                        _this.editor.updateOptions({ theme: ThemeUtility_1.default.getMonacoTheme(newTheme) });
                    }
                });
                window.host = _this.daytonaContext.hostProxy;
            }
            _this.partitionKey = options.partitionKey;
            _this.documentIds = options.documentIds;
            _this._selfLink = options.selfLink;
            _this.partitionKeyPropertyHeader = _this._getPartitionKeyPropertyHeader();
            _this.partitionKeyProperty = !!_this.partitionKeyPropertyHeader ?
                _this.partitionKeyPropertyHeader.replace(/[/]+/g, ".").substr(1).replace(/[']+/g, '')
                : null;
            _this.documentEditorId = "documenteditor" + _this.tabId;
            _this.documentContentsGridId = "documentContentsGrid" + _this.tabId;
            _this.editorState = ko.observable(ViewModels.DocumentExplorerState.noDocumentSelected);
            _this.selectedDocumentId = ko.observable();
            _this.selectedDocumentContent = editable.observable();
            _this.isFilterExpanded = ko.observable(false);
            _this.isFilterCreated = ko.observable(false);
            _this.filterContent = ko.observable("");
            _this.appliedFilter = ko.observable("");
            _this.displayedError = ko.observable("");
            _this.lastFilterContents = ko.observableArray([
                'WHERE c.id = "foo"',
                'ORDER BY c._ts DESC',
                'WHERE c.id = "foo" ORDER BY c._ts DESC'
            ]);
            _this.dataContentsGridScrollHeight = ko.observable(null);
            _this.accessibleDocumentList = new AccessibleVerticalList_1.AccessibleVerticalList(_this.documentIds());
            _this.accessibleDocumentList.setOnSelect(function (selectedDocument) { return selectedDocument && selectedDocument.click(); });
            _this.selectedDocumentId.subscribe(function (newSelectedDocumentId) { return _this.accessibleDocumentList.updateCurrentItem(newSelectedDocumentId); });
            _this.documentIds.subscribe(function (newDocuments) {
                _this.accessibleDocumentList.updateItemList(newDocuments);
                _this.dataContentsGridScrollHeight((newDocuments.length * DocumentsTab.DocumentsGridIndividualRowHeight + DocumentsTab.DocumentsGridBufferHeight) + "px");
            });
            _this.monacoSettings = new ViewModels.MonacoEditorSettings('json', false);
            _this.isEditorDirty = ko.computed(function () {
                switch (_this.editorState()) {
                    case ViewModels.DocumentExplorerState.noDocumentSelected:
                    case ViewModels.DocumentExplorerState.exisitingDocumentNoEdits:
                        return false;
                    case ViewModels.DocumentExplorerState.newDocumentValid:
                    case ViewModels.DocumentExplorerState.newDocumentInvalid:
                    case ViewModels.DocumentExplorerState.exisitingDocumentDirtyInvalid:
                        return true;
                    case ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid:
                        return _this.selectedDocumentContent.getEditableOriginalValue() !== _this.selectedDocumentContent.getEditableCurrentValue();
                    default:
                        return false;
                }
            });
            _this.newDocumentButton = {
                enabled: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.noDocumentSelected:
                        case ViewModels.DocumentExplorerState.exisitingDocumentNoEdits:
                            return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.saveNewDocumentButton = {
                enabled: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.newDocumentValid:
                            return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.newDocumentValid:
                        case ViewModels.DocumentExplorerState.newDocumentInvalid:
                            return true;
                    }
                    return false;
                })
            };
            _this.discardNewDocumentChangesButton = {
                enabled: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.newDocumentValid:
                        case ViewModels.DocumentExplorerState.newDocumentInvalid:
                            return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.newDocumentValid:
                        case ViewModels.DocumentExplorerState.newDocumentInvalid:
                            return true;
                    }
                    return false;
                })
            };
            _this.saveExisitingDocumentButton = {
                enabled: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid:
                            return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.exisitingDocumentNoEdits:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyInvalid:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid:
                            return true;
                    }
                    return false;
                })
            };
            _this.discardExisitingDocumentChangesButton = {
                enabled: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyInvalid:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid:
                            return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.exisitingDocumentNoEdits:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyInvalid:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid:
                            return true;
                    }
                    return false;
                })
            };
            _this.deleteExisitingDocumentButton = {
                enabled: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.exisitingDocumentNoEdits:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyInvalid:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid:
                            return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.DocumentExplorerState.exisitingDocumentNoEdits:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyInvalid:
                        case ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid:
                            return true;
                    }
                    return false;
                })
            };
            _this.applyFilterButton = {
                enabled: ko.computed(function () {
                    return true;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.buildCommandBarOptions();
            _this.buildToolbar();
            return _this;
        }
        DocumentsTab.prototype.onShowFilterClick = function () {
            this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[this.tabKind] + ".EditFilter");
            this.isFilterCreated(true);
            this.isFilterExpanded(true);
            $(".filterDocExpanded").addClass("active");
            $("#content").addClass("active");
            return Q();
        };
        DocumentsTab.prototype.onHideFilterClick = function () {
            this.isFilterExpanded(false);
            $(".filterDocExpanded").removeClass("active");
            $("#content").removeClass("active");
            return Q();
        };
        DocumentsTab.prototype.onApplyFilterClick = function () {
            var _this = this;
            // clear documents grid
            this.documentIds([]);
            return this._createIterator()
                .then(
            // reset iterator
            function (iterator) {
                _this._documentsIterator = iterator;
            })
                .then(
            // load documents
            function () {
                return _this.loadNextPage();
            })
                .then(function () {
                // collapse filter
                _this.appliedFilter(_this.filterContent());
                _this.isFilterExpanded(false);
                $(".filterDocExpanded").removeClass("active");
                $("#content").removeClass("active");
            }).catch(function (reason) {
                var message = ErrorParserUtility.parse(reason)[0].message;
                if (!_this.isRunningOnDaytona) {
                    window.alert(message);
                }
                else {
                    _this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptOK", {
                        title: "Error",
                        message: message + "\r\nPlease revise your SQL query predicate.",
                        messageBoxType: "error"
                    });
                }
            });
        };
        DocumentsTab.prototype.refreshDocumentsGrid = function () {
            return this.onApplyFilterClick();
        };
        DocumentsTab.prototype.onDocumentIdClick = function (clickedDocumentId) {
            if (this.editorState() !== ViewModels.DocumentExplorerState.noDocumentSelected) {
                return Q();
            }
            this.editorState(ViewModels.DocumentExplorerState.exisitingDocumentNoEdits);
            return Q();
        };
        DocumentsTab.prototype.onNewDocumentClick = function () {
            if (this.isEditorDirty && !this._isIgnoreDirtyEditor()) {
                return Q();
            }
            this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[this.tabKind] + ".CreateNewDocument");
            this.selectedDocumentId(null);
            this.selectedDocumentContent.setBaseline({ id: "replace_with_new_document_id" });
            this._getEditorContainer().innerHTML = "";
            this._createEditor();
            this.editorState(ViewModels.DocumentExplorerState.newDocumentValid);
            return Q();
        };
        ;
        DocumentsTab.prototype.onSaveNewDocumentClick = function () {
            var _this = this;
            return this.documentClientUtility.createDocument({ self: this._selfLink }, this.selectedDocumentContent(), null /*options*/).then(function (savedDocument) {
                _this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[_this.tabKind] + ".SaveNewDocument");
                var value = _this.renderObjectForEditor(_this.selectedDocumentContent() || {}, null, 4);
                var documentEditorModel = _this.editor.getModel();
                documentEditorModel.setValue(value);
                _this.selectedDocumentContent.setBaseline(savedDocument);
                var partitionKeyValue = _this.documentClientUtility.extractPartitionKey(savedDocument, _this.partitionKey);
                var id = new DocumentId(_this, savedDocument, partitionKeyValue);
                var ids = _this.documentIds();
                id.partitionKeyValue = _this.documentClientUtility.extractPartitionKey(savedDocument, _this.partitionKey);
                ids.push(id);
                _this.selectedDocumentId(id);
                _this.documentIds(ids);
                _this.editorState(ViewModels.DocumentExplorerState.exisitingDocumentNoEdits);
            }, function (reason) {
                var message = ErrorParserUtility.parse(reason)[0].message;
                if (!_this.isRunningOnDaytona) {
                    window.alert(message);
                }
                else {
                    _this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptOK", {
                        title: "Error",
                        message: message + ".\r\nPlease use a different id for the document.",
                        messageBoxType: "error"
                    });
                }
            });
        };
        ;
        DocumentsTab.prototype.onRevertNewDocumentClick = function () {
            this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[this.tabKind] + ".DiscardNewDocument");
            this.selectedDocumentContent(null);
            this._getEditorContainer().innerHTML = "";
            this.editorState(ViewModels.DocumentExplorerState.noDocumentSelected);
            return Q();
        };
        ;
        DocumentsTab.prototype.onSaveExisitingDocumentClick = function () {
            var _this = this;
            var selectedDocumentId = this.selectedDocumentId();
            return this.documentClientUtility.updateDocument(selectedDocumentId, this.selectedDocumentContent(), null /*options*/).then(function (updatedDocument) {
                _this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[_this.tabKind] + ".UpdateDocument");
                _this.selectedDocumentContent.setBaseline(updatedDocument);
                var value = _this.renderObjectForEditor(_this.selectedDocumentContent() || {}, null, 4);
                var documentEditorModel = _this.editor.getModel();
                documentEditorModel.setValue(value);
                _this.documentIds().forEach(function (documentId) {
                    if (documentId.rid === updatedDocument._rid) {
                        documentId.id(updatedDocument.id);
                    }
                });
                _this.editorState(ViewModels.DocumentExplorerState.exisitingDocumentNoEdits);
            }, function (reason) {
                var message = ErrorParserUtility.parse(reason)[0].message;
                if (!_this.isRunningOnDaytona) {
                    window.alert(message);
                }
                else {
                    _this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptOK", {
                        title: "Error",
                        message: message,
                        messageBoxType: "error"
                    });
                }
            });
        };
        ;
        DocumentsTab.prototype.onRevertExisitingDocumentClick = function () {
            this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[this.tabKind] + ".DiscardUpdateDocument");
            var original = this.selectedDocumentContent.getEditableOriginalValue();
            this.selectedDocumentContent.setBaseline(original);
            var value = this.renderObjectForEditor(this.selectedDocumentContent() || {}, null, 4);
            var documentEditorModel = this.editor.getModel();
            documentEditorModel.setValue(value);
            this.editorState(ViewModels.DocumentExplorerState.exisitingDocumentNoEdits);
            return Q();
        };
        ;
        DocumentsTab.prototype.onDeleteExisitingDocumentClick = function () {
            var _this = this;
            var selectedDocumentId = this.selectedDocumentId();
            if (this.isRunningOnDaytona) {
                return this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptYesNo", {
                    iconType: "question",
                    message: "Are you sure you want to delete the selected document?"
                }).then(function (response) {
                    if (response) {
                        return _this.deleteDocument(selectedDocumentId);
                    }
                    else {
                        return Q();
                    }
                });
            }
            else {
                return this.deleteDocument(selectedDocumentId);
            }
        };
        ;
        DocumentsTab.prototype.deleteDocument = function (selectedDocumentId) {
            var _this = this;
            return this.documentClientUtility.deleteDocument(selectedDocumentId, null /*options*/).then(function (result) {
                _this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[_this.tabKind] + ".DeleteDocument");
                _this.documentIds.remove(function (documentId) { return (documentId.rid === selectedDocumentId.rid); });
                _this.selectedDocumentContent(null);
                _this.selectedDocumentId(null);
                _this._getEditorContainer().innerHTML = "";
                _this.editorState(ViewModels.DocumentExplorerState.noDocumentSelected);
            }, function (reason) {
                console.error(reason);
            });
        };
        ;
        DocumentsTab.prototype.onDiscardClick = function () {
            if (this.discardExisitingDocumentChangesButton.enabled()) {
                return this.onRevertExisitingDocumentClick();
            }
            else if (this.discardNewDocumentChangesButton.enabled()) {
                return this.onRevertNewDocumentClick();
            }
            return Q();
        };
        ;
        DocumentsTab.prototype.onSaveClick = function () {
            if (this.saveExisitingDocumentButton.enabled()) {
                return this.onSaveExisitingDocumentClick();
            }
            else if (this.saveNewDocumentButton.enabled()) {
                return this.onSaveNewDocumentClick();
            }
            return Q();
        };
        ;
        DocumentsTab.prototype.onValidDocumentEdit = function () {
            if (this.editorState() === ViewModels.DocumentExplorerState.newDocumentInvalid || this.editorState() === ViewModels.DocumentExplorerState.newDocumentValid) {
                this.editorState(ViewModels.DocumentExplorerState.newDocumentValid);
                return Q();
            }
            this.editorState(ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid);
            return Q();
        };
        DocumentsTab.prototype.onInvalidDocumentEdit = function () {
            if (this.editorState() === ViewModels.DocumentExplorerState.newDocumentInvalid || this.editorState() === ViewModels.DocumentExplorerState.newDocumentValid) {
                this.editorState(ViewModels.DocumentExplorerState.newDocumentInvalid);
                return Q();
            }
            if (this.editorState() === ViewModels.DocumentExplorerState.exisitingDocumentNoEdits || this.editorState() === ViewModels.DocumentExplorerState.exisitingDocumentDirtyValid) {
                this.editorState(ViewModels.DocumentExplorerState.exisitingDocumentDirtyInvalid);
                return Q();
            }
            return Q();
        };
        DocumentsTab.prototype.onTabClick = function () {
            var _this = this;
            return _super.prototype.onTabClick.call(this).then(function () {
                _this.collection.selectedSubnodeKind(ViewModels.CollectionTabKind.Documents);
            });
        };
        DocumentsTab.prototype.onActivate = function () {
            var _this = this;
            return _super.prototype.onActivate.call(this).then(function () {
                if (_this._documentsIterator) {
                    return Q.resolve(_this._documentsIterator);
                }
                return _this._createIterator().then(function (iterator) {
                    _this._documentsIterator = iterator;
                    return _this.loadNextPage();
                });
            });
        };
        DocumentsTab.prototype.onRefreshClick = function () {
            var _this = this;
            this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[this.tabKind] + ".Refresh");
            return this.refreshDocumentsGrid().then(function () {
                _this.selectedDocumentContent(null);
                _this.selectedDocumentId(null);
                _this._getEditorContainer().innerHTML = "";
                _this.editorState(ViewModels.DocumentExplorerState.noDocumentSelected);
            });
        };
        DocumentsTab.prototype._createIterator = function () {
            this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[this.tabKind] + ".ApplyFilter");
            var filters = this.lastFilterContents();
            var filter = this.filterContent().trim();
            var query = this._buildQuery(filter);
            return this.documentClientUtility.queryDocuments({ self: this._selfLink }, query, { enableCrossPartitionQuery: this.partitionKey ? true : false } /*options*/);
        };
        DocumentsTab.prototype.loadNextPage = function () {
            var _this = this;
            return this._loadNextPageInternal().then(function (documentsIdsResponse) {
                _this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[_this.tabKind] + ".LoadMore");
                var currentDocuments = _this.documentIds();
                var currentDocumentsRids = currentDocuments.map(function (currentDocument) { return currentDocument.rid; });
                var nextDocumentIds = documentsIdsResponse
                    .filter(function (d) {
                    return currentDocumentsRids.indexOf(d._rid) < 0;
                })
                    .map(function (rawDocument) {
                    var partitionKeyValue = rawDocument._partitionKeyValue;
                    return new DocumentId(_this, rawDocument, partitionKeyValue);
                });
                var merged = currentDocuments.concat(nextDocumentIds);
                _this.documentIds(merged);
            });
        };
        DocumentsTab.prototype._loadNextPageInternal = function () {
            var deferred = Q.defer();
            this.documentClientUtility.nextIteratorItem(this._documentsIterator, DocumentsTab.DocumentsPerPage, [], deferred);
            return deferred.promise;
        };
        DocumentsTab.prototype._createEditor = function () {
            var _this = this;
            var value = this.renderObjectForEditor(this.selectedDocumentContent() || {}, null, 4);
            require(['vs/editor/editor.main'], function () {
                _this.editor = monaco.editor.create(_this._getEditorContainer(), { value: value, language: _this.monacoSettings.language, readOnly: _this.monacoSettings.readOnly, theme: _this._theme });
                var documentEditorModel = _this.editor.getModel();
                documentEditorModel.onDidChangeContent(_this._onEditorContentChange.bind(_this));
            });
        };
        DocumentsTab.prototype._onEditorContentChange = function (e) {
            var documentEditorModel = this.editor.getModel();
            try {
                var parsed = JSON.parse(documentEditorModel.getValue());
                this.selectedDocumentContent(parsed);
                this.onValidDocumentEdit();
            }
            catch (e) {
                this.onInvalidDocumentEdit();
            }
        };
        DocumentsTab.prototype.createDocumentEditor = function (documentId) {
            if (documentId) {
                this._getEditorContainer().innerHTML = "";
                this._createEditor();
                var newState = (documentId) ? ViewModels.DocumentExplorerState.exisitingDocumentNoEdits : ViewModels.DocumentExplorerState.newDocumentValid;
                this.editorState(newState);
            }
            return Q();
        };
        DocumentsTab.prototype._getEditorContainer = function () {
            return document.getElementById(this.documentEditorId);
        };
        DocumentsTab.prototype._buildQuery = function (filter) {
            // TODO adjust query to be able to retrieve multiple paths of partition keys
            var query = (this.partitionKeyProperty)
                ? "select c.id, c._self, c._rid, c._ts, c." + this.partitionKeyProperty + " as _partitionKeyValue from c"
                : "select c.id, c._self, c._rid, c._ts from c";
            if (filter) {
                query += " " + filter;
            }
            return query;
        };
        DocumentsTab.prototype.buildToolbar = function () {
            var _this = this;
            var toolbarActionsConfig = [
                {
                    type: "action",
                    action: function () { return _this.onShowFilterClick(); },
                    id: "filter",
                    title: "Filter",
                    enabled: ko.computed(function () { return !_this.isFilterExpanded(); }, this),
                    visible: ko.observable((this.tabKind == ViewModels.CollectionTabKind.Documents)),
                    icon: "images/ASX_QueryBuilder.svg",
                    displayName: "Filter"
                },
                {
                    type: "action",
                    action: function () { return _this.onApplyFilterClick(); },
                    id: "apply",
                    title: "Apply",
                    enabled: ko.computed(function () { return _this.isFilterExpanded(); }, this),
                    visible: ko.observable((this.tabKind == ViewModels.CollectionTabKind.Documents)),
                    icon: "images/apply-bigicon.svg",
                    displayName: "Apply"
                },
                {
                    type: "separator",
                    visible: ko.observable((this.tabKind == ViewModels.CollectionTabKind.Documents))
                },
                {
                    type: "action",
                    action: function () { return _this.onNewDocumentClick(); },
                    id: "new",
                    title: "Create new document",
                    enabled: ko.computed(function () { return _this.newDocumentButton.enabled(); }, this),
                    visible: ko.observable(true),
                    icon: "images/createDoc-bigicon.svg",
                    displayName: "New Document"
                },
                {
                    type: "action",
                    action: function () { return _this.onSaveClick(); },
                    id: "save",
                    title: "Save the document",
                    enabled: ko.computed(function () {
                        return _this.saveExisitingDocumentButton.enabled() ||
                            _this.saveNewDocumentButton.enabled();
                    }, this),
                    visible: ko.observable(true),
                    icon: "images/save-bigicon.svg",
                    displayName: "Save"
                },
                {
                    type: "action",
                    action: function () { return _this.onDiscardClick(); },
                    id: "discard",
                    title: "Discard current changes in editor",
                    enabled: ko.computed(function () {
                        return _this.discardExisitingDocumentChangesButton.enabled() ||
                            _this.discardNewDocumentChangesButton.enabled();
                    }, this),
                    visible: ko.observable(true),
                    icon: "images/discard-bigicon.svg",
                    displayName: "Discard"
                },
                {
                    type: "separator",
                    visible: ko.observable(true)
                },
                {
                    type: "action",
                    action: function () { return _this.onDeleteExisitingDocumentClick(); },
                    id: "delete",
                    title: "Delete the select document",
                    enabled: ko.computed(function () { return _this.deleteExisitingDocumentButton.enabled(); }, this),
                    visible: ko.observable(true),
                    icon: "images/ASX_Delete.svg",
                    displayName: "Delete"
                },
                {
                    type: "separator",
                    visible: ko.observable(true)
                },
                {
                    type: "action",
                    action: function () { return _this.onRefreshClick(); },
                    id: "refresh",
                    title: "Refresh",
                    enabled: ko.observable(true),
                    visible: ko.observable(true),
                    icon: "images/ASX_Refresh.svg",
                    displayName: "Refresh"
                }
            ];
            this.toolbarViewModel(new Toolbar_1.default(toolbarActionsConfig, function (id) { }));
        };
        DocumentsTab.prototype.buildCommandBarOptions = function () {
            var _this = this;
            var newDocumentButtonOptions = {
                iconSrc: 'images/createDoc.svg',
                onCommandClick: this.onNewDocumentClick,
                commandButtonLabel: 'New Document',
                visible: ko.computed(function () { return _this.newDocumentButton.visible(); }),
                disabled: ko.computed(function () { return !_this.newDocumentButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.newDocumentButton.enabled() ? 0 : -1; })
            };
            var saveNewDocumentButtonOptions = {
                iconSrc: 'images/save.svg',
                onCommandClick: this.onSaveNewDocumentClick,
                commandButtonLabel: 'Save',
                visible: ko.computed(function () { return _this.saveNewDocumentButton.visible(); }),
                disabled: ko.computed(function () { return !_this.saveNewDocumentButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.saveNewDocumentButton.enabled() ? 0 : -1; })
            };
            var discardNewDocumentChangesButton = {
                iconSrc: 'images/discard.svg',
                onCommandClick: this.onRevertNewDocumentClick,
                commandButtonLabel: 'Discard',
                visible: ko.computed(function () { return _this.discardNewDocumentChangesButton.visible(); }),
                disabled: ko.computed(function () { return !_this.discardNewDocumentChangesButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.discardNewDocumentChangesButton.enabled() ? 0 : -1; })
            };
            var saveExisitingDocumentButtonOptions = {
                iconSrc: 'images/save.svg',
                onCommandClick: this.onSaveExisitingDocumentClick,
                commandButtonLabel: 'Update',
                visible: ko.computed(function () { return _this.saveExisitingDocumentButton.visible(); }),
                disabled: ko.computed(function () { return !_this.saveExisitingDocumentButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.saveExisitingDocumentButton.enabled() ? 0 : -1; })
            };
            var discardExisitingDocumentChangesButton = {
                iconSrc: 'images/discard.svg',
                onCommandClick: this.onRevertExisitingDocumentClick,
                commandButtonLabel: 'Discard',
                visible: ko.computed(function () { return _this.discardExisitingDocumentChangesButton.visible(); }),
                disabled: ko.computed(function () { return !_this.discardExisitingDocumentChangesButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.discardExisitingDocumentChangesButton.enabled() ? 0 : -1; })
            };
            var deleteExisitingDocumentButton = {
                iconSrc: 'images/delete.svg',
                onCommandClick: this.onDeleteExisitingDocumentClick,
                commandButtonLabel: 'Delete',
                visible: ko.computed(function () { return _this.deleteExisitingDocumentButton.visible(); }),
                disabled: ko.computed(function () { return !_this.deleteExisitingDocumentButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.deleteExisitingDocumentButton.enabled() ? 0 : -1; })
            };
            this.commandBarOptions = new CommandBarOptions_1.CommandBarOptions([
                newDocumentButtonOptions,
                saveNewDocumentButtonOptions,
                discardNewDocumentChangesButton,
                saveExisitingDocumentButtonOptions,
                discardExisitingDocumentChangesButton,
                deleteExisitingDocumentButton
            ]);
        };
        DocumentsTab.prototype._getPartitionKeyPropertyHeader = function () {
            return this.partitionKey && this.partitionKey.paths && this.partitionKey.paths.length > 0 && this.partitionKey.paths[0] || null;
        };
        return DocumentsTab;
    }(TabsBase));
    DocumentsTab.DocumentsPerPage = 100;
    DocumentsTab.DocumentsGridIndividualRowHeight = 34;
    DocumentsTab.DocumentsGridBufferHeight = 28; // required so scrollbar is not displayed when there are less documents
    return DocumentsTab;
});
