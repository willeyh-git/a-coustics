// Unit tests for core Length utility functions
import { describe, it, expect } from 'vitest';
import { m } from '../types/core';

describe('Length utility function', () => {
  it('should create a branded type with positive value', () => {
    const length = m(1.5);
    
    // Verify it is a number
    expect(typeof length).toBe('number');
    
    // Verify it is positive
    expect(length).toBeGreaterThan(0);
  });

  it('should throw an error for negative values', () => {
    expect(() => m(-1)).toThrow('Length must be positive');
  });

  it('should handle zero (if applicable)', () => {
    const length = m(0);
    expect(length).toBe(0);
  });
});