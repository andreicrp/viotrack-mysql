/**
 * iProgSMS / iProgTech SMS Gateway Service Integration
 * Configured with live endpoint and credentials from viotrack1
 */

import { apiPost } from '../lib/api';

export const smsService = {
  // Sanitize phone number to standard format
  sanitizePhoneNumber(phone) {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '').trim();
  },

  async sendSMS({ recipientNumber, recipientName, studentName, violationTitle, customMessage = null }) {
    const sanitizedPhone = this.sanitizePhoneNumber(recipientNumber);
    if (!sanitizedPhone) {
      throw new Error('A valid recipient phone number is required.');
    }

    return apiPost('/sms', {
      recipientNumber: sanitizedPhone,
      recipientName,
      studentName,
      violationTitle,
      customMessage
    });
  }
};
