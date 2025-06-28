import path from "path";

export const CHART_TYPES = [
  "age",
  "gender",
  "workplace",
  "industry",
  "location",
  "birth_date",
] as const;

export const FONTS = {
  Roboto: {
    normal: path.resolve(__dirname, "../fonts/Roboto-Regular.ttf"),
    bold: path.resolve(__dirname, "../fonts/Roboto-Bold.ttf"),
    italics: path.resolve(__dirname, "../fonts/Roboto-Italic.ttf"),
    bolditalics: path.resolve(__dirname, "../fonts/Roboto-BoldItalic.ttf"),
  },
};

export const SUPABASE_URL = "https://qykuljbmbksrnqunizsy.supabase.co";
