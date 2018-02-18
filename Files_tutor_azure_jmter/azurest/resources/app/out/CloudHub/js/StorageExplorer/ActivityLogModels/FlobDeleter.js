/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore", "StorageExplorer/StorageExplorerConstants"], function (require, exports, _, StorageExplorerConstants) {
    "use strict";
    /**
     * Class to handle file/blob deletions and updating the view
     */
    function deleteFlobAndUpdateView(container, path, listViewModel, snapshot) {
        return container.deleteItem(path, snapshot)
            .then(function () {
            // After the blob has been deleted, remove it from the display
            if (listViewModel) {
                listViewModel.removeDeletedFlobFromDisplay(path, snapshot);
            }
        });
    }
    exports.deleteFlobAndUpdateView = deleteFlobAndUpdateView;
    function deleteFlobFolderAndUpdateView(container, path, listViewModel) {
        return container.deleteDirectory(path)
            .then(function () {
            // After the folder has been deleted, remove it from the display
            if (listViewModel) {
                listViewModel.removeDeletedFolderFromDisplay(path);
            }
        });
    }
    exports.deleteFlobFolderAndUpdateView = deleteFlobFolderAndUpdateView;
    function removeEmptyVirtualFoldersFromView(container, listViewModel) {
        if (!listViewModel || !container.supportsVirtualFolders()) {
            // Nothing to do
            return;
        }
        // After all the deletions have completed, check each folder in the view
        // and remove any which are now empty.
        // Trying to do this check along the way, without having a full list of
        // all blobs in memory at one time, is difficult.  This will handle most
        // scenarios well enough.
        var currentSubfolders = _.filter(listViewModel.items(), function (blob) { return blob.ContentType === StorageExplorerConstants.ContentTypes.Folder; });
        currentSubfolders.forEach(function (folder) {
            container.isFolderEmpty(folder.FullName).then(function (isEmpty) {
                if (isEmpty) {
                    listViewModel.removeFlobFromCache(folder).then(function () {
                        listViewModel.redrawTableThrottled();
                    });
                }
            });
        });
    }
    exports.removeEmptyVirtualFoldersFromView = removeEmptyVirtualFoldersFromView;
});
