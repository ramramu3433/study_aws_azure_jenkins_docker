/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Contains all the constants for Cloud Explorer App.
     */
    var CloudExplorerConstants;
    (function (CloudExplorerConstants) {
        CloudExplorerConstants.panelNamespaces = {
            treeViewPanel: "treeViewPanel"
        };
        CloudExplorerConstants.imagePaths = {
            Base64EncodedPngHeader: "data:image/png;base64,",
            UserInformationDefaultImage: "../../images/CloudExplorer/UserInformationDefaultImage.png"
        };
        CloudExplorerConstants.search = {
            deepSearchDefaultSeparator: "/"
        };
        CloudExplorerConstants.theme = {
            dark: "#252526",
            darkRGB: "rgb(37, 37, 38)",
            light: "#F5F5F5",
            lightRGB: "rgb(245, 245, 245)",
            blue: "#FFFFFF",
            blueRGB: "rgb(255, 255, 255)"
        };
        CloudExplorerConstants.themeName = {
            "#252526": "dark",
            "#f5f5f5": "light",
            "#ffffff": "blue"
        };
        CloudExplorerConstants.keyCodes = {
            // The command button of Mac doesn't have the same key code in all browsers, thus we give it a special value.
            // To check whether the command button is pressed, we can rely on the unified keyboard event.metaKey.
            MacCommand: -1,
            Enter: 13,
            Spacebar: 32,
            Shift: 16,
            Ctrl: 17,
            Alt: 18,
            Esc: 27,
            LeftArrow: 37,
            UpArrow: 38,
            RightArrow: 39,
            DownArrow: 40,
            Delete: 46,
            C: 67,
            V: 86,
            X: 88,
            F2: 113,
            ContextMenu: 93
        };
    })(CloudExplorerConstants || (CloudExplorerConstants = {}));
    return CloudExplorerConstants;
});
