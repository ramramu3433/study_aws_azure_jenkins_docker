"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var queueManager = require("../AzureStorage/QueueManager");
module.exports = {
    peekQueueMessages: queueManager.peekQueueMessages,
    addMessage: queueManager.addMessage,
    dequeueMessage: queueManager.dequeueMessage,
    clearQueue: queueManager.clearQueue,
    retrieveApproximateMessageCount: queueManager.retrieveApproximateMessageCount,
    generateSharedAccessSignature: queueManager.generateSharedAccessSignature,
    generateSharedAccessSignatureWithPolicy: queueManager.generateSharedAccessSignatureWithPolicy,
    getAccessControlList: queueManager.getAccessControlList,
    setAccessControlList: queueManager.setAccessControlList,
    getCorsRule: queueManager.getCorsRules,
    setCorsRule: queueManager.setCorsRules
};
