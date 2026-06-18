// Unit tests for QRD and PRD math functions
import { describe, it, expect } from 'vitest';
import { getQuadraticResidues, calculateWellDepths } from './qrd-prd';
import { m } from '../types/core';

describe('getQuadraticResidues', () => {
  it('should return quadratic residues for p=7', () => {
    const residues = getQuadraticResidues(7);
    expect(residues).toEqual([2, 4]); // Quadratic residues mod 7
  });

  it('should return quadratic residues for p=11', () => {
    const residues = getQuadraticResidues(11);
    expect(residues).toEqual([3, 4, 5, 9]); // Quadratic residues mod 11
  });

  it('should return an empty array for non-prime p', () => {
    const residues = getQuadraticResidues(8);
    expect(residues).toEqual([]); // No quadratic residues for non-primes
  });
});

describe('calculateWellDepths (QRD)', () => {
  it('should calculate correct depths for QRD with p=7, q=2', () => {
    const maxDepth = 10 * m;
    const depths = calculateWellDepths(7, 2, undefined, undefined, maxDepth, 7);
    
    // Expected: [0, 5.714..., 11.428..., 17.142..., 22.857..., 28.571..., 34.285...]
    expect(depths).toHaveLength(7);
    expect(depths[0]).toBeCloseTo(0, 3);
    expect(depths[6]).toBeCloseTo(maxDepth, 3);
  });

  it('should throw for invalid quadratic residue', () => {
    // q=1 is not a valid quadratic residue mod 7
    expect(() => calculateWellDepths(7, 1, undefined, undefined, m, 7)).toThrow('Invalid quadratic residue');
  });
});

describe('calculateWellDepths (PRD)', () => {
  it('should calculate correct depths for PRD with p=7, q=2, a=1, b=0', () => {
    const maxDepth = 10 * m;
    const depths = calculateWellDepths(7, 2, 1, 0, maxDepth, 7);
    
    // Expected: [0, 5.714..., 11.428..., 17.142..., 22.857..., 28.571..., 34.285...]
    expect(depths).toHaveLength(7);
    expect(depths[0]).toBeCloseTo(0, 3);
    expect(depths[6]).toBeCloseTo(maxDepth, 3);
  });
});