import { beforeEach, describe, it, expect, vi } from 'vitest';
import { apiPost } from '../lib/api';
import {
  sha256,
  computeHmacSha256,
  generateSignedStudentQr,
  verifySignedStudentQrPayload,
  matchStudentFromScan
} from './qrHelper';

vi.mock('../lib/api', () => ({
  apiPost: vi.fn()
}));

describe('Server-issued student QR passes', () => {
  const mockStudent = {
    id: '101',
    student_id: '20260042',
    fname: 'Juan',
    lname: 'Dela Cruz',
    grade: '10',
    section: 'Rizal'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the generic SHA-256 helper deterministic', () => {
    const hash = sha256('VioTrack2026');
    expect(hash).toHaveLength(64);
    expect(hash).toBe(sha256('VioTrack2026'));
  });

  it('computes HMAC only when explicitly given a key', () => {
    expect(computeHmacSha256('message', 'private-test-key')).toHaveLength(64);
    expect(() => computeHmacSha256('message')).toThrow('An HMAC key is required.');
  });

  it('requests signed passes from the API instead of signing in the browser', async () => {
    apiPost.mockResolvedValue({ payload: 'VT3:20260042:1791840000:signature' });
    await expect(generateSignedStudentQr(mockStudent)).resolves.toBe(
      'VT3:20260042:1791840000:signature'
    );
    expect(apiPost).toHaveBeenCalledWith('/qr/issue', { studentId: '20260042' });
  });

  it('verifies VT3 badges through the authenticated API', async () => {
    apiPost.mockResolvedValue({ isValid: true, studentId: mockStudent.student_id });
    await expect(
      verifySignedStudentQrPayload('VT3:20260042:1791840000:signature')
    ).resolves.toEqual({
      isValid: true,
      studentId: '20260042',
      isHmac: true
    });
    expect(apiPost).toHaveBeenCalledWith('/qr/verify', {
      payload: 'VT3:20260042:1791840000:signature'
    });
  });

  it('matches verified badges to the local student row', async () => {
    apiPost.mockResolvedValue({ isValid: true, studentId: mockStudent.student_id });
    const matched = await matchStudentFromScan(
      'VT3:20260042:1791840000:signature',
      [mockStudent]
    );

    expect(matched).not.toBeNull();
    expect(matched.fname).toBe('Juan');
    expect(matched._isSignedBadge).toBe(true);
    expect(matched._badgeVerified).toBe(true);
  });

  it('rejects obsolete, foreign, invalid, and arbitrary QR payloads', async () => {
    const students = [mockStudent];
    await expect(matchStudentFromScan('WIFI:S:MyWifi;T:WPA;P:12345;;', students)).resolves.toBeNull();
    await expect(matchStudentFromScan('https://www.youtube.com/watch?v=abc', students)).resolves.toBeNull();
    await expect(matchStudentFromScan('https://google.com', students)).resolves.toBeNull();
    await expect(matchStudentFromScan('VT2:20260042:1791840000:invalid', students)).resolves.toBeNull();
    expect(apiPost).not.toHaveBeenCalled();
  });
});
