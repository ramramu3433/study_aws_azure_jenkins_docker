"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureStackEnvironmentDefaults = {
    environmentDisplayName: "Azure Stack Environment",
    host: "https://login.windows.net",
    signInResourceId: "SignInResourceId is missing",
    graphResource: "https://graph.windows.net",
    armId: "ArmId is missing",
    armEndpoint: ""
};
exports.azureEnvironmentValue = {
    azure: "azure",
    mooncake: "mooncake",
    blackForest: "blackforest",
    fairFax: "fairfax",
    azureStack: "azurestack"
};
exports.azureEnvironments = [
    { value: exports.azureEnvironmentValue.azure, displayValue: "Azure" },
    { value: exports.azureEnvironmentValue.mooncake, displayValue: "Azure China" },
    { value: exports.azureEnvironmentValue.blackForest, displayValue: "Azure Germany" },
    { value: exports.azureEnvironmentValue.fairFax, displayValue: "Azure US Government" },
    { value: exports.azureEnvironmentValue.azureStack, displayValue: "Azure Stack Environment" }
];
exports.azureStackArmEndpointHelpLink = "https://go.microsoft.com/fwlink/?linkid=856120";
