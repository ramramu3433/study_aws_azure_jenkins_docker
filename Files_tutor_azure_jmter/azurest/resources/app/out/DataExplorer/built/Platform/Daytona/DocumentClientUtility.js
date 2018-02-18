/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../../Common/DocumentClientUtilityBase"], function (require, exports, DocumentClientUtilityBase) {
    "use strict";
    var DocumentClientUtility = (function (_super) {
        __extends(DocumentClientUtility, _super);
        function DocumentClientUtility(documentClientFactory, options) {
            return _super.call(this, documentClientFactory, options.endpoint, options.masterKey) || this;
        }
        return DocumentClientUtility;
    }(DocumentClientUtilityBase));
    return DocumentClientUtility;
});
