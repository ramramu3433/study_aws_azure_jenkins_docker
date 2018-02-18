/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "underscore", "Common/Utilities", "StorageExplorer/Common/StorageExplorerUtilities", "StorageExplorer/StorageExplorerConstants"], function (require, exports, ko, _, Utilities, StorageExplorerUtilities, StorageExplorerConstants) {
    "use strict";
    var AddressBarViewModel = (function () {
        function AddressBarViewModel(folderHierarchyViewModel) {
            var _this = this;
            // Displayed name includes container name at the beginning.
            this.displayedCurrentFolderPath = ko.pureComputed(function () { return StorageExplorerUtilities.ensureTrailingSlash(_this.containerResourceName).concat(_this.folderHierarchyViewModel.currentFolderPath()); });
            this.breadCrumbs = ko.observableArray();
            this.hiddenBreadCrumbs = ko.observableArray();
            this.hiddenBreadCrumbsExpanded = ko.observable(false);
            this.handleClickBreadCrumb = function (data, event) {
                if (data.isCollapsed) {
                    _this.hiddenBreadCrumbsExpanded(!_this.hiddenBreadCrumbsExpanded());
                }
                else {
                    _this.navigateThroughBreadCrumb(data.path, data.file);
                }
            };
            this.folderHierarchyViewModel = folderHierarchyViewModel;
            this.containerResourceName = this.folderHierarchyViewModel.getContainerResourceName();
            this.filePrefix = ko.pureComputed(function () {
                return _this.folderHierarchyViewModel.filePrefix();
            });
            this.isFile = ko.pureComputed(function () {
                return !!_this.folderHierarchyViewModel.currentFile();
            });
            // display the container name upon opening a blob container.
            this.updateBreadCrumb();
            this.displayedCurrentFolderPath.subscribe(function (newValue) {
                _this.updateBreadCrumb();
            });
            this.folderHierarchyViewModel.currentFile.subscribe(function (file) {
                _this.updateBreadCrumb();
            });
            this.displayedCurrentFolderPath.subscribe(function (newValue) {
                _this.updateBreadCrumb();
            });
            window.onresize = function (event) {
                _this.updateBreadCrumb();
            };
        }
        AddressBarViewModel.prototype.navigateThroughBreadCrumb = function (destFolder, destFile) {
            if (destFolder && destFile) {
                this.folderHierarchyViewModel.navigateToFile(destFolder, destFile);
            }
            else {
                this.folderHierarchyViewModel.navigateToFolder(destFolder);
            }
        };
        /*
         * Update breadcrumb to current path.
         */
        AddressBarViewModel.prototype.updateBreadCrumb = function () {
            var _this = this;
            var pathTexts = Utilities.splitPath(this.displayedCurrentFolderPath());
            var file = this.folderHierarchyViewModel.currentFile();
            if (!_.last(pathTexts)) {
                pathTexts.pop();
            }
            if (pathTexts.length || file) {
                this.clearCrumb();
                var lastPathTextIndex = pathTexts.length - 1;
                // represents the path to be navigated to when clicking on the crumb.
                var pathValue = "";
                pathTexts.forEach(function (value, index) {
                    // The first element is container name, which needs to be replace with empty string
                    // so that we get a decent path.
                    if (index !== 0) {
                        pathValue = Utilities.JoinAzurePaths(pathValue, value);
                        pathValue = StorageExplorerUtilities.ensureTrailingSlash(pathValue);
                    }
                    _this.addCrumb(value, pathValue, null, index === lastPathTextIndex && !file);
                });
                if (file) {
                    this.addCrumb(file, pathValue, file, true);
                }
                this.adjustBreadCrumbs();
            }
        };
        /*
         * Add new value to the observable array and notify UI
         */
        AddressBarViewModel.prototype.addCrumb = function (value, pathValue, fileValue, isLastCrumb, isCollapsed) {
            if (isCollapsed === void 0) { isCollapsed = false; }
            if (fileValue && this.filePrefix()) {
                value = this.filePrefix() + value;
            }
            this.breadCrumbs.push({ displayName: value, path: pathValue, file: fileValue, isLast: isLastCrumb, isCollapsed: isCollapsed });
        };
        /**
         * Move one specified breadcrumb to hidden which will show up in drop down menu.
         */
        AddressBarViewModel.prototype.moveOneCrumbToHidden = function (index) {
            var itemsToMove = this.breadCrumbs.splice(index, 1); // The specified crumb to hide.
            this.hiddenBreadCrumbs.unshift(itemsToMove[0]);
        };
        /**
         * Hide as many crumbs as long as there are still text overflow.
         * Default to hide the first crumb for every attempt.
         * @param indexToHide specify which crumb to hide for every attempt.
         */
        AddressBarViewModel.prototype.hideDisplayedCrumbs = function (indexToHide) {
            if (indexToHide === void 0) { indexToHide = 0; }
            var displayedBreadCrumbSize = this.getElementSize($(StorageExplorerConstants.htmlSelectors.breadCrumbsSelector));
            while (this.breadCrumbs().length > AddressBarViewModel.minimumDisplayedCrumbs &&
                displayedBreadCrumbSize.height > AddressBarViewModel.stardandBreadCrumbHeightInPixel) {
                this.moveOneCrumbToHidden(indexToHide);
                displayedBreadCrumbSize =
                    this.getElementSize($(StorageExplorerConstants.htmlSelectors.breadCrumbsSelector));
            }
        };
        /*
         * Clear the breadcrumb array.
         */
        AddressBarViewModel.prototype.clearCrumb = function () {
            this.breadCrumbs().splice(0);
            this.hiddenBreadCrumbs.splice(0);
        };
        AddressBarViewModel.prototype.getElementSize = function ($elem) {
            return {
                width: $elem.width(),
                height: $elem.height()
            };
        };
        AddressBarViewModel.prototype.adjustBreadCrumbs = function () {
            var addressBarSize = this.getElementSize($(StorageExplorerConstants.htmlSelectors.addressBarInputSelector));
            // First hide as many as breadcrumbs to make it fit the address bar
            this.hideDisplayedCrumbs();
            // If there are hidden breadcrumbs, add an clickable icon to show the hidden ones in a dropdown
            if (this.hiddenBreadCrumbs().length > 0) {
                this.breadCrumbs.unshift({ displayName: null, path: null, file: null, isLast: false, isCollapsed: true });
                // Due to this clickable icon, there are potential overflow, so try hide breadcrumbs again.
                var firstShownCrumbIndex = 1;
                this.hideDisplayedCrumbs(firstShownCrumbIndex);
            }
            var displayedBreadCrumbSize = this.getElementSize($(StorageExplorerConstants.htmlSelectors.breadCrumbsSelector));
            // If there are only two displayed breadcrumbs and they are still too long, treat as text overflow and show ellipsis.
            var maximumWidthInPixelPerItem = 0;
            if (displayedBreadCrumbSize.height > AddressBarViewModel.stardandBreadCrumbHeightInPixel) {
                // Means there are multiple lines of breadcrumbs
                var breadCrumbsCount = this.breadCrumbs().length;
                maximumWidthInPixelPerItem = addressBarSize.width / breadCrumbsCount;
                $(StorageExplorerConstants.htmlSelectors.breadCrumbItemsSelector).
                    css(StorageExplorerConstants.cssAttrs.maxWidthAttr, maximumWidthInPixelPerItem);
            }
            displayedBreadCrumbSize = this.getElementSize($(StorageExplorerConstants.htmlSelectors.breadCrumbsSelector));
            while (maximumWidthInPixelPerItem > AddressBarViewModel.minimumWidthInPixelPerCrumb &&
                displayedBreadCrumbSize.height > AddressBarViewModel.stardandBreadCrumbHeightInPixel) {
                maximumWidthInPixelPerItem -= AddressBarViewModel.decreasedPixelPerTry;
                $(StorageExplorerConstants.htmlSelectors.breadCrumbItemsSelector).
                    css(StorageExplorerConstants.cssAttrs.maxWidthAttr, maximumWidthInPixelPerItem);
                displayedBreadCrumbSize = this.getElementSize($(StorageExplorerConstants.htmlSelectors.breadCrumbsSelector));
            }
        };
        return AddressBarViewModel;
    }());
    AddressBarViewModel.minimumWidthInPixelPerCrumb = 40;
    AddressBarViewModel.stardandBreadCrumbHeightInPixel = 20;
    AddressBarViewModel.minimumDisplayedCrumbs = 2; // Display at least 2 breadcrumbs if there are more than that.
    AddressBarViewModel.decreasedPixelPerTry = 10;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AddressBarViewModel;
});
