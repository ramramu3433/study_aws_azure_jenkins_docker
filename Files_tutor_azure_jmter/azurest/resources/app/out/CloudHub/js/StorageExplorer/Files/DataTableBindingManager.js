/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "Common/Utilities", "StorageExplorer/Common/DataTableOperations", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities", "Common/DataTableBuilder", "StorageExplorer/Files/DataTableOperationManager", "datatables", "datatables-colReorder", "datatables-colResize", "jquery-contextMenu"], function (require, exports, ko, Utilities, DataTableOperations, StorageExplorerConstants, StorageExplorerUtilities, DataTableBuilder, DataTableOperationManager) {
    "use strict";
    /**
     * Custom binding manager for the File Editor's datatable
     */
    var fileListViewModel;
    var fileExplorerViewModel;
    var operationManager;
    var dataTableElem;
    var selected;
    var fileExtensionToIcon = {};
    buildIconMap();
    function bindDataTable(element, valueAccessor, allBindings, viewModel, bindingContext) {
        fileListViewModel = bindingContext.$data;
        dataTableElem = $(element);
        fileExplorerViewModel = bindingContext.$parent;
        operationManager = new DataTableOperationManager(dataTableElem, fileListViewModel, fileExplorerViewModel.fileCommands);
        operationManager.bind();
        fileListViewModel.bind(operationManager);
        fileListViewModel.table = DataTableBuilder.createDataTable(dataTableElem, getDataTableSettings());
        $(window).resize(updateTableScrollableRegionHeight);
        operationManager.focusTable(); // Also selects the first row if needed.
    }
    function getDataTableSettings() {
        return {
            "dom": "RZlfrtip",
            "oColReorder": {
                "iFixedColumns": 1
            },
            "bPaginate": true,
            "pagingType": "full_numbers",
            "bProcessing": true,
            "oLanguage": {
                "sEmptyTable": "No data available in this file share",
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
            "stateSave": false,
            "bFilter": true,
            "bInfo": true,
            "bLength": false,
            "bLengthChange": false,
            "scrollX": true,
            "scrollCollapse": true,
            "iDisplayLength": 100,
            "aaSorting": [[0, "asc"]],
            "serverSide": true,
            "fnServerData": getServerData,
            "aoColumns": [
                // WARNING!!! SECURITY: If you add new columns, make sure you encode them if they are user strings from Azure (see encodeText)
                // so that they don't get interpreted as HTML in our page.
                {
                    "sTitle": "Name",
                    "mData": "FileName",
                    "mRender": bindIcon,
                    "sClass": "nameColumnText"
                },
                {
                    "sTitle": "Size",
                    "data": "Size",
                    "bSearchable": false,
                    "sType": "num",
                    "mRender": formatSize,
                    "defaultContent": "",
                    "sClass": "textRight"
                }
            ],
            "fnRowCallback": bindClientId,
            "fnInitComplete": initializeTable,
            "fnDrawCallback": updateSelectionStatus
        };
    }
    function getServerData(sSource, aoData, fnCallback, oSettings) {
        fileListViewModel.renderNextPageAndupdateCache(sSource, aoData, fnCallback, oSettings);
    }
    ;
    /**
     * Bind table data information to row element so that we can track back to the table data
     * from UI elements.
     */
    function bindClientId(nRow, aData) {
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr, aData.FullName);
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr, aData.ContentType);
        $(nRow).attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr, "");
        return nRow;
    }
    function selectionChanged(element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(".dataTable tr.selected").removeClass("selected");
        bindingContext.$data.selected().forEach(function (item) {
            var selector = DataTableOperations.getRowSelector([
                {
                    key: StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr,
                    value: item.FullName
                },
                {
                    key: StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr,
                    value: item.ContentType
                }
            ]);
            $(selector).addClass("selected");
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
        var bodyHeight = dataTableElem.parents("body").height();
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
        var dataTableRows = $(StorageExplorerConstants.htmlSelectors.dataTableAllRowsSelector);
        if (dataTableRows) {
            for (var i = 0; i < dataTableRows.length; i++) {
                var row = dataTableRows.eq(i);
                var name = row.attr(StorageExplorerConstants.htmlAttributeNames.dataTableNameAttr);
                var contentType = row.attr(StorageExplorerConstants.htmlAttributeNames.dataTableContentTypeAttr);
                var snapshot = row.attr(StorageExplorerConstants.htmlAttributeNames.dataTableSnapshotAttr);
                if (fileListViewModel.isItemSelected(fileListViewModel.getFlobKeys(name, contentType, snapshot))) {
                    row.addClass("selected");
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
    // Builds a dictionary of file extension to icon to use
    function buildIconMap() {
        fileExtensionToIcon = {};
        var icons = {
            "Image_16x.png": [
                ".bmp",
                ".eps",
                ".gif",
                ".jpeg",
                ".jpg",
                ".jif",
                ".jiff",
                ".jp2",
                ".jpx",
                ".j2k",
                ".j2c",
                ".fpx",
                ".pcd",
                ".pct",
                ".pds",
                ".pict",
                ".png",
                ".pps",
                ".ppt",
                ".pptx",
                ".pdf",
                ".ps",
                ".svg",
                ".tga",
                ".tif",
                ".tiff",
                ".3dm",
                ".3ds",
                ".max",
                ".obj"
            ],
            "Video_16x.png": [
                ".3g2",
                ".3gp",
                ".asf",
                ".avi",
                ".flv",
                ".m4v",
                ".mov",
                ".mp4",
                ".mpg",
                ".rm",
                ".srt",
                ".swf",
                ".vob",
                ".wmv"
            ],
            "JSONScript_16x.png": [
                ".json"
            ],
            "TextFile_16x.png": [
                ".doc",
                ".docx",
                ".rtf",
                ".tex",
                ".txt",
                ".text",
                ".wpd",
                ".wps",
                ".readme"
            ],
            "FileTypes/HardDrive_16x.png": [
                ".vhd",
                ".vhdx"
            ]
        };
        for (var icon in icons) {
            icons[icon].forEach(function (extension) {
                fileExtensionToIcon[extension] = icon;
            });
        }
    }
    // Files don't currently support contentType, so the icon to use should depend on the extension
    function bindIcon(data, type, item) {
        var icon;
        if (item.ContentType === StorageExplorerConstants.ContentTypes.Folder) {
            // Folders
            icon = "Folder_16x.png";
        }
        else {
            icon = fileExtensionToIcon[Utilities.getFileExtension(item.FileName).toLowerCase()];
        }
        if (!icon) {
            // Generic blob/file icon
            icon = "Document_16x.png";
        }
        var imageHtml = "<img src=\"../../../images/StorageExplorer/" + icon + "\"/>";
        return imageHtml + "&nbsp;&nbsp;" + Utilities.htmlEncode(data);
    }
    function formatSize(data, type, ignoredItem) {
        if (data !== undefined) {
            return Utilities.formatSize(Number(data));
        }
        else {
            return "";
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
