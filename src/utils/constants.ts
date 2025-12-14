import path from "path";

export const CHART_TYPES = [
  "age",
  "gender",
  "workplace",
  "industry",
  "location",
  "birth_date",
];

export const CHART_TYPES_TO_GENERATE = ["pie", "bar", "both"];

export const FONTS = {
  Noto: {
    normal: path.resolve(__dirname, "../fonts/NotoSans-Regular.ttf"),
    bold: path.resolve(__dirname, "../fonts/NotoSans-Bold.ttf"),
    italics: path.resolve(__dirname, "../fonts/NotoSans-Italic.ttf"),
    bolditalics: path.resolve(__dirname, "../fonts/NotoSans-BoldItalic.ttf"),
  },
  NotoSC: {
    normal: path.resolve(__dirname, "../fonts/NotoSansSC-Regular.ttf"),
    bold: path.resolve(__dirname, "../fonts/NotoSansSC-Bold.ttf"),
    italics: path.resolve(__dirname, "../fonts/NotoSansSC-Regular.ttf"),
    bolditalics: path.resolve(__dirname, "../fonts/NotoSansSC-Bold.ttf"),
  },
  NotoJP: {
    normal: path.resolve(__dirname, "../fonts/NotoSansJP-Regular.otf"),
    bold: path.resolve(__dirname, "../fonts/NotoSansJP-Bold.otf"),
    italics: path.resolve(__dirname, "../fonts/NotoSansJP-Regular.otf"),
    bolditalics: path.resolve(__dirname, "../fonts/NotoSansJP-Bold.otf"),
  },
  NotoKR: {
    normal: path.resolve(__dirname, "../fonts/NotoSansKR-Regular.otf"),
    bold: path.resolve(__dirname, "../fonts/NotoSansKR-Bold.otf"),
    italics: path.resolve(__dirname, "../fonts/NotoSansKR-Regular.otf"),
    bolditalics: path.resolve(__dirname, "../fonts/NotoSansKR-Bold.otf"),
  },
};

export const SUPABASE_URL = "https://qykuljbmbksrnqunizsy.supabase.co";

export const OLLAMA_URL = "http://ollama.railway.internal:11434";
