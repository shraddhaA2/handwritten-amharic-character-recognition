import { FidelCharacter, FidelFamily } from '../types';

export const ORDER_NAMES = [
  { order: 1, name: "Ge'ez", amharic: "ግዕዝ", vowel: "ä", vowelDesc: "First order (/ä/)" },
  { order: 2, name: "Ka'eb", amharic: "ካዕብ", vowel: "u", vowelDesc: "Second order (/u/)" },
  { order: 3, name: "Salis", amharic: "ሣልስ", vowel: "i", vowelDesc: "Third order (/i/)" },
  { order: 4, name: "Rabi", amharic: "ራብዕ", vowel: "a", vowelDesc: "Fourth order (/a/)" },
  { order: 5, name: "Hamis", amharic: "ኃምስ", vowel: "e", vowelDesc: "Fifth order (/e/)" },
  { order: 6, name: "Sadis", amharic: "ሳድስ", vowel: "ɨ", vowelDesc: "Sixth order (/ɨ/ or bare consonant)" },
  { order: 7, name: "Sabi", amharic: "ሳብዕ", vowel: "o", vowelDesc: "Seventh order (/o/)" },
];

export const AMHARIC_FAMILIES_DATA: FidelFamily[] = [
  {
    name: "Hoi (ሀ)",
    baseChar: "ሀ",
    ipa: "/h/",
    englishSound: "h",
    characters: [
      { char: "ሀ", name: "Hä", phonetic: "ha", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Hoi", familyChar: "ሀ", unicode: "U+1200", description: "Hoi first order" },
      { char: "ሁ", name: "Hu", phonetic: "hu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Hoi", familyChar: "ሀ", unicode: "U+1201", description: "Hoi second order (right tick)" },
      { char: "ሂ", name: "Hi", phonetic: "hi", order: 3, orderName: "Salis", vowelSound: "i", family: "Hoi", familyChar: "ሀ", unicode: "U+1202", description: "Hoi third order (bottom right ring)" },
      { char: "ሃ", name: "Haa", phonetic: "ha", order: 4, orderName: "Rabi", vowelSound: "a", family: "Hoi", familyChar: "ሀ", unicode: "U+1203", description: "Hoi fourth order (short left leg)" },
      { char: "ሄ", name: "He", phonetic: "he", order: 5, orderName: "Hamis", vowelSound: "e", family: "Hoi", familyChar: "ሀ", unicode: "U+1204", description: "Hoi fifth order (right foot)" },
      { char: "ህ", name: "H", phonetic: "h", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Hoi", familyChar: "ሀ", unicode: "U+1205", description: "Hoi sixth order (curved roof)" },
      { char: "ሆ", name: "Ho", phonetic: "ho", order: 7, orderName: "Sabi", vowelSound: "o", family: "Hoi", familyChar: "ሀ", unicode: "U+1206", description: "Hoi seventh order (loop modifications)" },
    ]
  },
  {
    name: "Lawe (ለ)",
    baseChar: "ለ",
    ipa: "/l/",
    englishSound: "l",
    characters: [
      { char: "ለ", name: "Lä", phonetic: "le", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Lawe", familyChar: "ለ", unicode: "U+1208", description: "Lawe first order" },
      { char: "ሉ", name: "Lu", phonetic: "lu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Lawe", familyChar: "ለ", unicode: "U+1209", description: "Lawe second order" },
      { char: "ሊ", name: "Li", phonetic: "li", order: 3, orderName: "Salis", vowelSound: "i", family: "Lawe", familyChar: "ለ", unicode: "U+120A", description: "Lawe third order" },
      { char: "ላ", name: "Laa", phonetic: "la", order: 4, orderName: "Rabi", vowelSound: "a", family: "Lawe", familyChar: "ለ", unicode: "U+120B", description: "Lawe fourth order" },
      { char: "ሌ", name: "Le", phonetic: "lay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Lawe", familyChar: "ለ", unicode: "U+120C", description: "Lawe fifth order" },
      { char: "ል", name: "L", phonetic: "l", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Lawe", familyChar: "ለ", unicode: "U+120D", description: "Lawe sixth order" },
      { char: "ሎ", name: "Lo", phonetic: "lo", order: 7, orderName: "Sabi", vowelSound: "o", family: "Lawe", familyChar: "ለ", unicode: "U+120E", description: "Lawe seventh order" },
    ]
  },
  {
    name: "Hawt (ሐ)",
    baseChar: "ሐ",
    ipa: "/ħ/",
    englishSound: "hh",
    characters: [
      { char: "ሐ", name: "Ḥä", phonetic: "hha", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Hawt", familyChar: "ሐ", unicode: "U+1210" },
      { char: "ሑ", name: "Ḥu", phonetic: "hhu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Hawt", familyChar: "ሐ", unicode: "U+1211" },
      { char: "ሒ", name: "Ḥi", phonetic: "hhi", order: 3, orderName: "Salis", vowelSound: "i", family: "Hawt", familyChar: "ሐ", unicode: "U+1212" },
      { char: "ሓ", name: "Ḥaa", phonetic: "hhaa", order: 4, orderName: "Rabi", vowelSound: "a", family: "Hawt", familyChar: "ሐ", unicode: "U+1213" },
      { char: "ሔ", name: "Ḥe", phonetic: "hhe", order: 5, orderName: "Hamis", vowelSound: "e", family: "Hawt", familyChar: "ሐ", unicode: "U+1214" },
      { char: "ሕ", name: "Ḥ", phonetic: "hh", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Hawt", familyChar: "ሐ", unicode: "U+1215" },
      { char: "ሖ", name: "Ḥo", phonetic: "hho", order: 7, orderName: "Sabi", vowelSound: "o", family: "Hawt", familyChar: "ሐ", unicode: "U+1216" },
    ]
  },
  {
    name: "May (መ)",
    baseChar: "መ",
    ipa: "/m/",
    englishSound: "m",
    characters: [
      { char: "መ", name: "Mä", phonetic: "me", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "May", familyChar: "መ", unicode: "U+1218" },
      { char: "ሙ", name: "Mu", phonetic: "mu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "May", familyChar: "መ", unicode: "U+1219" },
      { char: "ሚ", name: "Mi", phonetic: "mi", order: 3, orderName: "Salis", vowelSound: "i", family: "May", familyChar: "መ", unicode: "U+121A" },
      { char: "ማ", name: "Maa", phonetic: "ma", order: 4, orderName: "Rabi", vowelSound: "a", family: "May", familyChar: "መ", unicode: "U+121B" },
      { char: "ሜ", name: "Me", phonetic: "may", order: 5, orderName: "Hamis", vowelSound: "e", family: "May", familyChar: "መ", unicode: "U+121C" },
      { char: "ም", name: "M", phonetic: "m", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "May", familyChar: "መ", unicode: "U+121D" },
      { char: "ሞ", name: "Mo", phonetic: "mo", order: 7, orderName: "Sabi", vowelSound: "o", family: "May", familyChar: "መ", unicode: "U+121E" },
    ]
  },
  {
    name: "Sawt (ሠ)",
    baseChar: "ሠ",
    ipa: "/s/",
    englishSound: "ss",
    characters: [
      { char: "ሠ", name: "Śä", phonetic: "se", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Sawt", familyChar: "ሠ", unicode: "U+1220" },
      { char: "ሡ", name: "Śu", phonetic: "su", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Sawt", familyChar: "ሠ", unicode: "U+1221" },
      { char: "ሢ", name: "Śi", phonetic: "si", order: 3, orderName: "Salis", vowelSound: "i", family: "Sawt", familyChar: "ሠ", unicode: "U+1222" },
      { char: "ሣ", name: "Śaa", phonetic: "sa", order: 4, orderName: "Rabi", vowelSound: "a", family: "Sawt", familyChar: "ሠ", unicode: "U+1223" },
      { char: "ሤ", name: "Śe", phonetic: "say", order: 5, orderName: "Hamis", vowelSound: "e", family: "Sawt", familyChar: "ሠ", unicode: "U+1224" },
      { char: "ሥ", name: "Ś", phonetic: "s", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Sawt", familyChar: "ሠ", unicode: "U+1225" },
      { char: "ሦ", name: "Śo", phonetic: "so", order: 7, orderName: "Sabi", vowelSound: "o", family: "Sawt", familyChar: "ሠ", unicode: "U+1226" },
    ]
  },
  {
    name: "Re'es (ረ)",
    baseChar: "ረ",
    ipa: "/r/",
    englishSound: "r",
    characters: [
      { char: "ረ", name: "Rä", phonetic: "re", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Re'es", familyChar: "ረ", unicode: "U+1228" },
      { char: "ሩ", name: "Ru", phonetic: "ru", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Re'es", familyChar: "ረ", unicode: "U+1229" },
      { char: "ሪ", name: "Ri", phonetic: "ri", order: 3, orderName: "Salis", vowelSound: "i", family: "Re'es", familyChar: "ረ", unicode: "U+122A" },
      { char: "ራ", name: "Raa", phonetic: "ra", order: 4, orderName: "Rabi", vowelSound: "a", family: "Re'es", familyChar: "ረ", unicode: "U+122B" },
      { char: "ሬ", name: "Re", phonetic: "ray", order: 5, orderName: "Hamis", vowelSound: "e", family: "Re'es", familyChar: "ረ", unicode: "U+122C" },
      { char: "ር", name: "R", phonetic: "r", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Re'es", familyChar: "ረ", unicode: "U+122D" },
      { char: "ሮ", name: "Ro", phonetic: "ro", order: 7, orderName: "Sabi", vowelSound: "o", family: "Re'es", familyChar: "ረ", unicode: "U+122E" },
    ]
  },
  {
    name: "Sat (ሰ)",
    baseChar: "ሰ",
    ipa: "/s/",
    englishSound: "s",
    characters: [
      { char: "ሰ", name: "Sä", phonetic: "se", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Sat", familyChar: "ሰ", unicode: "U+1230" },
      { char: "ሱ", name: "Su", phonetic: "su", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Sat", familyChar: "ሰ", unicode: "U+1231" },
      { char: "ሲ", name: "Si", phonetic: "si", order: 3, orderName: "Salis", vowelSound: "i", family: "Sat", familyChar: "ሰ", unicode: "U+1232" },
      { char: "ሳ", name: "Saa", phonetic: "sa", order: 4, orderName: "Rabi", vowelSound: "a", family: "Sat", familyChar: "ሰ", unicode: "U+1233" },
      { char: "ሴ", name: "Se", phonetic: "say", order: 5, orderName: "Hamis", vowelSound: "e", family: "Sat", familyChar: "ሰ", unicode: "U+1234" },
      { char: "ስ", name: "S", phonetic: "s", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Sat", familyChar: "ሰ", unicode: "U+1235" },
      { char: "ሶ", name: "So", phonetic: "so", order: 7, orderName: "Sabi", vowelSound: "o", family: "Sat", familyChar: "ሰ", unicode: "U+1236" },
    ]
  },
  {
    name: "Sha (ሸ)",
    baseChar: "ሸ",
    ipa: "/ʃ/",
    englishSound: "sh",
    characters: [
      { char: "ሸ", name: "Šä", phonetic: "she", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Sha", familyChar: "ሸ", unicode: "U+1238" },
      { char: "ሹ", name: "Šu", phonetic: "shu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Sha", familyChar: "ሸ", unicode: "U+1239" },
      { char: "ሺ", name: "Ši", phonetic: "shi", order: 3, orderName: "Salis", vowelSound: "i", family: "Sha", familyChar: "ሸ", unicode: "U+123A" },
      { char: "ሻ", name: "Šaa", phonetic: "sha", order: 4, orderName: "Rabi", vowelSound: "a", family: "Sha", familyChar: "ሸ", unicode: "U+123B" },
      { char: "ሼ", name: "Še", phonetic: "shay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Sha", familyChar: "ሸ", unicode: "U+123C" },
      { char: "ሽ", name: "Š", phonetic: "sh", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Sha", familyChar: "ሸ", unicode: "U+123D" },
      { char: "ሾ", name: "Šo", phonetic: "sho", order: 7, orderName: "Sabi", vowelSound: "o", family: "Sha", familyChar: "ሸ", unicode: "U+123E" },
    ]
  },
  {
    name: "Qaf (ቀ)",
    baseChar: "ቀ",
    ipa: "/kʼ/",
    englishSound: "q (ejective)",
    characters: [
      { char: "ቀ", name: "Qä", phonetic: "qe", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Qaf", familyChar: "ቀ", unicode: "U+1240" },
      { char: "ቁ", name: "Qu", phonetic: "qu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Qaf", familyChar: "ቀ", unicode: "U+1241" },
      { char: "ቂ", name: "Qi", phonetic: "qi", order: 3, orderName: "Salis", vowelSound: "i", family: "Qaf", familyChar: "ቀ", unicode: "U+1242" },
      { char: "ቃ", name: "Qaa", phonetic: "qa", order: 4, orderName: "Rabi", vowelSound: "a", family: "Qaf", familyChar: "ቀ", unicode: "U+1243" },
      { char: "ቄ", name: "Qe", phonetic: "qay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Qaf", familyChar: "ቀ", unicode: "U+1244" },
      { char: "ቅ", name: "Q", phonetic: "q", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Qaf", familyChar: "ቀ", unicode: "U+1245" },
      { char: "ቆ", name: "Qo", phonetic: "qo", order: 7, orderName: "Sabi", vowelSound: "o", family: "Qaf", familyChar: "ቀ", unicode: "U+1246" },
    ]
  },
  {
    name: "Bet (በ)",
    baseChar: "በ",
    ipa: "/b/",
    englishSound: "b",
    characters: [
      { char: "በ", name: "Bä", phonetic: "be", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Bet", familyChar: "በ", unicode: "U+1260" },
      { char: "ቡ", name: "Bu", phonetic: "bu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Bet", familyChar: "በ", unicode: "U+1261" },
      { char: "ቢ", name: "Bi", phonetic: "bi", order: 3, orderName: "Salis", vowelSound: "i", family: "Bet", familyChar: "በ", unicode: "U+1262" },
      { char: "ባ", name: "Baa", phonetic: "ba", order: 4, orderName: "Rabi", vowelSound: "a", family: "Bet", familyChar: "በ", unicode: "U+1263" },
      { char: "ቤ", name: "Be", phonetic: "bay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Bet", familyChar: "በ", unicode: "U+1264" },
      { char: "ብ", name: "B", phonetic: "b", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Bet", familyChar: "በ", unicode: "U+1265" },
      { char: "ቦ", name: "Bo", phonetic: "bo", order: 7, orderName: "Sabi", vowelSound: "o", family: "Bet", familyChar: "በ", unicode: "U+1266" },
    ]
  },
  {
    name: "Täwe (ተ)",
    baseChar: "ተ",
    ipa: "/t/",
    englishSound: "t",
    characters: [
      { char: "ተ", name: "Tä", phonetic: "te", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Täwe", familyChar: "ተ", unicode: "U+1270" },
      { char: "ቱ", name: "Tu", phonetic: "tu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Täwe", familyChar: "ተ", unicode: "U+1271" },
      { char: "ቲ", name: "Ti", phonetic: "ti", order: 3, orderName: "Salis", vowelSound: "i", family: "Täwe", familyChar: "ተ", unicode: "U+1272" },
      { char: "ታ", name: "Taa", phonetic: "ta", order: 4, orderName: "Rabi", vowelSound: "a", family: "Täwe", familyChar: "ተ", unicode: "U+1273" },
      { char: "ቴ", name: "Te", phonetic: "tay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Täwe", familyChar: "ተ", unicode: "U+1274" },
      { char: "ት", name: "T", phonetic: "t", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Täwe", familyChar: "ተ", unicode: "U+1275" },
      { char: "ቶ", name: "To", phonetic: "to", order: 7, orderName: "Sabi", vowelSound: "o", family: "Täwe", familyChar: "ተ", unicode: "U+1276" },
    ]
  },
  {
    name: "Chä (ቸ)",
    baseChar: "ቸ",
    ipa: "/tʃ/",
    englishSound: "ch",
    characters: [
      { char: "ቸ", name: "Čä", phonetic: "che", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Chä", familyChar: "ቸ", unicode: "U+1278" },
      { char: "ቹ", name: "Ču", phonetic: "chu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Chä", familyChar: "ቸ", unicode: "U+1279" },
      { char: "ቺ", name: "Či", phonetic: "chi", order: 3, orderName: "Salis", vowelSound: "i", family: "Chä", familyChar: "ቸ", unicode: "U+127A" },
      { char: "ቻ", name: "Čaa", phonetic: "cha", order: 4, orderName: "Rabi", vowelSound: "a", family: "Chä", familyChar: "ቸ", unicode: "U+127B" },
      { char: "ቼ", name: "Če", phonetic: "chay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Chä", familyChar: "ቸ", unicode: "U+127C" },
      { char: "ች", name: "Č", phonetic: "ch", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Chä", familyChar: "ቸ", unicode: "U+127D" },
      { char: "ቾ", name: "Čo", phonetic: "cho", order: 7, orderName: "Sabi", vowelSound: "o", family: "Chä", familyChar: "ቸ", unicode: "U+127E" },
    ]
  },
  {
    name: "Nähä (ነ)",
    baseChar: "ነ",
    ipa: "/n/",
    englishSound: "n",
    characters: [
      { char: "ነ", name: "Nä", phonetic: "ne", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Nähä", familyChar: "ነ", unicode: "U+1290" },
      { char: "ኑ", name: "Nu", phonetic: "nu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Nähä", familyChar: "ነ", unicode: "U+1291" },
      { char: "ኒ", name: "Ni", phonetic: "ni", order: 3, orderName: "Salis", vowelSound: "i", family: "Nähä", familyChar: "ነ", unicode: "U+1292" },
      { char: "ና", name: "Naa", phonetic: "na", order: 4, orderName: "Rabi", vowelSound: "a", family: "Nähä", familyChar: "ነ", unicode: "U+1293" },
      { char: "ኔ", name: "Ne", phonetic: "nay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Nähä", familyChar: "ነ", unicode: "U+1294" },
      { char: "ን", name: "N", phonetic: "n", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Nähä", familyChar: "ነ", unicode: "U+1295" },
      { char: "ኖ", name: "No", phonetic: "no", order: 7, orderName: "Sabi", vowelSound: "o", family: "Nähä", familyChar: "ነ", unicode: "U+1296" },
    ]
  },
  {
    name: "Alf (አ)",
    baseChar: "አ",
    ipa: "/ʔ/",
    englishSound: "a (glottal)",
    characters: [
      { char: "አ", name: "’Ä", phonetic: "a", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Alf", familyChar: "አ", unicode: "U+12A0" },
      { char: "ኡ", name: "’U", phonetic: "u", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Alf", familyChar: "አ", unicode: "U+12A1" },
      { char: "ኢ", name: "’I", phonetic: "i", order: 3, orderName: "Salis", vowelSound: "i", family: "Alf", familyChar: "አ", unicode: "U+12A2" },
      { char: "ኣ", name: "’Aa", phonetic: "aa", order: 4, orderName: "Rabi", vowelSound: "a", family: "Alf", familyChar: "አ", unicode: "U+12A3" },
      { char: "ኤ", name: "’E", phonetic: "ay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Alf", familyChar: "አ", unicode: "U+12A4" },
      { char: "እ", name: "’", phonetic: "ih", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Alf", familyChar: "አ", unicode: "U+12A5" },
      { char: "ኦ", name: "’O", phonetic: "o", order: 7, orderName: "Sabi", vowelSound: "o", family: "Alf", familyChar: "አ", unicode: "U+12A6" },
    ]
  },
  {
    name: "Kaf (ከ)",
    baseChar: "ከ",
    ipa: "/k/",
    englishSound: "k",
    characters: [
      { char: "ከ", name: "Kä", phonetic: "ke", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Kaf", familyChar: "ከ", unicode: "U+12A8" },
      { char: "ኩ", name: "Ku", phonetic: "ku", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Kaf", familyChar: "ከ", unicode: "U+12A9" },
      { char: "ኪ", name: "Ki", phonetic: "ki", order: 3, orderName: "Salis", vowelSound: "i", family: "Kaf", familyChar: "ከ", unicode: "U+12AA" },
      { char: "ካ", name: "Kaa", phonetic: "ka", order: 4, orderName: "Rabi", vowelSound: "a", family: "Kaf", familyChar: "ከ", unicode: "U+12AB" },
      { char: "ኬ", name: "Ke", phonetic: "kay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Kaf", familyChar: "ከ", unicode: "U+12AC" },
      { char: "ክ", name: "K", phonetic: "k", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Kaf", familyChar: "ከ", unicode: "U+12AD" },
      { char: "ኮ", name: "Ko", phonetic: "ko", order: 7, orderName: "Sabi", vowelSound: "o", family: "Kaf", familyChar: "ከ", unicode: "U+12AE" },
    ]
  },
  {
    name: "Wäwe (ወ)",
    baseChar: "ወ",
    ipa: "/w/",
    englishSound: "w",
    characters: [
      { char: "ወ", name: "Wä", phonetic: "we", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Wäwe", familyChar: "ወ", unicode: "U+12C8" },
      { char: "ዉ", name: "Wu", phonetic: "wu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Wäwe", familyChar: "ወ", unicode: "U+12C9" },
      { char: "ዊ", name: "Wi", phonetic: "wi", order: 3, orderName: "Salis", vowelSound: "i", family: "Wäwe", familyChar: "ወ", unicode: "U+12CA" },
      { char: "ዋ", name: "Waa", phonetic: "wa", order: 4, orderName: "Rabi", vowelSound: "a", family: "Wäwe", familyChar: "ወ", unicode: "U+12CB" },
      { char: "ዌ", name: "We", phonetic: "way", order: 5, orderName: "Hamis", vowelSound: "e", family: "Wäwe", familyChar: "ወ", unicode: "U+12CC" },
      { char: "ው", name: "W", phonetic: "w", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Wäwe", familyChar: "ወ", unicode: "U+12CD" },
      { char: "ዎ", name: "Wo", phonetic: "wo", order: 7, orderName: "Sabi", vowelSound: "o", family: "Wäwe", familyChar: "ወ", unicode: "U+12CE" },
    ]
  },
  {
    name: "Zäy (ዘ)",
    baseChar: "ዘ",
    ipa: "/z/",
    englishSound: "z",
    characters: [
      { char: "ዘ", name: "Zä", phonetic: "ze", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Zäy", familyChar: "ዘ", unicode: "U+12D8" },
      { char: "ዙ", name: "Zu", phonetic: "zu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Zäy", familyChar: "ዘ", unicode: "U+12D9" },
      { char: "ዚ", name: "Zi", phonetic: "zi", order: 3, orderName: "Salis", vowelSound: "i", family: "Zäy", familyChar: "ዘ", unicode: "U+12DA" },
      { char: "ዛ", name: "Zaa", phonetic: "za", order: 4, orderName: "Rabi", vowelSound: "a", family: "Zäy", familyChar: "ዘ", unicode: "U+12DB" },
      { char: "ዜ", name: "Ze", phonetic: "zay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Zäy", familyChar: "ዘ", unicode: "U+12DC" },
      { char: "ዝ", name: "Z", phonetic: "z", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Zäy", familyChar: "ዘ", unicode: "U+12DD" },
      { char: "ዞ", name: "Zo", phonetic: "zo", order: 7, orderName: "Sabi", vowelSound: "o", family: "Zäy", familyChar: "ዘ", unicode: "U+12DE" },
    ]
  },
  {
    name: "Yäman (የ)",
    baseChar: "የ",
    ipa: "/j/",
    englishSound: "y",
    characters: [
      { char: "የ", name: "Yä", phonetic: "ye", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Yäman", familyChar: "የ", unicode: "U+12E8" },
      { char: "ዩ", name: "Yu", phonetic: "yu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Yäman", familyChar: "የ", unicode: "U+12E9" },
      { char: "ዪ", name: "Yi", phonetic: "yi", order: 3, orderName: "Salis", vowelSound: "i", family: "Yäman", familyChar: "የ", unicode: "U+12EA" },
      { char: "ያ", name: "Yaa", phonetic: "ya", order: 4, orderName: "Rabi", vowelSound: "a", family: "Yäman", familyChar: "የ", unicode: "U+12EB" },
      { char: "ዬ", name: "Ye", phonetic: "yay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Yäman", familyChar: "የ", unicode: "U+12EC" },
      { char: "ይ", name: "Y", phonetic: "y", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Yäman", familyChar: "የ", unicode: "U+12ED" },
      { char: "ዮ", name: "Yo", phonetic: "yo", order: 7, orderName: "Sabi", vowelSound: "o", family: "Yäman", familyChar: "የ", unicode: "U+12EE" },
    ]
  },
  {
    name: "Dänt (ደ)",
    baseChar: "ደ",
    ipa: "/d/",
    englishSound: "d",
    characters: [
      { char: "ደ", name: "Dä", phonetic: "de", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Dänt", familyChar: "ደ", unicode: "U+12F0" },
      { char: "ዱ", name: "Du", phonetic: "du", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Dänt", familyChar: "ደ", unicode: "U+12F1" },
      { char: "ዲ", name: "Di", phonetic: "di", order: 3, orderName: "Salis", vowelSound: "i", family: "Dänt", familyChar: "ደ", unicode: "U+12F2" },
      { char: "ዳ", name: "Daa", phonetic: "da", order: 4, orderName: "Rabi", vowelSound: "a", family: "Dänt", familyChar: "ደ", unicode: "U+12F3" },
      { char: "ዴ", name: "De", phonetic: "day", order: 5, orderName: "Hamis", vowelSound: "e", family: "Dänt", familyChar: "ደ", unicode: "U+12F4" },
      { char: "ድ", name: "D", phonetic: "d", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Dänt", familyChar: "ደ", unicode: "U+12F5" },
      { char: "ዶ", name: "Do", phonetic: "do", order: 7, orderName: "Sabi", vowelSound: "o", family: "Dänt", familyChar: "ደ", unicode: "U+12F6" },
    ]
  },
  {
    name: "Gäml (ገ)",
    baseChar: "ገ",
    ipa: "/ɡ/",
    englishSound: "g",
    characters: [
      { char: "ገ", name: "Gä", phonetic: "ge", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Gäml", familyChar: "ገ", unicode: "U+1308" },
      { char: "ጉ", name: "Gu", phonetic: "gu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Gäml", familyChar: "ገ", unicode: "U+1309" },
      { char: "ጊ", name: "Gi", phonetic: "gi", order: 3, orderName: "Salis", vowelSound: "i", family: "Gäml", familyChar: "ገ", unicode: "U+130A" },
      { char: "ጋ", name: "Gaa", phonetic: "ga", order: 4, orderName: "Rabi", vowelSound: "a", family: "Gäml", familyChar: "ገ", unicode: "U+130B" },
      { char: "ጌ", name: "Ge", phonetic: "gay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Gäml", familyChar: "ገ", unicode: "U+130C" },
      { char: "ግ", name: "G", phonetic: "g", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Gäml", familyChar: "ገ", unicode: "U+130D" },
      { char: "ጎ", name: "Go", phonetic: "go", order: 7, orderName: "Sabi", vowelSound: "o", family: "Gäml", familyChar: "ገ", unicode: "U+130E" },
    ]
  },
  {
    name: "T'äyt (ጠ)",
    baseChar: "ጠ",
    ipa: "/tʼ/",
    englishSound: "t (ejective)",
    characters: [
      { char: "ጠ", name: "Ṭä", phonetic: "t'e", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "T'äyt", familyChar: "ጠ", unicode: "U+1320" },
      { char: "ጡ", name: "Ṭu", phonetic: "t'u", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "T'äyt", familyChar: "ጠ", unicode: "U+1321" },
      { char: "ጢ", name: "Ṭi", phonetic: "t'i", order: 3, orderName: "Salis", vowelSound: "i", family: "T'äyt", familyChar: "ጠ", unicode: "U+1322" },
      { char: "ጣ", name: "Ṭaa", phonetic: "t'a", order: 4, orderName: "Rabi", vowelSound: "a", family: "T'äyt", familyChar: "ጠ", unicode: "U+1323" },
      { char: "ጤ", name: "Ṭe", phonetic: "t'ay", order: 5, orderName: "Hamis", vowelSound: "e", family: "T'äyt", familyChar: "ጠ", unicode: "U+1324" },
      { char: "ጥ", name: "Ṭ", phonetic: "t'", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "T'äyt", familyChar: "ጠ", unicode: "U+1325" },
      { char: "ጦ", name: "Ṭo", phonetic: "t'o", order: 7, orderName: "Sabi", vowelSound: "o", family: "T'äyt", familyChar: "ጠ", unicode: "U+1326" },
    ]
  },
  {
    name: "Ch'ä (ጨ)",
    baseChar: "ጨ",
    ipa: "/tʃʼ/",
    englishSound: "ch (ejective)",
    characters: [
      { char: "ጨ", name: "Č̣ä", phonetic: "ch'e", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Ch'ä", familyChar: "ጨ", unicode: "U+1328" },
      { char: "ጩ", name: "Č̣u", phonetic: "ch'u", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Ch'ä", familyChar: "ጨ", unicode: "U+1329" },
      { char: "ጪ", name: "Č̣i", phonetic: "ch'i", order: 3, orderName: "Salis", vowelSound: "i", family: "Ch'ä", familyChar: "ጨ", unicode: "U+132A" },
      { char: "ጫ", name: "Č̣aa", phonetic: "ch'a", order: 4, orderName: "Rabi", vowelSound: "a", family: "Ch'ä", familyChar: "ጨ", unicode: "U+132B" },
      { char: "ጬ", name: "Č̣e", phonetic: "ch'ay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Ch'ä", familyChar: "ጨ", unicode: "U+132C" },
      { char: "ጭ", name: "Č̣", phonetic: "ch'", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Ch'ä", familyChar: "ጨ", unicode: "U+132D" },
      { char: "ጮ", name: "Č̣o", phonetic: "ch'o", order: 7, orderName: "Sabi", vowelSound: "o", family: "Ch'ä", familyChar: "ጨ", unicode: "U+132E" },
    ]
  },
  {
    name: "Af (ፈ)",
    baseChar: "ፈ",
    ipa: "/f/",
    englishSound: "f",
    characters: [
      { char: "ፈ", name: "Fä", phonetic: "fe", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Af", familyChar: "ፈ", unicode: "U+1348" },
      { char: "ፉ", name: "Fu", phonetic: "fu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Af", familyChar: "ፈ", unicode: "U+1349" },
      { char: "ፊ", name: "Fi", phonetic: "fi", order: 3, orderName: "Salis", vowelSound: "i", family: "Af", familyChar: "ፈ", unicode: "U+134A" },
      { char: "ፋ", name: "Faa", phonetic: "fa", order: 4, orderName: "Rabi", vowelSound: "a", family: "Af", familyChar: "ፈ", unicode: "U+134B" },
      { char: "ፌ", name: "Fe", phonetic: "fay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Af", familyChar: "ፈ", unicode: "U+134C" },
      { char: "ፍ", name: "F", phonetic: "f", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Af", familyChar: "ፈ", unicode: "U+134D" },
      { char: "ፎ", name: "Fo", phonetic: "fo", order: 7, orderName: "Sabi", vowelSound: "o", family: "Af", familyChar: "ፈ", unicode: "U+134E" },
    ]
  },
  {
    name: "Psa (ፐ)",
    baseChar: "ፐ",
    ipa: "/p/",
    englishSound: "p",
    characters: [
      { char: "ፐ", name: "Pä", phonetic: "pe", order: 1, orderName: "Ge'ez", vowelSound: "ä", family: "Psa", familyChar: "ፐ", unicode: "U+1350" },
      { char: "ፑ", name: "Pu", phonetic: "pu", order: 2, orderName: "Ka'eb", vowelSound: "u", family: "Psa", familyChar: "ፐ", unicode: "U+1351" },
      { char: "ፒ", name: "Pi", phonetic: "pi", order: 3, orderName: "Salis", vowelSound: "i", family: "Psa", familyChar: "ፐ", unicode: "U+1352" },
      { char: "ፓ", name: "Paa", phonetic: "pa", order: 4, orderName: "Rabi", vowelSound: "a", family: "Psa", familyChar: "ፐ", unicode: "U+1353" },
      { char: "ፔ", name: "Pe", phonetic: "pay", order: 5, orderName: "Hamis", vowelSound: "e", family: "Psa", familyChar: "ፐ", unicode: "U+1354" },
      { char: "ፕ", name: "P", phonetic: "p", order: 6, orderName: "Sadis", vowelSound: "ɨ", family: "Psa", familyChar: "ፐ", unicode: "U+1355" },
      { char: "ፖ", name: "Po", phonetic: "po", order: 7, orderName: "Sabi", vowelSound: "o", family: "Psa", familyChar: "ፐ", unicode: "U+1356" },
    ]
  }
];

// Flat list of all characters
export const ALL_AMHARIC_CHARACTERS: FidelCharacter[] = AMHARIC_FAMILIES_DATA.flatMap(f => f.characters);

// Quick lookup map by character glyph
export const CHARACTER_BY_GLYPH = new Map<string, FidelCharacter>(
  ALL_AMHARIC_CHARACTERS.map(c => [c.char, c])
);

export function getCharacterDetails(char: string): FidelCharacter {
  const found = CHARACTER_BY_GLYPH.get(char);
  if (found) return found;
  return {
    char: char,
    name: "Amharic Character",
    phonetic: char,
    order: 1,
    orderName: "Ge'ez",
    vowelSound: "ä",
    family: "Unknown",
    familyChar: char,
    unicode: `U+${(char.codePointAt(0) || 0).toString(16).toUpperCase().padStart(4, '0')}`,
    description: "Amharic Fidel glyph"
  };
}

// Preset handwritten sample characters for interactive testing
export const AMHARIC_DATASET_FAMILIES = AMHARIC_FAMILIES_DATA;
export type AmharicCharacterMeta = FidelCharacter;

export interface SamplePreset {
  id: string;
  char: string;
  name: string;
  family: string;
  orderName: string;
  description: string;
  // SVG glyph representation or stroke points
  svgPath: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging (Similar Stems)';
  similarTo: string[];
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "sample_ha",
    char: "ሀ",
    name: "Hä (ሀ)",
    family: "Hoi",
    orderName: "Ge'ez (1st order)",
    description: "Standard top loop with left and right downward legs.",
    svgPath: "M 30,70 Q 30,25 60,25 Q 90,25 90,70 M 30,45 L 90,45",
    difficulty: "Easy",
    similarTo: ["ሁ", "ሂ", "ሃ"]
  },
  {
    id: "sample_la",
    char: "ለ",
    name: "Lä (ለ)",
    family: "Lawe",
    orderName: "Ge'ez (1st order)",
    description: "Two parallel vertical legs joined with a curved top loop.",
    svgPath: "M 35,85 L 35,35 Q 35,20 60,20 Q 85,20 85,35 L 85,85",
    difficulty: "Easy",
    similarTo: ["ሉ", "ሊ", "ላ"]
  },
  {
    id: "sample_ma",
    char: "መ",
    name: "Mä (መ)",
    family: "May",
    orderName: "Ge'ez (1st order)",
    description: "Two rounded bottom loops connected by a center vertical stem.",
    svgPath: "M 25,60 Q 25,85 45,85 Q 60,85 60,60 L 60,25 M 60,60 Q 60,85 75,85 Q 95,85 95,60 L 95,40",
    difficulty: "Medium",
    similarTo: ["ሙ", "ሚ", "ማ"]
  },
  {
    id: "sample_ba",
    char: "በ",
    name: "Bä (በ)",
    family: "Bet",
    orderName: "Ge'ez (1st order)",
    description: "Open square-like base with two vertical parallel stems.",
    svgPath: "M 30,25 L 30,80 L 90,80 L 90,25",
    difficulty: "Easy",
    similarTo: ["ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ"]
  },
  {
    id: "sample_ta",
    char: "ተ",
    name: "Tä (ተ)",
    family: "Täwe",
    orderName: "Ge'ez (1st order)",
    description: "Horizontal top bar with central vertical leg and bottom serif.",
    svgPath: "M 25,25 L 95,25 M 60,25 L 60,85 M 40,85 L 80,85",
    difficulty: "Medium",
    similarTo: ["ቱ", "ቲ", "ታ", "ት"]
  },
  {
    id: "sample_sha",
    char: "ሸ",
    name: "Šä (ሸ)",
    family: "Sha",
    orderName: "Ge'ez (1st order)",
    description: "Trident-like triple vertical stems with connecting lower bar.",
    svgPath: "M 25,25 L 25,80 L 95,80 L 95,25 M 60,35 L 60,80 M 20,25 L 30,25 M 90,25 L 100,25",
    difficulty: "Challenging (Similar Stems)",
    similarTo: ["ሰ", "ሹ", "ሺ", "ሻ"]
  },
  {
    id: "sample_a",
    char: "አ",
    name: "’Ä (አ)",
    family: "Alf",
    orderName: "Ge'ez (1st order)",
    description: "Central vertical spine with two outward curved wings.",
    svgPath: "M 60,20 L 60,85 M 25,45 Q 40,30 60,45 M 60,45 Q 80,30 95,45 M 25,75 Q 40,60 60,75 M 60,75 Q 80,60 95,75",
    difficulty: "Medium",
    similarTo: ["ኡ", "ኢ", "ኣ", "እ"]
  },
  {
    id: "sample_ka",
    char: "ከ",
    name: "Kä (ከ)",
    family: "Kaf",
    orderName: "Ge'ez (1st order)",
    description: "Distinct curved upper loop and lower forward stroke.",
    svgPath: "M 30,85 L 30,35 Q 30,20 60,20 Q 90,20 90,45 Q 90,65 60,65 L 30,65 M 60,65 L 90,85",
    difficulty: "Medium",
    similarTo: ["ኩ", "ኪ", "ካ", "ኮ"]
  },
  {
    id: "sample_wa",
    char: "ወ",
    name: "Wä (ወ)",
    family: "Wäwe",
    orderName: "Ge'ez (1st order)",
    description: "Circular loop attached to a vertical stem with base curve.",
    svgPath: "M 60,25 Q 35,25 35,50 Q 35,75 60,75 Q 85,75 85,50 Q 85,25 60,25 M 85,50 L 85,85 L 65,85",
    difficulty: "Challenging (Similar Stems)",
    similarTo: ["ዉ", "ዊ", "ዋ", "ዐ"]
  },
  {
    id: "sample_da",
    char: "ደ",
    name: "Dä (ደ)",
    family: "Dänt",
    orderName: "Ge'ez (1st order)",
    description: "Open top crescent facing left with horizontal base.",
    svgPath: "M 85,25 Q 40,25 40,55 Q 40,85 85,85",
    difficulty: "Easy",
    similarTo: ["ዱ", "ዲ", "ዳ", "ዶ"]
  },
  {
    id: "sample_ga",
    char: "ገ",
    name: "Gä (ገ)",
    family: "Gäml",
    orderName: "Ge'ez (1st order)",
    description: "Two vertical strokes connected by diagonal cross-beam.",
    svgPath: "M 35,25 L 35,85 M 85,25 L 85,85 M 35,55 L 85,55",
    difficulty: "Easy",
    similarTo: ["ጉ", "ጊ", "ጋ", "ጎ"]
  },
  {
    id: "sample_fa",
    char: "ፈ",
    name: "Fä (ፈ)",
    family: "Af",
    orderName: "Ge'ez (1st order)",
    description: "Closed top box with right extended leg and bottom foot.",
    svgPath: "M 35,25 L 85,25 L 85,60 L 35,60 Z M 85,60 L 85,85 M 70,85 L 95,85",
    difficulty: "Medium",
    similarTo: ["ፉ", "ፊ", "ፋ", "ፌ", "ፍ", "ፎ"]
  }
];
