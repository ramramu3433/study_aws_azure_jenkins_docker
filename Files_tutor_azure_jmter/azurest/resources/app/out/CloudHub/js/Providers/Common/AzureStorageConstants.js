/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * Contains constants for azure storage.
     */
    var AzureStorageConstants;
    (function (AzureStorageConstants) {
        AzureStorageConstants.transportProtocol = {
            http: "http",
            https: "https"
        };
        AzureStorageConstants.connectionStringTemplate = {
            defaultEndpoint: "DefaultEndpointsProtocol=%(transportProtocol)s;AccountName=%(accountName)s;AccountKey=%(accountKey)s",
            customEndpoint: "BlobEndpoint=%(transportProtocol)s://%(accountName)s.blob.%(endpointsDomain)s;" +
                "FileEndpoint=%(transportProtocol)s://%(accountName)s.file.%(endpointsDomain)s;" +
                "QueueEndpoint=%(transportProtocol)s://%(accountName)s.queue.%(endpointsDomain)s;" +
                "TableEndpoint=%(transportProtocol)s://%(accountName)s.table.%(endpointsDomain)s;" +
                "AccountName=%(accountName)s;AccountKey=%(accountKey)s;DefaultEndpointsProtocol=%(transportProtocol)s"
        };
        AzureStorageConstants.localEndpoints = {
            // The endpoints for local/development/emulator storage.
            LocalBlobEndpoint: "http://127.0.0.1:10000/devstoreaccount1",
            LocalQueueEndpoint: "http://127.0.0.1:10001/devstoreaccount1",
            LocalTableEndpoint: "http://127.0.0.1:10002/devstoreaccount1"
        };
        AzureStorageConstants.connectionStringKeys = {
            useDevelopmentStorage: "UseDevelopmentStorage",
            defaultEndpointsProtocol: "DefaultEndpointsProtocol",
            endpointSuffix: "EndpointSuffix",
            blobEndpoint: "BlobEndpoint",
            fileEndpoint: "FileEndpoint",
            queueEndpoint: "QueueEndpoint",
            tableEndpoint: "TableEndpoint",
            accountName: "AccountName",
            accountKey: "AccountKey",
            sharedAccessSignature: "SharedAccessSignature"
        };
        AzureStorageConstants.BlobContainerClipboardFormat = "CloudHub.Azure.Storage.BlobContainer";
        AzureStorageConstants.FileShareClipboardFormat = "CloudHub.Azure.Storage.FileShare";
        AzureStorageConstants.BlobsClipboardFormat = "CloudHub.Azure.Storage.Blobs";
        AzureStorageConstants.FilesClipboardFormat = "CloudHub.Azure.Storage.Files";
        AzureStorageConstants.TableClipboardFormat = "CloudHub.Azure.Storage.Table";
        AzureStorageConstants.AzureBlobCopyStatus = {
            Pending: "pending",
            Success: "success",
            Aborted: "aborted",
            Failed: "failed"
        };
        AzureStorageConstants.sasResourceTypes = {
            account: "account",
            blob: "blob",
            file: "file",
            table: "table",
            queue: "queue"
        };
        AzureStorageConstants.storageEndpointTypes = {
            blob: ".blob.",
            file: ".file.",
            queue: ".queue.",
            table: ".table."
        };
        AzureStorageConstants.editorNamespace = {
            blobContainer: "BlobContainer",
            table: "Table",
            queue: "Queue",
            fileShare: "FileShare"
        };
        AzureStorageConstants.nodeTypes = {
            blobContainer: "Azure.BlobContainer",
            blobContainerInSasAccount: "Azure.BlobContainerInSasAccount",
            blobContainerGroup: "Azure.BlobContainerGroup",
            fileShare: "Azure.FileShare",
            fileShareGroup: "Azure.FileShareGroup",
            sasBlobContainer: "Azure.SASBlobContainer",
            sasBlobContainerGroup: "Azure.SASBlobContainerGroup",
            sasFileShare: "Azure.SASFileShare",
            sasFileShareGroup: "Azure.SASFileShareGroup",
            queue: "Azure.Queue",
            queueGroup: "Azure.QueueGroup",
            sasQueue: "Azure.SASQueue",
            sasQueueGroup: "Azure.SASQueueGroup",
            sasTable: "Azure.SASTable",
            sasTableGroup: "Azure.SASTableGroup",
            table: "Azure.Table",
            tableGroup: "Azure.TableGroup"
        };
        AzureStorageConstants.endpointsDomain = {
            default: "core.windows.net",
            chinaAzure: "core.chinacloudapi.cn"
        };
        AzureStorageConstants.deeplinkParameterNames = {
            accountid: "accountid",
            subscriptionId: "subscriptionid",
            resourceType: "resourcetype",
            resourceName: "resourcename"
        };
        AzureStorageConstants.editablePropertiesNames = ["contentType", "contentEncoding", "contentLanguage", "contentMD5", "cacheControl", "contentDisposition"];
        // using this api version as is it currently (1/27/2017) the API version which Azure Stack requires
        AzureStorageConstants.defaultCustomApiVersion = "2015-04-05";
        AzureStorageConstants.customProvidersKey = "Standalone_UserAccountsManager_CustomProviders_v1";
        AzureStorageConstants.azureEnvironmentValue = {
            azure: "azure",
            mooncake: "mooncake",
            blackForest: "blackforest",
            fairFax: "fairfax",
            azureStack: "azurestack"
        };
        AzureStorageConstants.azureStackEnvironmentDefaults = {
            environmentDisplayName: "Azure Stack Environment",
            host: "https://login.windows.net",
            signInResourceId: "SignInResourceId is missing",
            graphResource: "https://graph.windows.net",
            armId: "ArmId is missing",
            armEndpoint: ""
        };
        AzureStorageConstants.azureEnvironments = [
            { action: "use", value: AzureStorageConstants.azureEnvironmentValue.azure, displayValue: "Azure" },
            { action: "use", value: AzureStorageConstants.azureEnvironmentValue.mooncake, displayValue: "Azure China" },
            { action: "use", value: AzureStorageConstants.azureEnvironmentValue.blackForest, displayValue: "Azure Germany" },
            { action: "use", value: AzureStorageConstants.azureEnvironmentValue.fairFax, displayValue: "Azure US Government" },
            { action: "use", value: AzureStorageConstants.azureEnvironmentValue.azureStack, displayValue: "Azure Stack Environment" }
        ];
        AzureStorageConstants.azureStackArmEndpointHelpLink = "https://go.microsoft.com/fwlink/?linkid=856120";
        function isPublicAzureEnvironment(value) {
            return value !== AzureStorageConstants.azureEnvironmentValue.azureStack;
        }
        AzureStorageConstants.isPublicAzureEnvironment = isPublicAzureEnvironment;
        ;
    })(AzureStorageConstants || (AzureStorageConstants = {}));
    return AzureStorageConstants;
});
