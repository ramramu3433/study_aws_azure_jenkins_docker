/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * A provider for general table operations
     */
    var TableProviderConfig = (function () {
        function TableProviderConfig() {
            this.namespace = "Azure.Storage.TableProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/TableProvider",
                useChildProcess: true
            };
            this.exports = [
                "Azure.Storage.Table.addEntity",
                "Azure.Storage.Table.addEntities",
                "Azure.Storage.Table.updateEntity",
                "Azure.Storage.Table.deleteEntities",
                "Azure.Storage.Table.listTableEntitiesSegmented",
                "Azure.Storage.Table.doesTableExist",
                "Azure.Storage.Table.setCorsRules",
                "Azure.Storage.Table.getCorsRules",
                "Azure.Storage.Table.parseFromCsv",
                "Azure.Storage.Table.getAccessControlList",
                "Azure.Storage.Table.setAccessControlList",
                "Azure.Storage.Table.generateSharedAccessSignature",
                "Azure.Storage.Table.generateSharedAccessSignatureWithPolicy"
            ];
        }
        return TableProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TableProviderConfig;
});
