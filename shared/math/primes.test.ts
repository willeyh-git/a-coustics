// Unit tests for prime number utilities
import { describe, it, expect } from 'vitest';
import { isPrime, generatePrimes } from './primes';

describe('isPrime', () => {
  it('should return true for prime numbers', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(11)).toBe(true);
  });

  it('should return false for non-prime numbers', () => {
    expect(isPrime(1)).toBe(false); // 1 is not a prime
    expect(isPrime(4)).toBe(false);
    expect(isPrime(9)).toBe(false);
    expect(isPrime(15)).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isPrime(-1)).toBe(false); // Negative numbers
    expect(isPrime(0)).toBe(false);  // Zero
  });
});

describe('generatePrimes', () => {
  it('should generate primes up to a given limit', () => {
    const primes = generatePrimes(10);
    expect(primes).toEqual([2, 3, 5, 7]);
  });

  it('should return an empty array for limit < 2', () => {
    expect(generatePrimes(1)).toEqual([]);
    expect(generatePrimes(0)).toEqual([]);
  });
});