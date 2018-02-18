"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var SasResourceType_1 = require("../../SasResourceType");
var _string = require("underscore.string");
var url = require("url");
var SasToken = (function () {
    function SasToken(sas) {
        if (sas === void 0) { sas = ""; }
        this.inputString = sas;
        this.token = url.parse("?" + sas, true).query;
        if (this.permissions) {
            this.displayPermission = "";
            for (var i in this.permissions) {
                var p = this.permissions[i];
                this.displayPermission += (this.displayPermission) ?
                    ", " + SasToken._permissionsLabels[p] :
                    SasToken._permissionsLabels[p];
            }
        }
        var parsedStart = this.token.st && Date.parse(this.token.st);
        if (!isNaN(parsedStart)) {
            this.start = this.token.se && new Date(parsedStart);
            this.displayStart = this.start && this.start.toLocaleString();
        }
        var parsedExpiry = this.token.se && Date.parse(this.token.se);
        if (!isNaN(parsedExpiry)) {
            this.expiration = this.token.se && new Date(parsedExpiry);
            this.displayExpiration = this.expiration && this.expiration.toLocaleString();
        }
    }
    Object.defineProperty(SasToken.prototype, "apiVersion", {
        get: function () { return this.token["api-version"]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "version", {
        get: function () { return this.token.sv; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "permissions", {
        get: function () { return this.token.sp; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "ip", {
        get: function () { return this.token.sip; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "protocol", {
        get: function () { return this.token.spr; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "signature", {
        get: function () { return this.token.sig; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "services", {
        // Account SAS parameters
        get: function () { return this.token.ss; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "resourceTypes", {
        get: function () { return this.token.srt; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "resource", {
        // Service SAS parameters
        get: function () { return this.token.sr; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "tableName", {
        get: function () { return this.token.tn; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "identifier", {
        get: function () { return this.token.si; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "startpk", {
        get: function () { return this.token.spk; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "startrk", {
        get: function () { return this.token.srk; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "endpk", {
        get: function () { return this.token.epk; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "endrk", {
        get: function () { return this.token.erk; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SasToken.prototype, "accessType", {
        /**
         * Gets a value indicating what kind of access this token provides.
         *
         * The access type is identified by looking for key parameters.
         *
         * Queue SAS tokens have no unique parameters. Therefore, if no
         * key parameters for other access types are present, a token is assumed to
         * provide access to a queue.
         */
        get: function () {
            if (this.isBlobServiceToken()) {
                return SasResourceType_1.default.blob;
            }
            else if (this.isFileServiceToken()) {
                return SasResourceType_1.default.file;
            }
            else if (this.isTableServiceToken()) {
                return SasResourceType_1.default.table;
            }
            else if (this.isAccountToken()) {
                return SasResourceType_1.default.account;
            }
            else {
                // SAS tokens for queues don't have any unique parameters.
                return SasResourceType_1.default.queue;
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    SasToken.prototype.isAccountToken = function () {
        return !!this.services || !!this.resourceTypes;
    };
    SasToken.prototype.hasServiceAccess = function (service) {
        return _string.contains(this.services, service);
    };
    SasToken.prototype.hasResourceTypeAccess = function (resourceType) {
        return _string.contains(this.resourceTypes, resourceType);
    };
    SasToken.prototype.isServiceToken = function () {
        return !this.isAccountToken();
    };
    SasToken.prototype.isBlobServiceToken = function () {
        return this.isServiceToken() && (this.isResource("b") || this.isResource("c"));
    };
    SasToken.prototype.isFileServiceToken = function () {
        return this.isServiceToken() && (this.isResource("f") || this.isResource("s"));
    };
    SasToken.prototype.isTableServiceToken = function () {
        return this.isServiceToken() && !!this.tableName;
    };
    SasToken.prototype.isQueueServiceToken = function () {
        return !this.isAccountToken() && !this.isBlobServiceToken() && !this.isFileServiceToken() && !this.isTableServiceToken();
    };
    SasToken.prototype.isResource = function (resource) {
        return _string.contains(this.resource, resource);
    };
    SasToken.prototype.isExpired = function () {
        if (!!this.expiration) {
            return this.expiration < new Date(Date.now());
        }
        return false;
    };
    SasToken.prototype.hasPermission = function (permission) {
        return !!this.identifier || _string.contains(this.permissions, permission);
    };
    return SasToken;
}());
// Localize
// TODO: Use this in SASGeneration dialogs.
SasToken._permissionsLabels = {
    "r": "Read",
    "w": "Write",
    "d": "Delete",
    "l": "List",
    "a": "Add",
    "c": "Create",
    "u": "Update",
    "p": "Process"
};
exports.default = SasToken;
