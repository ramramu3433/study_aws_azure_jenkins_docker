/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "es6-promise", "underscore.string", "Providers/Common/StorageExplorer/BaseStorageActions", "Providers/Azure/Resources/AzureResources", "Providers/StorageExplorer/ProviderWrappers/BlobPW"], function (require, exports, es6_promise_1, _string, BaseStorageActions_1, AzureResources, BlobPW_1) {
    "use strict";
    /**
     * Actions exposed by the Azure Cloud Explorer plugin.
     */
    var AzureStorageActions = (function (_super) {
        __extends(AzureStorageActions, _super);
        function AzureStorageActions(azureConnection, host, telemetry) {
            var _this = _super.call(this, azureConnection, host, telemetry) || this;
            _this._regexForBlobcontainerAndQueueName = "^(([a-z0-9]((-(?=[a-z0-9]))|([a-z0-9])){2,62})|(\$root))$";
            _this._regexForFileShareName = "^(([a-z0-9]((-(?=[a-z0-9]))|([a-z0-9])){2,62})|(\$root))$";
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            _this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureStorageActions.safeCreateBlobContainerNamespace, function (args) { return _this._safeCreateBlobContainer(args); });
                actionBindingManager.addActionBinding(AzureStorageActions.safeCreateBlobContainerFromExistingNamespace, function (args) { return _this._safeCreateBlobContainerFromExisting(args); });
                actionBindingManager.addActionBinding(AzureStorageActions.safeDeleteBlobContainerNamespace, _this._safeDeleteBlobContainer);
                actionBindingManager.addActionBinding(AzureStorageActions.validateBlobContainerNameNamespace, _this._validateBlobContainerName);
                actionBindingManager.addActionBinding(AzureStorageActions.safeCreateFileShareNamespace, function (args) { return _this._safeCreateFileShare(args); });
                actionBindingManager.addActionBinding(AzureStorageActions.safeCreateFileShareFromExistingNamespace, function (args) { return _this._safeCreateFileShareFromExisting(args); });
                actionBindingManager.addActionBinding(AzureStorageActions.safeDeleteFileShareNamespace, _this._safeDeleteFileShare);
                actionBindingManager.addActionBinding(AzureStorageActions.validateFileShareNameNamespace, _this._validateFileShareName);
                actionBindingManager.addActionBinding(AzureStorageActions.safeCreateTableNamespace, _this._safeCreateTable);
                actionBindingManager.addActionBinding(AzureStorageActions.safeDeleteTableNamespace, _this._safeDeleteTable);
                actionBindingManager.addActionBinding(AzureStorageActions.validateTableNameNamespace, _this._validateTableName);
                actionBindingManager.addActionBinding(AzureStorageActions.safeCreateQueueNamespace, _this._safeCreateQueue);
                actionBindingManager.addActionBinding(AzureStorageActions.safeDeleteQueueNamespace, _this._safeDeleteQueue);
                actionBindingManager.addActionBinding(AzureStorageActions.validateQueueNameNamespace, _this._validateQueueName);
                actionBindingManager.addActionBinding(AzureStorageActions.copyPrimaryKeyToClipboardNamespace, _this.copyPrimaryKeyToClipboard);
                actionBindingManager.addActionBinding(AzureStorageActions.copySecondaryKeyToClipboardNamespace, _this.copySecondaryKeyToClipboard);
            };
            /**
             * Action to delete a blob container and remove the node from the tree without doing a refresh
             *
             * @param {string} args.connectionString The connection string of the account node containing the node to delete
             * @param {string} args.name The name of the node to be deleted
             * @param {string} args.nodeType The node type of the node to be deleted
             */
            _this._safeDeleteBlobContainer = function (args) {
                var connectionString = args.connectionString;
                var containerName = args.name;
                var nodeType = args.nodeType;
                var skipPrompt = args.skipPrompt;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.BlobContainers.Delete.Confirm", "Actions.BlobContainers.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.BlobContainers.Delete.Confirm"], containerName);
                    failedMessage = resources["Actions.BlobContainers.Delete.Failed"];
                    return _this.confirmDelete(confirmMessage, skipPrompt);
                })
                    .then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.Storage.deleteBlobContainer", [{ connectionString: connectionString, containerName: containerName }])
                            .then(function (response) {
                            if (response) {
                                // Telemetry delete blob container.
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.deleteBlobContainer", telemetryProperties);
                                var nodeQuery = [{ name: "connectionString", value: connectionString },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: containerName }];
                                return _this.deleteNode(nodeQuery, connectionString, 0 /* blobContainer */, containerName);
                            }
                        }, function (err) {
                            _this.handleErrorAndThrow(err, _this.constructErrorMessage(failedMessage, err.message), containerName, "CloudExplorer.deleteBlobContainer");
                        });
                    }
                });
            };
            /**
             * Action to delete a file share and remove the node from the tree without doing a refresh
             *
             * @param {string} args.connectionString The connection string of the account node containing the node to delete
             * @param {string} args.name The name of the node to be deleted
             * @param {string} args.nodeType The node type of the node to be deleted
             */
            _this._safeDeleteFileShare = function (args) {
                var connectionString = args.connectionString;
                var shareName = args.name;
                var nodeType = args.nodeType;
                var skipPrompt = args.skipPrompt;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.FileShare.Delete.Confirm", "Actions.FileShare.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.FileShare.Delete.Confirm"], shareName);
                    failedMessage = resources["Actions.FileShare.Delete.Failed"];
                    return _this.confirmDelete(confirmMessage, skipPrompt);
                })
                    .then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.Storage.deleteFileShare", [{ connectionString: connectionString, shareName: shareName }])
                            .then(function (response) {
                            if (response) {
                                // Telemetry delete file share.
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.deleteFileShare", telemetryProperties);
                                var nodeQuery = [{ name: "connectionString", value: connectionString },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: shareName }];
                                return _this.deleteNode(nodeQuery, connectionString, 1 /* fileShare */, shareName);
                            }
                        }, function (err) {
                            _this.handleErrorAndThrow(err, _this.constructErrorMessage(failedMessage, err.message), shareName, "CloudExplorer.deleteFileShare");
                        });
                    }
                });
            };
            /**
             * Action to create a table and add the new node directly into the tree without doing a refresh
             *
             * @param {string} args.connectionString The connection string of the account containing the new node
             * @param {string} args.id The id of the account containing this new node
             * @param {string} args.connectionType The accountConnectionType for the account node containing the new node
             * @param {string} args.nodeType The node type of the parent for the new node (the group node)
             */
            _this._safeCreateTable = function (args) {
                var connectionString = args.connectionString;
                var id = args.id;
                var connectionType = args.connectionType;
                var nodeType = args.nodeType;
                var tableName = args.newChildName;
                var doNotOpenInEditor = args.doNotOpenInEditor;
                var path = args.path;
                return _this._host.executeOperation("Azure.Actions.Storage.createTable", [{ connectionString: connectionString, tableName: tableName }])
                    .then(function (response) {
                    if (response) {
                        // Telemetry create table.
                        var telemetryType = "Response";
                        var telemetryProperties = {};
                        telemetryProperties[telemetryType] = "Success";
                        _this._telemetry.sendEvent("CloudExplorer.createTable", telemetryProperties);
                        var nodeQuery = [{ name: "nodeType", value: nodeType },
                            { name: "connectionString", value: connectionString }];
                        var editorNamespace = "Table";
                        return _this.getStorageNode(connectionString, editorNamespace, tableName, id, connectionType)
                            .then(function (nodeToAdd) {
                            return _this._addChildAndOpen(nodeQuery, nodeToAdd, !doNotOpenInEditor, {
                                editorNamespace: editorNamespace,
                                connectionString: connectionString,
                                name: tableName,
                                connectionType: connectionType,
                                path: path + "/" + nodeToAdd.displayName.value
                            });
                        });
                    }
                }, function (err) {
                    _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create table.", err.message), // localize
                    tableName, "CloudExplorer.createTable");
                });
            };
            /**
             * Action to delete a table and remove the node from the tree without doing a refresh
             *
             * @param {string} args.connectionString The connection string of the account node containing the node to delete
             * @param {string} args.name The name of the table to be deleted
             * @param {string} args.nodeType The node type of the table to be deleted
             */
            _this._safeDeleteTable = function (args) {
                var connectionString = args.connectionString;
                var tableName = args.name;
                var nodeType = args.nodeType;
                var skipPrompt = args.skipPrompt;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.Tables.Delete.Confirm", "Actions.Tables.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.Tables.Delete.Confirm"], tableName);
                    failedMessage = resources["Actions.Tables.Delete.Failed"];
                    return _this.confirmDelete(confirmMessage, skipPrompt);
                })
                    .then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.Storage.deleteTable", [{ connectionString: connectionString, tableName: tableName }])
                            .then(function (response) {
                            if (response) {
                                // Telemetry delete table.
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.deleteTable", telemetryProperties);
                                var nodeQuery = [{ name: "connectionString", value: connectionString },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: tableName }];
                                return _this.deleteNode(nodeQuery, connectionString, 2 /* table */, tableName);
                            }
                        }, function (err) {
                            _this.handleErrorAndThrow(err, _this.constructErrorMessage(failedMessage, err.message), tableName, "CloudExplorer.deleteTable");
                        });
                    }
                });
            };
            /**
             * Action to create a queue and add the new node directly into the tree without doing a refresh
             *
             * @param {string} args.connectionString The connection string of the account containing the new node
             * @param {string} args.id The id of the account containing this new node
             * @param {string} args.connectionType The accountConnectionType for the account node containing the new node
             * @param {string} args.nodeType The node type of the parent for the new node (the group node)
             */
            _this._safeCreateQueue = function (args) {
                var connectionString = args.connectionString;
                var queueName = args.newChildName;
                var id = args.id;
                var nodeType = args.nodeType;
                var connectionType = args.connectionType;
                var doNotOpenInEditor = args.doNotOpenInEditor;
                var path = args.path;
                return _this._host.executeOperation("Azure.Actions.Storage.createQueue", [{ connectionString: connectionString, queueName: queueName }])
                    .then(function (response) {
                    if (response) {
                        // Telemetry create Queue.
                        var telemetryType = "Response";
                        var telemetryProperties = {};
                        telemetryProperties[telemetryType] = "Success";
                        _this._telemetry.sendEvent("CloudExplorer.createQueue", telemetryProperties);
                        var nodeQuery = [
                            { name: "nodeType", value: nodeType },
                            { name: "connectionString", value: connectionString }
                        ];
                        var editorNamespace = "Queue";
                        return _this.getStorageNode(connectionString, editorNamespace, queueName, id, connectionType)
                            .then(function (nodeToAdd) {
                            return _this._addChildAndOpen(nodeQuery, nodeToAdd, !doNotOpenInEditor, {
                                editorNamespace: editorNamespace,
                                connectionString: connectionString,
                                name: queueName,
                                connectionType: connectionType,
                                path: path + "/" + nodeToAdd.displayName.value
                            });
                        });
                    }
                }, function (err) {
                    _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create queue.", err.message), // localize
                    queueName, "CloudExplorer.createQueue");
                });
            };
            /**
             * Action to delete a queue and remove the node from the tree without doing a refresh
             *
             * @param {string} args.connectionString The connection string of the account node containing the node to delete
             * @param {string} args.name The name of the node to be deleted
             * @param {string} args.nodeType The node type of the node to be deleted
             */
            _this._safeDeleteQueue = function (args) {
                var connectionString = args.connectionString;
                var queueName = args.name;
                var nodeType = args.nodeType;
                var skipPrompt = args.skipPrompt;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.Queues.Delete.Confirm", "Actions.Queues.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.Queues.Delete.Confirm"], queueName);
                    failedMessage = resources["Actions.Queues.Delete.Failed"];
                    return _this.confirmDelete(confirmMessage, skipPrompt);
                })
                    .then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.Storage.deleteQueue", [{ connectionString: connectionString, queueName: queueName }])
                            .then(function (response) {
                            if (response) {
                                // Telemetry create delete Queue.
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.deleteQueue", telemetryProperties);
                                var nodeQuery = [{ name: "connectionString", value: connectionString },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: queueName }];
                                return _this.deleteNode(nodeQuery, connectionString, 3 /* queue */, queueName);
                            }
                        }, function (err) {
                            _this.handleErrorAndThrow(err, _this.constructErrorMessage(failedMessage, err.message), queueName, "CloudExplorer.deleteQueue");
                        });
                    }
                });
            };
            _this._lengthMessage = "The name should be between 3 and 63 characters long.\n";
            /**
             * Action to validate a blob container name.
             */
            _this._validateBlobContainerName = function (args) {
                var name = args;
                var generalRule = "Container names can contain only lowercase letters, " +
                    "numbers, and hyphens, and must begin and end with a letter or a number. " +
                    "The name can't contain two consecutive hyphens.";
                var lengthRule = _this._lengthMessage + generalRule;
                return es6_promise_1.Promise.resolve(_this._validateName(_this._regexForBlobcontainerAndQueueName, name, { lengthRule: lengthRule, generalRule: generalRule }));
            };
            /**
             * Action to validate a file share name.
             * See: https://msdn.microsoft.com/en-us/library/azure/dn167011.aspx
             */
            _this._validateFileShareName = function (args) {
                var name = args;
                var generalRule = "A file share name must be a valid DNS name, can contain only lowercase letters, " +
                    "numbers, and hyphens, and must begin and end with a letter or a number. " +
                    "The name can't contain two consecutive hyphens.";
                var lengthRule = _this._lengthMessage + generalRule;
                return es6_promise_1.Promise.resolve(_this._validateName(_this._regexForFileShareName, name, { lengthRule: lengthRule, generalRule: generalRule }));
            };
            /**
             * Action to validate a table name.
             */
            _this._validateTableName = function (args) {
                var name = args;
                var generalRule = "Table names can contain only letters and numbers. " +
                    "The name must begin with a letter and end with a letter or a number.";
                var lengthRule = _this._lengthMessage + generalRule;
                return es6_promise_1.Promise.resolve(_this._validateName("^[A-Za-z][A-Za-z0-9]{2,62}$", name, { lengthRule: lengthRule, generalRule: generalRule }));
            };
            /**
             * Action to validate a blob container name.
             */
            _this._validateQueueName = function (args) {
                var name = args;
                var generalRule = "Queue names can contain only lowercase letters, " +
                    "numbers, and hyphens, and must begin and end with a letter or a number. " +
                    "The name can't contain two consecutive hyphens.";
                var lengthRule = _this._lengthMessage + generalRule;
                return es6_promise_1.Promise.resolve(_this._validateName(_this._regexForBlobcontainerAndQueueName, name, { lengthRule: lengthRule, generalRule: generalRule }));
            };
            _this._validateName = function (regexpTemplate, name, errorMessage) {
                if (name.length < 3 || name.length > 63) {
                    return errorMessage.lengthRule;
                }
                var regex = new RegExp(regexpTemplate);
                var message = "";
                if (!regex.test(name)) {
                    message = errorMessage.generalRule;
                }
                return message;
            };
            _this._addChildAndOpen = function (nodeQuery, childNode, showEditor, showEditorArgs) {
                return _this._uiActions.addChild(nodeQuery, childNode)
                    .then(function (_) {
                    if (showEditor) {
                        _this._host.executeOperation("Azure.Actions.Storage.showEditor", [showEditorArgs]);
                    }
                });
            };
            _this.copyPrimaryKeyToClipboard = function (args) {
                var primaryKey = args.primaryKey;
                return _this._host.executeOperation("Environment.clipboardSetData", ["text", primaryKey]);
            };
            _this.copySecondaryKeyToClipboard = function (args) {
                var secondaryKey = args.secondaryKey;
                return _this._host.executeOperation("Environment.clipboardSetData", ["text", secondaryKey]);
            };
            _this._blobPW = new BlobPW_1.default(host);
            return _this;
        }
        /**
         * Action to create a blob container and add the new node directly into the tree without doing a refresh
         *
         * @param {string} args.connectionString The connection string of the account containing the new node
         * @param {string} args.id The id of the account containing this new node
         * @param {string} args.connectionType The accountConnectionType for the account node containing the new node
         * @param {string} args.nodeType The node type of the parent for the new node (the group node)
         * @param {string} args.doNotOpenInEditor If true, does not open the new editor
         */
        AzureStorageActions.prototype._safeCreateBlobContainer = function (args) {
            var _this = this;
            var connectionString = args.connectionString;
            var containerName = args.newChildName;
            var id = args.id;
            var nodeType = args.nodeType;
            var connectionType = args.connectionType;
            var doNotOpenInEditor = args.doNotOpenInEditor;
            var path = args.path;
            return this._blobPW.createBlobContainer(connectionString, containerName)
                .then(function (response) {
                if (response) {
                    // Telemetry create blob container.
                    var telemetryType = "Response";
                    var telemetryProperties = {};
                    telemetryProperties[telemetryType] = "Success";
                    _this._telemetry.sendEvent("CloudExplorer.createBlobContainer", telemetryProperties);
                    var nodeQuery = [
                        { name: "nodeType", value: nodeType },
                        { name: "connectionString", value: connectionString }
                    ];
                    var editorNamespace = "BlobContainer";
                    return _this.getStorageNode(connectionString, editorNamespace, containerName, id, connectionType)
                        .then(function (nodeToAdd) {
                        return _this._addChildAndOpen(nodeQuery, nodeToAdd, !doNotOpenInEditor, {
                            editorNamespace: editorNamespace,
                            connectionString: connectionString,
                            name: containerName,
                            connectionType: connectionType,
                            path: path + "/" + nodeToAdd.displayName.value
                        });
                    });
                }
            }, function (err) {
                _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create blob container.", err.message), // localize
                containerName, "CloudExplorer.createBlobContainer");
            });
        };
        ;
        /**
         * Action to create an empty copy of a blob container and add the new node directly into the tree without doing a refresh.
         *
         * @param {string} args.connectionString The connection string of the account containing the source container.
         * @param {string} args.sourceContainerName The name of the container being copied.
         * @param {string} args.targetContainerName The name of the new container.
         * @param {string} args.targetConnectionString The connection string of the target container.
         * @param {string} args.targetID The id of the account containing the new node.
         * @param {string} args.targetConnectionType The `accountConnectionType` for the account containing the new node.
         * @param {string} args.targetNodeType The node type of the parent for the new node (the group node).
         * @param {string} args.doNotOpenInEditor If true, does not open the new editor.
         */
        AzureStorageActions.prototype._safeCreateBlobContainerFromExisting = function (args) {
            var _this = this;
            var sourceConnectionString = args.sourceConnectionString;
            var sourceContainerName = args.sourceContainerName;
            var targetConnectionString = args.targetConnectionString;
            var targetContainerName = args.targetContainerName;
            var targetID = args.targetID;
            var targetNodeType = args.targetNodeType;
            var targetConnectionType = args.targetConnectionType;
            var doNotOpenInEditor = args.doNotOpenInEditor;
            var path = args.path;
            return this._blobPW.createBlobContainerFromExisting(sourceConnectionString, sourceContainerName, targetConnectionString, targetContainerName)
                .then(function (response) {
                if (response) {
                    // Telemetry create blob container.
                    var telemetryType = "Response";
                    var telemetryProperties = {};
                    telemetryProperties[telemetryType] = "Success";
                    _this._telemetry.sendEvent("CloudExplorer.createBlobContainerFromExisting", telemetryProperties);
                    var nodeQuery = [
                        { name: "nodeType", value: targetNodeType },
                        { name: "connectionString", value: targetConnectionString }
                    ];
                    var editorNamespace = "BlobContainer";
                    return _this.getStorageNode(targetConnectionString, editorNamespace, targetContainerName, targetID, targetConnectionType).then(function (nodeToAdd) { return _this._addChildAndOpen(nodeQuery, nodeToAdd, !doNotOpenInEditor, {
                        editorNamespace: editorNamespace,
                        connectionString: targetConnectionString,
                        name: targetContainerName,
                        connectionType: targetConnectionType,
                        path: path + "/" + nodeToAdd.displayName.value
                    }); });
                }
            }, function (err) {
                _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create blob container.", err.message), // localize
                sourceContainerName, "CloudExplorer.createBlobContainer");
            });
        };
        /**
         * Action to create a file share and add the new node directly into the tree without doing a refresh
         *
         * @param {string} args.connectionString The connection string of the account containing the new node
         * @param {string} args.id The id of the account containing this new node
         * @param {string} args.connectionType The accountConnectionType for the account node containing the new node
         * @param {string} args.nodeType The node type of the parent for the new node (the group node)
         */
        AzureStorageActions.prototype._safeCreateFileShare = function (args) {
            var _this = this;
            var connectionString = args.connectionString;
            var shareName = args.newChildName;
            var id = args.id;
            var nodeType = args.nodeType;
            var connectionType = args.connectionType;
            var quota = args.quota;
            var doNotOpenInEditor = args.doNotOpenInEditor;
            var path = args.path;
            var operationArgs = {
                connectionString: connectionString,
                shareName: shareName,
                quota: quota
            };
            return this._host.executeOperation("Azure.Actions.Storage.createFileShare", [operationArgs])
                .then(function (response) {
                if (response) {
                    // Telemetry create file share.
                    var telemetryType = "Response";
                    var telemetryProperties = {};
                    telemetryProperties[telemetryType] = "Success";
                    _this._telemetry.sendEvent("CloudExplorer.createFileShare", telemetryProperties);
                    var nodeQuery = [
                        { name: "nodeType", value: nodeType },
                        { name: "connectionString", value: connectionString }
                    ];
                    var editorNamespace = "FileShare";
                    return _this.getStorageNode(connectionString, editorNamespace, shareName, id, connectionType).then(function (nodeToAdd) {
                        return _this._addChildAndOpen(nodeQuery, nodeToAdd, !doNotOpenInEditor, {
                            editorNamespace: editorNamespace,
                            connectionString: connectionString,
                            name: shareName,
                            connectionType: connectionType,
                            path: path + "/" + nodeToAdd.displayName.value
                        });
                    });
                }
            }, function (err) {
                _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create file share.", err.message), // localize
                shareName, "CloudExplorer.createFileShare");
            });
        };
        ;
        /**
         * Action to copy a file share and add the new node directly into the tree without doing a refresh.
         *
         * @param {string} args.connectionString The connection string of the account containing the source share.
         * @param {string} args.sourceShareName The name of the share being copied.
         * @param {string} args.targetShareName The name of the new share.
         * @param {string} args.targetConnectionString The connection string of the target share.
         * @param {string} args.targetID The id of the account containing the new node.
         * @param {string} args.connectionType The `accountConnectionType` for the account containing the new node.
         * @param {string} args.nodeType The node type of the parent for the new node (the group node).
         * @param {string} args.doNotOpenInEditor If true, does not open the new editor.
         */
        AzureStorageActions.prototype._safeCreateFileShareFromExisting = function (args) {
            var _this = this;
            var sourceConnectionString = args.sourceConnectionString;
            var sourceShareName = args.sourceShareName;
            var targetConnectionString = args.targetConnectionString;
            var targetShareName = args.targetShareName;
            var targetID = args.targetID;
            var targetNodeType = args.targetNodeType;
            var targetConnectionType = args.targetConnectionType;
            var doNotOpenInEditor = args.doNotOpenInEditor;
            var path = args.path;
            var operationArgs = {
                sourceConnectionString: sourceConnectionString,
                sourceShareName: sourceShareName,
                targetConnectionString: targetConnectionString,
                targetShareName: targetShareName
            };
            return this._host.executeOperation("Azure.Actions.Storage.createFileShareFromExisting", [operationArgs])
                .then(function (response) {
                if (response) {
                    // Telemetry create file share.
                    var telemetryType = "Response";
                    var telemetryProperties = {};
                    telemetryProperties[telemetryType] = "Success";
                    _this._telemetry.sendEvent("CloudExplorer.createFileShareFromExisting", telemetryProperties);
                    var nodeQuery = [
                        { name: "nodeType", value: targetNodeType },
                        { name: "connectionString", value: targetConnectionString }
                    ];
                    var editorNamespace = "FileShare";
                    return _this.getStorageNode(targetConnectionString, editorNamespace, targetShareName, targetID, targetConnectionType).then(function (nodeToAdd) { return _this._addChildAndOpen(nodeQuery, nodeToAdd, !doNotOpenInEditor, {
                        editorNamespace: editorNamespace,
                        connectionString: targetConnectionString,
                        name: targetShareName,
                        connectionType: targetConnectionType,
                        path: path + "/" + nodeToAdd.displayName.value
                    }); });
                }
            }, function (err) {
                _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create file share.", err.message), // localize
                sourceShareName, "CloudExplorer.createFileShare");
            });
        };
        ;
        return AzureStorageActions;
    }(BaseStorageActions_1.default));
    AzureStorageActions.safeCreateBlobContainerNamespace = "Azure.Actions.Storage.safeCreateBlobContainer";
    AzureStorageActions.safeCreateBlobContainerFromExistingNamespace = "Azure.Actions.Storage.safeCreateBlobContainerFromExisting";
    AzureStorageActions.safeCreateFileShareNamespace = "Azure.Actions.Storage.safeCreateFileShare";
    AzureStorageActions.safeCreateFileShareFromExistingNamespace = "Azure.Actions.Storage.safeCreateFileShareFromExisting";
    AzureStorageActions.safeCreateTableNamespace = "Azure.Actions.Storage.safeCreateTable";
    AzureStorageActions.safeCreateQueueNamespace = "Azure.Actions.Storage.safeCreateQueue";
    AzureStorageActions.safeDeleteBlobContainerNamespace = "Azure.Actions.Storage.safeDeleteBlobContainer";
    AzureStorageActions.safeDeleteFileShareNamespace = "Azure.Actions.Storage.safeDeleteFileShare";
    AzureStorageActions.safeDeleteTableNamespace = "Azure.Actions.Storage.safeDeleteTable";
    AzureStorageActions.safeDeleteQueueNamespace = "Azure.Actions.Storage.safeDeleteQueue";
    AzureStorageActions.validateBlobContainerNameNamespace = "Azure.Actions.Storage.validateBlobContainerName";
    AzureStorageActions.validateFileShareNameNamespace = "Azure.Actions.Storage.validateFileShareName";
    AzureStorageActions.validateTableNameNamespace = "Azure.Actions.Storage.validateTableName";
    AzureStorageActions.validateQueueNameNamespace = "Azure.Actions.Storage.validateQueueName";
    AzureStorageActions.copyPrimaryKeyToClipboardNamespace = "Azure.Actions.Storage.copyPrimaryKeyToClipboard";
    AzureStorageActions.copySecondaryKeyToClipboardNamespace = "Azure.Actions.Storage.copySecondaryKeyToClipboard";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AzureStorageActions;
});
