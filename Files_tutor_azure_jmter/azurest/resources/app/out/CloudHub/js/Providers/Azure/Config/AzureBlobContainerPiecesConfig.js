/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureConstants", "Providers/Azure/Resources/AzureResources", "CloudExplorer/CloudExplorerConstants", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Providers/Azure/Loaders/AzureStorageAttributeLoader", "Common/Utilities"], function (require, exports, AzureConstants, AzureResources, CloudExplorerConstants, CloudExplorerResources, AzureStorageAttributeLoader, Utilities) {
    "use strict";
    /**
     * Base configurations for blob containers
     */
    var AzureBlobContainerPiecesConfig = (function () {
        function AzureBlobContainerPiecesConfig() {
        }
        return AzureBlobContainerPiecesConfig;
    }());
    /**
     * Common configuration for blob containers
     */
    AzureBlobContainerPiecesConfig.Common = {
        aliases: ["Azure.Blob.Pieces.Common"],
        displayName: { attribute: "name" },
        icon: AzureConstants.imagePaths.StorageAccountBlobContainerIcon,
        themeSrc: AzureConstants.imageThemeSrc.StorageAccountBlobContainerIcon,
        supported: true,
        highlightLocations: {
            attribute: "highlightLocations"
        },
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.Open", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountBlobContainerIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountBlobContainerIcon,
                isDefault: true,
                namespace: "Azure.Actions.Storage.showEditor",
                boundArguments: {
                    editorNamespace: {
                        attribute: "editorNamespace"
                    },
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    subscription: {
                        attribute: "subscription"
                    }
                },
                sortIndex: -1000
            },
            {
                displayName: {
                    resource: { resourceId: "Action.Storage.OpenNewTab", namespace: AzureResources.commonNamespace }
                },
                isDefault: false,
                namespace: "Azure.Actions.Storage.showEditor",
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                boundArguments: {
                    editorNamespace: {
                        attribute: "editorNamespace"
                    },
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    openNewTab: {
                        value: true
                    }
                },
                sortIndex: -999
            }
        ],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.BlobContainers.Url", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "url"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.BlobContainers.Type", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    value: "Blob Container"
                }
            }
        ],
        loaders: [
            {
                namespace: AzureStorageAttributeLoader.getBlobContainerAttributes,
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    containerName: {
                        attribute: "name"
                    }
                },
                provides: ["lastModified", "publicReadAccess", "leaseState", "leaseStatus", "leaseStatusDisplay"]
            }
        ]
    };
    /**
     * Lease functionality
     */
    AzureBlobContainerPiecesConfig.Leases = {
        aliases: ["Azure.Blob.Pieces.Leases"],
        status: { attribute: "leaseStatusDisplay" },
        actions: [
            {
                // localize
                displayName: {
                    value: "Acquire Lease"
                },
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Blob.acquireBlobContainerLease",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    containerName: {
                        attribute: "name"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["leaseStatus"],
                        expression: "leaseStatus === 'unlocked'"
                    }
                }
            },
            {
                // localize
                displayName: {
                    value: "Break Lease"
                },
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Blob.breakBlobContainerLease",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    containerName: {
                        attribute: "name"
                    }
                },
                enabled: {
                    expression: {
                        requires: ["leaseStatus"],
                        expression: "leaseStatus === 'locked'"
                    }
                }
            }
        ],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.BlobContainers.LeaseState", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "leaseState"
                }
            },
            {
                displayName: {
                    resource: { resourceId: "Properties.BlobContainers.LeaseStatus", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "leaseStatus"
                }
            }
        ]
    };
    /**
     * Delete functionality
     */
    AzureBlobContainerPiecesConfig.Delete = {
        aliases: ["Azure.Blob.Pieces.Delete"],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.BlobContainers.Delete", namespace: AzureResources.commonNamespace }
                },
                icon: AzureConstants.imagePaths.StorageAccountBlobContainerIcon,
                themeSrc: AzureConstants.imageThemeSrc.StorageAccountDeleteIcon,
                isDefault: false,
                keyboard: [CloudExplorerConstants.keyCodes.Delete],
                namespace: "Azure.Actions.Storage.safeDeleteBlobContainer",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ],
        properties: []
    };
    /**
     * Copy blob container functionality
     */
    AzureBlobContainerPiecesConfig.Copy = {
        aliases: ["Azure.Blob.Pieces.Copy"],
        actions: [
            {
                // Localize
                displayName: {
                    value: "Copy Blob Container"
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [
                    Utilities.isMac() ? CloudExplorerConstants.keyCodes.MacCommand : CloudExplorerConstants.keyCodes.Ctrl,
                    CloudExplorerConstants.keyCodes.C
                ],
                namespace: "Azure.Actions.Storage.Blob.copyBlobContainerToClipboard",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    }
                }
            }
        ]
    };
    /**
     * Rename functionality
     */
    AzureBlobContainerPiecesConfig.Rename = {
        aliases: ["Azure.Blob.Pieces.Rename"],
        actions: [
            {
                displayName: {
                    resource: { resourceId: "Actions.BlobContainers.Rename", namespace: AzureResources.commonNamespace }
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                keyboard: [CloudExplorerConstants.keyCodes.F2],
                namespace: "Azure.Actions.Storage.Blob.renameBlobContainer",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    id: {
                        attribute: "id"
                    },
                    nodeType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    /**
     * Copy direct link functionality
     */
    AzureBlobContainerPiecesConfig.CopyLink = {
        aliases: ["Azure.Blob.Pieces.CopyLink"],
        actions: [
            {
                // Localize
                displayName: {
                    value: "Copy Direct Link to Blob Container"
                },
                isDefault: false,
                visible: {
                    expression: {
                        requires: ["hasSubscription"],
                        expression: "hasSubscription && " + Utilities.isDirectLinkSupported()
                    }
                },
                namespace: "Azure.Actions.Storage.copyLinkToResource",
                boundArguments: {
                    accountId: {
                        attribute: "id"
                    },
                    name: {
                        attribute: "name"
                    },
                    resourceType: {
                        attribute: "nodeType"
                    }
                }
            }
        ]
    };
    /**
     * Add to Quick Access
     */
    AzureBlobContainerPiecesConfig.PinToQuickAccess = {
        aliases: ["Azure.Blob.Pieces.PinToQuickAccess"],
        actions: [
            {
                icon: AzureConstants.imagePaths.QuickAccessIcon,
                themeSrc: AzureConstants.imageThemeSrc.QuickAccessIcon,
                // Localize
                displayName: {
                    resource: { namespace: CloudExplorerResources.namespace, resourceId: "TreeView.QuickAccess.Add" }
                },
                isDefault: false,
                namespace: "Azure.Actions.Storage.addToQuickAccess",
                visible: {
                    expression: {
                        requires: ["hasSubscription"],
                        expression: "hasSubscription && " + Utilities.isRunningOnElectron()
                    }
                },
                boundArguments: {
                    displayName: {
                        attribute: "name"
                    },
                    producerNamespace: {
                        value: "Azure.Producers.Storage.GetSingleBlobContainerByName"
                    },
                    producerArgs: {
                        boundArguments: {
                            connectionString: {
                                attribute: "connectionString"
                            },
                            id: {
                                attribute: "id"
                            },
                            searchQuery: {
                                attribute: "name"
                            }
                        }
                    }
                }
            }
        ]
    };
    /**
     * Public access level
     */
    AzureBlobContainerPiecesConfig.PublicAccessLevel = {
        aliases: ["Azure.Blob.Pieces.PublicAccessLevel"],
        actions: [
            {
                // localize
                displayName: {
                    value: "Set Public Access Level..."
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Blob.safeSetContainerPublicAccessLevel",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    },
                    publicReadAccess: {
                        attribute: "publicReadAccess"
                    }
                }
            }
        ],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.BlobContainers.PublicReadAccess", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "publicReadAccess"
                }
            }
        ]
    };
    /**
     * Last Modified property
     */
    AzureBlobContainerPiecesConfig.LastModified = {
        aliases: ["Azure.Blob.Pieces.LastModified"],
        properties: [
            {
                displayName: {
                    resource: { resourceId: "Properties.BlobContainers.LastModified", namespace: AzureResources.commonNamespace }
                },
                binding: {
                    attribute: "lastModified"
                }
            }
        ]
    };
    /**
     * SAS/SAP
     */
    AzureBlobContainerPiecesConfig.SasSapManagement = {
        aliases: ["Azure.Blob.Pieces.SasSapManagement"],
        actions: [
            {
                // localize
                displayName: {
                    value: "Get Shared Access Signature..."
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Blob.generateBlobContainerSharedAccessSignature",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    }
                }
            },
            {
                // localize
                displayName: {
                    value: "Manage Access Policies..."
                },
                isDefault: false,
                visible: {
                    value: Utilities.isRunningOnElectron()
                },
                namespace: "Azure.Actions.Storage.Blob.manageBlobContainerAccessControlList",
                boundArguments: {
                    connectionString: {
                        attribute: "connectionString"
                    },
                    name: {
                        attribute: "name"
                    }
                }
            }
        ]
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AzureBlobContainerPiecesConfig;
});
