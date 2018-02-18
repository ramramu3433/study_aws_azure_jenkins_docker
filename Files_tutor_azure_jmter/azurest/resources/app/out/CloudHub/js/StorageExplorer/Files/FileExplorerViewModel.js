/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "StorageExplorer/Configurable/ContextMenu", "StorageExplorer/Configurable/Toolbar/Toolbar", "StorageExplorer/Files/FileExplorerContext", "StorageExplorer/Files/FileCommands", "StorageExplorer/Files/FileListViewModel", "StorageExplorer/Common/NavigationViewModel", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/AddressBarViewModel", "../../CloudExplorer/DaytonaTabMessengerProxy"], function (require, exports, ko, ContextMenu_1, Toolbar_1, FileExplorerContext_1, FileCommands_1, FileListViewModel_1, NavigationViewModel, StorageExplorerConstants, AddressBarViewModel_1, DaytonaTabMessengerProxy_1) {
    "use strict";
    /**
     * View model for the entire Storage Explorer document window for files.
     */
    var FileExplorerViewModel = (function () {
        function FileExplorerViewModel() {
            var _this = this;
            /* Observables */
            this.fileListViewModel = ko.observable();
            this.toolbarViewModel = ko.observable();
            this.addressBarViewModel = ko.observable();
            this.navigationViewModel = ko.observable();
            this.searchText = ko.observable("");
            this.searchPlaceholder = ko.observable("Search by prefix");
            this._setFocus = function () {
                _this.toolbarViewModel().focus();
            };
            this._logTelemetry = function (action) {
                _this.fileExplorerContext.telemetry.sendEvent("StorageExplorer.FileEditor.Toolbar", {
                    "Action": action
                });
            };
            this.dataTableSearch = function () {
                _this.fileListViewModel().search(_this.searchText());
            };
            this._selected = ko.pureComputed(function () { return _this.fileListViewModel().selected(); });
            this._areItemsSelected = ko.pureComputed(function () { return _this._selected().length > 0; });
            this._showUpload = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canUpload = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._uploadFiles = function () {
                _this._logTelemetry("uploadFiles");
                return _this.fileCommands.showUploadFilesDialog(_this.fileListViewModel().currentFolderPath(), _this.fileListViewModel())
                    .then(function () {
                    // Showing the dialog loses the focus, giving it to the data table when we return from the dialog.
                    _this.fileListViewModel().focusDataTable();
                });
            };
            this._uploadFolder = function () {
                _this._logTelemetry("uploadFolder");
                return _this.fileCommands.showUploadFolderDialog(_this.fileListViewModel().currentFolderPath(), _this.fileListViewModel())
                    .then(function () {
                    // Showing the dialog loses the focus, giving it to the data table when we return from the dialog.
                    _this.fileListViewModel().focusDataTable();
                });
            };
            this._download = function () {
                _this._logTelemetry("download");
                return _this.fileCommands.showDownloadDialog(_this._selected(), _this.fileListViewModel().currentFolderPath())
                    .then(function () {
                    // Showing the dialog loses the focus, giving it to the data table when we return from the dialog.
                    _this.fileListViewModel().focusDataTable();
                });
            };
            this._canOpenFolder = ko.pureComputed(function () { return _this.fileCommands.isEnabled(FileCommands_1.default.openCommand, _this._selected()); });
            this._openFolder = function () {
                _this._logTelemetry("openFolder");
                _this.fileCommands.openSelected(_this.fileListViewModel());
            };
            this._copyUrl = function () {
                _this._logTelemetry("copyUrl");
                return _this.fileCommands.copyUrl(_this._selected(), _this.fileListViewModel());
            };
            this._canCopy = ko.pureComputed(function () { return _this._areItemsSelected() && _this.fileCommands.canCopy(_this._selected()); });
            this._copy = function () {
                _this._logTelemetry("copy");
                return _this.fileCommands.copyItemsToClipboard(_this._selected(), _this.fileListViewModel().currentFolderPath());
            };
            this._showPaste = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canPaste = ko.pureComputed(function () { return _this.fileCommands.canPaste(); });
            this._paste = function () {
                _this._logTelemetry("paste");
                return _this.fileCommands.startFilePasteTask(_this.fileListViewModel().currentFolderPath(), _this.fileListViewModel());
            };
            this._getSelectionStats = function () {
                _this._logTelemetry("getSelectionStats");
                _this.fileCommands.getFileStats(_this.fileListViewModel().selected(), _this.fileListViewModel().currentFolderPath());
            };
            this._getFolderStats = function () {
                _this._logTelemetry("getFolderStats");
                _this.fileCommands.getFileStats(null /*all*/, _this.fileListViewModel().currentFolderPath());
            };
            this._deleteFiles = function () {
                _this._logTelemetry("deleteFiles");
                return _this.fileCommands.startDeleteItemsTask(_this.fileListViewModel());
            };
            this._refresh = function () {
                _this._logTelemetry("refresh");
                return _this._reloadTable();
            };
            this._showRename = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canRename = ko.pureComputed(function () { return _this.fileCommands.canRename(_this._selected()); });
            this._rename = function () {
                _this._logTelemetry("rename");
                var promise = _this.fileCommands.startRenameTask(_this.fileListViewModel());
                promise.then(function () {
                    // Showing the dialog loses the focus, giving it to the data table when we return from the dialog.
                    _this.fileListViewModel().focusDataTable();
                });
            };
            this._connect = function () {
                _this._logTelemetry("connect");
                return _this.fileCommands.connect();
            };
            this._showNewDirectory = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._canNewDirectory = ko.pureComputed(function () { return !_this.addressBarViewModel().isFile(); });
            this._newDirectory = function () {
                _this._logTelemetry("newDirectory");
                return _this.fileCommands.newDirectory(_this.fileListViewModel()).then(function () {
                    // Showing the dialog loses the focus, giving it to the data table when we return from the dialog.
                    _this.fileListViewModel().focusDataTable();
                });
            };
            this._reloadTable = function () {
                var dataTable;
                _this.fileListViewModel().clearCache();
                _this.fileListViewModel().clearSelection();
                dataTable = _this.fileListViewModel().table.ajax.reload();
                return dataTable;
            };
            this._canGenerateSharedAccessSignature = ko.pureComputed(function () { return _this.fileCommands.isEnabled(FileCommands_1.default.generateSharedAccessSignatureCommand, _this._selected()); });
            this._generateSharedAccessSignature = function () {
                _this.fileCommands.generateSharedAccessSignature(_this._selected(), _this.fileListViewModel());
            };
            this._canViewFileProperties = ko.pureComputed(function () { return _this.fileCommands.isEnabled(FileCommands_1.default.showPropertiesCommand, _this._selected()); });
            this._viewFileProperties = function () {
                _this.fileCommands.showItemProperties(_this._selected(), _this.fileListViewModel().currentFolderPath(), _this.fileListViewModel());
            };
            this._copyAction = {
                type: "action",
                title: "Copy selected Item",
                displayName: "Copy",
                id: StorageExplorerConstants.buttonIds.copy,
                action: this._copy,
                enabled: this._canCopy,
                icon: "images/StorageExplorer/ASX_Copy.svg"
            };
            this._pasteAction = {
                type: "action",
                title: "Paste selected items",
                displayName: "Paste",
                id: StorageExplorerConstants.buttonIds.paste,
                action: this._paste,
                enabled: this._canPaste,
                visible: this._showPaste,
                icon: "images/StorageExplorer/ASX_Paste.svg"
            };
            this._deleteAction = {
                type: "action",
                title: "Delete selected items",
                displayName: "Delete",
                id: StorageExplorerConstants.buttonIds.deleteBlobs,
                action: this._deleteFiles,
                enabled: this._areItemsSelected,
                icon: "images/StorageExplorer/ASX_Delete.svg"
            };
            this._renameAction = {
                type: "action",
                title: "Rename selected blob or folder",
                displayName: "Rename",
                id: StorageExplorerConstants.buttonIds.rename,
                action: this._rename,
                enabled: this._canRename,
                visible: this._showRename,
                icon: "images/StorageExplorer/ASX_Rename.svg"
            };
            this._downloadAction = {
                type: "action",
                title: "Download selected items",
                displayName: "Download",
                id: StorageExplorerConstants.buttonIds.download,
                action: function () {
                    _this._download();
                },
                enabled: this._areItemsSelected,
                icon: "images/StorageExplorer/ASX_TransferDownload.svg"
            };
            this._openAction = {
                type: "action",
                title: "Open selected item",
                displayName: "Open",
                id: StorageExplorerConstants.buttonIds.openFolder,
                action: this._openFolder,
                enabled: this._canOpenFolder,
                icon: "images/StorageExplorer/ASX_Open.svg"
            };
            this._copyUrlAction = {
                type: "action",
                title: "Copy URLs of selected items to clipboard",
                displayName: "Copy URL",
                id: StorageExplorerConstants.buttonIds.copyUrl,
                action: this._copyUrl,
                enabled: this._areItemsSelected,
                icon: "images/StorageExplorer/ASX_Link.svg"
            };
            this._contextMenuActionsConfig = [
                this._copyAction,
                this._pasteAction,
                this._deleteAction,
                this._renameAction,
                {
                    type: "separator"
                },
                this._downloadAction,
                this._openAction,
                {
                    type: "separator"
                },
                this._copyUrlAction,
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Get Shared Access Signature...",
                    displayName: "Get Shared Access Signature...",
                    id: "generateSharedAccessSignature",
                    action: this._generateSharedAccessSignature,
                    enabled: this._canGenerateSharedAccessSignature
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "File statistics for current selection",
                    displayName: "Selection Statistics",
                    id: StorageExplorerConstants.buttonIds.getSelectionStats,
                    action: this._getSelectionStats,
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_AutoSum.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Properties for current item",
                    displayName: "Properties...",
                    id: "showBlobProperties",
                    action: this._viewFileProperties,
                    enabled: this._canViewFileProperties,
                    icon: "images/StorageExplorer/ASX_AutoSum.svg"
                }
            ];
            this._toolbarActionsConfig = [
                {
                    type: "dropdown",
                    title: "Upload",
                    displayName: "Upload",
                    id: StorageExplorerConstants.buttonIds.uploadDropdownToggle,
                    enabled: this._canUpload,
                    visible: this._showUpload,
                    icon: "images/StorageExplorer/ASX_TransferUploadDropdown.svg",
                    subgroup: [
                        {
                            type: "action",
                            title: "Upload Files",
                            displayName: "Upload Files ...",
                            id: StorageExplorerConstants.buttonIds.uploadFiles,
                            action: function () {
                                _this._uploadFiles();
                            },
                            enabled: this._canUpload,
                            icon: "../../../images/StorageExplorer/TextFile_16x.svg"
                        },
                        {
                            type: "action",
                            title: "Upload Folder",
                            displayName: "Upload Folder ...",
                            id: StorageExplorerConstants.buttonIds.uploadFolder,
                            action: function () {
                                _this._uploadFolder();
                            },
                            enabled: this._canUpload,
                            icon: "../../../images/StorageExplorer/Folder_16x.svg"
                        }
                    ]
                },
                this._downloadAction,
                {
                    type: "separator"
                },
                this._openAction,
                {
                    type: "action",
                    title: "New Folder",
                    displayName: "New Folder",
                    id: StorageExplorerConstants.buttonIds.newFolder,
                    action: this._newDirectory,
                    enabled: this._canNewDirectory,
                    visible: this._showNewDirectory,
                    icon: "images/StorageExplorer/ASX_Add.svg"
                },
                this._copyUrlAction,
                {
                    type: "dropdown",
                    title: "Select all entitites",
                    displayName: "Select All",
                    id: StorageExplorerConstants.buttonIds.selectAll,
                    enabled: this._canUpload,
                    icon: "images/StorageExplorer/ASX_CheckboxCheckAllDropdown.svg",
                    subgroup: [
                        {
                            type: "action",
                            title: "Select All in Page",
                            displayName: "Select All in Page",
                            id: StorageExplorerConstants.buttonIds.selectAllInCurrentPage,
                            action: function () { return _this.selectAllInCurrentPage(); },
                            enabled: ko.observable(true),
                            icon: "../../../images/StorageExplorer/ASX_CheckboxCheckAll.svg"
                        },
                        {
                            type: "action",
                            title: "Select All Cached",
                            displayName: "Select All Cached",
                            id: StorageExplorerConstants.buttonIds.selectAllInCache,
                            action: function () { return _this.selectAllInCache(); },
                            enabled: ko.observable(true),
                            icon: "../../../images/StorageExplorer/ASX_CheckboxCheckAll.svg"
                        }
                    ]
                },
                {
                    type: "separator"
                },
                this._copyAction,
                this._pasteAction,
                {
                    type: "separator"
                },
                this._renameAction,
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Connect File Share to VM",
                    displayName: "Connect VM",
                    id: StorageExplorerConstants.buttonIds.connect,
                    action: this._connect,
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_Connect.svg"
                },
                {
                    type: "separator"
                },
                this._deleteAction,
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "File statistics for current directory and subdirectories",
                    displayName: "Directory Statistics",
                    id: StorageExplorerConstants.buttonIds.getFolderStats,
                    action: this._getFolderStats,
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_AutoSum.svg"
                },
                {
                    type: "separator"
                },
                {
                    type: "action",
                    title: "Refresh",
                    displayName: "Refresh",
                    id: StorageExplorerConstants.buttonIds.refresh,
                    action: this._refresh,
                    enabled: ko.observable(true),
                    icon: "images/StorageExplorer/ASX_Refresh.svg"
                }
            ];
            this.fileExplorerContext = new FileExplorerContext_1.default();
            window.host = this.fileExplorerContext.hostProxy;
            this.fileCommands = new FileCommands_1.default(this.fileExplorerContext);
            var fileListViewModel = new FileListViewModel_1.default(this.fileExplorerContext);
            this.fileListViewModel(fileListViewModel);
            var fileAddress = new AddressBarViewModel_1.default(this.fileListViewModel());
            this.addressBarViewModel(fileAddress);
            this.navigationViewModel(new NavigationViewModel(this.fileListViewModel(), this._logTelemetry));
            this.searchText.subscribe(function () { return _this.dataTableSearch(); });
            this.fileListViewModel().currentFolderPath.subscribe(function () { return _this.searchText(""); });
            // Must be run after all configs are setup and after all Observables are setup.
            this.toolbarViewModel(new Toolbar_1.default(this._toolbarActionsConfig, function (id) {
                _this.fileExplorerContext.telemetry.sendEvent("StorageExplorer.FileEditor.Toolbar", {
                    "Action": id
                });
            }));
            new ContextMenu_1.default(this._contextMenuActionsConfig, [".dataTable tr td", ".dataTable tr td *"], function (id) {
                _this.fileExplorerContext.telemetry.sendEvent("StorageExplorer.FileEditor.contextMenu", {
                    "Action": id
                });
            }, ".selected:last");
            // TODO: Is there any way to know when to turn this off?
            // TODO: Or a better solution?  Consider creating an event listener in environment marshaler
            // Poll for clipboard changes
            setInterval(function () {
                _this.fileCommands.checkClipboard(fileListViewModel.selected());
            }, 500);
            DaytonaTabMessengerProxy_1.default.on("tab-active", function () {
                _this._setFocus();
            });
        }
        FileExplorerViewModel.prototype.selectAllInCurrentPage = function () {
            this._logTelemetry("selectAllInCurrentPage");
            this.fileCommands.selectAllInCurrentPage(this.fileListViewModel());
            this.fileListViewModel().focusDataTable();
        };
        ;
        FileExplorerViewModel.prototype.selectAllInCache = function () {
            this._logTelemetry("selectAllInCache");
            this.fileCommands.selectAllInCache(this.fileListViewModel());
            this.fileListViewModel().focusDataTable();
        };
        FileExplorerViewModel.prototype.folderNavigateBack = function () {
            this.navigationViewModel().navigateBack();
        };
        FileExplorerViewModel.prototype.folderNavigateForward = function () {
            this.navigationViewModel().navigateForward();
        };
        FileExplorerViewModel.prototype.navigateToParentFolder = function () {
            this.navigationViewModel().navigateToParentFolder();
        };
        return FileExplorerViewModel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FileExplorerViewModel;
});
