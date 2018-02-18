"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var DialogManagerProxy_1 = require("../UI/DialogManagerProxy");
var MessageBoxManager_1 = require("../UI/MessageBoxManager");
var DialogsManager = require("../DialogsManager");
module.exports = {
    "Environment.Dialogs.getDialogResult": function (args) {
        return DialogManagerProxy_1.default.getDialogResult(args.id, args.parameters);
    },
    "Environment.Dialogs.getSaveFileDialogResult": function (args) {
        return DialogsManager.showSaveFileDialog(args.message, args.defaultName, args.filters);
    },
    "Environment.Dialogs.getOpenFileDialogResult": function (args) {
        return DialogsManager.showOpenDialog(args.message, args.browseForFolder, args.allowMultiSelect, args.filters);
    },
    "Environment.Dialogs.showMessageBox": function (args) {
        return MessageBoxManager_1.default.showMessageBox(args.title, args.message, args.type, args.buttons);
    },
    "Environment.Theming.onThemeChanged": function (args) {
        return DialogManagerProxy_1.default.onThemeChanged(args.newTheme);
    },
    "Environment.Zoom.onZoomChanged": function (args) {
        return DialogManagerProxy_1.default.onZoomChanged(args.zoomFactor);
    }
};
