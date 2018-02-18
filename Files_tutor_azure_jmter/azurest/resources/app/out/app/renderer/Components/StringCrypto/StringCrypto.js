"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var crypto = require("crypto");
var StringCrypto = (function () {
    function StringCrypto(encryptionKey) {
        this._encryptionKey = encryptionKey;
    }
    StringCrypto.prototype.encrypt = function (stringToEncrypt) {
        if (!stringToEncrypt) {
            return "";
        }
        var password = this._encryptionKey;
        var cipher = crypto.createCipher("aes-256-cbc", password);
        var crypted = cipher.update(stringToEncrypt, "utf8", "base64");
        crypted += cipher.final("base64");
        return crypted;
    };
    StringCrypto.prototype.decrypt = function (stringToDecrypt) {
        if (!stringToDecrypt) {
            return "";
        }
        var password = this._encryptionKey;
        var decipher = crypto.createDecipher("aes-256-cbc", password);
        var decrypted = decipher.update(stringToDecrypt, "base64", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    };
    return StringCrypto;
}());
exports.default = StringCrypto;
