define(["require", "exports"], function (require, exports) {
    "use strict";
    var ErrorParserUtility = (function () {
        function ErrorParserUtility() {
        }
        ErrorParserUtility.parse = function (err) {
            try {
                return ErrorParserUtility._parse(err);
            }
            catch (e) {
                return [{ message: JSON.stringify(err) }];
            }
        };
        ErrorParserUtility._parse = function (err) {
            var normalizedErrors = [];
            if (err.message && !err.code) {
                normalizedErrors.push(err);
            }
            else {
                var wrappedError = err, backendError = JSON.parse(wrappedError.body), innerErrors = ErrorParserUtility._getInnerErrors(backendError.message);
                normalizedErrors = innerErrors.map(function (innerError) { return (typeof innerError === "string") ? { message: innerError } : innerError; });
            }
            return normalizedErrors;
        };
        ErrorParserUtility._getInnerErrors = function (message) {
            /*
                The backend error message has an inner-message which is a stringified object.
    
                For SQL errors, the "errors" property is an array of SqlErrorDataModel.
                Example:
                    "Message: {"Errors":["Resource with specified id or name already exists"]}\r\nActivityId: 80005000008d40b6a, Request URI: /apps/19000c000c0a0005/services/mctestdocdbprod-MasterService-0-00066ab9937/partitions/900005f9000e676fb8/replicas/13000000000955p"
                For non-SQL errors the "Errors" propery is an array of string.
                Example:
                    "Message: {"errors":[{"severity":"Error","location":{"start":7,"end":8},"code":"SC1001","message":"Syntax error, incorrect syntax near '.'."}]}\r\nActivityId: d3300016d4084e310a, Request URI: /apps/12401f9e1df77/services/dc100232b1f44545/partitions/f86f3bc0001a2f78/replicas/13085003638s"
            */
            var innerMessage = null;
            var singleLineMessage = message.replace(/[\r\n]|\r|\n/g, '');
            try {
                // Multi-Partition error flavor
                var regExp = /^(.*)ActivityId: (.*)/g;
                var regString = regExp.exec(singleLineMessage);
                var innerMessageString = regString[1];
                innerMessage = JSON.parse(innerMessageString);
            }
            catch (e) {
                // Single-partition error flavor
                var regExp = /^Message: (.*)ActivityId: (.*)/g;
                var regString = regExp.exec(singleLineMessage);
                var innerMessageString = regString[1];
                innerMessage = JSON.parse(innerMessageString);
            }
            return (innerMessage.errors) ? innerMessage.errors : innerMessage.Errors;
        };
        ErrorParserUtility._parse3 = function (err) {
            console.log("_parse3");
            var outerCode = err && err.code;
            var body = err && err.body;
            var innerCode;
            var message;
            if (body && typeof body === "string") {
                try {
                    var parsedBody = JSON.parse(body);
                    innerCode = parsedBody && parsedBody.code;
                    message = parsedBody.message;
                }
                catch (e) {
                    return null;
                }
            }
            var code = innerCode || outerCode;
            if (typeof code === "string" && typeof message === "string") {
                return [{
                        message: message,
                        code: code
                    }];
            }
            return null;
        };
        ErrorParserUtility._parse1 = function (err) {
            console.log("_parse1");
            if (err.message && !err.code) {
                var normalizedErrors = [err];
                return normalizedErrors;
            }
            return null;
        };
        ErrorParserUtility._parse2 = function (err) {
            console.log("_parse2");
            var wrappedError = err;
            try {
                var backendError = JSON.parse(wrappedError.body);
                var innerErrors = ErrorParserUtility._getInnerErrors(backendError.message);
                var normalizedErrors = innerErrors.map(function (innerError) { return (typeof innerError === "string") ? { message: innerError } : innerError; });
                return normalizedErrors;
            }
            catch (e) {
            }
            return null;
        };
        return ErrorParserUtility;
    }());
    return ErrorParserUtility;
});
