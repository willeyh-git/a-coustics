// Prime number utilities

export function isPrime(n: number): boolean {
  if (n <= 1) return false; // Primes must be greater than 1
  if (n === 2) return true; // 2 is the only even prime
  if (n % 2 === 0) return false; // Exclude even numbers
  
  // Check divisibility up to sqrt(n)
  const sqrtN = Math.sqrt(n);
  for (let i = 3; i <= sqrtN; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function generatePrimes(limit: number): number[] {
  const primes: number[] = [];
  
  // Edge case: limit < 2
  if (limit < 2) return primes;
  
  for (let n = 2; n <= limit; n++) {
    if (isPrime(n)) primes.push(n);
  }
  return primes;
}