export const matchesWard = (cWard?: string, userWard?: string): boolean => {
  if (!userWard) return true;
  if (!cWard) return false;

  const w1 = cWard.toLowerCase().trim();
  const w2 = userWard.toLowerCase().trim();

  if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) return true;

  const digit1 = w1.match(/\d+/)?.[0];
  const digit2 = w2.match(/\d+/)?.[0];

  if (digit1 && digit2 && digit1 === digit2) {
    return true;
  }

  return false;
};
