import { describe, it, expect } from 'vitest';
import { isSafePublicUrl } from '../../src/utils/urlValidator.js';

describe('UrlValidator SSRF Protection Unit Tests', () => {
  it('should accept valid public HTTPS URLs', () => {
    expect(isSafePublicUrl('https://legislative.gov.in/constitution')).toBe(true);
    expect(isSafePublicUrl('https://en.wikipedia.org/wiki/Constitution_of_India')).toBe(true);
    expect(isSafePublicUrl('http://news.bbc.co.uk/world')).toBe(true);
  });

  it('should reject non-HTTP(S) protocols', () => {
    expect(isSafePublicUrl('file:///etc/passwd')).toBe(false);
    expect(isSafePublicUrl('ftp://example.com/file')).toBe(false);
    expect(isSafePublicUrl('javascript:alert(1)')).toBe(false);
  });

  it('should reject localhost and loopback addresses', () => {
    expect(isSafePublicUrl('http://localhost:5000/api')).toBe(false);
    expect(isSafePublicUrl('http://127.0.0.1:8080')).toBe(false);
    expect(isSafePublicUrl('http://127.0.0.5:3000')).toBe(false);
  });

  it('should reject private RFC1918 IPv4 ranges', () => {
    expect(isSafePublicUrl('http://10.0.0.1/admin')).toBe(false);
    expect(isSafePublicUrl('http://172.16.0.1/metadata')).toBe(false);
    expect(isSafePublicUrl('http://192.168.1.1/router')).toBe(false);
  });

  it('should reject cloud metadata service IP 169.254.169.254', () => {
    expect(isSafePublicUrl('http://169.254.169.254/latest/meta-data/')).toBe(false);
  });

  it('should reject malformed or empty URLs', () => {
    expect(isSafePublicUrl('')).toBe(false);
    expect(isSafePublicUrl('not-a-valid-url')).toBe(false);
  });
});

