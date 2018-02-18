"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var keytar = require("keytar");
var q = require("q");
function saveConfidentialData(key, data) {
    var service = key.service, account = key.account, password = data;
    if (service && account && password) {
        keytar.replacePassword(service, account, password);
    }
}
exports.saveConfidentialData = saveConfidentialData;
function getConfidentialData(key) {
    return q.resolve(getConfidentialDataSynchronously(key));
}
exports.getConfidentialData = getConfidentialData;
function getConfidentialDataSynchronously(key) {
    var service = key.service;
    var account = key.account;
    var password = null;
    if (service && account) {
        password = keytar.getPassword(service, account);
    }
    return password;
}
exports.getConfidentialDataSynchronously = getConfidentialDataSynchronously;
function deleteConfidentialData(key) {
    if (!key) {
        return q.resolve(false);
    }
    var service = key.service, account = key.account;
    if (service && account) {
        return q.resolve(!!keytar.deletePassword(service, account));
    }
    else {
        return q.resolve(false);
    }
}
exports.deleteConfidentialData = deleteConfidentialData;
function encryptText(text) {
    if (!text) {
        return "";
    }
    var password = getEncryptionKey();
    var cipher = crypto.createCipher("aes-256-cbc", password);
    var crypted = cipher.update(text, "utf8", "base64");
    crypted += cipher.final("base64");
    return crypted;
}
exports.encryptText = encryptText;
function decryptText(text) {
    if (!text) {
        return "";
    }
    var password = getEncryptionKey();
    var decipher = crypto.createDecipher("aes-256-cbc", password);
    var decrypted = decipher.update(text, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
exports.decryptText = decryptText;
function getEncryptionKey() {
    var passwordKey = {
        service: "Microsoft_StorageExplorer",
        account: "app"
    };
    var encryptionKey = getConfidentialDataSynchronously(passwordKey);
    if (!encryptionKey) {
        encryptionKey = generateRandomBase64String(64);
        saveConfidentialData(passwordKey, encryptionKey);
    }
    return encryptionKey;
}
exports.getEncryptionKey = getEncryptionKey;
function generateRandomBase64String(length) {
    return crypto.randomBytes(Math.ceil(3 / 4 * length)).toString("base64");
}
