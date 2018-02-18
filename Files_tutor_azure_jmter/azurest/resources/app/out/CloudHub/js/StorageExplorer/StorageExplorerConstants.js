/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Contains all the constants for Storage Explorer.
     */
    var StorageExplorerConstants;
    (function (StorageExplorerConstants) {
        StorageExplorerConstants.dataTable = {
            defaultHeaders: ["PartitionKey", "RowKey"]
        };
        StorageExplorerConstants.htmlAttributeNames = {
            dataTableNameAttr: "name_attr",
            dataTableContentTypeAttr: "contentType_attr",
            dataTableSnapshotAttr: "snapshot_attr",
            dataTablePartitionKeyAttr: "partitionKey_attr",
            dataTableRowKeyAttr: "rowKey_attr",
            dataTableMessageIdAttr: "messageId_attr",
            dataTableHeaderIndex: "data-column-index"
        };
        StorageExplorerConstants.cssColors = {
            commonControlsButtonActive: "#B4C7DC" /* A darker shade of [{common-controls-button-hover-background}] */
        };
        StorageExplorerConstants.cssAttrs = {
            maxWidthAttr: "max-width"
        };
        StorageExplorerConstants.htmlSelectors = {
            dataTableSelector: "#storageTable",
            dataTableAllRowsSelector: "#storageTable tbody tr",
            dataTableHeadRowSelector: ".dataTable thead tr",
            dataTableBodyRowSelector: ".dataTable tbody tr",
            dataTableScrollBodySelector: ".dataTables_scrollBody",
            dataTableHeaderTypeSelector: "table thead th",
            dataTablePaginationButtonSelector: ".paginate_button",
            searchInputField: ".search-input",
            uploadDropdownSelector: "#upload-dropdown",
            navigationDropdownSelector: "#navigation-dropdown",
            addressBarInputSelector: "#address-bar",
            breadCrumbsSelector: "#breadcrumb-list",
            breadCrumbItemsSelector: ".breadcrumb li a",
            paginateSelector: "#storageTable_paginate",
            dataTablesInfoSelector: "#storageTable_info",
            toolbarButtonSelector: ".toolbar button",
            selectAllDropdownSelector: "#select-all-dropdown"
        };
        StorageExplorerConstants.cssClassNames = {
            navigationCurrentChild: "navigation-current-child",
            navigationDropdownMenuItem: "dropdown-menu-item",
            navigationButton: "navigation-button",
            active: "active"
        };
        StorageExplorerConstants.buttonIds = {
            addEntity: "add-entity",
            addMessage: "add-message",
            clearQueue: "clear-queue",
            copy: "copy",
            copyEntities: "copy-entities",
            copyUrl: "copy-url",
            customizeColumns: "customize-columns",
            deleteBlobs: "delete-blobs",
            deleteItems: "delete-items",
            dequeueFirstMessage: "dequeue-first-message",
            download: "download",
            deleteEntities: "delete-entities",
            editEntity: "edit-entity",
            executeQuery: "execute-query",
            exportEntities: "export-entities",
            importEntities: "import-entities",
            newDirectory: "new-directory",
            newFolder: "new-folder",
            openFolder: "open-folder",
            paste: "paste",
            refresh: "refresh",
            selectAll: "select-all-toggle",
            selectAllInCurrentPage: "select-page",
            selectAllInCache: "select-cached",
            getFolderStats: "get-folder-stats",
            getSelectionStats: "get-selection-stats",
            getTableStats: "get-table-stats",
            toggleQueryMode: "toggle-query-mode",
            viewMessage: "view-message",
            uploadDropdownToggle: "upload-dropdown-toggle",
            uploadFiles: "upload-files",
            uploadFolder: "upload-folder",
            connect: "connect",
            rename: "rename",
            manageSnapshots: "manage-snapshots",
            makeSnapshot: "make-snapshot",
            promoteSnapshot: "promote-snapshot"
        };
        // Localize
        StorageExplorerConstants.storageDisplayText = {
            invalidAccountWarning: "Unable to connect to the Microsoft Azure storage account. Please check your credentials and try again.",
            attachExternalStorageTitle: "Attach External Storage"
        };
        var InfoBarTypes;
        (function (InfoBarTypes) {
            InfoBarTypes[InfoBarTypes["errorLink"] = 1] = "errorLink";
            InfoBarTypes[InfoBarTypes["addAccount"] = 2] = "addAccount";
            InfoBarTypes[InfoBarTypes["selectAccount"] = 3] = "selectAccount";
            InfoBarTypes[InfoBarTypes["signUpSubscriptions"] = 4] = "signUpSubscriptions";
            InfoBarTypes[InfoBarTypes["reauthentication"] = 5] = "reauthentication";
            InfoBarTypes[InfoBarTypes["hideColumns"] = 6] = "hideColumns";
            InfoBarTypes[InfoBarTypes["other"] = 7] = "other";
        })(InfoBarTypes = StorageExplorerConstants.InfoBarTypes || (StorageExplorerConstants.InfoBarTypes = {}));
        ;
        var EntityEditorTypes;
        (function (EntityEditorTypes) {
            EntityEditorTypes[EntityEditorTypes["add"] = 1] = "add";
            EntityEditorTypes[EntityEditorTypes["edit"] = 2] = "edit";
        })(EntityEditorTypes = StorageExplorerConstants.EntityEditorTypes || (StorageExplorerConstants.EntityEditorTypes = {}));
        ;
        StorageExplorerConstants.buttonCodes = {
            None: -1,
            Left: 0,
            Middle: 1,
            Right: 2
        };
        StorageExplorerConstants.ContentTypes = {
            Folder: "Folder",
            ImagePrefix: "image/",
            Json: "application/json",
            TextPrefix: "text/",
            VideoPrefix: "video/"
        };
        var block = "block";
        StorageExplorerConstants.BlobTypes = {
            Block: block,
            Page: "page",
            Append: "append",
            Default: block
        };
        StorageExplorerConstants.MessageKeyNames = {
            MessageId: "MessageId"
        };
        StorageExplorerConstants.EntityKeyNames = {
            PartitionKey: "PartitionKey",
            RowKey: "RowKey",
            Timestamp: "Timestamp",
            Metadata: ".metadata",
            Etag: "etag"
        };
        StorageExplorerConstants.EdmTypePrefix = "Edm.";
        StorageExplorerConstants.EdmType = {
            String: "Edm.String",
            Boolean: "Edm.Boolean",
            Binary: "Edm.Binary",
            DateTime: "Edm.DateTime",
            Double: "Edm.Double",
            Guid: "Edm.Guid",
            Int32: "Edm.Int32",
            Int64: "Edm.Int64"
        };
        StorageExplorerConstants.DisplayedEdmType = {
            String: "String",
            Boolean: "Boolean",
            Binary: "Binary",
            DateTime: "DateTime",
            Double: "Double",
            Guid: "Guid",
            Int32: "Int32",
            Int64: "Int64"
        };
        StorageExplorerConstants.InputType = {
            Text: "text",
            // Chrome doesn't support datetime, instead, datetime-local is supported.
            DateTime: "datetime-local",
            Number: "number"
        };
        StorageExplorerConstants.ClauseRule = {
            And: "And",
            Or: "Or"
        };
        StorageExplorerConstants.Operator = {
            EqualTo: "==",
            GreaterThan: ">",
            GreaterThanOrEqualTo: ">=",
            LessThan: "<",
            LessThanOrEqualTo: "<=",
            NotEqualTo: "<>",
            Equal: "="
        };
        StorageExplorerConstants.ODataOperator = {
            EqualTo: "eq",
            GreaterThan: "gt",
            GreaterThanOrEqualTo: "ge",
            LessThan: "lt",
            LessThanOrEqualTo: "le",
            NotEqualTo: "ne"
        };
        StorageExplorerConstants.Time = {
            MillisecondsPerSecond: 1000
        };
        StorageExplorerConstants.ErrorNames = {
            NetworkTimeoutError: "NetworkTimeoutError"
        };
        StorageExplorerConstants.connectWizardSteps = {
            summary: "summary",
            addWithSas: "addWithSas",
            addStorageAccountKey: "addStorageAccountKey",
            azureSignIn: "azureSignIn",
            connectOptions: "default-panel",
            signInToNationalAzure: "signInToNationalAzure",
            signInSpinner: "signInSpinner",
            customEnvironment: "customEnvironment"
        };
        StorageExplorerConstants.timeOptions = {
            lastHour: "Last hour",
            last24Hours: "Last 24 hours",
            last7Days: "Last 7 days",
            last31Days: "Last 31 days",
            last365Days: "Last 365 days",
            currentMonth: "Current month",
            currentYear: "Current year",
            custom: "Custom..."
        };
        /* Query builder (future use)
            export var ClauseRule = {
                And: "And",
                Or: "Or"
            };
    
            export var Operator = {
                EqualTo: "==",
                GreaterThan: ">",
                GreaterThanOrEqualTo: ">=",
                LessThan: "<",
                LessThanOrEqualTo: "<=",
                NotEqualTo: "<>"
            };
    
            export var ODataOperator = {
                EqualTo: "eq",
                GreaterThan: "gt",
                GreaterThanOrEqualTo: "ge",
                LessThan: "lt",
                LessThanOrEqualTo: "le",
                NotEqualTo: "ne"
            };
        */
    })(StorageExplorerConstants || (StorageExplorerConstants = {}));
    return StorageExplorerConstants;
});
