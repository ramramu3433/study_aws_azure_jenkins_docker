/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Debug", "Common/Errors", "es6-promise", "Common/Utilities"], function (require, exports, Debug, Errors, es6_promise_1, Utilities) {
    "use strict";
    /**
     * A FIFO cache that can be first written to and then read from.
     * This implementation caches the data to disk, so its capacity is
     * limited only by disk space.
     *
     * The cache can be read from while it is being written.
     */
    var CachedSequenceBuilder = (function () {
        function CachedSequenceBuilder(host, telemetry) {
            var _this = this;
            this._buffer = new Array();
            this._count = 0;
            this._writtenCount = 0;
            this._host = host;
            this._telemetry = telemetry;
            this._closedPromise = new es6_promise_1.Promise(function (resolve, reject) {
                _this._resolveWhenClosed = resolve;
                // TODO: reject?
            });
        }
        Object.defineProperty(CachedSequenceBuilder.prototype, "length", {
            /**
             * Get the total number of items that have been added to the cache
             */
            get: function () {
                return this._count;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CachedSequenceBuilder.prototype, "writtenLength", {
            /**
             * Number of items that have been written to the cache file (may be less than the current length)
             */
            get: function () {
                return this._writtenCount;
            },
            enumerable: true,
            configurable: true
        });
        CachedSequenceBuilder.prototype.waitUntilClosed = function () {
            return this._closedPromise;
        };
        Object.defineProperty(CachedSequenceBuilder.prototype, "isClosed", {
            /**
             * True if all data has been added to the cache.
             */
            get: function () {
                return !this._buffer;
            },
            enumerable: true,
            configurable: true
        });
        CachedSequenceBuilder.prototype.addRange = function (items) {
            var _this = this;
            if (items.length) {
                var partition = items.slice(0, CachedSequenceBuilder.BufferSize);
                var remaining = items.slice(CachedSequenceBuilder.BufferSize);
                return this._addRangeCore(partition).then(function () {
                    return _this.addRange(remaining);
                });
            }
            else {
                return es6_promise_1.Promise.resolve();
            }
        };
        CachedSequenceBuilder.prototype.add = function (item) {
            return this._addRangeCore([item]);
        };
        CachedSequenceBuilder.prototype._addRangeCore = function (items) {
            var _this = this;
            this._ensureNotClosed();
            // Yes, our buffer can grow to beyond BufferSize (but not beyond
            // BufferSize + items.length), that's okay, we'll flush immediately after.
            items.forEach(function (item) { return _this._addCoreNoFlush(item); });
            if (this._buffer.length >= CachedSequenceBuilder.BufferSize) {
                return this._flush();
            }
            else {
                return es6_promise_1.Promise.resolve();
            }
        };
        CachedSequenceBuilder.prototype._addCoreNoFlush = function (item) {
            var stringItem = JSON.stringify(item);
            this._buffer.push(stringItem);
            this._count++;
        };
        CachedSequenceBuilder.prototype.read = function () {
            var _this = this;
            return this._ensureTempFileCreated().then(function () {
                return new BuiltSequenceReader(_this, _this._host, _this._telemetry, _this._path);
            });
        };
        /**
         * Indicate no more items to add
         */
        CachedSequenceBuilder.prototype.close = function () {
            var _this = this;
            this._ensureNotClosed();
            this._flush()
                .then(function () {
                _this._buffer = null;
                _this._resolveWhenClosed();
            });
        };
        CachedSequenceBuilder.prototype._ensureNotClosed = function () {
            if (!this._buffer) {
                throw new Errors.InvalidOperationError("Internal error: This cache is closed");
            }
        };
        CachedSequenceBuilder.prototype._ensureTempFileCreated = function () {
            var _this = this;
            if (!this._path) {
                return this._createTempFilePath()
                    .then(function (path) {
                    if (!_this._path) {
                        _this._path = path;
                        return _this._host.executeOperation("Environment.appendToFile", [_this._path, ""]);
                    }
                });
            }
            else {
                return es6_promise_1.Promise.resolve();
            }
        };
        CachedSequenceBuilder.prototype._createTempFilePath = function () {
            return this._host.executeOperation("Environment.getTempDirectory", []).then(function (tempFolder) {
                var fileName = "stgexp-cache-" + Utilities.guid() + ".tmp";
                var path = Utilities.JoinFilePaths(tempFolder, fileName);
                Debug.logAlways("Cache file path: " + path);
                return path;
            });
        };
        CachedSequenceBuilder.prototype._flush = function () {
            var data = this._buffer.join("\n") + "\n";
            this._buffer = new Array();
            return this._write(data);
        };
        CachedSequenceBuilder.prototype._write = function (data) {
            var _this = this;
            var doWrite = function () {
                return _this._ensureTempFileCreated().then(function () {
                    if (data.length) {
                        return _this._host.executeOperation("Environment.appendToFile", [_this._path, data]).then(function () {
                            _this._writtenCount += data.length;
                        });
                    }
                });
            };
            // Wait for any previous write promises to finish before writing
            var lastPromise = this._currentWritePromise || es6_promise_1.Promise.resolve();
            this._currentWritePromise = lastPromise.then(function () { return doWrite(); });
            return this._currentWritePromise;
        };
        return CachedSequenceBuilder;
    }());
    CachedSequenceBuilder.BufferSize = 100; // in lines
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CachedSequenceBuilder;
    /**
     * A reader for the sequence (works whether the sequence is still being written to or not)
     */
    var BuiltSequenceReader = (function () {
        function BuiltSequenceReader(builder, host, telemetry, path) {
            this._countRead = 0;
            this._readBuffer = null;
            this._builder = builder;
            this._host = host;
            this._telemetry = telemetry;
            this._path = path;
            Debug.assert(!!path);
        }
        BuiltSequenceReader.prototype.getNextAvailable = function () {
            var _this = this;
            if (this._readBuffer && this._readBuffer.length) {
                var next = this._readBuffer.shift();
                this._countRead++;
                if (this.isEmpty()) {
                    // Don't wait for this to return
                    this._host.executeOperation("Environment.deleteFile", [this._path])
                        .catch(function (error) {
                        _this._logError(error);
                    });
                }
                return next;
            }
            else {
                return null;
            }
        };
        BuiltSequenceReader.prototype.loadMore = function () {
            var _this = this;
            if (this._readBuffer && this._readBuffer.length) {
                // Already more data available in read buffer
                return es6_promise_1.Promise.resolve();
            }
            else {
                // Need to read more from the file
                if (this._currentLoadMorePromise) {
                    // Already retrieving more data
                    return this._currentLoadMorePromise;
                }
                if (this.isEmpty()) {
                    // No more data to retrieve
                    return es6_promise_1.Promise.resolve();
                }
                if (this._readBuffer && !this._continuationToken) {
                    // Localize
                    return es6_promise_1.Promise.reject("The cache should have more data, but does not. Remaining: " + this.getRemainingCount() + ", file: " + this._path);
                }
                Debug.assert(!!this._readBuffer || !this._continuationToken);
                // Until the builder is done writing all data to its cache file, we can't read all of what's already in the cache file,
                // because then the CSV reader will realize it's hit the end of that file and return an empty continuationToken, which means
                // we would have no way to continue reading when the builder appends more to the file.
                // So until the builder is closed, we can only read up to the before-last line safely.
                var safeLinesToRead = Math.max(0, this._builder.isClosed ? this._builder.length : this._builder.writtenLength - 1);
                var linesToRead = Math.min(safeLinesToRead - this._countRead, BuiltSequenceReader.BufferSize);
                if (!linesToRead) {
                    // Need to wait for the builder to write more data 
                    Debug.assert(!this._builder.isClosed, "If not empty, should be more to read");
                    return Utilities.delay(1000);
                }
                this._currentLoadMorePromise = this._host.executeOperation("Environment.readLines", [
                    this._path,
                    linesToRead,
                    this._continuationToken
                ])
                    .then(function (result) {
                    var lines = result.chunk.split("\n").map(function (value) { return value.trim(); }).filter(function (value) { return !!value; });
                    var data = lines.map(function (line) { return JSON.parse(line); });
                    _this._readBuffer = data;
                    _this._currentLoadMorePromise = null;
                    if (!!result.continuationToken) {
                        _this._continuationToken = result.continuationToken;
                    }
                    else {
                        // result.continuation === null means there are no more items to read in the current file.
                        // But until the builder is closed, there may be more items pending, so in that case, leave
                        // this._continuationhToken as it is to try again at same spot next time.
                        if (_this.isEmpty()) {
                            _this._continuationToken = null;
                        }
                    }
                    return;
                });
                this._currentLoadMorePromise.catch(function (error) {
                    _this._currentLoadMorePromise = null;
                });
                return this._currentLoadMorePromise;
            }
        };
        BuiltSequenceReader.prototype.getRemainingCount = function () {
            return this._builder.length - this._countRead;
        };
        BuiltSequenceReader.prototype.isEmpty = function () {
            Debug.assert(this._countRead <= this._builder.length);
            return this._builder.isClosed && this._countRead >= this._builder.length;
        };
        BuiltSequenceReader.prototype.waitUntilAddItemsAdded = function () {
            return this._builder.waitUntilClosed();
        };
        BuiltSequenceReader.prototype._logError = function (error) {
            this._telemetry.sendError({
                name: "BuiltSequenceReader",
                error: error
            });
            Debug.fail(Utilities.getErrorMessage(error.message));
        };
        return BuiltSequenceReader;
    }());
    BuiltSequenceReader.BufferSize = 100;
});
