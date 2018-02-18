"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var FeedbackManager_1 = require("../FeedbackManager");
var feedbackProvider = {
    "CloudExplorer.Actions.Feedback.sendASmile": function (args) {
        var email = args.email;
        var text = args.text;
        return FeedbackManager_1.default.sendASmile(email, text);
    },
    "CloudExplorer.Actions.Feedback.sendAFrown": function (args) {
        var email = args.email;
        var text = args.text;
        return FeedbackManager_1.default.sendAFrown(email, text);
    }
};
module.exports = feedbackProvider;
