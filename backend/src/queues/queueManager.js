import { Queue } from 'bullmq';
import { redisClient, isMockRedis } from '../config/redis.js';

const QUEUE_NAMES = [
  'analysisQueue',
  'aiQueue',
  'docxQueue',
  'pdfQueue',
  'pptQueue',
  'diagramQueue',
  'notificationQueue',
  'cleanupQueue'
];

// Mock Job structure mimicking BullMQ Job API for transparent in-memory local testing
class MockJob {
  constructor(queueName, jobName, data, opts = {}) {
    this.id = opts.jobId || `mock-job-${Math.random().toString(36).substr(2, 9)}`;
    this.name = jobName;
    this.data = data;
    this.opts = opts;
    this.queueName = queueName;
    this.status = 'active';
    this.progressVal = 0;
    this.returnValue = null;
    this.failedReason = null;
    this.attempts = 0;
    this.createdAt = new Date();
  }

  async updateProgress(progress) {
    this.progressVal = progress;
    console.log(`[MOCK JOB PROGRESS] Queue: ${this.queueName}, Job: ${this.id} -> ${progress}%`);
    return progress;
  }

  async log(logMessage) {
    console.log(`[MOCK JOB LOG] Job: ${this.id}: ${logMessage}`);
  }
}

// Mock Queue wrapper for non-Redis environments
class MockQueue {
  constructor(name) {
    this.name = name;
    this.activeJobs = [];
    this.completedJobs = [];
    this.failedJobs = [];
  }

  async add(jobName, data, opts = {}) {
    const job = new MockJob(this.name, jobName, data, opts);
    this.activeJobs.push(job);
    
    // Execute job asynchronously via setTimeout to simulate background processing
    setTimeout(async () => {
      await mockWorkerDispatcher(this.name, job);
    }, opts.delay || 50);

    return job;
  }

  async getJob(id) {
    return this.activeJobs.find(j => j.id === id) || 
           this.completedJobs.find(j => j.id === id) || 
           this.failedJobs.find(j => j.id === id) || 
           null;
  }

  async clean() {
    this.activeJobs = [];
    this.completedJobs = [];
    this.failedJobs = [];
    return 0;
  }

  async getJobCounts() {
    return {
      active: this.activeJobs.length,
      completed: this.completedJobs.length,
      failed: this.failedJobs.length,
      delayed: 0,
      waiting: 0
    };
  }
}

// Holds global registrations of handlers to execute mock background workers
const mockWorkerRegistrations = {};

export const registerMockWorker = (queueName, handler) => {
  mockWorkerRegistrations[queueName] = handler;
};

const mockWorkerDispatcher = async (queueName, job) => {
  const handler = mockWorkerRegistrations[queueName];
  if (!handler) {
    console.warn(`[MOCK WORKER WARNING] No mock handler registered for queue: ${queueName}`);
    job.status = 'failed';
    job.failedReason = 'No worker handler registered';
    return;
  }

  const maxRetries = job.opts.attempts || 1;
  while (job.attempts < maxRetries) {
    try {
      job.status = 'active';
      const result = await handler(job);
      job.status = 'completed';
      job.returnValue = result;
      // Move job record
      const idx = mockWorkerRegistrations[queueName] ? 0 : -1;
      const index = queueInstances[queueName].activeJobs.indexOf(job);
      if (index > -1) {
        queueInstances[queueName].activeJobs.splice(index, 1);
      }
      queueInstances[queueName].completedJobs.push(job);
      return;
    } catch (err) {
      job.attempts++;
      console.warn(`[MOCK WORKER RETRY] Job ${job.id} failed (attempt ${job.attempts}/${maxRetries}): ${err.message}`);
      job.failedReason = err.message;
      if (job.attempts >= maxRetries) {
        job.status = 'failed';
        const index = queueInstances[queueName].activeJobs.indexOf(job);
        if (index > -1) {
          queueInstances[queueName].activeJobs.splice(index, 1);
        }
        queueInstances[queueName].failedJobs.push(job);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Compile physical queues
const queueInstances = {};

QUEUE_NAMES.forEach(name => {
  if (isMockRedis) {
    queueInstances[name] = new MockQueue(name);
  } else {
    queueInstances[name] = new Queue(name, {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1500
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 }
      }
    });
  }
});

export const getQueue = (name) => {
  if (!queueInstances[name]) {
    throw new Error(`BullMQ Queue "${name}" not registered.`);
  }
  return queueInstances[name];
};

export const getQueueSizes = async () => {
  const sizes = {};
  for (const name of QUEUE_NAMES) {
    const q = queueInstances[name];
    if (isMockRedis) {
      sizes[name] = q.activeJobs.length + q.completedJobs.length + q.failedJobs.length; // Active simulated count
    } else {
      sizes[name] = await q.count();
    }
  }
  return sizes;
};

export default queueInstances;
