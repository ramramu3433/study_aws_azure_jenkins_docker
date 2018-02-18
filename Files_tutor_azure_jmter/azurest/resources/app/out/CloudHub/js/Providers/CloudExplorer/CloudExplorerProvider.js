/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Providers/CloudExplorer/Actions/ActionInteractionActions", "Providers/Common/BaseProvider", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Providers/CloudExplorer/Actions/ElementInteractionActions", "Providers/CloudExplorer/Actions/PropertyInteractionActions"], function (require, exports, ActionInteractionActions, BaseProvider, CloudExplorerActions, CloudExplorerResources, ElementInteractionActions, PropertyInteractionActions) {
    "use strict";
    var CloudExplorerProvider = (function (_super) {
        __extends(CloudExplorerProvider, _super);
        function CloudExplorerProvider(host, explorerInteractionExecutor, themeProvider, panelInteractor) {
            var _this = _super.call(this, "CloudExplorer", host) || this;
            new CloudExplorerActions(_this.host, themeProvider, panelInteractor)
                .registerBindings(_this);
            new ElementInteractionActions(explorerInteractionExecutor, _this.host)
                .registerBindings(_this);
            new ActionInteractionActions()
                .registerBindings(_this);
            new PropertyInteractionActions()
                .registerBindings(_this);
            new CloudExplorerResources(_this.host)
                .registerBindings(_this);
            return _this;
        }
        return CloudExplorerProvider;
    }(BaseProvider));
    return CloudExplorerProvider;
});
