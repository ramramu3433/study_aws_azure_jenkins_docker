/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore.string", "StorageExplorer/KeyCodes", "StorageExplorer/StorageExplorerConstants", "StorageExplorer/Common/StorageExplorerUtilities", "StorageExplorer/Common/DropdownMenuKeyboardNavigationHelper"], function (require, exports, ko, _string, KeyCodes_1, StorageExplorerConstants, StorageExplorerUtilities, DropdownMenuKeyboardNavigationHelper) {
    "use strict";
    var NavigationViewModel = (function () {
        function NavigationViewModel(folderHierarchyViewModel, logTelemetry) {
            var _this = this;
            // Always points to the current folder path or the folder just navigated to.
            this.currentFolderIndex = ko.observable();
            this.isBackwardable = ko.pureComputed(function () { return _this.currentFolderIndex() < (_this.navigationHistory().length - 1); });
            this.isForwardable = ko.pureComputed(function () { return _this.currentFolderIndex() > 0; });
            this.hasNavigationHistory = ko.pureComputed(function () {
                return _this.navigationHistory().length > 1;
            });
            this.isTopLevelFolder = ko.pureComputed(function () { return !_this.folderHierarchyViewModel.currentFolderPath() && !_this.folderHierarchyViewModel.currentFile(); });
            this.navigationDropdownExpanded = ko.observable(false);
            // Used as a stack to store the navigated folders, displaynames and corresponding css class.
            // The bigger the index, the earlier the folder was navigated.
            this.navigationHistory = ko.observableArray();
            this.navigateBack = function () {
                _this.logTelemetry("navigateBack");
                if (_this.isBackwardable()) {
                    var backwardIndex = _this.currentFolderIndex() + 1;
                    _this.navigationHistory()[_this.currentFolderIndex()].dropdownMenuItem("");
                    _this.navigationHistory()[backwardIndex].dropdownMenuItem(StorageExplorerConstants.cssClassNames.navigationCurrentChild);
                    _this.isHistoryNavigation = true;
                    _this.currentFolderIndex(backwardIndex);
                    // TODO: Judge whether the folder exists before navigating, same for forward and history clicking navigation
                    _this._navigateByNavigationRecord(_this.navigationHistory()[backwardIndex]);
                }
            };
            this.navigateForward = function () {
                _this.logTelemetry("navigateForward");
                if (_this.isForwardable()) {
                    var forwardIndex = _this.currentFolderIndex() - 1;
                    _this.navigationHistory()[_this.currentFolderIndex()].dropdownMenuItem("");
                    _this.navigationHistory()[forwardIndex].dropdownMenuItem(StorageExplorerConstants.cssClassNames.navigationCurrentChild);
                    _this.isHistoryNavigation = true;
                    _this.currentFolderIndex(forwardIndex);
                    _this._navigateByNavigationRecord(_this.navigationHistory()[forwardIndex]);
                }
            };
            this._navigateByNavigationRecord = function (navigateInfo) {
                if (navigateInfo.file) {
                    _this.folderHierarchyViewModel.navigateToFile(navigateInfo.folderPath, navigateInfo.file);
                }
                else {
                    _this.folderHierarchyViewModel.navigateToFolder(navigateInfo.folderPath);
                }
            };
            this.toggleNavigationHistory = function () {
                _this.logTelemetry("toggleNavigationHistory");
                var show = !_this.navigationDropdownExpanded();
                _this.navigationDropdownExpanded(show);
                if (show) {
                    _this.navigationDropdownMenuKeyboardNavigationHelper.attachEventHandlers();
                }
                else {
                    _this.navigationDropdownMenuKeyboardNavigationHelper.removeEventHandlers();
                }
            };
            this.navigateToParentFolder = function () {
                _this.logTelemetry("navigateToParentFolder");
                if (!_this.folderHierarchyViewModel.currentFile()) {
                    var parentFolderPath = StorageExplorerUtilities.getPrefixFromBlobName(_this.folderHierarchyViewModel.currentFolderPath());
                    _this.folderHierarchyViewModel.navigateToFolder(parentFolderPath);
                }
                else {
                    _this.folderHierarchyViewModel.navigateToFolder(_this.folderHierarchyViewModel.currentFolderPath());
                }
            };
            this.handleHistoryEvent = function (index, data) {
                _this.logTelemetry("handleClickHistory");
                _this.isHistoryNavigation = true;
                _this.navigationHistory()[_this.currentFolderIndex()].dropdownMenuItem("");
                _this.navigationHistory()[index].dropdownMenuItem(StorageExplorerConstants.cssClassNames.navigationCurrentChild);
                _this.currentFolderIndex(index);
                _this._navigateByNavigationRecord(data);
            };
            this.updateNavigationHistory = function () {
                var folderPath = _this.folderHierarchyViewModel.currentFolderPath();
                var file = _this.folderHierarchyViewModel.currentFile();
                // Shouldn't update the navigation history when it's a backward, forward or clicking dropdown history navigation.
                if (_this.isHistoryNavigation) {
                    _this.isHistoryNavigation = false;
                    return;
                }
                // If there are already 10 folder backward navigation records, remove the oldest one.
                var backwardItemsCount = _this.navigationHistory().length - _this.currentFolderIndex();
                if (backwardItemsCount >= NavigationViewModel.maxNavigatedFolders) {
                    _this.navigationHistory.pop();
                }
                // Clear the forward history if there is any.
                var forwardItemsCount = _this.currentFolderIndex();
                if (forwardItemsCount > 0) {
                    _this.navigationHistory.splice(0, forwardItemsCount);
                    _this.currentFolderIndex(0);
                }
                var folderName = StorageExplorerUtilities.getFileNameFromBlobName(folderPath);
                var displayName;
                if (file) {
                    displayName = file;
                }
                else if (_string.isBlank(folderName)) {
                    displayName = _this.containerResourceName;
                }
                else {
                    displayName = folderName;
                }
                // currentFolderIndex will point to the added folderPath.
                _this.navigationHistory.splice(_this.currentFolderIndex(), 0, {
                    folderPath: folderPath,
                    file: file,
                    displayName: displayName,
                    // Current folder in dropdown will be highlighted.
                    dropdownMenuItem: ko.observable(StorageExplorerConstants.cssClassNames.navigationCurrentChild)
                });
                // Update the previous navigated folder's style.
                var previousNavigatedFolderIndex = _this.currentFolderIndex() + 1;
                _this.navigationHistory()[previousNavigatedFolderIndex].dropdownMenuItem("");
            };
            this.onKeyDown = function (data, event) {
                var handled = StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                    var handled = false;
                    if (_this.isNavigationButton($sourceElement) || _this.isNavigationDropdownMenuItem($sourceElement)) {
                        $sourceElement.css("background-color", StorageExplorerConstants.cssColors.commonControlsButtonActive);
                        handled = true;
                    }
                    return handled;
                });
                if (!handled) {
                    // Reset color if [shift-] tabbing, 'up/down arrowing', or 'esc'-aping away from button while holding down 'enter'
                    StorageExplorerUtilities.onKeys(event, [KeyCodes_1.default.Tab, KeyCodes_1.default.UpArrow, KeyCodes_1.default.DownArrow, KeyCodes_1.default.Esc], function ($sourceElement) {
                        if (_this.isNavigationButton($sourceElement) || _this.isNavigationDropdownMenuItem($sourceElement)) {
                            $sourceElement.css("background-color", "");
                        }
                    });
                }
                return !handled;
            };
            // Note: There is one key up event each time a key is pressed; in contrast,
            // there may be more than one key down and key pressed events.
            this.onKeyUp = function (data, event) {
                var handled = StorageExplorerUtilities.onEnter(event, function ($sourceElement) {
                    var handled = false;
                    handled = _this.tryHandleNavigateEvent($sourceElement);
                    if (!handled) {
                        handled = _this.tryHandleHistoryEvent($sourceElement, data);
                    }
                    if (_this.isNavigationButton($sourceElement) || _this.isNavigationDropdownMenuItem($sourceElement)) {
                        $sourceElement.css("background-color", "");
                    }
                    return handled;
                });
                return !handled;
            };
            this.onMouseDown = function (ignoredData, event) {
                StorageExplorerUtilities.onLeftButton(event, function ($sourceElement) {
                    _this.tryHandleNavigateEvent($sourceElement);
                });
                // Always returning false to stop propagation of 'mousedown' events.
                // This prevents giving focus to the button with a mouse click.
                return false;
            };
            this.folderHierarchyViewModel = folderHierarchyViewModel;
            this.containerResourceName = this.folderHierarchyViewModel.getContainerResourceName();
            this.logTelemetry = logTelemetry;
            this.folderHierarchyViewModel.currentFolderPath.subscribe(this.updateNavigationHistory);
            this.folderHierarchyViewModel.currentFile.subscribe(this.updateNavigationHistory);
            // When a container is opened. Always at the top level folder.
            this.navigationHistory.push({
                folderPath: "",
                file: "",
                displayName: this.containerResourceName,
                dropdownMenuItem: ko.observable(StorageExplorerConstants.cssClassNames.navigationCurrentChild)
            });
            this.currentFolderIndex(0);
            this.isHistoryNavigation = false;
            this.navigationDropdownMenuKeyboardNavigationHelper = new DropdownMenuKeyboardNavigationHelper(StorageExplorerConstants.htmlSelectors.navigationDropdownSelector, this.toggleNavigationHistory);
        }
        NavigationViewModel.prototype.isNavigationButton = function ($sourceElement) {
            return $sourceElement.hasClass(StorageExplorerConstants.cssClassNames.navigationButton);
        };
        NavigationViewModel.prototype.tryHandleNavigateEvent = function ($sourceElement) {
            var id = $sourceElement.attr("id"), handled = false;
            if (this.isNavigationButton($sourceElement)) {
                switch (id) {
                    case "navigate-back":
                        this.navigateBack();
                        handled = true;
                        break;
                    case "navigate-forward":
                        this.navigateForward();
                        handled = true;
                        break;
                    case "navigate-parent":
                        this.navigateToParentFolder();
                        handled = true;
                        break;
                }
            }
            return handled;
        };
        NavigationViewModel.prototype.isNavigationDropdownMenuItem = function ($sourceElement) {
            return $sourceElement.hasClass(StorageExplorerConstants.cssClassNames.navigationDropdownMenuItem);
        };
        NavigationViewModel.prototype.tryHandleHistoryEvent = function ($sourceElement, data) {
            var context = ko.contextFor($sourceElement.get(0)), handled = false;
            if (this.isNavigationDropdownMenuItem($sourceElement)) {
                this.handleHistoryEvent(context.$index(), data);
                this.toggleNavigationHistory();
                handled = true;
            }
            return handled;
        };
        return NavigationViewModel;
    }());
    // File explorer can hold up to TEN folders navigated to before.
    NavigationViewModel.maxNavigatedFolders = 10;
    return NavigationViewModel;
});
