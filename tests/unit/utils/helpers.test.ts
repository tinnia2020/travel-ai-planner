import { describe, it, expect } from 'vitest';
import {
  isValidURL,
  isImageFile,
  formatFileSize,
  truncate,
  escapeHTML,
  calculateUsagePercentage,
  getUsageColor,
} from '../../../src/utils/helpers';

describe('helpers', () => {
  describe('isValidURL', () => {
    it('should validate correct URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('https://example.com/path')).toBe(true);
      expect(isValidURL('https://example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('example.com')).toBe(false);
      expect(isValidURL('')).toBe(false);
    });
  });

  describe('isImageFile', () => {
    it('should validate image files', () => {
      const imageFile = new File([''], 'test.png', { type: 'image/png' });
      expect(isImageFile(imageFile)).toBe(true);

      const jpgFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isImageFile(jpgFile)).toBe(true);
    });

    it('should reject non-image files', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      expect(isImageFile(textFile)).toBe(false);

      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(isImageFile(pdfFile)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('Exactly Ten', 11)).toBe('Exactly Ten');
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHTML('<script>alert("xss")</script>')).toContain('&lt;');
      expect(escapeHTML('<script>alert("xss")</script>')).toContain('&gt;');
      expect(escapeHTML('A & B')).toContain('&amp;');
    });

    it('should not modify safe text', () => {
      expect(escapeHTML('Hello World')).toBe('Hello World');
    });
  });

  describe('calculateUsagePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateUsagePercentage(50, 100)).toBe(50);
      expect(calculateUsagePercentage(25, 100)).toBe(25);
      expect(calculateUsagePercentage(100, 100)).toBe(100);
    });

    it('should handle null values', () => {
      expect(calculateUsagePercentage(null, 100)).toBe(0);
      expect(calculateUsagePercentage(50, null)).toBe(0);
      expect(calculateUsagePercentage(null, null)).toBe(0);
    });

    it('should handle zero limit', () => {
      expect(calculateUsagePercentage(50, 0)).toBe(0);
    });
  });

  describe('getUsageColor', () => {
    it('should return red for low percentage', () => {
      expect(getUsageColor(10)).toBe('#ef4444');
      expect(getUsageColor(19)).toBe('#ef4444');
    });

    it('should return orange for medium percentage', () => {
      expect(getUsageColor(20)).toBe('#f59e0b');
      expect(getUsageColor(40)).toBe('#f59e0b');
      expect(getUsageColor(49)).toBe('#f59e0b');
    });

    it('should return green for high percentage', () => {
      expect(getUsageColor(50)).toBe('#10b981');
      expect(getUsageColor(75)).toBe('#10b981');
      expect(getUsageColor(100)).toBe('#10b981');
    });
  });
});
