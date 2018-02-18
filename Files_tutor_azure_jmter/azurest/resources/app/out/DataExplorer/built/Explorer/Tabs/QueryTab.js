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
define(["require", "exports", "knockout", "../../Contracts/ViewModels", "../../Common/ErrorParserUtility", "./TabsBase", "../Menus/CommandBar/CommandBarOptions"], function (require, exports, ko, ViewModels, ErrorParserUtility, TabsBase, CommandBarOptions_1) {
    "use strict";
    var QueryTab = (function (_super) {
        __extends(QueryTab, _super);
        function QueryTab(options) {
            var _this = _super.call(this, options) || this;
            _this.commandBarOptions = {};
            _this.onExecuteQueryClick = function () {
                var sqlStatement = _this.sqlQueryEditorContent();
                _this.sqlStatementToExecute(sqlStatement);
                _this.allResultsMetadata([]);
                return _this._executeQuery();
            };
            _this.queryEditorId = "queryeditor" + _this.tabId;
            _this.resultsEditorId = "queryresults" + _this.tabId;
            _this.queryEditor = ko.observable();
            _this.resultsEditor = ko.observable();
            _this.showingDocumentsDisplayText = ko.observable();
            _this.requestChargeDisplayText = ko.observable();
            _this.sqlQueryEditorContent = ko.observable("SELECT * FROM c");
            _this.sqlStatementToExecute = ko.observable("");
            _this.statusMessge = ko.observable();
            _this.statusIcon = ko.observable();
            _this.allResultsMetadata = ko.observableArray([]);
            _this.errors = ko.observableArray([]);
            _this.monacoSettings = new ViewModels.MonacoEditorSettings('sql', false);
            _this.executeQueryButton = {
                enabled: ko.computed(function () {
                    return !!_this.queryEditor() && !!_this.sqlQueryEditorContent() && _this.sqlQueryEditorContent().length > 0;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.fetchNextPageButton = {
                enabled: ko.computed(function () {
                    var allResultsMetadata = _this.allResultsMetadata() || [];
                    var numberOfResultsMetadata = allResultsMetadata.length;
                    if (numberOfResultsMetadata === 0) {
                        return false;
                    }
                    if (allResultsMetadata[numberOfResultsMetadata - 1].continuation) {
                        return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.fetchPreviousPageButton = {
                enabled: ko.computed(function () {
                    var allResultsMetadata = _this.allResultsMetadata && _this.allResultsMetadata() || [];
                    var numberOfContinuationTokens = allResultsMetadata.length;
                    if (numberOfContinuationTokens > 1) {
                        return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.isTemplateReady = ko.observable(false);
            _this.isTemplateReady.subscribe(function (isTemplateReady) {
                if (isTemplateReady) {
                    _this._createQueryEditor();
                }
            });
            _this._buildCommandBarOptions();
            return _this;
        }
        QueryTab.prototype.onTabClick = function () {
            var _this = this;
            return _super.prototype.onTabClick.call(this).then(function () {
                _this.collection.selectedSubnodeKind(ViewModels.CollectionTabKind.Query);
            });
        };
        QueryTab.prototype.onFetchNextPageClick = function () {
            return this._executeQuery();
        };
        QueryTab.prototype.onFetchPreviousPageClick = function () {
            var continuationTokens = this.allResultsMetadata();
            continuationTokens.pop();
            continuationTokens.pop();
            this.allResultsMetadata(continuationTokens);
            return this._executeQuery();
        };
        QueryTab.prototype._executeQuery = function () {
            var _this = this;
            var sqlStatement = this.sqlStatementToExecute();
            var allResultsMetadata = this.allResultsMetadata && this.allResultsMetadata() || [];
            var metadata = allResultsMetadata[allResultsMetadata.length - 1];
            var continuationToken = metadata && metadata.continuation;
            var firstResultIndex = metadata && Number(metadata.firstItemIndex) || 1;
            var itemCount = metadata && Number(metadata.itemCount) || 0;
            this.showingDocumentsDisplayText("-");
            this.requestChargeDisplayText("-");
            this.errors([]);
            return this.documentClientUtility.queryDocumentsPage(this.collection, sqlStatement, continuationToken, firstResultIndex + itemCount - 1, null /*options*/).then(function (queryResults) {
                _this._resetModelMarkers();
                var documents = queryResults.documents;
                var results = _this.renderObjectForEditor(documents, null, 4);
                var resultsMetadata = {
                    continuation: queryResults.continuation,
                    itemCount: queryResults.itemCount,
                    firstItemIndex: queryResults.firstItemIndex,
                    lastItemIndex: queryResults.lastItemIndex
                };
                var resultsDisplay = (queryResults.itemCount > 0) ? queryResults.firstItemIndex + " - " + queryResults.lastItemIndex : "0 - 0";
                _this.showingDocumentsDisplayText(resultsDisplay);
                _this.requestChargeDisplayText(queryResults.requestCharge + " RUs");
                _this.allResultsMetadata.push(resultsMetadata);
                if (!_this.resultsEditor()) {
                    _this._createResultsEditor(results);
                }
                else {
                    var resultsEditorModel = _this.resultsEditor().getModel();
                    resultsEditorModel.setValue(results);
                }
            }, function (reason) {
                var parsedErrors = ErrorParserUtility.parse(reason);
                var errors = parsedErrors.map(function (error) {
                    return {
                        message: error.message,
                        start: (error.location) ? error.location.start : undefined,
                        end: (error.location) ? error.location.end : undefined,
                        code: error.code,
                        severity: error.severity
                    };
                });
                _this.errors(errors);
                _this._setModelMarkers(errors);
            });
        };
        QueryTab.prototype._setModelMarkers = function (errors) {
            var _this = this;
            var markers = errors.map(function (e) { return _this._toMarker(e); });
            var queryEditorModel = this.queryEditor().getModel();
            monaco.editor.setModelMarkers(queryEditorModel, this.tabId, markers);
        };
        QueryTab.prototype._resetModelMarkers = function () {
            var queryEditorModel = this.queryEditor().getModel();
            monaco.editor.setModelMarkers(queryEditorModel, this.tabId, []);
        };
        QueryTab.prototype._createQueryEditor = function () {
            var _this = this;
            require(['vs/editor/editor.main'], function () {
                var id = _this.queryEditorId;
                var container = document.getElementById(id);
                var options = { value: _this.sqlQueryEditorContent(), language: _this.monacoSettings.language, readOnly: _this.monacoSettings.readOnly };
                container.innerHTML = "";
                _this.queryEditor(monaco.editor.create(container, options));
                var queryEditorModel = _this.queryEditor().getModel();
                queryEditorModel.onDidChangeContent(_this._onQueryEditorContentChange.bind(_this));
            });
        };
        QueryTab.prototype._createResultsEditor = function (value) {
            var _this = this;
            require(['vs/editor/editor.main'], function () {
                var id = _this.resultsEditorId;
                var container = document.getElementById(id);
                var options = {
                    language: 'json',
                    readOnly: true,
                    lineNumbers: "off",
                    value: value
                };
                container.innerHTML = "";
                _this.resultsEditor(monaco.editor.create(container, options));
            });
        };
        QueryTab.prototype._onQueryEditorContentChange = function (e) {
            var queryEditorModel = this.queryEditor().getModel();
            this.sqlQueryEditorContent(queryEditorModel.getValue());
        };
        QueryTab.prototype._toMarker = function (error) {
            var queryEditorModel = this.queryEditor().getModel();
            var lines = queryEditorModel.getLinesContent();
            var start = this._toEditorPosition(Number(error.start), lines);
            var end = this._toEditorPosition(Number(error.end), lines);
            return {
                severity: this._toSeverity(error.severity),
                message: error.message,
                startLineNumber: start.line,
                startColumn: start.column,
                endLineNumber: end.line,
                endColumn: end.column,
                code: error.code
            };
        };
        QueryTab.prototype._toSeverity = function (severity) {
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
        QueryTab.prototype._toEditorPosition = function (target, lines) {
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
        QueryTab.prototype._buildCommandBarOptions = function () {
            var _this = this;
            var executeQueryButton = {
                iconSrc: 'images/ExecuteQuery.svg',
                onCommandClick: this.onExecuteQueryClick,
                commandButtonLabel: 'Execute Query',
                visible: ko.computed(function () { return _this.executeQueryButton.visible(); }),
                disabled: ko.computed(function () { return !_this.executeQueryButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.executeQueryButton.enabled() ? 0 : -1; })
            };
            this.commandBarOptions = new CommandBarOptions_1.CommandBarOptions([
                executeQueryButton
            ]);
        };
        return QueryTab;
    }(TabsBase));
    return QueryTab;
});
