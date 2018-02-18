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
define(["require", "exports", "knockout", "q", "../../Contracts/ViewModels", "./ScriptTabBase"], function (require, exports, ko, Q, ViewModels, ScriptTabBase) {
    "use strict";
    var StoredProcedureTab = (function (_super) {
        __extends(StoredProcedureTab, _super);
        function StoredProcedureTab(options) {
            var _this = _super.call(this, options) || this;
            _this.executeButton = {
                enabled: ko.computed(function () {
                    switch (_this.editorState()) {
                        case ViewModels.ScriptEditorState.exisitingNoEdits:
                            return true;
                        default:
                            return false;
                    }
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            return _this;
        }
        StoredProcedureTab.prototype.onSaveClick = function () {
            var _this = this;
            var resource = {
                id: this.id(),
                body: this.editorContent()
            };
            // When create in Store Explorer, the script has already created before open the tab.
            if (this.isRunningOnDaytona) {
                // For partition collection, we need to delete it then create a new one. 
                // As the DocumentDB doesn't support update script in collection with partition. 
                if (this._isPartition) {
                    return this.documentClientUtility.deleteStoredProcedure({ _self: this.resource()._self }, null).then(function () {
                        return _this._createStoredProcedure(resource);
                    }).then(
                    // Show user info about cannot update the script in collection with partition.
                    function () {
                        return _this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptOK", {
                            title: "Info",
                            message: "Please note the script is in collection with partition. The tab will be closed, and the script cannot be updated in future.",
                            messageBoxType: "info"
                        });
                    }).then(
                    // Close the tab, as the tab parameters have been updated after recreate script.
                    function () {
                        return _this.daytonaContext.hostProxy.executeProviderOperation("Azure.Actions.Storage.closeEditor", {});
                    });
                }
                else {
                    // For non-partition collection, just update the script.
                    return this.onUpdateClick();
                }
            }
            return this._createStoredProcedure(resource);
        };
        StoredProcedureTab.prototype.onRefresh = function () {
            var _this = this;
            var selfLink = this.resource()._self;
            return this.documentClientUtility.readStoredProcedure(selfLink, null).then(function (script) {
                _this.editorContent(script.body);
                _this.resource().body = script.body;
                _this._createBodyEditor();
            });
        };
        StoredProcedureTab.prototype._createStoredProcedure = function (resource) {
            var _this = this;
            return this.documentClientUtility.createStoredProcedure({ self: this._collectionSelfLink }, resource, null /*options*/).then(function (createdResource) {
                _this.tabTitle(createdResource.id);
                _this.isNew(false);
                _this.resource(createdResource);
                _this.setBaselines();
                var editorModel = _this.editor().getModel();
                editorModel.setValue(createdResource.body);
                _this.editorContent.setBaseline(createdResource.body);
                if (!_this.isRunningOnDaytona) {
                    _this.node = _this.collection.createStoredProcedureNode(createdResource);
                }
                else {
                    _this.daytonaContext.telemetry.sendEvent("StorageExplorer.StoredProcedures.Create");
                    _this.daytonaContext.hostProxy.executeProviderOperation("Azure.Actions.DocumentDB.refreshNode", {
                        selfLink: _this._collectionSelfLink,
                        nodeType: "Azure.DocumentDB.StoredProcedureGroup"
                    });
                }
                _this.editorState(ViewModels.ScriptEditorState.exisitingNoEdits);
                return createdResource;
            }, function (createError) {
                return Q.reject(createError);
            });
        };
        StoredProcedureTab.prototype.onUpdateClick = function () {
            var _this = this;
            var data = this._getResource();
            return this.documentClientUtility.updateStoredProcedure(data, null /*options*/).then(function (createdResource) {
                _this.resource(createdResource);
                _this.tabTitle(createdResource.id);
                if (!_this.isRunningOnDaytona) {
                    _this.node.id(createdResource.id);
                    _this.node.body(createdResource.body);
                }
                else {
                    _this.daytonaContext.telemetry.sendEvent("StorageExplorer.StoredProcedures.Update");
                    _this.daytonaContext.hostProxy.executeProviderOperation("Azure.Actions.DocumentDB.updateNode", {
                        selfLink: _this.resource()._self,
                        nodeType: "Azure.DocumentDB.StoredProcedure",
                        attributes: [{
                                name: "body",
                                value: createdResource.body
                            }]
                    });
                }
                _this.setBaselines();
                var editorModel = _this.editor().getModel();
                editorModel.setValue(createdResource.body);
                _this.editorContent.setBaseline(createdResource.body);
            }, function (createError) {
                if (_this.isRunningOnDaytona) {
                    var message = JSON.parse(createError.body).message;
                    _this.daytonaContext.hostProxy.executeProviderOperation("CloudExplorer.Actions.Dialog.promptOK", {
                        title: "Error",
                        message: message,
                        messageBoxType: "error"
                    });
                }
            });
        };
        StoredProcedureTab.prototype.onDelete = function () {
            // TODO
            return Q();
        };
        StoredProcedureTab.prototype._getResource = function () {
            var resource = {
                _rid: this.resource()._rid,
                _self: this.resource()._self,
                id: this.id(),
                body: this.editorContent(),
            };
            return resource;
        };
        return StoredProcedureTab;
    }(ScriptTabBase));
    return StoredProcedureTab;
});
