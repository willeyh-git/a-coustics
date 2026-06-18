export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function gcd(a: number, b: number): number {
  while (b !== 0) {
    a %= b;
    [a, b] = [b, a];
  }
  return a;
}

export function isCoprime(a: number, b: number): boolean {
  return gcd(a, b) === 1;
}

export function getQuadraticResidues(p: number): number[] {
  const residues = new Set<number>();
  for (let i = 0; i < p; i++) {
    residues.add((i * i) % p);
  }
  return Array.from(residues).sort((a, b) => a - b);
}
