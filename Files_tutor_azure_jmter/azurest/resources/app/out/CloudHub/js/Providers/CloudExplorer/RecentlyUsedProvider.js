/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/Common/BaseProvider", "Providers/CloudExplorer/Actions/RecentlyUsedActions", "Providers/CloudExplorer/Producers/RecentlyUsedNodeProducer"], function (require, exports, BaseProvider, RecentlyUsedActions_1, RecentlyUsedNodeProducer_1) {
    "use strict";
    var RecentlyUsedProvider = (function (_super) {
        __extends(RecentlyUsedProvider, _super);
        function RecentlyUsedProvider() {
            var _this = _super.call(this, "Azure.CloudExplorer.RecentlyUsed") || this;
            new RecentlyUsedNodeProducer_1.default(_this.host).registerBindings(_this);
            new RecentlyUsedActions_1.default(_this.host).registerBindings(_this);
            return _this;
        }
        return RecentlyUsedProvider;
    }(BaseProvider));
    return RecentlyUsedProvider;
});
