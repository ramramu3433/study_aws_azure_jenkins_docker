"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var ProviderBasedJobQueueManager_1 = require("../Components/JobQueue/ProviderBasedJobQueue/ProviderBasedJobQueueManager");
var host = global.host;
var jobQueueManager = new ProviderBasedJobQueueManager_1.default(host);
var JobQueueProvider = {
    "JobQueueManager.addJob": function (args) { return jobQueueManager.addJob(args.queue, args.job); },
    "JobQueueManager.deleteJob": function (lease) { return jobQueueManager.deleteJob(lease); },
    "JobQueueManager.updateJob": function (args) { return jobQueueManager.updateJob(args.lease, args.job); },
    "JobQueueManager.registerJobQueuer": function (queuer) { return jobQueueManager.registerProviderBasedJobQueuer(queuer); },
    "JobQueueManager.addIterator": function (args) { return jobQueueManager.addIterator(args.queue, args.iterator); },
    "JobQueueManager.registerJobIteratorProcessor": function (queuer) { return jobQueueManager.registerProviderBasedJobIteratorProcessor(queuer); },
    "JobQueueManager.getQueueStats": function (queue) { return jobQueueManager.getQueueStats(queue); },
    "JobQueueManager.nextJobLease": function (args) { return jobQueueManager.nextJobLease(args.queue, args.ms); },
    "JobQueueManager.renewJobLease": function (args) { return jobQueueManager.renewJobLease(args.lease, args.ms); },
    "JobQueueManager.releaseJobLease": function (lease) { return jobQueueManager.releaseJobLease(lease); },
    "JobQueueManager.clearQueue": function (queue) { return jobQueueManager.clearQueue(queue); }
};
module.exports = JobQueueProvider;
