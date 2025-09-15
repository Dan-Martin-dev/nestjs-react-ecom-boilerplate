export type PasswordStrengthLabel = 'weak' | 'medium' | 'strong' | 'very-strong' | null;

export function computePasswordStrength(password: string): { score: number; label: PasswordStrengthLabel } {
  if (!password) return { score: 0, label: null };

  let score = 0;

  // Length check
  if (password.length > 5) score += 10;
  if (password.length > 8) score += 15;
  if (password.length > 12) score += 15;

  // Complexity checks
  if (/[A-Z]/.test(password)) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  // Variety check (reward unique chars)
  const uniqueChars = new Set(password.split('')).size;
  score += Math.min(uniqueChars * 2, 15);

  score = Math.min(score, 100);

  const label: PasswordStrengthLabel =
    score < 30 ? 'weak' : score < 60 ? 'medium' : score < 80 ? 'strong' : 'very-strong';

  return { score, label };
}
