var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "underscore", "Providers/Common/AzureConnection"], function (require, exports, _, AzureConnection) {
    "use strict";
    var VMDiskInfoLoader = (function () {
        function VMDiskInfoLoader(host, containerReference) {
            this._host = host;
            this._containerReference = containerReference;
        }
        /**
         * Goes through the list of blobs, picks out any leased ones which don't have VM related metada, and then tries to figure out
         * if they are a VM disk.
         */
        VMDiskInfoLoader.prototype.processDiscs = function (blobs) {
            return __awaiter(this, void 0, void 0, function () {
                var leasedUnprocessedBlobs, notV2Disks;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            leasedUnprocessedBlobs = _.filter(blobs, function (element) {
                                // look for any leased blobs which don't have a disk name yet
                                return element.Blob.LeaseState === "leased" && !(!!element.Blob.metadata && !!element.Blob.metadata.microsoftazurecompute_diskname);
                            });
                            return [4 /*yield*/, this.processV2Disks(leasedUnprocessedBlobs)];
                        case 1:
                            notV2Disks = _a.sent();
                            // everything in notV2Disks could possibly be a v1 disk
                            return [4 /*yield*/, this.processV1Disks(notV2Disks)];
                        case 2:
                            // everything in notV2Disks could possibly be a v1 disk
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Gets the metadata for each blob, and sees if the metadata contains any VM disk information. If the metadata does, then
         * the metadata is saved to the blob. All blobs whose metadata does not contain any VM disk information are returned.
         */
        VMDiskInfoLoader.prototype.processV2Disks = function (blobs) {
            return __awaiter(this, void 0, void 0, function () {
                var notV2Disks, i, operationArgs, result, metadata;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            notV2Disks = [];
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < blobs.length)) return [3 /*break*/, 4];
                            operationArgs = {
                                connectionString: this._containerReference.connectionString,
                                containerName: this._containerReference.containerName,
                                blobName: blobs[i].FullName
                            };
                            return [4 /*yield*/, this._host.executeProviderOperation("Azure.Storage.Blobs.getMetadata", operationArgs)];
                        case 2:
                            result = _a.sent();
                            metadata = !!result ? this.convertPascalObjectToLowerCaseObject(result.metadata) : null;
                            if (!!metadata && !!metadata.microsoftazurecompute_diskname && !!metadata.microsoftazurecompute_disktype &&
                                !!metadata.microsoftazurecompute_resourcegroupname && !!metadata.microsoftazurecompute_vmname) {
                                // is a v2 disk
                                blobs[i].Blob.metadata = metadata;
                            }
                            else {
                                // is not a v2 disk
                                notV2Disks.push(blobs[i]);
                            }
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, notV2Disks];
                    }
                });
            });
        };
        /**
         * Determines if any of the given blobs are disks for any v1 VMs. Any blobs which are not v1 VM disks are returned.
         */
        VMDiskInfoLoader.prototype.processV1Disks = function (blobs) {
            return __awaiter(this, void 0, void 0, function () {
                var notV1Disks, v1Disks, i, curr;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            notV1Disks = [];
                            if (!(!!blobs && blobs.length > 0)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.queryClassicDisks(this._containerReference)];
                        case 1:
                            v1Disks = _a.sent();
                            // try to match any of the blobs to those disks
                            for (i = 0; i < blobs.length; i++) {
                                curr = blobs[i];
                                if (!!v1Disks[curr.Uri]) {
                                    // is a v1 disk
                                    if (!blobs[i].Blob.metadata) {
                                        blobs[i].Blob.metadata = { microsoftazurecompute_diskname: "", microsoftazurecompute_disktype: "", microsoftazurecompute_resourcegroupname: "", microsoftazurecompute_vmname: "" };
                                    }
                                    blobs[i].Blob.metadata.microsoftazurecompute_diskname = v1Disks[curr.Uri].diskName;
                                    blobs[i].Blob.metadata.microsoftazurecompute_vmname = v1Disks[curr.Uri].vmName;
                                }
                                else {
                                    // is not a v1 disk
                                    notV1Disks.push(blobs[i]);
                                }
                            }
                            _a.label = 2;
                        case 2: return [2 /*return*/, notV1Disks = []];
                    }
                });
            });
        };
        /**
         * Queries the subscription found in the containerReference for all v1 VMs. Creates a IClassicDisk object for each
         * VM's disk, and then returns a map or disk url to disk.
         */
        VMDiskInfoLoader.prototype.queryClassicDisks = function (containerReference) {
            return __awaiter(this, void 0, void 0, function () {
                var subscription, url, response, disksXml, parsedDisks, i, curr, diskName, attachedToElement, vmName, diskUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!containerReference.subscription) {
                                return [2 /*return*/, Promise.resolve({})];
                            }
                            subscription = JSON.parse(containerReference.subscription);
                            if (!subscription.coreEndpoint || !subscription.id) {
                                return [2 /*return*/, Promise.resolve({})];
                            }
                            url = subscription.coreEndpoint + "/" + subscription.id + "/services/disks?api-version=2014-04-01";
                            return [4 /*yield*/, new AzureConnection(this._host).webRequest(url, subscription, "GET", { "x-ms-version": "2012-03-01" }, null)];
                        case 1:
                            response = _a.sent();
                            disksXml = new DOMParser().parseFromString(response, "text/xml").getElementsByTagName("Disk");
                            parsedDisks = {};
                            for (i = 0; i < disksXml.length; i++) {
                                curr = disksXml[i];
                                diskName = this.getTextContent(curr.getElementsByTagName("Name")[0]);
                                attachedToElement = curr.getElementsByTagName("AttachedTo")[0];
                                vmName = !!attachedToElement ? this.getTextContent(attachedToElement.getElementsByTagName("DeploymentName")[0]) : null;
                                diskUrl = this.getTextContent(curr.getElementsByTagName("MediaLink")[0]);
                                if (!!vmName && !!diskUrl) {
                                    parsedDisks[diskUrl] = {
                                        diskName: diskName,
                                        vmName: vmName,
                                        diskUrl: diskUrl
                                    };
                                }
                            }
                            return [2 /*return*/, parsedDisks];
                    }
                });
            });
        };
        VMDiskInfoLoader.prototype.getTextContent = function (element) {
            if (!!element && !!element.textContent) {
                return element.textContent;
            }
            else {
                return "";
            }
        };
        VMDiskInfoLoader.prototype.convertPascalObjectToLowerCaseObject = function (pascalObject) {
            var key, keys = Object.keys(pascalObject);
            var n = keys.length;
            var lowerCaseObject = {};
            while (n--) {
                key = keys[n];
                lowerCaseObject[key.toLowerCase()] = pascalObject[key];
            }
            return lowerCaseObject;
        };
        return VMDiskInfoLoader;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = VMDiskInfoLoader;
});
