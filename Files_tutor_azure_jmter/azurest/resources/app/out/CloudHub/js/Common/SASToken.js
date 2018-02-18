/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore.string", "URIjs/URI", "Common/SASUri"], function (require, exports, _string, URI, SASUri_1) {
    "use strict";
    var SASToken = (function () {
        function SASToken(sas) {
            this.token = sas;
            var parsedURI = URI("?" + sas);
            var query = parsedURI.query(true);
            if (query) {
                var parseDate = query.se && Date.parse(query.se);
                if (!isNaN(parseDate)) {
                    this.expiration = query.se && new Date(parseDate);
                    this.displayExpiration = this.expiration && this.expiration.toLocaleString();
                }
                this.permissions = query.sp;
                if (this.permissions) {
                    this.displayPermission = "";
                    for (var i in this.permissions) {
                        var p = this.permissions[i];
                        this.displayPermission += (this.displayPermission) ?
                            ", " + SASToken._permissionsLabels[p] :
                            SASToken._permissionsLabels[p];
                    }
                }
                this.resource = query.sr;
                this.signature = query.sig;
                this.tableName = query.tn;
                this.version = query.sv;
                this.signedIdentifier = query.si || null;
                this.signedServices = query.ss;
            }
        }
        SASToken.prototype.isAccountResource = function () {
            return !!this.signedServices;
        };
        SASToken.prototype.isBlobResource = function () {
            return _string.contains(this.resource, "b");
        };
        SASToken.prototype.isContainerResource = function () {
            return _string.contains(this.resource, "c");
        };
        SASToken.prototype.isExpired = function () {
            if (!!this.signedIdentifier) {
                return false;
            }
            return !this.expiration || (this.expiration < new Date(Date.now()));
        };
        SASToken.prototype.isFileResource = function () {
            return _string.contains(this.resource, "f");
        };
        SASToken.prototype.isShareResource = function () {
            return _string.contains(this.resource, "s");
        };
        SASToken.prototype.isTableResource = function () {
            return !!this.tableName;
        };
        SASToken.prototype.hasPermission = function (permission) {
            return !!this.signedIdentifier || _string.contains(this.permissions, permission);
        };
        SASToken.prototype.validate = function () {
            if (!this.signature || !this.version) {
                return SASUri_1.SASDialogValidationResult.ERROR_MISSING_PARAMS;
            }
            if (this.isExpired()) {
                return SASUri_1.SASDialogValidationResult.ERROR_SAS_EXPIRED;
            }
            return SASUri_1.SASDialogValidationResult.OK;
        };
        return SASToken;
    }());
    // Localize
    // TODO: Use this in SASGeneration dialogs.
    SASToken._permissionsLabels = {
        "r": "Read",
        "w": "Write",
        "d": "Delete",
        "l": "List",
        "a": "Add",
        "c": "Create",
        "u": "Update",
        "p": "Process"
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SASToken;
});
