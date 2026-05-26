/**
 * Simple Job Queue System
 * Handles async background tasks like email sending without external dependencies
 */

const logger = require('./logger');

class JobQueue {
    constructor(concurrency = 3) {
        this.queue = [];
        this.processing = 0;
        this.concurrency = concurrency;
    }

    /**
     * Add a job to the queue
     * @param {Function} task - Async function to execute
     * @param {object} metadata - Job metadata for logging
     */
    add(task, metadata = {}) {
        this.queue.push({ task, metadata, timestamp: Date.now() });
        logger.debug('Job added to queue', metadata);
        this.process();
    }

    /**
     * Process queue
     */
    async process() {
        if (this.processing >= this.concurrency || this.queue.length === 0) {
            return;
        }

        const job = this.queue.shift();
        this.processing++;

        try {
            logger.debug('Processing job', job.metadata);
            await job.task();
            logger.info('Job completed successfully', job.metadata);
        } catch (error) {
            logger.error('Job failed', {
                ...job.metadata,
                error: error.message,
                stack: error.stack
            });
            // Simple retry logic could be added here
        } finally {
            this.processing--;
            // Recursively process next job
            this.process();
        }
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            queued: this.queue.length,
            processing: this.processing
        };
    }
}

// Create singleton instance
const queue = new JobQueue();

module.exports = queue;
