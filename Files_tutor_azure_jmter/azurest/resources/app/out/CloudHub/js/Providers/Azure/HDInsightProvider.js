/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/AzureConnection", "Providers/Azure/Actions/AzureHDInsightActions", "Providers/Azure/Loaders/AzureHDInsightAttributeLoader", "Providers/Azure/Producers/AzureHDInsightProducer", "Providers/Common/BaseProvider"], function (require, exports, AzureConnection, AzureHDInsightActions, AzureHDInsightAttributeLoader, AzureHDInsightProducer, BaseProvider) {
    "use strict";
    var HDInsightProvider = (function (_super) {
        __extends(HDInsightProvider, _super);
        function HDInsightProvider() {
            var _this = _super.call(this, "Azure.CloudExplorer.HDInsight") || this;
            _this._azureConnection = new AzureConnection(_this.host);
            new AzureHDInsightActions(_this.host).registerBindings(_this);
            new AzureHDInsightProducer(_this.host).registerBindings(_this);
            new AzureHDInsightAttributeLoader(_this._azureConnection, _this.host).registerBindings(_this);
            return _this;
        }
        return HDInsightProvider;
    }(BaseProvider));
    return HDInsightProvider;
});
