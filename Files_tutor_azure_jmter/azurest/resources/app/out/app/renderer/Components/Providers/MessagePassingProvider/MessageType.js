"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Defines types of messages that can be passed between provider and host proxies.
 */
var MessageType = {
    // "Event": "Event" as "Event";
    FunctionCall: "FunctionCall",
    FunctionResponse: "FunctionResponse",
    EventCall: "EventCall",
    EventResponse: "EventResponse"
    // RegisterEvent: "RegisterEvent" as "RegisterEvent",
    // ResolveResourcesCall: "ResolveResourcesCall" as "ResovelResourceCall",
    // ResolveResourcesResponse: "ResolveResourcesResponse" as "ResolveResourceResponse"
};
exports.default = MessageType;
