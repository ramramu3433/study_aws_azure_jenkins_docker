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
define(["require", "exports", "knockout", "q", "../../Contracts/ViewModels", "./TabsBase", "../../Common/EditableUtility", "../Controls/Toolbar/Toolbar", "../../Common/ThemeUtility"], function (require, exports, ko, Q, ViewModels, TabsBase, editable, Toolbar_1, ThemeUtility_1) {
    "use strict";
    var ScriptTabBase = (function (_super) {
        __extends(ScriptTabBase, _super);
        function ScriptTabBase(options) {
            var _this = _super.call(this, options) || this;
            _this.toolbarViewModel = ko.observable();
            // add theme change listener to update the monaco editor theme
            if (_this.isRunningOnDaytona) {
                _this.daytonaContext.hostProxy.onThemeChange(function (newTheme) {
                    _this._theme = ThemeUtility_1.default.getMonacoTheme(newTheme);
                    if (_this.editor) {
                        _this.editor().updateOptions({ theme: ThemeUtility_1.default.getMonacoTheme(newTheme) });
                    }
                });
                window.host = _this.daytonaContext.hostProxy;
            }
            _this._collectionSelfLink = options.collectionSelfLink;
            _this._isPartition = options.isPartition;
            _this.isNew = ko.observable(options.isNew);
            _this.resource = ko.observable(options.resource);
            _this.isTemplateReady = ko.observable(false);
            _this.isTemplateReady.subscribe(function (isTemplateReady) {
                if (isTemplateReady) {
                    _this._createBodyEditor();
                }
            });
            _this.editorId = "editor_" + _this.tabId;
            if (options.isNew) {
                _this.editorState = ko.observable(ViewModels.ScriptEditorState.newInvalid);
            }
            else {
                _this.editorState = ko.observable(ViewModels.ScriptEditorState.exisitingNoEdits);
            }
            _this.id = editable.observable();
            _this.id.validations([
                ScriptTabBase._isValidId
            ]);
            _this.editorContent = editable.observable();
            _this.editorContent.validations([
                ScriptTabBase._isNotEmpty
            ]);
            _this.formFields = ko.observableArray([
                _this.id,
                _this.editorContent
            ]);
            _this._setBaselines();
            _this.id.editableIsValid.subscribe(function (isValid) {
                var currentState = _this.editorState();
                switch (currentState) {
                    case ViewModels.ScriptEditorState.newValid:
                    case ViewModels.ScriptEditorState.newInvalid:
                        if (isValid) {
                            _this.editorState(ViewModels.ScriptEditorState.newValid);
                        }
                        else {
                            _this.editorState(ViewModels.ScriptEditorState.newInvalid);
                        }
                        break;
                    case ViewModels.ScriptEditorState.exisitingDirtyInvalid:
                    case ViewModels.ScriptEditorState.exisitingDirtyValid:
                        if (isValid) {
                            _this.editorState(ViewModels.ScriptEditorState.exisitingDirtyValid);
                        }
                        else {
                            _this.editorState(ViewModels.ScriptEditorState.exisitingDirtyInvalid);
                        }
                        break;
                    case ViewModels.ScriptEditorState.exisitingDirtyValid:
                    default:
                        break;
                }
            });
            _this.editor = ko.observable();
            _this.formIsValid = ko.computed(function () {
                var formIsValid = _this.formFields().every(function (field) {
                    return field.editableIsValid();
                });
                return formIsValid;
            });
            _this.formIsDirty = ko.computed(function () {
                var formIsDirty = _this.formFields().some(function (field) {
                    return field.editableIsDirty();
                });
                return formIsDirty;
            });
            _this.saveButton = {
                enabled: ko.computed(function () {
                    if (!_this.formIsValid()) {
                        return false;
                    }
                    if (!_this.formIsDirty()) {
                        return false;
                    }
                    return true;
                }),
                visible: ko.computed(function () {
                    return _this.isNew();
                })
            };
            _this.updateButton = {
                enabled: ko.computed(function () {
                    if (!_this.formIsValid()) {
                        return false;
                    }
                    if (!_this.formIsDirty()) {
                        return false;
                    }
                    return true;
                }),
                visible: ko.computed(function () {
                    return !_this.isNew();
                })
            };
            _this.discardButton = {
                enabled: ko.computed(function () {
                    return _this.formIsDirty();
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.deleteButton = {
                enabled: ko.computed(function () {
                    return !_this.isNew();
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.executeButton = {
                enabled: ko.computed(function () {
                    return !_this.isNew() && !_this.formIsDirty() && _this.formIsValid();
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.buildToolbar();
            return _this;
        }
        ScriptTabBase.prototype._setBaselines = function () {
            var resource = this.resource();
            this.id.setBaseline(resource.id);
            this.editorContent.setBaseline(resource.body);
        };
        ;
        ScriptTabBase.prototype.setBaselines = function () {
            this._setBaselines();
        };
        ;
        ScriptTabBase.prototype.onTabClick = function () {
            var _this = this;
            return _super.prototype.onTabClick.call(this).then(function () {
                if (_this.isNew()) {
                    _this.collection.selectedSubnodeKind(_this.tabKind);
                }
            });
        };
        ScriptTabBase.prototype.onSaveOrUpdateClick = function () {
            if (this.saveButton.visible()) {
                return this.onSaveClick();
            }
            else if (this.updateButton.visible()) {
                return this.onUpdateClick();
            }
            return Q();
        };
        ;
        ScriptTabBase.prototype.onRefreshClick = function () {
            return this.onRefresh();
        };
        ;
        ScriptTabBase.prototype.onDiscard = function () {
            this.setBaselines();
            this.daytonaContext.telemetry.sendEvent("StorageExplorer." + ViewModels.CollectionTabKind[this.tabKind] + ".Discard");
            var original = this.editorContent.getEditableOriginalValue();
            var editorModel = this.editor().getModel();
            editorModel.setValue(original);
            return Q();
        };
        ;
        ScriptTabBase._isValidId = function (id) {
            if (!id) {
                return false;
            }
            var invalidStartCharacters = /^[/?#\\]/;
            if (invalidStartCharacters.test(id)) {
                return false;
            }
            var invalidMiddleCharacters = /^.+[/?#\\]/;
            if (invalidMiddleCharacters.test(id)) {
                return false;
            }
            var invalidEndCharacters = /.*[/?#\\ ]$/;
            if (invalidEndCharacters.test(id)) {
                return false;
            }
            return true;
        };
        ScriptTabBase._isNotEmpty = function (value) {
            return !!value;
        };
        ScriptTabBase._toSeverity = function (severity) {
            switch (severity.toLowerCase()) {
                case "error":
                    return monaco.Severity.Error;
                case "warning":
                    return monaco.Severity.Warning;
                case "info":
                    return monaco.Severity.Info;
                case "ignore":
                default:
                    return monaco.Severity.Ignore;
            }
        };
        ScriptTabBase._toEditorPosition = function (target, lines) {
            var cursor = 0;
            var previousCursor = 0;
            var i = 0;
            while (target > cursor + lines[i].length) {
                cursor += lines[i].length + 2;
                i++;
            }
            var editorPosition = {
                line: i + 1,
                column: target - cursor + 1
            };
            return editorPosition;
        };
        ScriptTabBase.prototype._createBodyEditor = function () {
            var _this = this;
            require(['vs/editor/editor.main'], function () {
                var id = _this.editorId;
                var container = document.getElementById(id);
                // in case the container has not been renderred
                // FIXME, more graceful fix
                if (container.clientHeight === 0) {
                    setTimeout(_this._createBodyEditor.bind(_this), 100);
                    return;
                }
                var options = {
                    value: _this.editorContent(),
                    language: 'javascript',
                    readOnly: false,
                    theme: _this._theme
                };
                container.innerHTML = "";
                var editor = monaco.editor.create(container, options);
                _this.editor(editor);
                var editorModel = editor.getModel();
                editorModel.onDidChangeContent(_this._onBodyContentChange.bind(_this));
            });
        };
        ScriptTabBase.prototype._onBodyContentChange = function (e) {
            var editorModel = this.editor().getModel();
            this.editorContent(editorModel.getValue());
        };
        ScriptTabBase.prototype._setModelMarkers = function (errors) {
            var _this = this;
            var markers = errors.map(function (e) { return _this._toMarker(e); });
            var editorModel = this.editor().getModel();
            monaco.editor.setModelMarkers(editorModel, this.tabId, markers);
        };
        ScriptTabBase.prototype._resetModelMarkers = function () {
            var queryEditorModel = this.editor().getModel();
            monaco.editor.setModelMarkers(queryEditorModel, this.tabId, []);
        };
        ScriptTabBase.prototype._toMarker = function (error) {
            var editorModel = this.editor().getModel();
            var lines = editorModel.getLinesContent();
            var start = ScriptTabBase._toEditorPosition(Number(error.start), lines);
            var end = ScriptTabBase._toEditorPosition(Number(error.end), lines);
            return {
                severity: ScriptTabBase._toSeverity(error.severity),
                message: error.message,
                startLineNumber: start.line,
                startColumn: start.column,
                endLineNumber: end.line,
                endColumn: end.column,
                code: error.code
            };
        };
        ScriptTabBase.prototype.buildToolbar = function () {
            var _this = this;
            var toolbarActionsConfig = [
                {
                    type: "action",
                    action: function () { return _this.onSaveOrUpdateClick(); },
                    id: "update",
                    title: "Update the script",
                    enabled: ko.computed(function () {
                        return _this.updateButton.enabled() && _this.updateButton.visible() ||
                            _this.saveButton.enabled() && _this.saveButton.visible();
                    }),
                    visible: ko.observable(true),
                    icon: "images/save-bigicon.svg",
                    displayName: "Update"
                },
                {
                    type: "action",
                    action: function () { return _this.onDiscard(); },
                    id: "discard",
                    title: "Discard current changes",
                    enabled: ko.computed(function () { return _this.discardButton.enabled(); }),
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
        return ScriptTabBase;
    }(TabsBase));
    return ScriptTabBase;
});
