/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "underscore.string", "StorageExplorer/KeyCodes", "StorageExplorer/StorageExplorerConstants", "Common/Utilities"], function (require, exports, underscore, _string, KeyCodes_1, StorageExplorerConstants, Utilities) {
    "use strict";
    var StorageExplorerUtilities = (function () {
        function StorageExplorerUtilities() {
        }
        StorageExplorerUtilities.getDisplayedNameFromEdmTypeName = function (edmType) {
            var displayedName = "";
            if (edmType) {
                displayedName = edmType.slice(StorageExplorerConstants.EdmTypePrefix.length);
            }
            return displayedName;
        };
        StorageExplorerUtilities.getEdmTypeNameFromDisplayedName = function (displayedName) {
            var edmType = StorageExplorerConstants.EdmType.String;
            if (displayedName) {
                edmType = StorageExplorerConstants.EdmTypePrefix + displayedName;
            }
            return edmType;
        };
        StorageExplorerUtilities.getInputTypeFromDisplayedName = function (displayedName) {
            switch (displayedName) {
                case StorageExplorerConstants.DisplayedEdmType.DateTime:
                    return StorageExplorerConstants.InputType.DateTime;
                case StorageExplorerConstants.DisplayedEdmType.Int32:
                case StorageExplorerConstants.DisplayedEdmType.Int64:
                    return StorageExplorerConstants.InputType.Number;
                default:
                    return StorageExplorerConstants.InputType.Text;
            }
        };
        /**
         * Get the prefix from a blob name. The prefix includes a trailing slash.
         * For blob at the top level, the prefix is empty.
         */
        StorageExplorerUtilities.getPrefixFromBlobName = function (blobName) {
            blobName = Utilities.removeTrailingSlash(blobName);
            return blobName.substr(0, blobName.length - StorageExplorerUtilities.getFileNameFromBlobName(blobName).length);
        };
        /**
         * Given a set of absolute file paths, find the largest common folder path among them
         */
        StorageExplorerUtilities.getCommonFileFolderPath = function (absoluteFilePaths) {
            if (!absoluteFilePaths) {
                return null;
            }
            var getMinCommonString = function (a, b) {
                var minLength = Math.min(a.length, b.length);
                var result = "";
                if (a === b) {
                    return a; // Optimization case
                }
                for (var i = 0; i < minLength; ++i) {
                    if (a[i] === b[i]) {
                        result += a[i];
                    }
                    else {
                        break;
                    }
                }
                return result;
            };
            var common = StorageExplorerUtilities.getFolderFromFilePath(absoluteFilePaths[0]);
            for (var i = 1; i < absoluteFilePaths.length - 1; ++i) {
                var folder = StorageExplorerUtilities.getFolderFromFilePath(absoluteFilePaths[i]);
                common = getMinCommonString(common, folder);
            }
            return common;
        };
        /**
         * Given a set of absolute file paths, return the common path between them and a set of relative file paths to it.
         */
        StorageExplorerUtilities.convertToRelativeFilePaths = function (absoluteFilePaths) {
            var commonFileFolder = StorageExplorerUtilities.getCommonFileFolderPath(absoluteFilePaths);
            return {
                commonFileFolder: commonFileFolder,
                relativeFilePaths: absoluteFilePaths.map(function (filePath) { return filePath.substr(commonFileFolder.length); })
            };
        };
        /**
         * Remove the prefix and trailing slash (for folder type) of a blob name and return the santitized name.
         */
        StorageExplorerUtilities.getFileNameFromBlobName = function (blobName) {
            return Utilities.removeTrailingSlash(blobName).split("/").pop();
        };
        /**
         * Append a slash at the end if no one exists.
         */
        StorageExplorerUtilities.ensureTrailingSlash = function (flobPath) {
            if (flobPath && !_string.endsWith(flobPath, "/")) {
                flobPath = flobPath.concat("/");
            }
            return flobPath;
        };
        /**
         * Get the filename (with extension) from a file path
         */
        StorageExplorerUtilities.getFileNameFromPath = function (path) {
            if (!path) {
                return "";
            }
            return underscore.last(underscore.last(path.split("/"))
                .split("\\"));
        };
        /**
         * Get the folder (path and name) from a file path, with trailing backslash/slash
         */
        StorageExplorerUtilities.getFolderFromFilePath = function (path) {
            return path.substr(0, path.length - this.getFileNameFromPath(path).length);
        };
        /**
         * Converts a blob path to a file path appropriate for the local environment.
         */
        StorageExplorerUtilities.convertBlobPathToFilePath = function (path) {
            if (Utilities.isWin()) {
                return path.replace(/\//g, "\\");
            }
            return path;
        };
        /**
         * Converts a local environment file path to a blob or Azure file path.
         */
        StorageExplorerUtilities.convertFilePathToFlobPath = function (path) {
            if (Utilities.isWin()) {
                return path.replace(/\\/g, "/");
            }
            return path;
        };
        /**
         * Executes an action on a keyboard event.
         * Modifiers: ctrlKey - control/command key, shiftKey - shift key, altKey - alt/option key;
         * pass on 'null' to ignore the modifier (default).
         */
        StorageExplorerUtilities.onKey = function (event, eventKeyCode, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            var source = event.target || event.srcElement, keyCode = event.keyCode, $sourceElement = $(source), handled = false;
            if ($sourceElement.length
                && (keyCode === eventKeyCode)
                && $.isFunction(action)
                && ((metaKey === null) || (metaKey === event.metaKey))
                && ((shiftKey === null) || (shiftKey === event.shiftKey))
                && ((altKey === null) || (altKey === event.altKey))) {
                action($sourceElement);
                handled = true;
            }
            return handled;
        };
        /**
         * Executes an action on the first matched keyboard event.
         */
        StorageExplorerUtilities.onKeys = function (event, eventKeyCodes, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            var handled = false, keyCount, i;
            if ($.isArray(eventKeyCodes)) {
                keyCount = eventKeyCodes.length;
                for (i = 0; i < keyCount; ++i) {
                    handled = StorageExplorerUtilities.onKey(event, eventKeyCodes[i], action, metaKey, shiftKey, altKey);
                    if (handled) {
                        break;
                    }
                }
            }
            return handled;
        };
        /**
         * Executes an action on an 'enter' keyboard event.
         */
        StorageExplorerUtilities.onEnter = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return StorageExplorerUtilities.onKey(event, KeyCodes_1.default.Enter, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on a 'tab' keyboard event.
         */
        StorageExplorerUtilities.onTab = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return StorageExplorerUtilities.onKey(event, KeyCodes_1.default.Tab, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on an 'Esc' keyboard event.
         */
        StorageExplorerUtilities.onEsc = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return StorageExplorerUtilities.onKey(event, KeyCodes_1.default.Esc, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on an 'UpArrow' keyboard event.
         */
        StorageExplorerUtilities.onUpArrow = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return StorageExplorerUtilities.onKey(event, KeyCodes_1.default.UpArrow, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on a 'DownArrow' keyboard event.
         */
        StorageExplorerUtilities.onDownArrow = function (event, action, metaKey, shiftKey, altKey) {
            if (metaKey === void 0) { metaKey = null; }
            if (shiftKey === void 0) { shiftKey = null; }
            if (altKey === void 0) { altKey = null; }
            return StorageExplorerUtilities.onKey(event, KeyCodes_1.default.DownArrow, action, metaKey, shiftKey, altKey);
        };
        /**
         * Executes an action on a mouse event.
         */
        StorageExplorerUtilities.onButton = function (event, eventButtonCode, action) {
            var source = event.currentTarget;
            var buttonCode = event.button;
            var $sourceElement = $(source);
            var handled = false;
            if ($sourceElement.length
                && (buttonCode === eventButtonCode)
                && $.isFunction(action)) {
                action($sourceElement);
                handled = true;
            }
            return handled;
        };
        /**
         * Executes an action on a 'left' mouse event.
         */
        StorageExplorerUtilities.onLeftButton = function (event, action) {
            return StorageExplorerUtilities.onButton(event, StorageExplorerConstants.buttonCodes.Left, action);
        };
        /**
         * Converts a string value to an appropriate primitive corresponding to the specified EDM type.
         * Currently, the client API ignores the EDM type ($ property) when set to
         * Boolean, Double, or Int32 and only examines the Javascript primitive type.
         * This function converts string values to JavaScript primitives to ensure that the client API
         * sends values to Azure correctly.
         */
        StorageExplorerUtilities.convertFromEdmType = function (value, edmType) {
            if (edmType === void 0) { edmType = StorageExplorerConstants.EdmType.String; }
            if (_string.isBlank(value) && edmType === StorageExplorerConstants.EdmType.String) {
                return value;
            }
            switch (edmType) {
                // case StorageExplorerConstants.EdmType.Binary:
                //     return (a base-64 encoded string);
                case StorageExplorerConstants.EdmType.Boolean:
                    return value.toLowerCase() === "true";
                case StorageExplorerConstants.EdmType.DateTime:
                    return new Date(value);
                case StorageExplorerConstants.EdmType.Double:
                    // If the value parses to a whole number, the EDM type may be misinterpreted as Int32 or Int64 by the client API.
                    return parseFloat(value);
                case StorageExplorerConstants.EdmType.Int32:
                case StorageExplorerConstants.EdmType.Int64:
                    // If Int64 values are within the range of Int32 values, the EDM type may be misinterpreted as Int32 by the client API.
                    return parseInt(value, 10);
                default:
                    return value;
            }
        };
        /**
         * Map an object to an array of properties. excludedKeys is used to exclude specified keys from the result array.
         */
        StorageExplorerUtilities.objectToPropertyArray = function (instance, excludedKeys) {
            var keys = Object.keys(instance);
            keys = underscore.difference(keys, excludedKeys);
            var propertyArray = underscore.map(keys, function (keyName) {
                return {
                    key: keyName,
                    value: instance[keyName]
                };
            });
            return propertyArray;
        };
        /**
         * Determines whether a property name is `PartitionKey` or `RowKey` for a table entity.
         */
        StorageExplorerUtilities.isTableKeyProperty = function (propertyName) {
            return propertyName === "PartitionKey" || propertyName === "RowKey";
        };
        /**
         * Determines whether a property name is `PartitionKey`, `RowKey`, or `Timestamp` for a table entity.
         */
        StorageExplorerUtilities.isTableSystemProperty = function (propertyName) {
            return StorageExplorerUtilities.isTableKeyProperty(propertyName) || propertyName === "Timestamp";
        };
        /**
         * Determines whether a property name is not a reserved system property name for a table entity.
         */
        StorageExplorerUtilities.isTableCustomProperty = function (propertyName) {
            return !StorageExplorerUtilities.isTableSystemProperty(propertyName);
        };
        /**
         * Determines whether a table entity property name corresponds to a type annotation of a custom property.
         */
        StorageExplorerUtilities.isTableTypeAnnotation = function (propertyName) {
            return _string.endsWith(propertyName, StorageExplorerUtilities.tableTypeAnnotationSufix);
        };
        /**
         * Gets the property name referenced by the specified type annotation name.
         * For example, if the annoation name is `myProp@type`, `myProp` is the property name
         * and will be returned.
         */
        StorageExplorerUtilities.getTablePropertyNameFromAnnotation = function (annotationName) {
            return annotationName.substring(0, annotationName.indexOf(StorageExplorerUtilities.tableTypeAnnotationSufix));
        };
        /**
         * Gets a type annotation name for the specified propertyName.
         */
        StorageExplorerUtilities.getTableTypeAnnotation = function (propertyName) {
            return propertyName + StorageExplorerUtilities.tableTypeAnnotationSufix;
        };
        StorageExplorerUtilities.tryOpenFileOnDiskSafely = function (host, diskPath) {
            return host.executeOperation("Environment.tryOpenFileSafely", [diskPath])
                .then(function (result) {
                if (result.status === 1 /* Failed */) {
                    return host.executeOperation("Environment.showMessageBox", ["Storage Explorer", result.message, "error"]);
                }
            });
        };
        StorageExplorerUtilities.getFileShareItem = function (host, shareReference, itemPath, isDirectory) {
            if (isDirectory === void 0) { isDirectory = false; }
            var operationNamespace;
            var args;
            if (isDirectory) {
                operationNamespace = "AzureFiles.getDirectory";
                args = [
                    shareReference,
                    itemPath
                ];
            }
            else {
                operationNamespace = "AzureFiles.getFile";
                args = [
                    shareReference,
                    StorageExplorerUtilities.getFolderFromFilePath(itemPath),
                    StorageExplorerUtilities.getFileNameFromPath(itemPath)
                ];
            }
            return host.executeOperation(operationNamespace, args);
        };
        StorageExplorerUtilities.copyTableQuery = function (query) {
            if (!query) {
                return null;
            }
            return {
                filter: query.filter,
                select: query.select && query.select.slice(),
                top: query.top
            };
        };
        return StorageExplorerUtilities;
    }());
    StorageExplorerUtilities.tableTypeAnnotationSufix = "@type";
    return StorageExplorerUtilities;
});
