// Comprehensive Bad Word Filter & 18+ Content Detector

export const nsfw18PlusKeywords = [
  '18+', 'nsfw', 'porn', 'porno', 'hentai', 'xxx', 'sex', 'seks', 'erotic', 'erotika', 'nude', 'nudity', 'adult',
  'bitch', 'fuck', 'shit', 'dick', 'pussy', 'ass', 'cunt', 'anal', 'boobs', 'ecchi', 'sukebe',
  'lüt', 'sik', 'qancıq', 'göt', 'amq', 'sikiş', 'amcama', 'pornstar', 'xvideos', 'onlyfans',
  'brazzers', 'xhamster', 'redtube', 'phub', 'pornography', 'escort', 'fap', 'milf', 'fetish',
  'kahpe', 'orosbu', 'fahişe', 'fuhuş', 's1k', 's1k1s', 'p0rn', 'fuc*', 'f*ck', 'b!tch'
];

export const badWordsDictionary = [
  ...nsfw18PlusKeywords,
  'söyüş', 'it', 'köpək', 'dıllağ', 'bic', 'peyser', 'peyşər', 'götverən', 'amciq', 'amcıq', 'gandun', 'qandon',
  'p...r', 'orospu', 'sikdir', 'sg', 'oç', 'amk', 'aq', 'sikim', 'sikimmm', 'kahbe', 'pic', 'piç'
];

// Map common leetspeak & bypass symbols to standard characters
export function normalizeText(text: string): string {
  if (!text) return '';
  let normalized = text.toLowerCase();

  // Character substitutions for bypass detection
  const substitutions: Record<string, string> = {
    '@': 'a',
    '4': 'a',
    '8': 'b',
    '3': 'e',
    '1': 'i',
    '!': 'i',
    '|': 'i',
    '0': 'o',
    '5': 's',
    '$': 's',
    '7': 't',
    '+': 't',
    'v': 'u',
    'u': 'u',
    '*': '',
    '.': '',
    '_': '',
    '-': '',
    ' ': ''
  };

  return normalized
    .split('')
    .map(ch => substitutions[ch] !== undefined ? substitutions[ch] : ch)
    .join('');
}

export interface ContentFilterResult {
  isValid: boolean;
  has18Plus: boolean;
  hasProfanity: boolean;
  detectedWords: string[];
  reason?: string;
  censoredText: string;
}

export function detectBadWords(text?: string): ContentFilterResult {
  if (!text || !text.trim()) {
    return {
      isValid: true,
      has18Plus: false,
      hasProfanity: false,
      detectedWords: [],
      censoredText: ''
    };
  }

  const rawLower = text.toLowerCase();
  const normalized = normalizeText(text);

  const detectedWordsSet = new Set<string>();
  let has18Plus = false;
  let hasProfanity = false;

  for (const word of badWordsDictionary) {
    const wordLower = word.toLowerCase();
    const wordNormalized = normalizeText(word);

    // Check direct match or normalized match
    if (
      rawLower.includes(wordLower) || 
      (wordNormalized.length >= 3 && normalized.includes(wordNormalized))
    ) {
      detectedWordsSet.add(word);
      if (nsfw18PlusKeywords.includes(wordLower)) {
        has18Plus = true;
      } else {
        hasProfanity = true;
      }
    }
  }

  const detectedWords = Array.from(detectedWordsSet);
  const isValid = detectedWords.length === 0;

  let censoredText = text;
  detectedWords.forEach(word => {
    const reg = new RegExp(word, 'gi');
    censoredText = censoredText.replace(reg, '*'.repeat(word.length));
  });

  let reason = undefined;
  if (!isValid) {
    if (has18Plus) {
      reason = `🚫 18+ və ya NSFW məzmun aşkar edildi! (${detectedWords.join(', ')})`;
    } else {
      reason = `⚠️ Əxlaqsız və ya qadağan olunmuş söz daxil edilib! (${detectedWords.join(', ')})`;
    }
  }

  return {
    isValid,
    has18Plus,
    hasProfanity,
    detectedWords,
    reason,
    censoredText
  };
}
