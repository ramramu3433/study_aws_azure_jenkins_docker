/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore", "Common/DataTableBuilder", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/Tables/DataTableOperationManager", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities", "Common/Utilities", "StorageExplorer/Dialogs/StorageExplorerKnockoutBindings", "datatables", "datatables-colReorder", "datatables-colResize", "jquery-contextMenu"], function (require, exports, ko, _, DataTableBuilder, DataTableOperations, DataTableOperationManager, StorageExplorerConstants, StorageExplorerUtilities, Utilities) {
    "use strict";
    /**
     * Custom binding manager of datatable
     */
    var $dataTable;
    var tableEntityListViewModel;
    var tableExplorerViewModel;
    var operationManager;
    var selected;
    var columnSettingsManager;
    function bindDataTable(element, valueAccessor, allBindings, viewModel, bindingContext) {
        tableEntityListViewModel = bindingContext.$data;
        $dataTable = $(element);
        tableExplorerViewModel = bindingContext.$parent;
        tableEntityListViewModel.notifyColumnChanges = onTableColumnChange;
        columnSettingsManager = tableExplorerViewModel.tableExplorerContext.columnSettingsManager;
        operationManager = new DataTableOperationManager($dataTable, tableEntityListViewModel, tableExplorerViewModel.tableCommands, tableExplorerViewModel.tableExplorerContext.telemetry);
        createDataTable(0); // Fake a DataTable to start.
        $(window).resize(updateTableScrollableRegionHeight);
        // Also resize if the body height has changed (e.g., the Query panel gets opened/closed)
        $(".toolbar").resize(updateTableScrollableRegionHeight);
        operationManager.focusTable(); // Also selects the first row if needed.
    }
    function onTableColumnChange(enablePrompt) {
        if (enablePrompt === void 0) { enablePrompt = true; }
        var columnsFilter = null;
        if (columnSettingsManager.enabled) {
            if (tableEntityListViewModel.useSetting) {
                var appliedSetting = applySetting(enablePrompt);
                if (appliedSetting) {
                    columnsFilter = appliedSetting.visible;
                }
            }
            else {
                tableEntityListViewModel.useSetting = true;
            }
        }
        createDataTable(tableEntityListViewModel.tablePageStartIndex, true, columnsFilter);
    }
    function createDataTable(startIndex, destroy, columnsFilter) {
        if (destroy === void 0) { destroy = false; }
        if (columnsFilter === void 0) { columnsFilter = null; }
        if (destroy) {
            // Find currently displayed columns.
            var currentColumns = DataTableOperations.getDataTableHeaders(tableEntityListViewModel.table);
            // Calculate how many more columns need to added to the current table.
            var columnsToAdd = _.difference(tableEntityListViewModel.headers, currentColumns).length;
            // This is needed as current solution of adding column is more like a workaround
            // The official support for dynamically add column is not yet there
            // Please track github issue https://github.com/DataTables/DataTables/issues/273 for its offical support
            for (var i = 0; i < columnsToAdd; i++) {
                $(".dataTables_scrollHead table thead tr th").eq(0).after("<th></th>");
            }
            tableEntityListViewModel.table.destroy();
            $dataTable.empty();
        }
        var jsonColTable = [];
        for (var i = 0; i < tableEntityListViewModel.headers.length; i++) {
            jsonColTable.push({
                "sTitle": tableEntityListViewModel.headers[i],
                "data": tableEntityListViewModel.headers[i],
                "aTargets": [i],
                "mRender": bindColumn,
                "visible": !!columnsFilter ? columnsFilter[i] : true
            });
        }
        tableEntityListViewModel.table = DataTableBuilder.createDataTable($dataTable, {
            // WARNING!!! SECURITY: If you add new columns, make sure you encode them if they are user strings from Azure (see encodeText)
            // so that they don't get interpreted as HTML in our page.
            "aoColumnDefs": jsonColTable,
            "stateSave": false,
            "dom": "RZlfrtip",
            "oColReorder": {
                "iFixedColumns": 1
            },
            "displayStart": startIndex,
            "bPaginate": true,
            "pagingType": "full_numbers",
            "bProcessing": true,
            "oLanguage": {
                "sInfo": "Showing _START_ to _END_ of _TOTAL_ cached items",
                "oPaginate": {
                    "sFirst": "<<",
                    "sNext": ">",
                    "sPrevious": "<",
                    "sLast": ">>"
                },
                "oAria": {
                    "paginate": {
                        "first": "First",
                        "next": "Next",
                        "previous": "Previous",
                        "last": "Last"
                    }
                },
                "sProcessing": "<img style=\"width: 36px; height: 36px; \" src=\"../../../images/Common/Halo_ProgressSpinner.svg\">"
            },
            "destroy": destroy,
            "bFilter": true,
            "bInfo": true,
            "bLength": false,
            "bLengthChange": false,
            "scrollX": true,
            "scrollCollapse": true,
            "iDisplayLength": 100,
            // aaSorting removed since we don't want a default sorting in tables, and keeping "aaSorting": [] here caused unexpected rendering artifacts e.g. selection was lost after clicking "load more"
            "serverSide": true,
            "fnServerData": getServerData,
            "fnRowCallback": bindClientId,
            "fnInitComplete": initializeTable,
            "fnDrawCallback": updateSelectionStatus
        });
    }
    /**
     * Apply saved column settings.
     * @param  {boolean=true} enablePrompt: Decide whether to prompt info bar for users to hide extra columns.
     * E.g., if user updates/adds an entity which introduces new columns, we should directly show these columns instead of continuing asking
     *      whether to hide them.
     */
    function applySetting(enablePrompt) {
        if (enablePrompt === void 0) { enablePrompt = true; }
        var columnSetting = columnSettingsManager.getColumnSetting();
        if (columnSetting) {
            // Find columns saved in the setting that are applicable to the current loaded table.
            var applicableColumns = _.intersection(tableEntityListViewModel.headers, columnSetting.columnNames);
            // Find columns not included in the saved settings.
            var unexpectedColumns = _.difference(tableEntityListViewModel.headers, applicableColumns);
            // Display the columns saved in the settings plus those just found in loaded table.
            tableEntityListViewModel.headers = columnSetting.columnNames.concat(unexpectedColumns);
            if (!Utilities.isEqual(columnSetting.columnNames, tableEntityListViewModel.headers)) {
                columnSetting.columnNames = tableEntityListViewModel.headers;
                for (var i = columnSetting.visible.length; i < tableEntityListViewModel.headers.length; i++) {
                    columnSetting.visible.push(true);
                }
                // Update columnSetting as loaded table contains columns other than the ones saved last time.
                columnSettingsManager.saveColumnSetting(columnSetting);
                if (enablePrompt) {
                    promptToHideUnexpectedColumns(unexpectedColumns, columnSetting);
                }
            }
        }
        return columnSetting;
    }
    function promptToHideUnexpectedColumns(unexpectedColumns, columnSetting) {
        // Notify users unexpected columns are displayed.
        // localize
        tableExplorerViewModel.tableExplorerContext.hostProxy.executeOperation("Environment.showInfobarMessage", [
            "There are extra columns introduced since last time you viewed the table. Do you want to hide these columns?",
            "Hide",
            StorageExplorerConstants.InfoBarTypes.hideColumns
        ]).then(function (value) {
            if (value) {
                var visible = columnSetting.visible;
                var columnCount = visible.length;
                var startToHide = visible.length - unexpectedColumns.length;
                for (var i = startToHide; i < columnCount; i++) {
                    visible[i] = false;
                }
                columnSettingsManager.saveColumnSetting(columnSetting);
                DataTableOperations.filterColumns(tableEntityListViewModel.table, visible);
            }
        });
    }
    function bindColumn(data, type, full) {
        var displayedValue = null;
        if (data) {
            displayedValue = data._;
            // SECURITY: Make sure we don't allow cross-site scripting by interpreting the values as HTML
            displayedValue = Utilities.htmlEncode(displayedValue);
            // Css' empty psuedo class can only tell the difference of whether a cell has values.
            // A cell has no values no matter it's empty or it has no such a property.
            // To distinguish between an empty cell and a non-existing property cell,
            // we add a whitespace to the empty cell so that css will treat it as a cell with values.
            if (displayedValue === "" && data.$ === StorageExplorerConstants.EdmType.String) {
                displayedValue = " ";
            }
        }
        return displayedValue;
    }
    function getServerData(sSource, aoData, fnCallback, oSettings) {
        tableEntityListViewModel.renderNextPageAndupdateCache(sSource, aoData, fnCallback, oSettings);
    }
    /**
     * Bind table data information to row element so that we can track back to the table data
     * from UI elements.
     */
    function bindClientId(nRow, aData) {
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTablePartitionKeyAttr, aData.PartitionKey._);
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTableRowKeyAttr, aData.RowKey._);
        return nRow;
    }
    function selectionChanged(element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(".dataTable tr.selected").removeClass("selected");
        bindingContext.$data.selected().forEach(function (b) {
            var sel = DataTableOperations.getRowSelector([
                {
                    key: StorageExplorerConstants.htmlAttributeNames.dataTablePartitionKeyAttr,
                    value: b.PartitionKey._
                },
                {
                    key: StorageExplorerConstants.htmlAttributeNames.dataTableRowKeyAttr,
                    value: b.RowKey._
                }
            ]);
            $(sel).addClass("selected");
        });
        selected = bindingContext.$data.selected();
    }
    function dataChanged(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // do nothing for now
    }
    function initializeTable() {
        updateTableScrollableRegionHeight();
        initializeEventHandlers();
    }
    /*
     * Update the table's scrollable region height. So the pagination control is always shown at the bottom of the page.
     */
    function updateTableScrollableRegionHeight() {
        // Add some padding to the table so it doesn't get too close to the container border.
        var dataTablePaddingBottom = 10;
        var bodyHeight = $dataTable.parents("body").height();
        var dataTablesScrollBodyPosY = $(StorageExplorerConstants.htmlSelectors.dataTableScrollBodySelector).offset().top;
        var dataTablesInfoElem = $(".dataTables_info");
        var dataTablesPaginateElem = $(".dataTables_paginate");
        var scrollHeight = bodyHeight - dataTablesScrollBodyPosY - dataTablesPaginateElem.outerHeight(true) - dataTablePaddingBottom;
        // info and paginate control are stacked
        if (dataTablesInfoElem.offset().top < dataTablesPaginateElem.offset().top) {
            scrollHeight -= dataTablesInfoElem.outerHeight(true);
        }
        $(StorageExplorerConstants.htmlSelectors.dataTableScrollBodySelector).outerHeight(scrollHeight);
    }
    function initializeEventHandlers() {
        var $headers = $(StorageExplorerConstants.htmlSelectors.dataTableHeaderTypeSelector);
        $headers.on("keydown", function (event) {
            StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                $sourceElement.css("background-color", StorageExplorerConstants.cssColors.commonControlsButtonActive);
            });
            // Also reset color if [shift-] tabbing away from button while holding down 'enter'
            StorageExplorerUtilities.onTab(event, function ($sourceElement) {
                $sourceElement.css("background-color", "");
            });
        }).on("keyup", function (event) {
            StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                $sourceElement.css("background-color", "");
            });
        });
    }
    function updateSelectionStatus() {
        var $dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector);
        if ($dataTableRows) {
            for (var i = 0; i < $dataTableRows.length; i++) {
                var $row = $dataTableRows.eq(i);
                var partitionKey = $row.attr(StorageExplorerConstants.htmlAttributeNames.dataTablePartitionKeyAttr);
                var rowKey = $row.attr(StorageExplorerConstants.htmlAttributeNames.dataTableRowKeyAttr);
                if (tableEntityListViewModel.isItemSelected(tableEntityListViewModel.getTableEntityKeys(partitionKey, rowKey))) {
                    $row.addClass("selected");
                }
            }
        }
        updateDataTableFocus();
        DataTableOperations.setPaginationButtonEventHandlers();
    }
    // TODO consider centralizing this "post-command" logic into some sort of Command Manager entity.
    // See VSO:166520: "[Storage Explorer] Consider adding a 'command manager' to track command post-effects."
    function updateDataTableFocus() {
        var $activeElement = $(document.activeElement);
        var isFocusLost = $activeElement.is("body"); // When focus is lost, "body" becomes the active element.
        var storageExplorerFrameHasFocus = document.hasFocus();
        if (operationManager) {
            if (isFocusLost && storageExplorerFrameHasFocus) {
                // We get here when no control is active, meaning that the table update was triggered
                // from a dialog, the context menu or by clicking on a toolbar control or header.
                // Note that giving focus to the table also selects the first row if needed.
                // The document.hasFocus() ensures that the table will only get focus when the
                // focus was lost (i.e. "body has the focus") within the Storage Explorer frame
                // i.e. not when the focus is lost because it is in another frame
                // e.g. a daytona dialog or in the Activity Log.
                operationManager.focusTable();
            }
            else {
                // If some control is active, we don't give focus back to the table,
                // just select the first row if needed (empty selection).
                operationManager.selectFirstIfNeeded();
            }
        }
    }
    ko.bindingHandlers.tableSource = {
        init: bindDataTable,
        update: dataChanged
    };
    ko.bindingHandlers.tableSelection = {
        update: selectionChanged
    };
});
