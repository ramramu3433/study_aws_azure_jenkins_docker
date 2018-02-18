define(["require", "exports"], function (require, exports) {
    "use strict";
    var Constants;
    (function (Constants) {
        Constants.EdmType = {
            String: "Edm.String",
            Boolean: "Edm.Boolean",
            Binary: "Edm.Binary",
            DateTime: "Edm.DateTime",
            Double: "Edm.Double",
            Guid: "Edm.Guid",
            Int32: "Edm.Int32",
            Int64: "Edm.Int64"
        };
        Constants.DisplayedEdmType = {
            String: "String",
            Boolean: "Boolean",
            Binary: "Binary",
            DateTime: "DateTime",
            Double: "Double",
            Guid: "Guid",
            Int32: "Int32",
            Int64: "Int64"
        };
        Constants.ClauseRule = {
            And: "And",
            Or: "Or"
        };
        Constants.Operator = {
            EqualTo: "==",
            GreaterThan: ">",
            GreaterThanOrEqualTo: ">=",
            LessThan: "<",
            LessThanOrEqualTo: "<=",
            NotEqualTo: "<>",
            Equal: "="
        };
        Constants.ODataOperator = {
            EqualTo: "eq",
            GreaterThan: "gt",
            GreaterThanOrEqualTo: "ge",
            LessThan: "lt",
            LessThanOrEqualTo: "le",
            NotEqualTo: "ne"
        };
        Constants.timeOptions = {
            lastHour: "Last hour",
            last24Hours: "Last 24 hours",
            last7Days: "Last 7 days",
            last31Days: "Last 31 days",
            last365Days: "Last 365 days",
            currentMonth: "Current month",
            currentYear: "Current year",
            custom: "Custom..."
        };
        Constants.htmlSelectors = {
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
            selectAllDropdownSelector: "#select-all-dropdown"
        };
        Constants.EntityKeyNames = {
            PartitionKey: "PartitionKey",
            RowKey: "RowKey",
            Timestamp: "Timestamp",
            Metadata: ".metadata",
            Etag: "etag"
        };
        Constants.dataTable = {
            defaultHeaders: ["PartitionKey", "RowKey"]
        };
        Constants.htmlAttributeNames = {
            dataTableNameAttr: "name_attr",
            dataTableContentTypeAttr: "contentType_attr",
            dataTableSnapshotAttr: "snapshot_attr",
            dataTablePartitionKeyAttr: "partitionKey_attr",
            dataTableRowKeyAttr: "rowKey_attr",
            dataTableMessageIdAttr: "messageId_attr",
            dataTableHeaderIndex: "data-column-index"
        };
        Constants.cssColors = {
            commonControlsButtonActive: "#B4C7DC" /* A darker shade of [{common-controls-button-hover-background}] */
        };
        Constants.clauseGroupColors = ["#ffe1ff", "#fffacd", "#f0ffff", "#ffefd5", "#f0fff0"];
        Constants.transparentColor = "transparent";
        Constants.keyCodes = {
            RightClick: 3,
            Enter: 13,
            Esc: 27,
            Tab: 9,
            LeftArrow: 37,
            UpArrow: 38,
            RightArrow: 39,
            DownArrow: 40,
            Delete: 46,
            A: 65,
            B: 66,
            C: 67,
            D: 68,
            E: 69,
            F: 70,
            G: 71,
            H: 72,
            I: 73,
            J: 74,
            K: 75,
            L: 76,
            M: 77,
            N: 78,
            O: 79,
            P: 80,
            Q: 81,
            R: 82,
            S: 83,
            T: 84,
            U: 85,
            V: 86,
            W: 87,
            X: 88,
            Y: 89,
            Z: 90,
            Period: 190,
            DecimalPoint: 110,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            Dash: 189
        };
        Constants.EdmTypePrefix = "Edm.";
        Constants.InputType = {
            Text: "text",
            // Chrome doesn't support datetime, instead, datetime-local is supported.
            DateTime: "datetime-local",
            Number: "number"
        };
    })(Constants || (Constants = {}));
    return Constants;
});
