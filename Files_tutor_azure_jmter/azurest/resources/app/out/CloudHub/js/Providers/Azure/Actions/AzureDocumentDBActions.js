/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/AzureCosmosDBAccountManager", "../../Common/AzureConstants", "../../Common/AzureCosmosDBConstants", "Providers/CloudExplorer/Actions/CloudExplorerActions", "URIjs/URITemplate", "Common/Errors", "Providers/Azure/Resources/AzureResources", "underscore.string", "Common/UIActions", "Common/Utilities"], function (require, exports, AzureCosmosDBAccountManager_1, AzureConstants, AzureCosmosDBConstants, CloudExplorerActions, URITemplate, Errors, AzureResources, _string, UIActions, Utilities) {
    "use strict";
    var AzureDocumentDBActions = (function () {
        function AzureDocumentDBActions(host, telemetry) {
            var _this = this;
            this._portalBladeDeepLinkBase = "https://portal.azure.com/#blade";
            this._databaseDeepLinkTemplate = URITemplate(this._portalBladeDeepLinkBase +
                "/Microsoft_Azure_DocumentDB/DatabaseBlade/selflink/{+selflink}/resourceId/{+resourceId}/databaseId/{+databaseId}/rid/{+rid}");
            this._collectionDeepLinkTemplate = URITemplate(this._portalBladeDeepLinkBase +
                "/Microsoft_Azure_DocumentDB/CollectionBlade/resourceId/{+resourceId}/self/{+selflink}/id/{+id}/rid/{+rid}" +
                "/databaseRid/{+databaseRid}/databaseId/{+databaseId}");
            this._lengthMessage = "The name should be between 3 and 63 characters long.\n";
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(AzureDocumentDBActions.connectAccountNamespace, _this.connectAccountInDialog);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.detachAccountNamespace, _this.detachAccount);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.safeDeleteUserDefinedFunctionNamespace, _this.safeDeleteUserDefinedFunction);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.safeDeleteTriggerNamespace, _this.safeDeleteTrigger);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.safeDeleteStoredProcedureNamespace, _this.safeDeleteStoredProcedure);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.safeDeleteCollectionNamespace, _this.safeDeleteCollection);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.safeDeleteDatabaseNamespace, _this.safeDeleteDatabase);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.openPortalBladeActionNamespace, _this.openPortalBlade);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.openFileEditorActionNamespace, _this.openFileEditor);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.createDatabaseActionNamespace, _this.createDatabase);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.openCreateCollectionDialogActionNamespace, _this.createCollectionInDialog);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.createStoreProcedureActionNamespace, _this.createStoredProcedure);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.createTriggerActionNamespace, _this.createTrigger);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.createUDFActionNamespace, _this.createUDF);
                actionBindingManager.addActionBinding(AzureDocumentDBActions.validateScriptNameActionNamespace, _this.validateScriptName);
            };
            this.connectAccountInDialog = function (args) {
                return new Promise(function (resolve, reject) {
                    _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                        id: AzureConstants.registeredDialogs.addCosmosDBAccount,
                        parameters: {}
                    }).then(function (result) {
                        if (result) {
                            var uid = "";
                            var partentNodeType = "ResourceTypeGroupNode-ResourceType:External/Microsoft.DocumentDB/documentDBAccounts";
                            var partentNodeQuery = [
                                { name: "type", value: partentNodeType }
                            ];
                            AzureCosmosDBAccountManager_1.default.saveCosmosDBAccount(_this._host, result)
                                .then(function () {
                                return _this._uiActions.findChildByName(partentNodeQuery, result.accountName);
                            })
                                .then(function (result) {
                                uid = result[0].uids[0];
                                return _this._uiActions.expand(partentNodeQuery);
                            })
                                .then(function () {
                                return _this._uiActions.addChildByUid(partentNodeQuery, uid);
                            });
                        }
                    });
                });
            };
            this.detachAccount = function (args) {
                var toDeleteAccount = {
                    accountEndpoint: args.documentEndpoint,
                    accountName: args.accountId,
                    defaultExperience: args.defaultExperience
                };
                // Localize
                var confirmation = _string.sprintf("Are you sure you want to detach the CosmosDB account \"%s\"?", args.accountId);
                return _this._host.executeOperation("Environment.promptYesNo", [confirmation, "error"]).then(function (response) {
                    if (response) {
                        AzureCosmosDBAccountManager_1.default.deleteCosmosDBAccount(_this._host, toDeleteAccount);
                        var nodeQuery = [
                            { name: "documentEndpoint", value: args.documentEndpoint },
                            { name: "accountId", value: args.accountId },
                            { name: "defaultExperience", value: args.defaultExperience },
                            { name: "isAttachedAccount", value: true }
                        ];
                        _this._uiActions.deleteNode(nodeQuery);
                    }
                });
            };
            this.safeDeleteUserDefinedFunction = function (args) {
                var containerName = args.name;
                var nodeType = args.nodeType;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.UserDefinedFunction.Delete.Confirm", "Actions.UserDefinedFunction.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.UserDefinedFunction.Delete.Confirm"], containerName);
                    failedMessage = resources["Actions.UserDefinedFunction.Delete.Failed"];
                    return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: confirmMessage, iconType: "critical" }]);
                }).then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.DocumentDB.deleteUserDefinedFunction", [{ endpointUrl: args.documentEndpoint, masterKey: args.primaryMasterKey, resourceSelfLink: args.selfLink }])
                            .then(function (response) {
                            if (response) {
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.DeleteUserDefinedFunction", telemetryProperties);
                                var nodeQuery = [{ name: "selfLink", value: args.selfLink },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: containerName }];
                                return _this._uiActions.deleteNode(nodeQuery).then(function () {
                                    return _this._closeTargetStorageEditor(_this._host, args.selfLink, nodeType, containerName);
                                });
                            }
                        }, function (err) {
                            throw err;
                        });
                    }
                });
            };
            this.safeDeleteTrigger = function (args) {
                var containerName = args.name;
                var nodeType = args.nodeType;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.Trigger.Delete.Confirm", "Actions.Trigger.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.Trigger.Delete.Confirm"], containerName);
                    failedMessage = resources["Actions.Trigger.Delete.Failed"];
                    return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: confirmMessage, iconType: "critical" }]);
                }).then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.DocumentDB.deleteTrigger", [{ endpointUrl: args.documentEndpoint, masterKey: args.primaryMasterKey, resourceSelfLink: args.selfLink }])
                            .then(function (response) {
                            if (response) {
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.DeleteTrigger", telemetryProperties);
                                var nodeQuery = [{ name: "selfLink", value: args.selfLink },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: containerName }];
                                return _this._uiActions.deleteNode(nodeQuery).then(function () {
                                    return _this._closeTargetStorageEditor(_this._host, args.selfLink, nodeType, containerName);
                                });
                            }
                        }, function (err) {
                            throw err;
                        });
                    }
                });
            };
            this.safeDeleteStoredProcedure = function (args) {
                var containerName = args.name;
                var nodeType = args.nodeType;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.StoredProcedure.Delete.Confirm", "Actions.StoredProcedure.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.StoredProcedure.Delete.Confirm"], containerName);
                    failedMessage = resources["Actions.StoredProcedure.Delete.Failed"];
                    return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: confirmMessage, iconType: "critical" }]);
                }).then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.DocumentDB.deleteStoredProcedure", [{ endpointUrl: args.documentEndpoint, masterKey: args.primaryMasterKey, resourceSelfLink: args.selfLink }])
                            .then(function (response) {
                            if (response) {
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.DeleteStoredProcedure", telemetryProperties);
                                var nodeQuery = [{ name: "selfLink", value: args.selfLink },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: containerName }];
                                return _this._uiActions.deleteNode(nodeQuery).then(function () {
                                    return _this._closeTargetStorageEditor(_this._host, args.selfLink, nodeType, containerName);
                                });
                            }
                        }, function (err) {
                            throw err;
                        });
                    }
                });
            };
            this.safeDeleteCollection = function (args) {
                var containerName = args.name;
                var nodeType = args.nodeType;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.Collections.Delete.Confirm", "Actions.Collections.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.Collections.Delete.Confirm"], containerName);
                    failedMessage = resources["Actions.Collections.Delete.Failed"];
                    return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: confirmMessage, iconType: "critical" }]);
                })
                    .then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.DocumentDB.deleteCollection", [{ endpointUrl: args.documentEndpoint, masterKey: args.primaryMasterKey, resourceSelfLink: args.selfLink }])
                            .then(function (response) {
                            if (response) {
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.DeleteCollection", telemetryProperties);
                                var nodeQuery = [{ name: "selfLink", value: args.selfLink },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: containerName }];
                                return _this._uiActions.deleteNode(nodeQuery);
                            }
                        }, function (err) {
                            throw err;
                        });
                    }
                })
                    .then(function () {
                    _this._host.executeProviderOperation("Azure.Actions.DocumentDB.closeCollectionTabs", {
                        selfLink: args.selfLink
                    });
                });
            };
            this.safeDeleteDatabase = function (args) {
                var containerName = args.name;
                var nodeType = args.nodeType;
                var confirmMessage;
                var failedMessage;
                return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.Databases.Delete.Confirm", "Actions.Databases.Delete.Failed"])
                    .then(function (resources) {
                    confirmMessage = _string.sprintf(resources["Actions.Databases.Delete.Confirm"], containerName);
                    failedMessage = resources["Actions.Databases.Delete.Failed"];
                    return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{ message: confirmMessage, iconType: "critical" }]);
                })
                    .then(function (result) {
                    if (result) {
                        return _this._host.executeOperation("Azure.Actions.DocumentDB.deleteDatabase", [{ endpointUrl: args.documentEndpoint, masterKey: args.primaryMasterKey, resourceSelfLink: args.selfLink }])
                            .then(function (response) {
                            if (response) {
                                var telemetryType = "Response";
                                var telemetryProperties = {};
                                telemetryProperties[telemetryType] = "Success";
                                _this._telemetry.sendEvent("CloudExplorer.DeleteDatabase", telemetryProperties);
                                var nodeQuery = [
                                    { name: "selfLink", value: args.selfLink },
                                    { name: "nodeType", value: nodeType },
                                    { name: "name", value: containerName }
                                ];
                                return _this._uiActions.deleteNode(nodeQuery);
                            }
                        }, function (err) {
                            throw err;
                        });
                    }
                });
            };
            this._closeTargetStorageEditor = function (host, selfLink, nodeType, name) {
                return host.executeOperation("Azure.Actions.Storage.getEditorInfo", []).then(function (value) {
                    if (!value) {
                        return;
                    }
                    if (value.resourceType === "UDF") {
                        value.resourceType = "UserDefinedFunction";
                    }
                    var valueNodeType = "Azure.DocumentDB." + value.resourceType;
                    if (selfLink === value.selfLink && nodeType === valueNodeType && name === value.id) {
                        return host.executeOperation("Azure.Actions.Storage.closeEditor", []);
                    }
                }, function (error) {
                    throw error;
                });
            };
            this.createCollectionInDialog = function (args) {
                return new Promise(function (resolve, reject) {
                    _this._host.executeProviderOperation("Environment.Dialogs.getDialogResult", {
                        id: AzureConstants.registeredDialogs.addCollection,
                        parameters: {
                            databaseId: args.databaseId
                        }
                    }).then(function (result) {
                        if (result) {
                            var partitionKey = !!result.partitionKeyPath ? { kind: result.partitionKeyKind, paths: result.partitionKeyPath } : null;
                            _this._host.executeProviderOperation("Azure.Actions.DocumentDB.createCollection", {
                                documentEndpoint: args.documentEndpoint,
                                primaryMasterKey: args.primaryMasterKey,
                                databaseSelfLink: args.databaseSelfLink,
                                collectionId: result.collectionId,
                                offerThroughput: result.offerThroughput,
                                partitionKey: partitionKey
                            }).then(function (collection) {
                                _this._uiActions.refreshNodeChildren([
                                    { name: "selfLink", value: args.databaseSelfLink },
                                    { name: "nodeType ", value: AzureCosmosDBConstants.nodeTypes.database }
                                ]);
                                resolve(true);
                            }, function (err) {
                                _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create collection.", err), // localize
                                result.collectionId, "CloudExplorer.CreateCollection");
                            }).catch(function (err) { return reject(err); });
                        }
                    });
                });
            };
            this._validateName = function (regexpTemplate, name, errorMessage) {
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
            this.validateScriptName = function (args) {
                var name = args;
                var generalRule = "Script name can contain only letters and numbers. " +
                    "The name must begin with a letter and end with a letter or a number.";
                var lengthRule = _this._lengthMessage + generalRule;
                return Promise.resolve(_this._validateName("^[A-Za-z][A-Za-z0-9]{2,62}$", name, { lengthRule: lengthRule, generalRule: generalRule }));
            };
            this.createDatabase = function (args) {
                var databaseName = args.newChildName;
                var nodeType = AzureCosmosDBConstants.nodeTypes.database;
                var nodeQuery = [
                    { name: "id", value: args.resourceId }
                ];
                return _this._host.executeProviderOperation("Azure.Actions.DocumentDB.createDatabase", {
                    documentEndpoint: args.documentEndpoint,
                    primaryMasterKey: args.primaryMasterKey,
                    newChildName: databaseName
                }).then(function (response) {
                    var telemetryType = "Response";
                    var telemetryProperties = {};
                    telemetryProperties[telemetryType] = "Success";
                    _this._telemetry.sendEvent("CloudExplorer.CreateDatabase", telemetryProperties);
                    // TODO If update the node config, this path of code need to be updated as well. This is not good.
                    var nodeArgs = args;
                    nodeArgs.name = databaseName;
                    nodeArgs.id = databaseName;
                    nodeArgs.editorNamespace = "Database";
                    nodeArgs.selfLink = response._self;
                    nodeArgs.nodeType = nodeType;
                    if (!nodeArgs.defaultExperience && !!args.tags) {
                        nodeArgs.defaultExperience = _this._getDefaultExperience(nodeArgs.kind, JSON.parse(nodeArgs.tags));
                    }
                    _this._generateDocumentDBNode(databaseName, nodeType, nodeArgs).then(function (node) {
                        _this._uiActions.addChild(nodeQuery, node);
                    });
                }, function (err) {
                    _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create database.", err), // localize
                    databaseName, "CloudExplorer.CreateDatabase");
                });
            };
            this.createStoredProcedure = function (args) {
                var storedProcedureName = args.newChildName;
                var nodeType = AzureCosmosDBConstants.nodeTypes.storedProcedure;
                var resourceType = "StoredProcedure";
                var nodeQuery = [
                    { name: "selfLink", value: args.selfLink },
                    { name: "nodeType", value: AzureCosmosDBConstants.nodeTypes.storedProcedureGroup }
                ];
                return _this._host.executeProviderOperation("Azure.Actions.DocumentDB.createStoredProcedure", {
                    documentEndpoint: args.documentEndpoint,
                    primaryMasterKey: args.primaryMasterKey,
                    selfLink: args.selfLink,
                    newChildName: storedProcedureName
                }).then(function (response) {
                    var telemetryType = "Response";
                    var telemetryProperties = {};
                    telemetryProperties[telemetryType] = "Success";
                    _this._telemetry.sendEvent("CloudExplorer.CreateStoredProcedure", telemetryProperties);
                    var nodeArgs = _this._getScriptNodeAttributes(resourceType, nodeType, "StoredProcedures", args, response);
                    _this._generateDocumentDBNode(storedProcedureName, nodeType, nodeArgs).then(function (node) {
                        _this._addChildAndOpen(nodeQuery, node, nodeArgs);
                    });
                }, function (err) {
                    _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create stored procedure.", err), // localize
                    storedProcedureName, "CloudExplorer.CreateStoredProcedure");
                });
            };
            this.createTrigger = function (args) {
                var triggerName = args.newChildName;
                var nodeType = AzureCosmosDBConstants.nodeTypes.trigger;
                var resourceType = "Trigger";
                var nodeQuery = [
                    { name: "selfLink", value: args.selfLink },
                    { name: "nodeType", value: AzureCosmosDBConstants.nodeTypes.triggerGroup }
                ];
                return _this._host.executeProviderOperation("Azure.Actions.DocumentDB.createTrigger", {
                    documentEndpoint: args.documentEndpoint,
                    primaryMasterKey: args.primaryMasterKey,
                    selfLink: args.selfLink,
                    newChildName: triggerName
                }).then(function (response) {
                    var telemetryType = "Response";
                    var telemetryProperties = {};
                    telemetryProperties[telemetryType] = "Success";
                    _this._telemetry.sendEvent("CloudExplorer.CreateTrigger", telemetryProperties);
                    var nodeArgs = _this._getScriptNodeAttributes(resourceType, nodeType, "Triggers", args, response);
                    _this._generateDocumentDBNode(triggerName, nodeType, nodeArgs).then(function (node) {
                        _this._addChildAndOpen(nodeQuery, node, nodeArgs);
                    });
                }, function (err) {
                    _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create trigger.", err), // localize
                    triggerName, "CloudExplorer.CreateTrigger");
                });
            };
            this.createUDF = function (args) {
                var udfName = args.newChildName;
                var nodeType = AzureCosmosDBConstants.nodeTypes.userDefinedFunction;
                var resourceType = "UDF";
                var nodeQuery = [
                    { name: "selfLink", value: args.selfLink },
                    { name: "nodeType", value: AzureCosmosDBConstants.nodeTypes.userDefinedFunctionGroup }
                ];
                return _this._host.executeProviderOperation("Azure.Actions.DocumentDB.createUDF", {
                    documentEndpoint: args.documentEndpoint,
                    primaryMasterKey: args.primaryMasterKey,
                    selfLink: args.selfLink,
                    newChildName: udfName
                }).then(function (response) {
                    var telemetryType = "Response";
                    var telemetryProperties = {};
                    telemetryProperties[telemetryType] = "Success";
                    _this._telemetry.sendEvent("CloudExplorer.CreateUserDefinedFunction", telemetryProperties);
                    var nodeArgs = _this._getScriptNodeAttributes(resourceType, nodeType, "UserDefinedFunctions", args, response);
                    _this._generateDocumentDBNode(udfName, nodeType, nodeArgs).then(function (node) {
                        _this._addChildAndOpen(nodeQuery, node, nodeArgs);
                    });
                }, function (err) {
                    _this.handleErrorAndThrow(err, _this.constructErrorMessage("Failed to create user defined function.", err), // localize
                    udfName, "CloudExplorer.CreateUserDefinedFunction");
                });
            };
            // TODO If update the node config, this path of code need to be updated as well. This is not good.
            this._getScriptNodeAttributes = function (resourceType, nodeType, editorNamespace, originArgs, responseArgs) {
                var connectionString = "AccountEndpoint=" + originArgs.documentEndpoint + ";AccountKey=" + originArgs.primaryMasterKey + ";";
                var nodeArgs = {
                    name: originArgs.newChildName,
                    id: originArgs.newChildName,
                    nodeType: nodeType,
                    resourceType: resourceType,
                    primaryMasterKey: originArgs.primaryMasterKey,
                    documentEndpoint: originArgs.documentEndpoint,
                    collectionSelfLink: originArgs.selfLink,
                    partitionKeyKind: originArgs.partitionKeyKind,
                    selfLink: responseArgs._self,
                    body: responseArgs.body,
                    connectionString: connectionString,
                    editorNamespace: editorNamespace
                };
                if (resourceType === "Trigger") {
                    nodeArgs.triggerType = responseArgs.triggerType;
                    nodeArgs.triggerOperation = responseArgs.triggerOperation;
                }
                return nodeArgs;
            };
            this._generateDocumentDBNode = function (nodeName, nodeType, args) {
                var attributes = [];
                Object.keys(args).forEach(function (key) {
                    attributes.push({
                        name: key,
                        value: args[key]
                    });
                });
                var rawData = {
                    type: nodeType,
                    name: nodeName,
                    attributes: attributes
                };
                return _this._convertRawDataToNode(rawData);
            };
            this._addChildAndOpen = function (nodeQuery, node, args) {
                return _this._uiActions.addChild(nodeQuery, node).then(function () {
                    return _this._host.executeOperation("Azure.openDocumentDBTab", [{
                            endpointUrl: args.documentEndpoint,
                            authorizationKey: args.primaryMasterKey,
                            resourceSelfLink: args.selfLink,
                            resourceType: args.resourceType,
                            openNewTab: false,
                            isNew: true,
                            metadata: args
                        }]);
                });
            };
            this.openFileEditor = function (args) {
                if (Utilities.isRunningOnElectron()) {
                    return _this.openFileEditorInElectron(args);
                }
                var endpointUrl = args.documentEndpoint, authorizationKey = args.primaryMasterKey, resourceSelfLink = args.selfLink, accountId = args.accountId, databaseId = args.databaseId, collectionId = args.collectionId, resourceId = args.id, resourceType = AzureCosmosDBConstants.resourceTypes.Document, metadata = {
                    accountId: accountId,
                    databaseId: databaseId,
                    collectionId: collectionId,
                    resourceId: resourceId,
                    resourceType: resourceType,
                    partitionKeyValue: args.partitionKeyValue,
                    partitionKeyPath: args.partitionKeyPath
                }, isReadOnly = false;
                return _this._host.executeOperation("Azure.openDocumentDBDocument", [endpointUrl, authorizationKey, resourceSelfLink, isReadOnly, metadata]);
            };
            this.openFileEditorInElectron = function (args) {
                var telemetryType = "ResourceType";
                var telemetryProperties = {};
                telemetryProperties[telemetryType] = args.resourceType;
                _this._telemetry.sendEvent("CloudExplorer.OpenFileEditor", telemetryProperties);
                var actions = ["DocumentDB", "MongoDB", "Settings", "UDF", "Trigger", "StoredProcedure"];
                if (actions.indexOf(args.resourceType) === -1) {
                    return _this._host.resolveResources(AzureResources.commonNamespace, ["Actions.DocumentDB.NotImplemented", "Actions.DocumentDB.HintMessage"])
                        .then(function (resources) {
                        var confirmMessage = _string.sprintf(resources["Actions.DocumentDB.NotImplemented"]);
                        var hintMessage = _string.sprintf(resources["Actions.DocumentDB.HintMessage"]);
                        return _this._host.executeOperation("CloudExplorer.Actions.Dialog.promptOK", [{ title: hintMessage, message: confirmMessage, messageBoxType: "info" }]);
                    });
                }
                else {
                    return _this._host.executeOperation("Azure.openDocumentDBTab", [{
                            endpointUrl: args.documentEndpoint,
                            authorizationKey: args.primaryMasterKey,
                            resourceSelfLink: args.selfLink,
                            resourceType: args.resourceType,
                            openNewTab: args.openNewTab,
                            isNew: false,
                            metadata: args
                        }]);
                }
            };
            this.openPortalBlade = function (args) {
                var url = _this._populateBladeUrl(args);
                return _this._host.executeOperation(CloudExplorerActions.openUrlNamespace, [{ url: url }]);
            };
            this._populateBladeUrl = function (args) {
                var urlToReturn, editorNamespace = args.editorNamespace, resourceId = encodeURIComponent(args.resourceId), selflink = encodeURIComponent(args.selfLink);
                switch (editorNamespace) {
                    case "Database":
                        var databaseId = args.id, documentdbResourceId = encodeURIComponent(args.documentdbResourceId);
                        urlToReturn = _this._databaseDeepLinkTemplate.expand({
                            selflink: selflink,
                            resourceId: resourceId,
                            databaseId: databaseId,
                            rid: documentdbResourceId
                        }).toString();
                        break;
                    case "Collection":
                        var databaseRid = encodeURIComponent(args.databaseRid), id = args.id;
                        databaseId = args.databaseId;
                        documentdbResourceId = encodeURIComponent(args.documentdbResourceId);
                        urlToReturn = _this._collectionDeepLinkTemplate.expand({
                            resourceId: resourceId,
                            selflink: selflink,
                            id: id,
                            rid: documentdbResourceId,
                            databaseId: databaseId,
                            databaseRid: databaseRid
                        }).toString();
                        break;
                }
                // UrlTemplate expand method will auto encode "%" into "%25"
                // It need to be manual decode in order to open correct url
                urlToReturn = urlToReturn.replace(/%25/g, "%");
                return urlToReturn;
            };
            /**
             * Handle an error.
             */
            this.handleErrorAndThrow = function (error, message, itemName, telemetryCategory) {
                var telemetryError = {
                    name: telemetryCategory,
                    error: error
                };
                _this._telemetry.sendError(telemetryError);
                var errorToThrow;
                if (error.name === Errors.errorNames.ActionableError || error.name === Errors.errorNames.DisplayableError) {
                    errorToThrow = error;
                }
                else {
                    if (error.name === Errors.errorNames.ActiveLeaseError) {
                        var message = itemName + " cannot be modified at this time because another resource is using it."; // localize
                    }
                    errorToThrow = new Errors.DisplayableError(message, error);
                }
                throw errorToThrow;
            };
            /**
             * Construct an error message to show more details.
             */
            this.constructErrorMessage = function (summary, err) {
                var information = "";
                try {
                    information = _this.parse(err)[0].message;
                }
                catch (e) {
                    information = "Unknown";
                }
                return summary
                    + Utilities.getEnvironmentNewLine()
                    + Utilities.getEnvironmentNewLine()
                    + "Details:" // localize
                    + Utilities.getEnvironmentNewLine()
                    + information;
            };
            this._getDefaultExperience = function (kind, tags) {
                var defaultExperience = tags.defaultExperience || "";
                if (!defaultExperience) {
                    switch (kind) {
                        case AzureCosmosDBConstants.CosmosDBKind.GlobalDocumentDB:
                            defaultExperience = AzureCosmosDBConstants.CosmosDBDefaultExperience.DocumentDB;
                            break;
                        case AzureCosmosDBConstants.CosmosDBKind.MongoDB:
                            defaultExperience = AzureCosmosDBConstants.CosmosDBDefaultExperience.MongoDB;
                            break;
                        default:
                            // set to DocumentDB by default
                            defaultExperience = AzureCosmosDBConstants.CosmosDBDefaultExperience.DocumentDB;
                    }
                }
                return defaultExperience;
            };
            this._host = host;
            this._telemetry = telemetry;
            this._uiActions = new UIActions(this._host);
        }
        AzureDocumentDBActions.prototype._convertRawDataToNode = function (resource) {
            return new Promise(function (resolve, reject) {
                require(["Providers/Azure/Nodes/AzureResourceNodeFactory"], function (azureResourceNodeFactory) {
                    var node = azureResourceNodeFactory.convertAzureResource(resource);
                    if (node) {
                        resolve(node);
                    }
                    else {
                        reject(new Error("Cannot convert raw data to node."));
                    }
                });
            });
        };
        /**
         * Parse CosmosDB related error messages
         */
        AzureDocumentDBActions.prototype.parse = function (err) {
            try {
                return this._parse(err);
            }
            catch (e) {
                return [{ message: JSON.stringify(err) }];
            }
        };
        AzureDocumentDBActions.prototype._parse = function (err) {
            var normalizedErrors = [];
            if (err.message && !err.code) {
                normalizedErrors.push(err);
            }
            else {
                var wrappedError = err, backendError = JSON.parse(wrappedError.body), innerErrors = this._getInnerErrors(backendError.message);
                normalizedErrors = innerErrors.map(function (innerError) { return (typeof innerError === "string") ? { message: innerError } : innerError; });
            }
            return normalizedErrors;
        };
        AzureDocumentDBActions.prototype._getInnerErrors = function (message) {
            /*
                The backend error message has an inner-message which is a stringified object.
    
                For SQL errors, the "errors" property is an array of SqlErrorDataModel.
                Example:
                    "Message: {"Errors":["Resource with specified id or name already exists"]}\r\nActivityId: 80005000008d40b6a, Request URI: /apps/19000c000c0a0005/services/mctestdocdbprod-MasterService-0-00066ab9937/partitions/900005f9000e676fb8/replicas/13000000000955p"
                For non-SQL errors the "Errors" propery is an array of string.
                Example:
                    "Message: {"errors":[{"severity":"Error","location":{"start":7,"end":8},"code":"SC1001","message":"Syntax error, incorrect syntax near '.'."}]}\r\nActivityId: d3300016d4084e310a, Request URI: /apps/12401f9e1df77/services/dc100232b1f44545/partitions/f86f3bc0001a2f78/replicas/13085003638s"
            */
            var innerMessage = null;
            var singleLineMessage = message.replace(/[\r\n]|\r|\n/g, "");
            try {
                // Multi-Partition error flavor
                var regExp = /^(.*)ActivityId: (.*)/g;
                var regString = regExp.exec(singleLineMessage);
                var innerMessageString = regString[1];
                innerMessage = JSON.parse(innerMessageString);
            }
            catch (e) {
                // Single-partition error flavor
                var regExp = /^Message: (.*)ActivityId: (.*)/g;
                var regString = regExp.exec(singleLineMessage);
                var innerMessageString = regString[1];
                innerMessage = JSON.parse(innerMessageString);
            }
            return (innerMessage.errors) ? innerMessage.errors : innerMessage.Errors;
        };
        return AzureDocumentDBActions;
    }());
    AzureDocumentDBActions.connectAccountNamespace = "Azure.Actions.DocumentDB.connectAccount";
    AzureDocumentDBActions.detachAccountNamespace = "Azure.Actions.DocumentDB.detachAccount";
    AzureDocumentDBActions.safeDeleteUserDefinedFunctionNamespace = "Azure.Actions.DocumentDB.safeDeleteUserDefinedFunction";
    AzureDocumentDBActions.safeDeleteTriggerNamespace = "Azure.Actions.DocumentDB.safeDeleteTrigger";
    AzureDocumentDBActions.safeDeleteStoredProcedureNamespace = "Azure.Actions.DocumentDB.safeDeleteStoredProcedure";
    AzureDocumentDBActions.safeDeleteCollectionNamespace = "Azure.Actions.DocumentDB.safeDeleteColection";
    AzureDocumentDBActions.safeDeleteDatabaseNamespace = "Azure.Actions.DocumentDB.safeDeleteDatabase";
    AzureDocumentDBActions.openPortalBladeActionNamespace = "Azure.Actions.DocumentDB.OpenPortalBladeAction";
    AzureDocumentDBActions.openCreateCollectionDialogActionNamespace = "Azure.Actions.DocumentDB.OpenCreateCollectionDialogAction";
    AzureDocumentDBActions.openFileEditorActionNamespace = "Azure.Actions.DocumentDB.OpenFileEditorAction";
    AzureDocumentDBActions.createDatabaseActionNamespace = "Azure.Actions.DocumentDB.CreateDatabaseAction";
    AzureDocumentDBActions.createStoreProcedureActionNamespace = "Azure.Actions.DocumentDB.CreateStoredProcedureAction";
    AzureDocumentDBActions.createTriggerActionNamespace = "Azure.Actions.DocumentDB.CreateTriggerAction";
    AzureDocumentDBActions.createUDFActionNamespace = "Azure.Actions.DocumentDB.CreateUDFAction";
    AzureDocumentDBActions.validateScriptNameActionNamespace = "Azure.Actions.DocumentDB.ValidateScriptNameAction";
    return AzureDocumentDBActions;
});
