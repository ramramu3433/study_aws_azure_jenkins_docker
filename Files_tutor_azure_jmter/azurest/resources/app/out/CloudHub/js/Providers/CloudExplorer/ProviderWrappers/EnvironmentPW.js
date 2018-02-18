/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Debug"], function (require, exports, Debug) {
    "use strict";
    //
    // Provider wrapper for Environment
    //
    var IconType;
    (function (IconType) {
        IconType[IconType["none"] = 0] = "none";
        IconType[IconType["info"] = 1] = "info";
        IconType[IconType["critical"] = 2] = "critical";
        IconType[IconType["question"] = 3] = "question";
        IconType[IconType["warning"] = 4] = "warning";
    })(IconType = exports.IconType || (exports.IconType = {}));
    function promptYesNo(host, prompt, iconType) {
        var iconTypeName;
        switch (iconType) {
            case IconType.none:
                iconTypeName = "none";
                break;
            case IconType.info:
                iconTypeName = "info";
                break;
            case IconType.critical:
                iconTypeName = "critical";
                break;
            case IconType.question:
                iconTypeName = "question";
                break;
            case IconType.warning:
                iconTypeName = "warning";
                break;
            default:
                Debug.fail("Unexpected icon");
                iconTypeName = "critical";
                break;
        }
        return host.executeOperation("CloudExplorer.Actions.Dialog.promptYesNo", [{
                message: prompt,
                iconType: iconTypeName
            }]);
    }
    exports.promptYesNo = promptYesNo;
    function renameFile(host, oldFilePath, newFilePath) {
        return host.executeOperation("Environment.renameFile", [oldFilePath, newFilePath]);
    }
    exports.renameFile = renameFile;
    function deleteFile(host, filePath) {
        return host.executeOperation("Environment.deleteFile", [filePath]);
    }
    exports.deleteFile = deleteFile;
});
