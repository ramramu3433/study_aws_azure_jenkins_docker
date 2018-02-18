/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/CloudExplorer/Actions/ActionInteractionActions", "Providers/CloudExplorer/Actions/CloudExplorerActions", "Providers/CloudExplorer/Resources/CloudExplorerResources", "Providers/CloudExplorer/Actions/ElementInteractionActions", "Providers/CloudExplorer/Actions/PropertyInteractionActions"], function (require, exports, ActionInteractionActions, CloudExplorerActions, CloudExplorerResources, ElementInteractionActions, PropertyInteractionActions) {
    "use strict";
    var CloudExplorerProviderConfig = (function () {
        function CloudExplorerProviderConfig() {
            this.namespace = "CloudExplorer";
            this.exports = [
                CloudExplorerActions.closeInfoBarNamespace,
                CloudExplorerActions.getSettingsNamespace,
                CloudExplorerActions.openFileEditorNamespace,
                CloudExplorerActions.openServerExplorerNamespace,
                CloudExplorerActions.openUrlNamespace,
                CloudExplorerActions.setSettingsNamespace,
                CloudExplorerActions.showErrorMessageBox,
                CloudExplorerActions.showInfobarMessageNamespace,
                CloudExplorerActions.showMessageBox,
                CloudExplorerActions.themeImagesNamespace,
                CloudExplorerActions.getTheme,
                CloudExplorerActions.refreshPanel,
                CloudExplorerActions.resetPanel,
                CloudExplorerActions.openPanel,
                CloudExplorerActions.openPanelByName,
                CloudExplorerActions.curentPanel,
                ElementInteractionActions.query,
                ElementInteractionActions.childrenQuery,
                ElementInteractionActions.getAttribute,
                ElementInteractionActions.getAttributes,
                ElementInteractionActions.setAttribute,
                ElementInteractionActions.select,
                ElementInteractionActions.expand,
                ElementInteractionActions.refresh,
                ElementInteractionActions.collapse,
                ElementInteractionActions.getActions,
                ElementInteractionActions.executeDefaultAction,
                ElementInteractionActions.getProperties,
                ElementInteractionActions.refreshChildren,
                ElementInteractionActions.loadMoreChildren,
                ElementInteractionActions.refresDynamicAttributes,
                ElementInteractionActions.addChild,
                ElementInteractionActions.addChildByUid,
                ElementInteractionActions.findChildByName,
                ElementInteractionActions.deleteSelf,
                ElementInteractionActions.scopedSearch,
                ElementInteractionActions.makeSearchResult,
                ActionInteractionActions.getDisplayName,
                ActionInteractionActions.getEnabled,
                ActionInteractionActions.getVisible,
                PropertyInteractionActions.getDisplayName,
                PropertyInteractionActions.getDisplayValue,
                // Resource
                CloudExplorerResources.namespace
            ];
        }
        return CloudExplorerProviderConfig;
    }());
    return CloudExplorerProviderConfig;
});
