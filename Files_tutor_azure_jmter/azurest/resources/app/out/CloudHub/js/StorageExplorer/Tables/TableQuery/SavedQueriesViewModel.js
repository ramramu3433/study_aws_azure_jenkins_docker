/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore.string", "StorageExplorer/ActivityLogModels/SaveQueryActivity", "StorageExplorer/ActivityLogModels/OpenQueryActivity", "StorageExplorer/Tables/TableQuery/QueryClauseViewModel", "StorageExplorer/Tables/TableQuery/ClauseGroup", "Common/Utilities", "../../Common/Timestamps"], function (require, exports, underscore_string_1, SaveQueryActivity_1, OpenQueryActivity_1, QueryClauseViewModel_1, ClauseGroup_1, Utilities, Timestamps_1) {
    "use strict";
    var SavedQueriesViewModel = (function () {
        function SavedQueriesViewModel(queryBuilderViewModel, tableExplorerContext, host, telemetry) {
            this._continuationToken = null;
            this._queryBuilderViewModel = queryBuilderViewModel;
            this._tableExplorerContext = tableExplorerContext;
            this._host = host;
            this._activityLogManager = tableExplorerContext.activityLogManager;
            this._telemetry = telemetry;
        }
        SavedQueriesViewModel.prototype.saveQueryCommand = function (viewModel) {
            var filePath = viewModel.savedQueryName();
            if (filePath == null) {
                return this.saveAsQueryCommand(viewModel);
            }
            else if (!(this._host.executeOperation("Environment.doesFileExist", [filePath]))) {
                return this.saveAsQueryCommand(viewModel);
            }
            else {
                var activity = new SaveQueryActivity_1.default(this._host, this._telemetry, filePath);
                activity.initialize();
                activity.addToActivityLog(this._activityLogManager);
                activity.start(filePath);
                var content = this.mapToJson(viewModel);
                return this._host.executeOperation("Environment.writeToFile", [filePath, content])
                    .then(function () {
                    activity.finished(filePath);
                })
                    .catch(function (error) {
                    activity._handleError(error);
                });
            }
        };
        ;
        SavedQueriesViewModel.prototype.saveAsQueryCommand = function (viewModel) {
            var _this = this;
            return this.getSaveQueryFile()
                .then(function (selectedFile) {
                if (selectedFile) {
                    var activity = new SaveQueryActivity_1.default(_this._host, _this._telemetry, selectedFile);
                    if (!underscore_string_1.endsWith(selectedFile, SavedQueriesViewModel.queryExtension)) {
                        selectedFile = selectedFile + "." + SavedQueriesViewModel.queryExtension;
                    }
                    activity.initialize();
                    activity.addToActivityLog(_this._activityLogManager);
                    activity.start(selectedFile);
                    viewModel.savedQueryName(selectedFile);
                    var content = _this.mapToJson(viewModel);
                    return _this._host.executeOperation("Environment.writeToFile", [selectedFile, content])
                        .then(function () {
                        activity.finished(selectedFile);
                    })
                        .catch(function (error) {
                        activity._handleError(error);
                    });
                }
                else {
                    var enableSave = true;
                    return enableSave;
                }
            })
                .catch(function (error) {
                _this._showError(error, "StorageExplorer.Table.saveAsQueryCommand");
            });
        };
        ;
        SavedQueriesViewModel.prototype.openQueryCommand = function (viewModel) {
            var _this = this;
            return this.getSavedQueryFile()
                .then(function (selectedFile) {
                if (selectedFile) {
                    var activity = new OpenQueryActivity_1.default(_this._host, _this._telemetry, selectedFile);
                    activity.initialize();
                    activity.addToActivityLog(_this._activityLogManager);
                    activity.start(selectedFile);
                    return _this._host.executeOperation("Environment.readLines", [selectedFile, 100, _this._continuationToken])
                        .then(function (result) {
                        var data = result.chunk;
                        var parsed = JSON.parse(data);
                        var currentMajorVersion = Number(SavedQueriesViewModel.currentFileVersion.toString().split(".")[0]);
                        var fileVersion = parsed.fileVersion.toString().split(".");
                        var majorVersion = fileVersion[0];
                        if (majorVersion > currentMajorVersion) {
                            var error = new Error();
                            error.message = "This query was created by a newer version of Storage Explorer. Please update to a newer version."; // Localize
                            activity._handleError(error, error.message);
                            return _this._host.executeOperation("Environment.showMessageBox", ["Storage Explorer", error.message, "error"]);
                        }
                        _this.toggleOnOpen(viewModel, parsed);
                        if (parsed.filterType === "Query Builder") {
                            viewModel.queryBuilderViewModel().queryClauses.removeAll();
                            if (parsed.group) {
                                var func = function (savedGroupInfo, clauseGroup) {
                                    for (var i = 0; i < savedGroupInfo.children.length; i++) {
                                        var item = savedGroupInfo.children[i];
                                        if (typeof item === "string") {
                                            var parsedClause = parsed.filter.find(function (f) { return f.id === item; });
                                            var clause = _this.buildClauseFromParsedJSON(parsedClause);
                                            clause.clauseGroup = clauseGroup;
                                            clauseGroup.children.push(clause);
                                        }
                                        else {
                                            var childGroup = new ClauseGroup_1.default(false, clauseGroup, item.id);
                                            clauseGroup.children.push(childGroup);
                                            func(item, childGroup);
                                        }
                                    }
                                };
                                func(parsed.group, viewModel.queryBuilderViewModel().queryClauses);
                            }
                            else {
                                parsed.filter.forEach(function (parsedClause) {
                                    var clause = _this.buildClauseFromParsedJSON(parsedClause);
                                    clause.clauseGroup = viewModel.queryBuilderViewModel().queryClauses;
                                    viewModel.queryBuilderViewModel().queryClauses.children.push(clause);
                                });
                            }
                            viewModel.queryBuilderViewModel().updateClauseArray();
                        }
                        else {
                            viewModel.queryText(parsed.filter);
                        }
                        viewModel.topValue(parsed.top);
                        viewModel.selectText(parsed.select);
                        viewModel.savedQueryName(selectedFile);
                        activity.finished(selectedFile);
                    }).catch(function (error) {
                        var message = "The file you are trying to open is an invalid query."; // Localize
                        activity._handleError(error, message);
                        return _this._host.executeOperation("Environment.showMessageBox", ["Storage Explorer", message, "error"]);
                    });
                }
                else {
                    var enableSave = true;
                    return enableSave;
                }
            })
                .catch(function (error) {
                _this._showError(error, "StorageExplorer.Table.openQueryCommand");
            });
        };
        ;
        SavedQueriesViewModel.prototype.buildClauseFromParsedJSON = function (parsedClause) {
            if (parsedClause.timestampType === "range") {
                var customTimeValue = parsedClause.value.substring(9, parsedClause.value.length - 1);
                if (parsedClause.isLocal) {
                    customTimeValue = Timestamps_1.default.getLocalDateTime(customTimeValue);
                }
                else {
                    customTimeValue = customTimeValue.substring(0, customTimeValue.length - 1);
                }
            }
            else if (parsedClause.timestampType === "last") {
                var customTimeValue = "Last " + parsedClause.customTimestamp.lastNumber + " " + parsedClause.customTimestamp.lastTimeUnit;
            }
            var clause = new QueryClauseViewModel_1.default(this._queryBuilderViewModel, this._host, parsedClause.andOr, parsedClause.field, parsedClause.type, parsedClause.operator, parsedClause.value, true, parsedClause.timeValue, customTimeValue, parsedClause.timestampType, parsedClause.customTimestamp, parsedClause.isLocal, parsedClause.id);
            return clause;
        };
        SavedQueriesViewModel.prototype.toggleOnOpen = function (viewModel, parsed) {
            if (viewModel.isHelperActive() && parsed.filterType === "Text Editor") {
                viewModel.isEditorActive(true);
                viewModel.isHelperActive(false);
            }
            else if (!viewModel.isHelperActive() && parsed.filterType !== "Text Editor") {
                viewModel.isHelperActive(true);
                viewModel.isEditorActive(false);
            }
        };
        SavedQueriesViewModel.prototype.mapToJson = function (viewModel) {
            if (viewModel.isHelperActive()) {
                var filterType = "Query Builder";
            }
            else {
                var filterType = "Text Editor";
            }
            var varToMap = {
                filter: viewModel.queryText(),
                select: viewModel.selectText(),
                group: null,
                top: viewModel.topValue(),
                filterType: filterType,
                fileVersion: SavedQueriesViewModel.currentFileVersion
            };
            if (viewModel.isHelperActive()) {
                varToMap.filter = viewModel.savedQueryHelperText;
                varToMap.group = viewModel.savedGroupStructure;
            }
            var content = JSON.stringify(varToMap);
            return content;
        };
        SavedQueriesViewModel.prototype.getSaveQueryFile = function () {
            var operationArgs = {
                message: "Save query",
                defaultName: this._tableExplorerContext.tableReference.tableName + "." + SavedQueriesViewModel.queryExtension,
                filters: SavedQueriesViewModel.saveFilters
            };
            return this._host.executeProviderOperation("Environment.Dialogs.getSaveFileDialogResult", operationArgs);
        };
        SavedQueriesViewModel.prototype.getSavedQueryFile = function () {
            var operationArgs = {
                message: "Select saved query to use",
                browseForFolder: false,
                allowMultiSelect: false,
                filters: SavedQueriesViewModel.saveFilters
            };
            return this._host.executeProviderOperation("Environment.Dialogs.getOpenFileDialogResult", operationArgs)
                .then(function (filePaths) {
                if (filePaths && filePaths.length) {
                    return filePaths[0];
                }
                return null;
            });
        };
        ;
        SavedQueriesViewModel.prototype._showError = function (error, telemetryCategory) {
            var telemetryError = {
                name: telemetryCategory,
                error: error
            };
            this._telemetry.sendError(telemetryError);
            var message = Utilities.getErrorMessage(error);
            this._host.executeOperation("Environment.showMessageBox", ["Storage Explorer", message, "error"]);
        };
        return SavedQueriesViewModel;
    }());
    SavedQueriesViewModel.currentFileVersion = 0.2;
    SavedQueriesViewModel.queryExtension = "stgquery";
    SavedQueriesViewModel.saveFilters = [
        { name: "Storage Explorer Query (*.stgquery)", extensions: [SavedQueriesViewModel.queryExtension] },
        { name: "All Files", extensions: ["*"] }
    ];
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SavedQueriesViewModel;
});
