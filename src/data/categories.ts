import { AmharicCategory } from "../types";

export const AMHARIC_BASE_FAMILIES = [
  { id: "he", char: "ሀ", name: "Hä (Ha)", count: 7 },
  { id: "le", char: "ለ", name: "Lä (La)", count: 7 },
  { id: "hhe", char: "ሐ", name: "Hhä (Hha)", count: 7 },
  { id: "me", char: "መ", name: "Mä (Ma)", count: 7 },
  { id: "sse", char: "ሠ", name: "Ssä (Ssa)", count: 7 },
  { id: "re", char: "ረ", name: "Rä (Ra)", count: 7 },
  { id: "se", char: "ሰ", name: "Sä (Sa)", count: 7 },
  { id: "she", char: "ሸ", name: "Shä (Sha)", count: 7 },
  { id: "qe", char: "ቀ", name: "Qä (Qa)", count: 7 },
  { id: "be", char: "በ", name: "Bä (Ba)", count: 7 },
  { id: "ve", char: "ቨ", name: "Vä (Va)", count: 7 },
  { id: "te", char: "ተ", name: "Tä (Ta)", count: 7 },
  { id: "che", char: "ቸ", name: "Chä (Cha)", count: 7 },
  { id: "xhe", char: "ኀ", name: "Xhä (Xha)", count: 7 },
  { id: "ne", char: "ነ", name: "Nä (Na)", count: 7 },
  { id: "nye", char: "ኘ", name: "Nyä (Nya)", count: 7 },
  { id: "alef", char: "አ", name: "’ä (A)", count: 7 },
  { id: "ke", char: "ከ", name: "Kä (Ka)", count: 7 },
  { id: "khe", char: "ኸ", name: "Khä (Kha)", count: 7 },
  { id: "we", char: "ወ", name: "Wä (Wa)", count: 7 },
  { id: "ayin", char: "ዐ", name: "‘ä (Aa)", count: 7 },
  { id: "ze", char: "ዘ", name: "Zä (Za)", count: 7 },
  { id: "zhe", char: "ዠ", name: "Zhä (Zha)", count: 7 },
  { id: "ye", char: "የ", name: "Yä (Ya)", count: 7 },
  { id: "de", char: "ደ", name: "Dä (Da)", count: 7 },
  { id: "je", char: "ጀ", name: "Jä (Ja)", count: 7 },
  { id: "ge", char: "ገ", name: "Gä (Ga)", count: 7 },
  { id: "tte", char: "ጠ", name: "Ttä (Tta)", count: 7 },
  { id: "chee", char: "ጨ", name: "Ch'ä (Cha)", count: 7 },
  { id: "ppe", char: "ጰ", name: "P'ä (Ppa)", count: 7 },
  { id: "tse", char: "ጸ", name: "Tsä (Tsa)", count: 7 },
  { id: "tts", char: "ፀ", name: "Ttsä (Ttsa)", count: 7 },
  { id: "fe", char: "ፈ", name: "Fä (Fa)", count: 7 },
  { id: "pe", char: "ፐ", name: "Pä (Pa)", count: 7 },
];

export const VOWEL_ORDERS = [
  { order: 1, name: "1st Order (Ge'ez)", vowel: "ä / e" },
  { order: 2, name: "2nd Order (Ka'eb)", vowel: "u" },
  { order: 3, name: "3rd Order (Salis)", vowel: "i" },
  { order: 4, name: "4th Order (Rabi)", vowel: "a" },
  { order: 5, name: "5th Order (Hamis)", vowel: "é / ee" },
  { order: 6, name: "6th Order (Sadis)", vowel: "ə / -" },
  { order: 7, name: "7th Order (Sabi)", vowel: "o" },
];

// Presets for quick live testing in UI
export const PRESET_SAMPLES: { class_id: string; character: string; name: string; phonetic: string; svgPath: string }[] = [
  {
    class_id: "001he",
    character: "ሀ",
    name: "001he.1.jpg (ሀ)",
    phonetic: "he",
    svgPath: "M 40 30 L 40 110 M 40 65 L 100 65 M 100 30 L 100 110"
  },
  {
    class_id: "008le",
    character: "ለ",
    name: "008le.1.jpg (ለ)",
    phonetic: "le",
    svgPath: "M 40 40 L 70 100 L 100 40"
  },
  {
    class_id: "015hhe",
    character: "ሐ",
    name: "015hhe.1.jpg (ሐ)",
    phonetic: "hhe",
    svgPath: "M 35 40 L 35 100 L 105 100 L 105 40"
  },
  {
    class_id: "022me",
    character: "መ",
    name: "022me.1.jpg (መ)",
    phonetic: "me",
    svgPath: "M 40 40 L 40 100 L 70 100 L 70 40 L 100 40 L 100 100"
  },
  {
    class_id: "036re",
    character: "ረ",
    name: "036re.1.jpg (ረ)",
    phonetic: "re",
    svgPath: "M 40 40 L 100 40 L 100 100"
  },
  {
    class_id: "043se",
    character: "ሰ",
    name: "043se.1.jpg (ሰ)",
    phonetic: "se",
    svgPath: "M 40 40 L 40 100 M 70 40 L 70 100 M 40 70 L 100 70 M 100 40 L 100 100"
  },
  {
    class_id: "064be",
    character: "በ",
    name: "064be.1.jpg (በ)",
    phonetic: "be",
    svgPath: "M 40 40 L 40 100 L 100 100 L 100 40 M 40 40 L 100 40"
  },
  {
    class_id: "078te",
    character: "ተ",
    name: "078te.1.jpg (ተ)",
    phonetic: "te",
    svgPath: "M 40 40 L 100 40 M 70 40 L 70 100 M 50 100 L 90 100"
  },
  {
    class_id: "113'e",
    character: "አ",
    name: "113'e.1.jpg (አ)",
    phonetic: "'e",
    svgPath: "M 40 40 L 40 100 M 40 70 L 80 40 L 80 100"
  },
  {
    class_id: "120ke",
    character: "ከ",
    name: "120ke.1.jpg (ከ)",
    phonetic: "ke",
    svgPath: "M 40 40 L 100 40 M 40 40 L 40 100 L 100 100"
  },
  {
    class_id: "134we",
    character: "ወ",
    name: "134we.1.jpg (ወ)",
    phonetic: "we",
    svgPath: "M 40 50 C 40 30, 70 30, 70 50 C 70 70, 100 70, 100 90 L 100 100 L 40 100"
  },
  {
    class_id: "238po",
    character: "ፖ",
    name: "238po.1.jpg (ፖ)",
    phonetic: "po",
    svgPath: "M 40 40 L 40 100 L 80 100 L 80 40 M 35 40 L 85 40 M 80 70 L 105 70"
  }
];
