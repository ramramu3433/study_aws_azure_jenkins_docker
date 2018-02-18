"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var path = require("path");
var WindowsSafeFileName = (function () {
    function WindowsSafeFileName() {
    }
    WindowsSafeFileName.isPathSafe = function (path) {
        return WindowsSafeFileName._getPathSegments(path).every(function (segment) {
            return WindowsSafeFileName._isPathSegmentSafe(segment);
        });
    };
    WindowsSafeFileName.isPathEncoded = function (path) {
        var segments = WindowsSafeFileName._getPathSegments(path);
        var rejoinedPath = (_a = WindowsSafeFileName.remotePath).join.apply(_a, segments);
        return WindowsSafeFileName.decodePath(path) !== rejoinedPath;
        var _a;
    };
    WindowsSafeFileName.encodePath = function (path) {
        var segments = WindowsSafeFileName._getPathSegments(path);
        segments = segments.map(function (segment) {
            // Encode names/folders` which don't appear to be safe
            return WindowsSafeFileName._isPathSegmentSafe(segment) ? segment : WindowsSafeFileName._encodeUnsafeSegment(segment);
        });
        return (_a = WindowsSafeFileName.localPath).join.apply(_a, segments);
        var _a;
    };
    WindowsSafeFileName.decodePath = function (path) {
        var segments = WindowsSafeFileName._getPathSegments(path);
        segments = segments.map(function (segment) {
            try {
                segment = decodeURIComponent(segment);
            }
            catch (error) {
                // Leave name alone if not properly encoded
            }
            return segment;
        });
        return (_a = WindowsSafeFileName.remotePath).join.apply(_a, segments);
        var _a;
    };
    WindowsSafeFileName._encodeUnsafeSegment = function (name) {
        var encoded = encodeURIComponent(name);
        // encodeURIComponent doesn't handle '*'
        encoded = encoded.replace(/[*]/g, "%2A");
        return encoded;
    };
    WindowsSafeFileName._getPathSegments = function (path) {
        // Return empty array for empty string. Split will at least return array with 1 element.
        if (!path) {
            return [];
        }
        // split by slash or backslash
        return path.split(/\/|\\/);
    };
    WindowsSafeFileName._isPathSegmentSafe = function (name) {
        if (name.match(/(^[\s.])|([\s.]$)/)) {
            // Begins or ends with whitespace or period
            return false;
        }
        // Otherwise, contains only safe chracters for all platforms
        //  (not perfect, but I think good enough)
        return !!name.match(/^[ !@#$%^&()\-_=+[\]{};'.0-9a-zA-Z~`\u00a1-\uffffff]*$/);
    };
    return WindowsSafeFileName;
}());
WindowsSafeFileName.localPath = path.win32;
WindowsSafeFileName.remotePath = path.posix;
exports.default = WindowsSafeFileName;
