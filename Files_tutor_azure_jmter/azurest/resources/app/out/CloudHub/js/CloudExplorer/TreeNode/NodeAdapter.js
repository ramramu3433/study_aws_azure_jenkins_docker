/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /*
     * Adapter for CCS (config/Extensibility)
     */
    var NodeAdapter = (function () {
        function NodeAdapter(caseInsensitive) {
            if (caseInsensitive === void 0) { caseInsensitive = false; }
            this.parent = function (element) {
                return element.parent();
            };
            this.firstChild = function (element) {
                return element.firstChild();
            };
            this.nextSibling = function (element) {
                return element.nextSibling();
            };
            this.previousSibling = function (element) {
                return element.previousSibling();
            };
            this._caseInsensitive = caseInsensitive;
        }
        NodeAdapter.prototype.type = function (element) {
            return "Node"; // Types aren't supported yet.
        };
        NodeAdapter.prototype.id = function (element) {
            return null; // ids aren't supported yet.
        };
        NodeAdapter.prototype.classes = function (element) {
            return ""; // Classes aren't supported yet.
        };
        NodeAdapter.prototype.attributes = function (element) {
            return element.getLoadedAttributeKeys().join(" ");
        };
        NodeAdapter.prototype.attribute = function (element, name) {
            if (this._caseInsensitive) {
                return element.getAttributeValueIfLoaded(name).toString().toLowerCase();
            }
            return element.getAttributeValueIfLoaded(name);
        };
        NodeAdapter.prototype.pseudoClasses = function (element) {
            return ""; // Pseudo classes aren't supported yet.
        };
        NodeAdapter.prototype.selectorMatches = function (selector, element) {
            return element.matches(selector, this);
        };
        NodeAdapter.prototype.getMatchingRules = function (element) {
            return []; // No sheets available yet.
        };
        NodeAdapter.prototype.getDefaultValue = function (element, property) {
            return undefined;
        };
        NodeAdapter.prototype.getInlineValue = function (element, property) {
            return undefined;
        };
        return NodeAdapter;
    }());
    return NodeAdapter;
});
