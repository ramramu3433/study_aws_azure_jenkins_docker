"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var dialogsManager = require("../DialogsManager");
var dialogProvider = {
    "CloudExplorer.Actions.Dialog.promptYesNo": function (args) { return dialogsManager.showYesNoMessageBox(args.message, args.iconType); },
    "CloudExplorer.Actions.Dialog.promptOK": function (args) { return dialogsManager.showOkMessageBox(args.title, args.message, args.messageBoxType); }
};
module.exports = dialogProvider;
