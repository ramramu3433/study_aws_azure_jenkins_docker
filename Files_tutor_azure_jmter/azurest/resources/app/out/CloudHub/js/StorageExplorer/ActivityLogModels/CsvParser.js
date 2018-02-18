/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/StorageExplorer/ProviderWrappers/TablePW"], function (require, exports, TablePW_1) {
    "use strict";
    var csvValueUnquoted = "[^\"\r\n,]+";
    var csvValueQuoted = "\"(?:[^\"]|\"\")*\"";
    var csvValue = csvValueUnquoted + "|" + csvValueQuoted;
    var csvRecord = "((?:" + csvValue + ")?(?:,(?:" + csvValue + ")?)*)\r?\n";
    var csv = "(" + csvRecord + ")*";
    var csvRegex = RegExp(csv);
    var batchSize = 200;
    /**
     * A class for asynchronously parsing a CSV file.
     */
    var CsvParser = (function () {
        function CsvParser(host, filePath) {
            this._recordsBuffer = [];
            this._linesBuffer = "";
            this._endOfFile = false;
            this._currentContinuationToken = null;
            this._host = host;
            this._filePath = filePath;
        }
        Object.defineProperty(CsvParser.prototype, "filePath", {
            /**
             * Gets the path to the file the parser is reading.
             */
            get: function () {
                return this._filePath;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets a value indicating whether the parser has any more records to read.
         */
        CsvParser.prototype.end = function () {
            return !this._recordsBuffer.length && !this._linesBuffer.length && this._endOfFile;
        };
        /**
         * Resets the parser to read from the beginning of the file.
         */
        CsvParser.prototype.reset = function () {
            this._recordsBuffer = [];
            this._linesBuffer = "";
            this._endOfFile = false;
            this._currentContinuationToken = null;
        };
        /**
         * Reads up to the specified number of records starting at the current file position.
         */
        CsvParser.prototype.read = function (numRecords) {
            var _this = this;
            if (numRecords === void 0) { numRecords = 1; }
            if (this._endOfFile || numRecords <= this._recordsBuffer.length) {
                // If we've accumulated enough records in the buffer, or if the end of the file has been reached,
                // splice up to the desired number of records.
                // Splice intentionally consumes records from the buffer. We don't want to merely copy them.
                return Promise.resolve(this._recordsBuffer.splice(0, numRecords));
            }
            // If the records buffer does not have enough records, and the end of the file hasn't been reached,
            // read more records from the line buffer.
            return this.accumulateRecordsAsync()
                .then(function () { return _this.read(numRecords); });
        };
        /**
         * Fills the internal records buffer by consuming lines from the lines buffer.
         */
        CsvParser.prototype.accumulateRecordsAsync = function () {
            var _this = this;
            var matches = this._linesBuffer.match(csvRegex);
            var validCsv = matches[0];
            if (this._endOfFile || validCsv) {
                // If the parser is at the end of the file, parse the entire lines buffer.
                var data = this._endOfFile ? this._linesBuffer : validCsv;
                return new TablePW_1.default(this._host).parseFromCsv(data)
                    .then(function (result) {
                    _this._recordsBuffer = _this._recordsBuffer.concat(result);
                    _this._linesBuffer = _this._linesBuffer.substr(data.length);
                });
            }
            // If the lines buffer does not start with a valid CSV substring, and the end of the file hasn't been reached,
            // read more data from the file.
            // WARNING: Syntax errors won't be caught until the entire file has been read, which is bad for large files.
            return this.accumulateLinesAsync()
                .then(function () { return _this.accumulateRecordsAsync(); });
        };
        /**
         * Fills the internal lines buffer by reading from the file.
         *
         * Ideally, `batchSize` should be greater than or equal to the number of lines occupied by any single record
         * to minimize how often this function has to be called.
         */
        CsvParser.prototype.accumulateLinesAsync = function () {
            var _this = this;
            var operationArgs = [this._filePath, batchSize, this._currentContinuationToken];
            return this._host.executeOperation("Environment.readLines", operationArgs)
                .then(function (result) {
                _this._linesBuffer += result.chunk;
                _this._endOfFile = result.continuationToken === null;
                _this._currentContinuationToken = result.continuationToken;
            });
        };
        return CsvParser;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CsvParser;
});
