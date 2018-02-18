/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Creates a new sequence by running a transform function on all items in an existing sequence
     */
    var SelectSequence = (function () {
        function SelectSequence(sequence, selector) {
            this._sequence = sequence;
            this._selector = selector;
        }
        SelectSequence.prototype.getNextAvailable = function () {
            var item = this._sequence.getNextAvailable();
            return (item !== null) ? this._selector(item) : null;
        };
        SelectSequence.prototype.loadMore = function () {
            return this._sequence.loadMore();
        };
        SelectSequence.prototype.isEmpty = function () {
            return this._sequence.isEmpty();
        };
        SelectSequence.prototype.getRemainingCount = function () {
            return this._sequence.getRemainingCount();
        };
        SelectSequence.prototype.waitUntilAddItemsAdded = function () {
            return this._sequence.waitUntilAddItemsAdded();
        };
        return SelectSequence;
    }());
    return SelectSequence;
});
