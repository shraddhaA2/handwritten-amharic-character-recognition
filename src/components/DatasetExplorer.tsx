import React, { useState, useMemo } from "react";
import { Search, Database, Filter, Eye, Check } from "lucide-react";
import { AMHARIC_BASE_FAMILIES, VOWEL_ORDERS } from "../data/categories";

interface DatasetExplorerProps {
  onSelectSample?: (classId: string, char: string) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ onSelectSample }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  // Generate full 238 matrix
  const fullCategories = useMemo(() => {
    const list = [];
    let counter = 1;

    // Standard consonant vowel matrices in Fidäl
    const glyphMatrix: Record<string, string[]> = {
      he: ["ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ"],
      le: ["ለ", "ሉ", "ሊ", "ላ", "ሌ", "ል", "ሎ"],
      hhe: ["ሐ", "ሑ", "ሒ", "ሓ", "ሔ", "ሕ", "ሖ"],
      me: ["መ", "ሙ", "ሚ", "ማ", "ሜ", "ም", "ሞ"],
      sse: ["ሠ", "ሡ", "ሢ", "ሣ", "ሤ", "ሥ", "ሦ"],
      re: ["ረ", "ሩ", "ሪ", "ራ", "ሬ", "ር", "ሮ"],
      se: ["ሰ", "ሱ", "ሲ", "ሳ", "ሴ", "ስ", "ሶ"],
      she: ["ሸ", "ሹ", "ሺ", "ሻ", "ሼ", "ሽ", "ሾ"],
      qe: ["ቀ", "ቁ", "ቂ", "ቃ", "ቄ", "ቅ", "ቆ"],
      be: ["በ", "ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ"],
      ve: ["ቨ", "ቩ", "ቪ", "ቫ", "ቬ", "ቭ", "ቮ"],
      te: ["ተ", "ቱ", "ቲ", "ታ", "ቴ", "ት", "ቶ"],
      che: ["ቸ", "ቹ", "ቺ", "ቻ", "ቼ", "ች", "ቾ"],
      xhe: ["ኀ", "ኁ", "ኂ", "ኃ", "ኄ", "ኅ", "ኆ"],
      ne: ["ነ", "ኑ", "ኒ", "ና", "ኔ", "ን", "ኖ"],
      nye: ["ኘ", "ኙ", "ኚ", "ኛ", "ኜ", "ኝ", "ኞ"],
      alef: ["አ", "ኡ", "ኢ", "ኣ", "ኤ", "እ", "ኦ"],
      ke: ["ከ", "ኩ", "ኪ", "ካ", "ኬ", "ክ", "ኮ"],
      khe: ["ኸ", "ኹ", "ኺ", "ኻ", "ኼ", "ኽ", "ኾ"],
      we: ["ወ", "ዉ", "ዊ", "ዋ", "ዌ", "ው", "ዎ"],
      ayin: ["ዐ", "ዑ", "ዒ", "ዓ", "ዔ", "ዕ", "ዖ"],
      ze: ["ዘ", "ዙ", "ዚ", "ዛ", "ዜ", "ዝ", "ዞ"],
      zhe: ["ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ"],
      ye: ["የ", "ዩ", "ዪ", "ያ", "ዬ", "ይ", "ዮ"],
      de: ["ደ", "ዱ", "ዲ", "ዳ", "ዴ", "ድ", "ዶ"],
      je: ["ጀ", "ጁ", "ጂ", "ጃ", "ጄ", "ጅ", "ጆ"],
      ge: ["ገ", "ጉ", "ጊ", "ጋ", "ጌ", "ግ", "ጎ"],
      tte: ["ጠ", "ጡ", "ጢ", "ጣ", "ጤ", "ጥ", "ጦ"],
      chee: ["ጨ", "ጩ", "ጪ", "ጫ", "ጬ", "ጭ", "ጮ"],
      ppe: ["ጰ", "ጱ", "ጲ", "ጳ", "ጴ", "ጵ", "ጶ"],
      tse: ["ጸ", "ጹ", "ጺ", "ጻ", "ጼ", "ጽ", "ጾ"],
      tts: ["ፀ", "ፁ", "ፂ", "ፃ", "ፄ", "ፅ", "ፆ"],
      fe: ["ፈ", "ፉ", "ፊ", "ፋ", "ፌ", "ፍ", "ፎ"],
      pe: ["ፐ", "ፑ", "ፒ", "ፓ", "ፔ", "ፕ", "ፖ"],
    };

    const phoneticMatrix: Record<string, string[]> = {
      he: ["he", "hu", "hi", "ha", "hee", "h", "ho"],
      le: ["le", "lu", "li", "la", "lee", "l", "lo"],
      hhe: ["hhe", "hhu", "hhi", "hha", "hhee", "hh", "hho"],
      me: ["me", "mu", "mi", "ma", "mee", "m", "mo"],
      sse: ["sse", "ssu", "ssi", "ssa", "ssee", "ss", "sso"],
      re: ["re", "ru", "ri", "ra", "ree", "r", "ro"],
      se: ["se", "su", "si", "sa", "see", "s", "so"],
      she: ["she", "shu", "shi", "sha", "shee", "sh", "sho"],
      qe: ["qe", "qu", "qi", "qa", "qee", "q", "qo"],
      be: ["be", "bu", "bi", "ba", "bee", "b", "bo"],
      ve: ["ve", "vu", "vi", "va", "vee", "v", "vo"],
      te: ["te", "tu", "ti", "ta", "tee", "t", "to"],
      che: ["che", "chu", "chi", "cha", "chee", "ch", "cho"],
      xhe: ["xhe", "xhu", "xhi", "xha", "xhee", "xh", "xho"],
      ne: ["ne", "nu", "ni", "na", "nee", "n", "no"],
      nye: ["nye", "nyu", "nyi", "nya", "nyee", "ny", "nyo"],
      alef: ["'e", "'u", "'i", "'a", "'ee", "'", "'o"],
      ke: ["ke", "ku", "ki", "ka", "kee", "k", "ko"],
      khe: ["khe", "khu", "khi", "kha", "khee", "kh", "kho"],
      we: ["we", "wu", "wi", "wa", "wee", "w", "wo"],
      ayin: ["ae", "au", "ai", "aa", "aee", "a", "ao"],
      ze: ["ze", "zu", "zi", "za", "zee", "z", "zo"],
      zhe: ["zhe", "zhu", "zhi", "zha", "zhee", "zh", "zho"],
      ye: ["ye", "yu", "yi", "ya", "yee", "y", "yo"],
      de: ["de", "du", "di", "da", "dee", "d", "do"],
      je: ["je", "ju", "ji", "ja", "jee", "j", "jo"],
      ge: ["ge", "gu", "gi", "ga", "gee", "g", "go"],
      tte: ["tte", "ttu", "tti", "tta", "ttee", "tt", "tto"],
      chee: ["che", "chu", "chi", "cha", "chee", "ch", "cho"],
      ppe: ["ppe", "ppu", "ppi", "ppa", "ppee", "pp", "ppo"],
      tse: ["tse", "tsu", "tsi", "tsa", "tsee", "ts", "tso"],
      tts: ["ttse", "ttsu", "ttsi", "ttsa", "ttsee", "tts", "ttso"],
      fe: ["fe", "fu", "fi", "fa", "fee", "f", "fo"],
      pe: ["pe", "pu", "pi", "pa", "pee", "p", "po"],
    };

    for (const base of AMHARIC_BASE_FAMILIES) {
      const glyphs = glyphMatrix[base.id] || ["?", "?", "?", "?", "?", "?", "?"];
      const phonetics = phoneticMatrix[base.id] || ["", "", "", "", "", "", ""];

      for (let order = 1; order <= 7; order++) {
        const glyph = glyphs[order - 1];
        const phon = phonetics[order - 1];
        const classId = `${String(counter).padStart(3, "0")}${phon}`;
        list.push({
          index: counter - 1,
          class_id: classId,
          character: glyph,
          base_family: base.name,
          base_char: base.char,
          base_id: base.id,
          order: order,
          order_name: VOWEL_ORDERS[order - 1].name,
          phonetic: phon,
          sample_filename: `${classId}.1.jpg`,
        });
        counter++;
      }
    }
    return list;
  }, []);

  const filtered = useMemo(() => {
    return fullCategories.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.character.includes(searchTerm) ||
        item.phonetic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.base_family.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOrder = selectedOrder === null || item.order === selectedOrder;

      return matchesSearch && matchesOrder;
    });
  }, [fullCategories, searchTerm, selectedOrder]);

  return (
    <div id="dataset-explorer-view" className="flex flex-col gap-5 p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Database className="w-5 h-5 text-slate-700" />
            Amharic Handwritten Dataset Explorer (238 Classes)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            37,804 total handwritten character images (Dataset 1 + Dataset 2) across 34 base consonants × 7 vowel orders.
          </p>
        </div>

        {/* Dataset Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-2xs">
            37,804 Images
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-2xs">
            238 Classes
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200 shadow-2xs">
            70% Train • 15% Val • 15% Test
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by class identifier (e.g. 001he, 238po) or Amharic character..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-xs text-slate-800 outline-hidden transition bg-white"
          />
        </div>

        {/* Vowel Order Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedOrder === null
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Orders
          </button>
          {VOWEL_ORDERS.map((o) => (
            <button
              key={o.order}
              type="button"
              onClick={() => setSelectedOrder(o.order)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedOrder === o.order
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Order {o.order}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Showing {filtered.length} of 238 categories</span>
        <span>Image format: 28×28 Grayscale JPEG</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 max-h-[460px] overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
        {filtered.map((item) => (
          <div
            key={item.class_id}
            className="flex flex-col p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-400 hover:shadow-2xs transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl font-bold font-serif text-slate-900">
                {item.character}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                O{item.order}
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-slate-800 leading-tight">
              {item.class_id}
            </span>
            <span className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
              {item.sample_filename}
            </span>

            {onSelectSample && (
              <button
                type="button"
                onClick={() => onSelectSample(item.class_id, item.character)}
                className="mt-2.5 py-1 px-2 rounded-md bg-slate-100 hover:bg-slate-900 hover:text-white text-[10px] font-semibold text-slate-700 transition flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Test Class</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
