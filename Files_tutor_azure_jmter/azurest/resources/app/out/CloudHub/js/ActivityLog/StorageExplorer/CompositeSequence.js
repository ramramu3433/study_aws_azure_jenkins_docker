/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * A sequence consisting of data items and other sequences
     */
    var CompositeSequence = (function () {
        function CompositeSequence() {
            this._dataAndSequences = [];
        }
        CompositeSequence._isSequence = function (o) {
            // Assume it's a sequence if it has the getNextAvailable method
            return o && !!o.getNextAvailable;
        };
        CompositeSequence.prototype.getNextAvailable = function () {
            var peek = this._peek();
            if (CompositeSequence._isSequence(peek)) {
                var sequence = peek;
                return sequence.getNextAvailable();
            }
            else {
                // Remove the peeked data
                return this._dataAndSequences.shift();
            }
        };
        CompositeSequence.prototype.loadMore = function () {
            var peek = this._peek();
            if (CompositeSequence._isSequence(peek)) {
                var sequence = peek;
                return sequence.loadMore();
            }
            else {
                return Promise.resolve();
            }
        };
        CompositeSequence.prototype.waitUntilAddItemsAdded = function () {
            return Promise.all(this._dataAndSequences.map(function (o) {
                if (CompositeSequence._isSequence(o)) {
                    return o.waitUntilAddItemsAdded();
                }
            }));
        };
        CompositeSequence.prototype.getRemainingCount = function () {
            var remaining = 0;
            this._dataAndSequences.forEach(function (o) {
                if (CompositeSequence._isSequence(o)) {
                    remaining += o.getRemainingCount();
                }
                else {
                    remaining += 1;
                }
            });
            return remaining;
        };
        CompositeSequence.prototype.isEmpty = function () {
            return !this._peek();
        };
        CompositeSequence.prototype.addData = function (data) {
            this._dataAndSequences.push(data);
        };
        CompositeSequence.prototype.addSequence = function (sequence) {
            this._dataAndSequences.push(sequence);
        };
        // Peeks the next activity or non-empty sequence
        CompositeSequence.prototype._peek = function () {
            var peek = this._dataAndSequences.length ? this._dataAndSequences[0] : null;
            while (CompositeSequence._isSequence(peek) && peek.isEmpty()) {
                // Remove the empty child sequence
                this._dataAndSequences.shift();
                peek = this._dataAndSequences.length ? this._dataAndSequences[0] : null;
            }
            return peek;
        };
        return CompositeSequence;
    }());
    return CompositeSequence;
});
