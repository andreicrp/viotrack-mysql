/**
 * VioTrack Resilient Offline Sync Queue Service
 * Ensures incident records logged during network outages
 * are saved locally and synced automatically once internet connection is restored.
 */

import { apiDelete, apiPatch, apiPost } from '../lib/api';

const QUEUE_STORAGE_KEY = 'viotrack_offline_mutation_queue_v1';
const LISTENERS = new Set();

/**
 * Retrieves the current offline queue from storage.
 * @returns {Array<object>}
 */
export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read offline sync queue:', err);
    return [];
  }
};

/**
 * Saves the offline queue to storage and notifies subscribers.
 * @param {Array<object>} queue
 */
const saveOfflineQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    notifyQueueChange(queue);
  } catch (err) {
    console.error('Failed to persist offline sync queue:', err);
  }
};

/**
 * Subscribes a callback to queue mutations.
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export const subscribeToQueue = (callback) => {
  if (typeof callback === 'function') {
    LISTENERS.add(callback);
    callback(getOfflineQueue());
    return () => LISTENERS.delete(callback);
  }
  return () => {};
};

const notifyQueueChange = (queue) => {
  LISTENERS.forEach((cb) => {
    try {
      cb(queue);
    } catch {}
  });
};

/**
 * Enqueues an operation to be synced when online.
 * @param {string} actionType - 'ADD_VIOLATION' | 'UPDATE_VIOLATION' | 'DELETE_VIOLATION'
 * @param {object} payload - The record payload
 * @returns {object} The queued task descriptor
 */
export const enqueueOfflineAction = (actionType, payload) => {
  const queue = getOfflineQueue();
  const task = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    actionType,
    payload,
    enqueuedAt: new Date().toISOString(),
    attempts: 0,
    lastError: null
  };

  queue.push(task);
  saveOfflineQueue(queue);
  return task;
};

/**
 * Processes all pending items in the offline queue against the REST API.
 * @returns {Promise<{ syncedCount: number, failedCount: number }>}
 */
export const processOfflineQueue = async () => {
  if (!navigator.onLine) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const remaining = [];
  let syncedCount = 0;
  let failedCount = 0;

  for (const task of queue) {
    try {
      task.attempts += 1;
      let success = false;

      if (task.actionType === 'ADD_VIOLATION') {
        await apiPost('/records', task.payload);
        success = true;
      } else if (task.actionType === 'UPDATE_VIOLATION') {
        const { id, ...updates } = task.payload;
        await apiPatch(`/records/${encodeURIComponent(id)}`, updates);
        success = true;
      } else if (task.actionType === 'DELETE_VIOLATION') {
        await apiDelete(`/records/${encodeURIComponent(task.payload.id)}`);
        success = true;
      }

      if (success) {
        syncedCount += 1;
      } else {
        remaining.push(task);
        failedCount += 1;
      }
    } catch (err) {
      console.warn(`[OfflineSync] Task ${task.id} sync failed:`, err);
      task.lastError = err.message || String(err);
      remaining.push(task);
      failedCount += 1;
    }
  }

  saveOfflineQueue(remaining);
  return { syncedCount, failedCount };
};

// Automatic online event listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processOfflineQueue().catch(console.error);
  });
}
