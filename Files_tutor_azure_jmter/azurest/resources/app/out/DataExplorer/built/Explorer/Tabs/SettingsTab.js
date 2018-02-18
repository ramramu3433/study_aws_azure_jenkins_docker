var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "knockout", "q", "../../Contracts/ViewModels", "../../Common/Constants", "../../Common/EditableUtility", "../../Shared/PriceEstimateCalculator", "../../Shared/Constants", "./TabsBase", "../Menus/CommandBar/CommandBarOptions"], function (require, exports, ko, Q, ViewModels, Constants, editable, PriceEstimateCalculator, SharedConstants, TabsBase, CommandBarOptions_1) {
    "use strict";
    var SettingsTab = (function (_super) {
        __extends(SettingsTab, _super);
        function SettingsTab(options) {
            var _this = _super.call(this, options) || this;
            _this.commandBarOptions = {};
            _this.onSaveClick = function () {
                var offer = _this.collection.offer();
                var defaultTtl;
                switch (_this.timeToLive()) {
                    case "on":
                        defaultTtl = Number(_this.timeToLiveSeconds());
                        break;
                    case "on-nodefault":
                        defaultTtl = -1;
                        break;
                    case "off":
                    default:
                        defaultTtl = undefined;
                        break;
                }
                var newCollection = {
                    _etag: undefined,
                    _ts: undefined,
                    _rid: _this.collection.rid,
                    _self: _this.collection.self,
                    partitionKey: _this.collection.partitionKey,
                    id: _this.collection.id(),
                    defaultTtl: defaultTtl,
                    indexingPolicy: _this.indexingPolicyContent()
                };
                var newOffer = {
                    content: {
                        offerThroughput: _this.throughput(),
                        offerIsRUPerMinuteThroughputEnabled: _this.rupm() === Constants.RUPMStates.on
                    },
                    _etag: undefined,
                    _ts: undefined,
                    _rid: offer._rid,
                    _self: offer._self,
                    id: offer.id,
                    offerResourceId: offer.offerResourceId,
                    offerVersion: offer.offerVersion,
                    offerType: offer.offerType,
                    resource: offer.resource
                };
                var updateCollectionPromise = _this.container.documentClientUtility.updateCollection(_this.collection, newCollection, null /*options*/).then(function (updatedCollection) {
                    _this.collection.defaultTtl(updatedCollection.defaultTtl);
                    _this.collection.id(updatedCollection.id);
                    _this.collection.indexingPolicy(updatedCollection.indexingPolicy);
                }, function (reason) {
                    console.error(reason);
                });
                var updateOfferPromise = _this.container.documentClientUtility.updateOffer(_this.collection.offer(), newOffer).then(function (updatedOffer) {
                    _this.collection.offer(updatedOffer);
                }, function (reason) {
                    console.error(reason);
                });
                return Q.all([
                    updateCollectionPromise,
                    updateOfferPromise
                ]).then(function () {
                    _this._setBaseline();
                }, function (reason) {
                    console.error(reason);
                });
            };
            _this.onRevertClick = function () {
                _this.throughput.setBaseline(_this.throughput.getEditableOriginalValue());
                _this.timeToLive.setBaseline(_this.timeToLive.getEditableOriginalValue());
                _this.timeToLiveSeconds.setBaseline(_this.timeToLiveSeconds.getEditableOriginalValue());
                _this.rupm.setBaseline(_this.rupm.getEditableOriginalValue());
                var indexingPolicyContent = _this.indexingPolicyContent.getEditableOriginalValue();
                var value = JSON.stringify(indexingPolicyContent, null, 4);
                _this.indexingPolicyContent.setBaseline(indexingPolicyContent);
                var indexingPolicyEditor = _this.indexingPolicyEditor();
                if (indexingPolicyEditor) {
                    var indexingPolicyEditorModel = indexingPolicyEditor.getModel();
                    indexingPolicyEditorModel.setValue(value);
                }
                return Q();
            };
            _this.container = options.collection.container;
            _this.isIndexingPolicyEditorInitializing = ko.observable(false);
            // html element ids
            _this.indexingPolicyEditorId = "indexingpolicyeditor" + _this.tabId;
            _this.ttlOffId = "ttlOffId" + _this.tabId;
            _this.ttlOnNoDefaultId = "ttlOnNoDefault" + _this.tabId;
            _this.ttlOnId = "ttlOn" + _this.tabId;
            _this.rupmOnId = "rupmOn" + _this.tabId;
            _this.rupmOffId = "rupmOff" + _this.tabId;
            _this.scaleExpanded = ko.observable(true);
            _this.settingsExpanded = ko.observable(true);
            _this.throughput = editable.observable();
            _this.timeToLive = editable.observable();
            _this.timeToLiveSeconds = editable.observable();
            _this.indexingPolicyContent = editable.observable();
            _this.rupm = editable.observable();
            _this.requestUnitsUsageCost = ko.pureComputed(function () {
                return PriceEstimateCalculator.computeRUUsagePrice(_this.container.serverId(), _this.rupm() === Constants.RUPMStates.on, _this.throughput());
            });
            _this.storageUsageCost = ko.pureComputed(function () {
                var usage = _this.collection.quotaInfo().usageSizeInKB;
                var displayUsageString = PriceEstimateCalculator.computeDisplayUsageString(_this.collection.quotaInfo().usageSizeInKB);
                return PriceEstimateCalculator.computeStorageUsagePrice(_this.container.serverId(), PriceEstimateCalculator.usageInGB(usage)) + " for " + displayUsageString;
            });
            _this.rupmVisible = ko.computed(function () {
                if (_this.container.isEmulator) {
                    return false;
                }
                return true;
            });
            _this.costsVisible = ko.computed(function () {
                if (_this.container.isEmulator) {
                    return false;
                }
                return true;
            });
            _this.minRUs = ko.computed(function () {
                var numPartitions = _this.collection.quotaInfo().numPartitions;
                if (numPartitions < 7) {
                    return SharedConstants.CollectionCreation.MinRUPerPartitionBelow7Partitions * numPartitions;
                }
                else if (numPartitions <= 25) {
                    return SharedConstants.CollectionCreation.MinRU7PartitionsTo25Partitions;
                }
                else if (numPartitions > 25) {
                    return SharedConstants.CollectionCreation.MinRUPerPartitionAbove25Partitions * numPartitions;
                }
                return SharedConstants.CollectionCreation.MinRUPerPartitionBelow7Partitions;
            });
            _this.maxRUs = ko.computed(function () {
                var numPartitions = _this.collection.quotaInfo().numPartitions;
                if (!!numPartitions) {
                    return SharedConstants.CollectionCreation.MaxRUPerPartition * numPartitions;
                }
                return SharedConstants.CollectionCreation.MaxRUPerPartition;
            });
            _this.throughputTitle = ko.observable("Throughput (" + _this.minRUs().toLocaleString() + " - " + _this.maxRUs().toLocaleString() + " RU/s*)");
            _this.partitionKeyVisible = ko.observable(!!_this.collection.partitionKeyProperty);
            _this.partitionKeyValue = ko.observable(_this.collection.partitionKeyProperty);
            _this.displayedError = ko.observable("");
            _this.indexingPolicyEditor = ko.observable();
            _this._setBaseline();
            _this.saveSettingsButton = {
                enabled: ko.computed(function () {
                    // TODO: move validations to editables and display validation errors
                    if (!_this.throughput()) {
                        return false;
                    }
                    if (_this.timeToLive() === "on" && !_this.timeToLiveSeconds()) {
                        return false;
                    }
                    if (_this.throughput() < _this.minRUs() || _this.throughput() > _this.maxRUs()) {
                        return false;
                    }
                    if (_this.rupm() === Constants.RUPMStates.on && _this.throughput() > (SharedConstants.CollectionCreation.MaxRUPMPerPartition * _this.collection.quotaInfo().numPartitions)) {
                        return false;
                    }
                    if (_this.throughput.editableIsDirty() && !!_this.throughput()) {
                        return true;
                    }
                    if (_this.timeToLive.editableIsDirty()) {
                        return true;
                    }
                    if (_this.timeToLive() === "on" && _this.timeToLiveSeconds.editableIsDirty()) {
                        return true;
                    }
                    if (_this.indexingPolicyContent.editableIsDirty() && _this.indexingPolicyContent.editableIsValid()) {
                        return true;
                    }
                    if (_this.rupm.editableIsDirty()) {
                        return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.discardSettingsChangesButton = {
                enabled: ko.computed(function () {
                    if (_this.throughput.editableIsDirty()) {
                        return true;
                    }
                    if (_this.timeToLive.editableIsDirty()) {
                        return true;
                    }
                    if (_this.timeToLive() === "on" && _this.timeToLiveSeconds.editableIsDirty()) {
                        return true;
                    }
                    if (_this.indexingPolicyContent.editableIsDirty()) {
                        return true;
                    }
                    if (_this.rupm.editableIsDirty()) {
                        return true;
                    }
                    return false;
                }),
                visible: ko.computed(function () {
                    return true;
                })
            };
            _this.isTemplateReady = ko.observable(false);
            _this.isTemplateReady.subscribe(function (isTemplateReady) {
                if (!_this.indexingPolicyEditor() && !_this.isIndexingPolicyEditorInitializing() && isTemplateReady) {
                    _this._createIndexingPolicyEditor();
                }
            });
            _this._buildCommandBarOptions();
            return _this;
        }
        SettingsTab.prototype.onValidIndexingPolicyEdit = function () {
            this.indexingPolicyContent.editableIsValid(true);
            return Q();
        };
        SettingsTab.prototype.onInvalidIndexingPolicyEdit = function () {
            this.indexingPolicyContent.editableIsValid(false);
            return Q();
        };
        SettingsTab.prototype.onActivate = function () {
            var _this = this;
            return _super.prototype.onActivate.call(this)
                .then(function () {
                _this.collection.selectedSubnodeKind(ViewModels.CollectionTabKind.Settings);
            });
        };
        SettingsTab.prototype.toggleScale = function () {
            this.scaleExpanded(!this.scaleExpanded());
        };
        SettingsTab.prototype.toggleSettings = function () {
            this.settingsExpanded(!this.settingsExpanded());
        };
        SettingsTab.prototype.onScaleKeyPress = function (source, event) {
            if (event.key === " " || event.key === "Enter") {
                this.toggleScale();
            }
        };
        SettingsTab.prototype.onSettingsKeyPress = function (source, event) {
            if (event.key === " " || event.key === "Enter") {
                this.toggleSettings();
            }
        };
        SettingsTab.prototype.onTtlOffKeyPress = function (source, event) {
            if (event.key === " " || event.key === "Enter") {
                this.timeToLive("off");
            }
        };
        SettingsTab.prototype.onTtlOnNoDefaultKeyPress = function (source, event) {
            if (event.key === " " || event.key === "Enter") {
                this.timeToLive("on-nodefault");
            }
        };
        SettingsTab.prototype.onTtlOnKeyPress = function (source, event) {
            if (event.key === " " || event.key === "Enter") {
                this.timeToLive("on");
            }
        };
        SettingsTab.prototype._setBaseline = function () {
            var defaultTtl = this.collection.defaultTtl();
            var timeToLive = this.timeToLive();
            var timeToLiveSeconds = this.timeToLiveSeconds();
            switch (defaultTtl) {
                case null:
                case undefined:
                case 0:
                    timeToLive = "off";
                    timeToLiveSeconds = 1;
                    break;
                case -1:
                    timeToLive = "on-nodefault";
                    timeToLiveSeconds = 1;
                    break;
                default:
                    timeToLive = "on";
                    timeToLiveSeconds = defaultTtl;
                    break;
            }
            var offerThroughput = this.collection && this.collection.offer && this.collection.offer() && this.collection.offer().content && this.collection.offer().content.offerThroughput;
            var offerIsRUPerMinuteThroughputEnabled = this.collection && this.collection.offer && this.collection.offer() && this.collection.offer().content && this.collection.offer().content.offerIsRUPerMinuteThroughputEnabled;
            this.throughput.setBaseline(offerThroughput);
            this.timeToLive.setBaseline(timeToLive);
            this.timeToLiveSeconds.setBaseline(timeToLiveSeconds);
            this.indexingPolicyContent.setBaseline(this.collection.indexingPolicy());
            this.rupm.setBaseline(offerIsRUPerMinuteThroughputEnabled ? Constants.RUPMStates.on : Constants.RUPMStates.off);
            var indexingPolicyContent = this.collection.indexingPolicy();
            var value = JSON.stringify(indexingPolicyContent, null, 4);
            this.indexingPolicyContent.setBaseline(indexingPolicyContent);
            if (!this.indexingPolicyEditor() && !this.isIndexingPolicyEditorInitializing()) {
                this._createIndexingPolicyEditor();
            }
            else {
                var indexingPolicyEditorModel = this.indexingPolicyEditor().getModel();
                indexingPolicyEditorModel.setValue(value);
            }
        };
        SettingsTab.prototype._createIndexingPolicyEditor = function () {
            var _this = this;
            this.isIndexingPolicyEditorInitializing(true);
            var value = JSON.stringify(this.indexingPolicyContent(), null, 4);
            require(['vs/editor/editor.main'], function () {
                var indexingPolicyEditor = monaco.editor.create(_this._getIndexingPolicyEditorContainer(), { value: value, language: 'json', readOnly: false });
                var indexingPolicyEditorModel = indexingPolicyEditor.getModel();
                indexingPolicyEditorModel.onDidChangeContent(_this._onEditorContentChange.bind(_this));
                _this.indexingPolicyEditor(indexingPolicyEditor);
                _this.isIndexingPolicyEditorInitializing(false);
            });
        };
        SettingsTab.prototype._onEditorContentChange = function (e) {
            var indexingPolicyEditorModel = this.indexingPolicyEditor().getModel();
            try {
                var parsed = JSON.parse(indexingPolicyEditorModel.getValue());
                this.indexingPolicyContent(parsed);
                this.onValidIndexingPolicyEdit();
            }
            catch (e) {
                this.onInvalidIndexingPolicyEdit();
            }
        };
        SettingsTab.prototype._getIndexingPolicyEditorContainer = function () {
            return document.getElementById(this.indexingPolicyEditorId);
        };
        SettingsTab.prototype._buildCommandBarOptions = function () {
            var _this = this;
            var saveSettingsButton = {
                iconSrc: 'images/save.svg',
                onCommandClick: this.onSaveClick,
                commandButtonLabel: 'Save ...',
                visible: ko.computed(function () { return _this.saveSettingsButton.visible(); }),
                disabled: ko.computed(function () { return !_this.saveSettingsButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.saveSettingsButton.enabled() ? 0 : -1; })
            };
            var discardSettingsChangesButton = {
                iconSrc: 'images/discard.svg',
                onCommandClick: this.onRevertClick,
                commandButtonLabel: 'Discard ...',
                visible: ko.computed(function () { return _this.discardSettingsChangesButton.visible(); }),
                disabled: ko.computed(function () { return !_this.discardSettingsChangesButton.enabled(); }),
                tabIndex: ko.computed(function () { return _this.discardSettingsChangesButton.enabled() ? 0 : -1; })
            };
            this.commandBarOptions = new CommandBarOptions_1.CommandBarOptions([
                saveSettingsButton,
                discardSettingsChangesButton
            ]);
        };
        return SettingsTab;
    }(TabsBase));
    return SettingsTab;
});
