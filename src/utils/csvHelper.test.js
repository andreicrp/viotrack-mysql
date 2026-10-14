import { describe, it, expect } from 'vitest';
import { generateTemporaryPassword, parseCsvString } from './csvHelper';
import { sanitizeText, sanitizeCsvCell } from './security';
import { smsService } from '../services/smsService';

describe('CSV & Security Utilities', () => {
  it('parses valid CSV string into rows and columns', () => {
    const csv = 'Name,Grade,Section\nJohn Doe,10,Rizal\nJane Smith,11,Bonifacio';
    const rows = parseCsvString(csv);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual(['Name', 'Grade', 'Section']);
    expect(rows[1]).toEqual(['John Doe', '10', 'Rizal']);
    expect(rows[2]).toEqual(['Jane Smith', '11', 'Bonifacio']);
  });

  it('parses quoted commas and line breaks inside fields', () => {
    const rows = parseCsvString('Name,Details\r\nJane Doe,"Line one, with comma\nline two"\r\n');
    expect(rows).toEqual([
      ['Name', 'Details'],
      ['Jane Doe', 'Line one, with comma\nline two']
    ]);
  });

  it('detects tab-delimited spreadsheet exports', () => {
    expect(parseCsvString('First Name\tLast Name\tEmail\nAda\tLovelace\tada@example.com')).toEqual([
      ['First Name', 'Last Name', 'Email'],
      ['Ada', 'Lovelace', 'ada@example.com']
    ]);
  });

  it('escapes CSV formula injection patterns', () => {
    const maliciousFormula = '=SUM(1+1)';
    const sanitized = sanitizeCsvCell(maliciousFormula);
    expect(sanitized.startsWith("'")).toBe(true);
  });

  it('sanitizes potentially malicious HTML text', () => {
    const dirty = '<script>alert("xss")</script>Hello';
    const clean = sanitizeText(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hello');
  });

  it('generates unique URL-safe temporary account passwords', () => {
    const passwords = Array.from({ length: 100 }, generateTemporaryPassword);
    expect(new Set(passwords).size).toBe(passwords.length);
    for (const password of passwords) {
      expect(password).toMatch(/^[A-Za-z0-9_-]{24}$/);
    }
  });
});

describe('SMS Service Utilities', () => {
  it('sanitizes recipient phone numbers', () => {
    expect(smsService.sanitizePhoneNumber('+63 (912) 345-6789')).toBe('+639123456789');
    expect(smsService.sanitizePhoneNumber('0912-345-6789')).toBe('09123456789');
    expect(smsService.sanitizePhoneNumber('')).toBe('');
  });
});
