import { describe, it, expect } from 'vitest';
import { isCoprime } from '../number-theory';

describe('isCoprime', () => {
  it('should return true for coprime numbers', () => {
    expect(isCoprime(8, 9)).toBe(true);
    expect(isCoprime(15, 28)).toBe(true);
    expect(isCoprime(7, 13)).toBe(true);
  });

  it('should return false for non-coprime numbers', () => {
    expect(isCoprime(8, 12)).toBe(false);
    expect(isCoprime(15, 20)).toBe(false);
    expect(isCoprime(10, 5)).toBe(false);
  });

  it('should be symmetric', () => {
    expect(isCoprime(8, 9)).toBe(isCoprime(9, 8));
    expect(isCoprime(15, 28)).toBe(isCoprime(28, 15));
  });
});
