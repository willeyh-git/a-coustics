import { describe, it, expect } from 'vitest';
import { gcd } from '../number-theory';

describe('gcd', () => {
  it('should calculate the greatest common divisor', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(8, 12)).toBe(4);
    expect(gcd(7, 13)).toBe(1);
    expect(gcd(10, 5)).toBe(5);
    expect(gcd(45, 75)).toBe(15);
    expect(gcd(101, 103)).toBe(1);
  });

  it('should handle zero correctly in gcd', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(0, 0)).toBe(0);
  });
});
