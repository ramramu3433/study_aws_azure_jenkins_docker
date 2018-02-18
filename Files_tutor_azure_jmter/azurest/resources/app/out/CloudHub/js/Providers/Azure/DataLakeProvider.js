/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Azure/Actions/AzureDataLakeAnalyticsActions", "Providers/Azure/Producers/AzureDataLakeAnalyticsProducer", "Providers/Common/BaseProvider"], function (require, exports, AzureDataLakeAnalyticsActions, AzureDataLakeAnalyticsProducer, BaseProvider) {
    "use strict";
    var DataLakeProvider = (function (_super) {
        __extends(DataLakeProvider, _super);
        function DataLakeProvider() {
            var _this = _super.call(this, "Azure.CloudExplorer.DataLake") || this;
            new AzureDataLakeAnalyticsActions(_this.host).registerBindings(_this);
            new AzureDataLakeAnalyticsProducer(_this.host).registerBindings(_this);
            return _this;
        }
        return DataLakeProvider;
    }(BaseProvider));
    return DataLakeProvider;
});
