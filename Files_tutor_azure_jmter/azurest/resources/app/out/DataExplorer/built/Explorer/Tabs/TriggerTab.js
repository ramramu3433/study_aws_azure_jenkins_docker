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
define(["require", "exports", "q", "../../Contracts/ViewModels", "./ScriptTabBase", "../../Common/EditableUtility"], function (require, exports, Q, ViewModels, ScriptTabBase, editable) {
    "use strict";
    var TriggerTab = (function (_super) {
        __extends(TriggerTab, _super);
        function TriggerTab(options) {
            var _this = _super.call(this, options) || this;
            _this.triggerType = editable.observable(options.triggerType);
            _this.triggerOperation = editable.observable(options.triggerOperation);
            _this.formFields([
                _this.id,
                _this.triggerType,
                _this.triggerOperation,
                _this.editorContent
            ]);
            return _this;
        }
        TriggerTab.prototype.onSaveClick = function () {
            var _this = this;
            var data = this._getResource();
            // When create in Store Explorer, the script has already created before open the tab.
            if (this.isRunningOnDaytona) {
                // For partition collection, we need to delete it then create a new one. 
                // As the DocumentDB doesn't support update script in collection with partition. 
                if (this._isPartition) {
                    return this.documentClientUtility.deleteTrigger({ _self: this.resource()._self }, null).then(function () {
                        return _this._createTrigger(data);
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
            return this._createTrigger(data);
        };
        TriggerTab.prototype.onRefresh = function () {
            var _this = this;
            var selfLink = this.resource()._self;
            return this.documentClientUtility.readTrigger(selfLink, null).then(function (script) {
                _this.editorContent(script.body);
                _this.resource().body = script.body;
                _this.triggerType(script.triggerType);
                _this.triggerOperation(script.triggerOperation);
                _this._createBodyEditor();
            });
        };
        TriggerTab.prototype._createTrigger = function (resource) {
            var _this = this;
            return this.documentClientUtility.createTrigger({ self: this._collectionSelfLink }, resource, null /*options*/).then(function (createdResource) {
                _this.tabTitle(createdResource.id);
                _this.isNew(false);
                _this.resource(createdResource);
                _this.setBaselines();
                var editorModel = _this.editor().getModel();
                editorModel.setValue(createdResource.body);
                _this.editorContent.setBaseline(createdResource.body);
                if (!_this.isRunningOnDaytona) {
                    _this.node = _this.collection.createTriggerNode(createdResource);
                }
                else {
                    _this.daytonaContext.telemetry.sendEvent("StorageExplorer.Triggers.Create");
                    _this.daytonaContext.hostProxy.executeProviderOperation("Azure.Actions.DocumentDB.refreshNode", {
                        selfLink: _this._collectionSelfLink,
                        nodeType: "Azure.DocumentDB.TriggerGroup"
                    });
                }
                _this.editorState(ViewModels.ScriptEditorState.exisitingNoEdits);
                return createdResource;
            }, function (createError) {
                return Q.reject(createError);
            });
        };
        TriggerTab.prototype.onUpdateClick = function () {
            var _this = this;
            var data = this._getResource();
            return this.documentClientUtility.updateTrigger(data, null /*options*/).then(function (createdResource) {
                _this.resource(createdResource);
                _this.tabTitle(createdResource.id);
                if (!_this.isRunningOnDaytona) {
                    _this.node.id(createdResource.id);
                    _this.node.body(createdResource.body);
                    _this.node.triggerType(createdResource.triggerOperation);
                    _this.node.triggerOperation(createdResource.triggerOperation);
                }
                else {
                    _this.daytonaContext.telemetry.sendEvent("StorageExplorer.Triggers.Update");
                    _this.daytonaContext.hostProxy.executeProviderOperation("Azure.Actions.DocumentDB.updateNode", {
                        selfLink: _this.resource()._self,
                        nodeType: "Azure.DocumentDB.Trigger",
                        attributes: [
                            {
                                name: "body",
                                value: createdResource.body
                            },
                            {
                                name: "triggerOperation",
                                value: createdResource.triggerOperation
                            },
                            {
                                name: "triggerType",
                                value: createdResource.triggerType
                            }
                        ]
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
        TriggerTab.prototype.onDelete = function () {
            // TODO
            return Q();
        };
        TriggerTab.prototype.setBaselines = function () {
            _super.prototype.setBaselines.call(this);
            var resource = this.resource();
            this.triggerOperation.setBaseline(resource.triggerOperation);
            this.triggerType.setBaseline(resource.triggerType);
        };
        TriggerTab.prototype._getResource = function () {
            var resource = {
                _rid: this.resource()._rid,
                _self: this.resource()._self,
                id: this.id(),
                body: this.editorContent(),
                triggerOperation: this.triggerOperation(),
                triggerType: this.triggerType()
            };
            return resource;
        };
        return TriggerTab;
    }(ScriptTabBase));
    return TriggerTab;
});
