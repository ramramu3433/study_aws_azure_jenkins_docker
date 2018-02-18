define(["require", "exports"], function (require, exports) {
    "use strict";
    var UrlUtility = (function () {
        function UrlUtility() {
        }
        UrlUtility.parseDocumentsPath = function (resourcePath) {
            if (typeof resourcePath !== "string") {
                return {};
            }
            if (resourcePath.length === 0) {
                return {};
            }
            if (resourcePath[resourcePath.length - 1] !== "/") {
                resourcePath = resourcePath + "/";
            }
            if (resourcePath[0] !== "/") {
                resourcePath = "/" + resourcePath;
            }
            var id;
            var type;
            var pathParts = resourcePath.split("/");
            if (pathParts.length % 2 === 0) {
                id = pathParts[pathParts.length - 2];
                type = pathParts[pathParts.length - 3];
            }
            else {
                id = pathParts[pathParts.length - 3];
                type = pathParts[pathParts.length - 2];
            }
            var result = {
                type: type,
                objectBody: {
                    id: id,
                    self: resourcePath
                }
            };
            return result;
        };
        UrlUtility.createUri = function (baseUri, relativeUri) {
            if (!baseUri) {
                throw new Error("baseUri is null or empty");
            }
            var slashAtEndOfUriRegex = /\/$/, slashAtStartOfUriRegEx = /^\//;
            var normalizedBaseUri = baseUri.replace(slashAtEndOfUriRegex, "") + "/", normalizedRelativeUri = relativeUri && relativeUri.replace(slashAtStartOfUriRegEx, "") || "";
            return normalizedBaseUri + normalizedRelativeUri;
        };
        return UrlUtility;
    }());
    return UrlUtility;
});
