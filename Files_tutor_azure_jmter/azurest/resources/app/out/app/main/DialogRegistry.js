"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module
 * Provides a set of IDs to uniquley identity an application dialog.
 *
 * Each ID maps to a JSON-formatted manifest file located in `app/dialogs`.
 * A manifest file specifies how a dialog is opened, such as what dimensions
 * and HTML view to use.
 */
exports.default = {
    addCollection: "AddCollection/AddCollection.json",
    addCosmosDBAccount: "AddCosmosDBAccount/AddCosmosDBAccount.json",
    addDirectory: "AddDirectory/AddDirectory.json",
    addEntity: "EntityEditor/AddEntity.json",
    addMessage: "AddMessage/AddMessage.json",
    connectDialog: "Connect/Connect.json",
    connectFileShare: "ConnectFileShare/ConnectFileShare.json",
    corsSettings: "CorsSettings/CorsSettings.json",
    customizeColumns: "CustomizeColumns/CustomizeColumns.json",
    customizeTimestamp: "CustomizeTimestamp/CustomizeTimestamp.json",
    editEntity: "EntityEditor/EditEntity.json",
    errorDetails: "Feedback/ErrorDetails.json",
    eula: "Eula/Eula.json",
    feedback: "Feedback/Feedback.json",
    flobProperties: "FlobProperties/FlobProperties.json",
    generateAccountSas: "GenerateSas/Accounts/GenerateAccountSas.json",
    generateBlobSas: "GenerateSas/Blobs/GenerateBlobSas.json",
    generateFileSas: "GenerateSas/Files/GenerateFileSas.json",
    generateQueueSas: "GenerateSas/Queues/GenerateQueueSas.json",
    generateTableSas: "GenerateSas/Tables/GenerateTableSas.json",
    importEntities: "ImportEntities/ImportEntities.json",
    manageBlobAcl: "ManageAcl/ManageBlobAcl.json",
    manageFileAcl: "ManageAcl/ManageFileAcl.json",
    manageQueueAcl: "ManageAcl/ManageQueueAcl.json",
    manageTableAcl: "ManageAcl/ManageTableAcl.json",
    nps: "NPS/Nps.json",
    options: "Options/Options.json",
    proxySettings: "ProxySettings/ProxySettings.json",
    querySelect: "QuerySelect/QuerySelect.json",
    rename: "Rename/Rename.json",
    uploadBlobs: "UploadBlobs/UploadBlobs.json",
    uploadFiles: "UploadFiles/UploadFiles.json",
    viewMessage: "ViewMessage/ViewMessage.json"
};
