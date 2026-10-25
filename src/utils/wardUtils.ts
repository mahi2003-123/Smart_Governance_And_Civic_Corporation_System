export const extractWardNumber = (str?: string): string | null => {
  if (!str) return null;
  const match = str.toLowerCase().match(/(?:ward\s*|w|^)(\d+)/) || str.match(/\d+/);
  return match ? match[1] || match[0] : null;
};

export const cleanWardName = (str?: string): string => {
  if (!str) return '';
  return str
    .replace(/(?:ward\s*\d*\s*[-:]*)/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .trim();
};

export const formatWardName = (wardNumber: number | string, name: string): string => {
  const clean = (name || '').trim();
  if (clean.toLowerCase().startsWith('ward')) {
    return clean;
  }
  return `Ward ${wardNumber} - ${clean}`;
};

export const matchesWard = (cWard?: string, userWard?: string): boolean => {
  if (!userWard || userWard === 'ALL' || userWard.toLowerCase().includes('all wards') || userWard.toLowerCase().includes('system wide')) return true;
  if (!cWard) return false;

  const w1 = cWard.toLowerCase().trim();
  const w2 = userWard.toLowerCase().trim();

  if (w1 === w2) return true;

  const digit1 = extractWardNumber(w1);
  const digit2 = extractWardNumber(w2);

  if (digit1 && digit2) {
    return digit1 === digit2;
  }

  const clean1 = cleanWardName(w1);
  const clean2 = cleanWardName(w2);

  if (clean1 && clean2 && (clean1.includes(clean2) || clean2.includes(clean1))) {
    return true;
  }

  // SGCS standard ward keywords alias table
  const wardAliases: Record<string, string[]> = {
    '1': ['central', 'central town'],
    '2': ['riverside', 'riverside north', 'south'],
    '3': ['east', 'east hill', 'east hill view', 'hill view'],
    '4': ['green valley', 'green valley south', 'valley south'],
  };

  for (const [num, keywords] of Object.entries(wardAliases)) {
    const w1Matches = (digit1 === num) || keywords.some((k) => w1.includes(k));
    const w2Matches = (digit2 === num) || keywords.some((k) => w2.includes(k));
    if (w1Matches && w2Matches) {
      return true;
    }
  }

  return false;
};
