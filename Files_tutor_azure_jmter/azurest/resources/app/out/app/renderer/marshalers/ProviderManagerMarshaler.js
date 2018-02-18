"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ModuleProviderFactory_1 = require("../Components/Providers/ModuleProviderFactory");
exports.moduleProviderFactory = new ModuleProviderFactory_1.default();
exports.instance = {
    registerProvider: exports.moduleProviderFactory.registerProvider,
    executeFunction: exports.moduleProviderFactory.executeFunction
};
