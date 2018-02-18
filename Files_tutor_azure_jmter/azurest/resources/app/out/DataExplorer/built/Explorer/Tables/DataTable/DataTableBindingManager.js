/// <amd-dependency path="datatables">
define(["require", "exports", "knockout", "underscore", "../Constants", "./DataTableBuilder", "./DataTableOperationManager", "./DataTableOperations", "../Utilities", "datatables"], function (require, exports, ko, _, Constants, DataTableBuilder, DataTableOperationManager, DataTableOperations, Utilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Custom binding manager of datatable
     */
    var tableEntityListViewModelMap = {};
    function bindDataTable(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var tableEntityListViewModel = bindingContext.$data;
        tableEntityListViewModel.notifyColumnChanges = onTableColumnChange;
        var $dataTable = $(element);
        var queryTablesTab = bindingContext.$parent;
        var operationManager = new DataTableOperationManager($dataTable, tableEntityListViewModel, queryTablesTab.tableCommands);
        tableEntityListViewModelMap[queryTablesTab.tabId] = { tableViewModel: tableEntityListViewModel, operationManager: operationManager, $dataTable: $dataTable };
        createDataTable(0, tableEntityListViewModel, queryTablesTab); // Fake a DataTable to start.
        $(window).resize(updateTableScrollableRegionHeight);
        operationManager.focusTable(); // Also selects the first row if needed.
    }
    function onTableColumnChange(enablePrompt, queryTablesTab) {
        if (enablePrompt === void 0) { enablePrompt = true; }
        var columnsFilter = null;
        var tableEntityListViewModel = tableEntityListViewModelMap[queryTablesTab.tabId].tableViewModel;
        createDataTable(tableEntityListViewModel.tablePageStartIndex, tableEntityListViewModel, queryTablesTab, true, columnsFilter);
        if (queryTablesTab.queryViewModel()) {
            queryTablesTab.queryViewModel().queryBuilderViewModel().updateColumnOptions();
        }
    }
    function createDataTable(startIndex, tableEntityListViewModel, queryTablesTab, destroy, columnsFilter) {
        if (destroy === void 0) { destroy = false; }
        if (columnsFilter === void 0) { columnsFilter = null; }
        var $dataTable = tableEntityListViewModelMap[queryTablesTab.tabId].$dataTable;
        if (destroy) {
            // Find currently displayed columns.
            var currentColumns = tableEntityListViewModel.headers;
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
            "colReorder": true,
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
                "sInfo": "Results _START_ - _END_ of _TOTAL_",
                "oPaginate": {
                    "sFirst": "<<",
                    "sNext": ">",
                    "sPrevious": "<",
                    "sLast": ">>"
                },
                "sProcessing": "<img style=\"width: 36px; height: 36px; \" src=\"images/QueryBuilder/Halo_ProgressSpinner.svg\">"
            },
            "destroy": destroy,
            "bInfo": true,
            "bLength": false,
            "bLengthChange": false,
            "scrollX": true,
            "scrollCollapse": true,
            "iDisplayLength": 100,
            "serverSide": true,
            "ajax": queryTablesTab.tabId,
            "fnServerData": getServerData,
            "fnRowCallback": bindClientId,
            "fnInitComplete": initializeTable,
            "fnDrawCallback": updateSelectionStatus
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
            if (displayedValue === "" && data.$ === Constants.EdmType.String) {
                displayedValue = " ";
            }
        }
        return displayedValue;
    }
    function getServerData(sSource, aoData, fnCallback, oSettings) {
        tableEntityListViewModelMap[oSettings.ajax].tableViewModel.renderNextPageAndupdateCache(sSource, aoData, fnCallback, oSettings);
    }
    /**
     * Bind table data information to row element so that we can track back to the table data
     * from UI elements.
     */
    function bindClientId(nRow, aData) {
        $(nRow).attr(Constants.htmlAttributeNames.dataTablePartitionKeyAttr, aData.PartitionKey._);
        $(nRow).attr(Constants.htmlAttributeNames.dataTableRowKeyAttr, aData.RowKey._);
        return nRow;
    }
    function selectionChanged(element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(".dataTable tr.selected").removeClass("selected");
        bindingContext.$data.selected().forEach(function (b) {
            var sel = DataTableOperations.getRowSelector([
                {
                    key: Constants.htmlAttributeNames.dataTablePartitionKeyAttr,
                    value: b.PartitionKey._
                },
                {
                    key: Constants.htmlAttributeNames.dataTableRowKeyAttr,
                    value: b.RowKey._
                }
            ]);
            $(sel).addClass("selected");
        });
        //selected = bindingContext.$data.selected();
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
        $(".tab-pane").each(function (index, tabElement) {
            // Add some padding to the table so it doesn't get too close to the container border.
            var dataTablePaddingBottom = 10;
            var bodyHeight = $(window).height();
            var dataTablesScrollBodyPosY = $(this).find(Constants.htmlSelectors.dataTableScrollBodySelector).offset().top;
            var dataTablesInfoElem = $(this).find(".dataTables_info");
            var dataTablesPaginateElem = $(this).find(".dataTables_paginate");
            var scrollHeight = bodyHeight - dataTablesScrollBodyPosY - dataTablesPaginateElem.outerHeight(true) - dataTablePaddingBottom;
            //info and paginate control are stacked
            if (dataTablesInfoElem.offset().top < dataTablesPaginateElem.offset().top) {
                scrollHeight -= dataTablesInfoElem.outerHeight(true);
            }
            // TODO This is a work around for setting the outerheight since we don't have access to the JQuery.outerheight(numberValue)
            // in the current version of JQuery we are using.  Ideally, we would upgrade JQuery and use this line instead:
            // $(Constants.htmlSelectors.dataTableScrollBodySelector).outerHeight(scrollHeight);
            var element = $(this).find(Constants.htmlSelectors.dataTableScrollBodySelector)[0];
            var style = getComputedStyle(element);
            var actualHeight = parseInt(style.height);
            var change = element.offsetHeight - scrollHeight;
            $(this).find((Constants.htmlSelectors.dataTableScrollBodySelector)).height((actualHeight - change));
        });
    }
    function initializeEventHandlers() {
        var $headers = $(Constants.htmlSelectors.dataTableHeaderTypeSelector);
        var $firstHeader = $headers.first();
        var firstIndex = $firstHeader.attr(Constants.htmlAttributeNames.dataTableHeaderIndex);
        $headers.on("keydown", function (event) {
            Utilities.onEnter(event, function ($sourceElement) {
                $sourceElement.css("background-color", Constants.cssColors.commonControlsButtonActive);
            });
            // Bind shift+tab from first header back to search input field
            Utilities.onTab(event, function ($sourceElement) {
                var sourceIndex = $sourceElement.attr(Constants.htmlAttributeNames.dataTableHeaderIndex);
                if (sourceIndex === firstIndex) {
                    event.preventDefault();
                }
            }, /* metaKey */ null, /* shiftKey */ true, /* altKey */ null);
            // Also reset color if [shift-] tabbing away from button while holding down 'enter'
            Utilities.onTab(event, function ($sourceElement) {
                $sourceElement.css("background-color", "");
            });
        }).on("keyup", function (event) {
            Utilities.onEnter(event, function ($sourceElement) {
                $sourceElement.css("background-color", "");
            });
        });
    }
    function updateSelectionStatus(oSettings) {
        var $dataTableRows = $(Constants.htmlSelectors.dataTableAllRowsSelector);
        if ($dataTableRows) {
            for (var i = 0; i < $dataTableRows.length; i++) {
                var $row = $dataTableRows.eq(i);
                var partitionKey = $row.attr(Constants.htmlAttributeNames.dataTablePartitionKeyAttr);
                var rowKey = $row.attr(Constants.htmlAttributeNames.dataTableRowKeyAttr);
                var table = tableEntityListViewModelMap[oSettings.ajax].tableViewModel;
                if (table.isItemSelected(table.getTableEntityKeys(partitionKey, rowKey))) {
                    $row.addClass("selected");
                }
            }
        }
        updateDataTableFocus(oSettings.ajax);
        DataTableOperations.setPaginationButtonEventHandlers();
    }
    // TODO consider centralizing this "post-command" logic into some sort of Command Manager entity.
    // See VSO:166520: "[Storage Explorer] Consider adding a 'command manager' to track command post-effects."
    function updateDataTableFocus(queryTablesTabId) {
        var $activeElement = $(document.activeElement);
        var isFocusLost = $activeElement.is("body"); // When focus is lost, "body" becomes the active element.
        var storageExplorerFrameHasFocus = document.hasFocus();
        var operationManager = tableEntityListViewModelMap[queryTablesTabId].operationManager;
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
    ko.bindingHandlers.readOnly = {
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (value) {
                element.setAttribute("readOnly", true);
            }
            else {
                element.removeAttribute("readOnly");
            }
        }
    };
});
