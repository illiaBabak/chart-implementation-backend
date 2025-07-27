import { supabase } from "..";
import { Chart } from "../types";
import { isChart, isChartArray } from "../utils/guards";

export const insertChart = async (chart: Chart) => {
  const { error } = await supabase.from("charts").insert(chart);

  if (error) throw error;
};

export const uploadPdf = async (key: string, pdfBuffer: Buffer) => {
  const { error } = await supabase.storage
    .from("documents")
    .upload(`${key}.pdf`, pdfBuffer);

  if (error) throw error;
};

export const updateChart = async (key: string, chart: Partial<Chart>) => {
  const { error } = await supabase.from("charts").update(chart).eq("key", key);

  if (error) throw error;
};

export const getChart = async (key: string): Promise<Chart | null> => {
  const { data, error } = await supabase
    .from("charts")
    .select("*")
    .eq("key", key);

  if (error) throw error;

  return isChart(data[0]) ? data[0] : null;
};

export const getCharts = async (chartType: string): Promise<Chart[]> => {
  const { data, error } = await supabase
    .from("charts")
    .select("*")
    .eq("chart_type", chartType)
    .order("version", { ascending: true });

  if (error) throw error;

  return isChartArray(data) ? data : [];
};

export const getLatestVersionOfChartType = async (
  chartType: string
): Promise<number> => {
  const { data } = await supabase
    .from("charts")
    .select("*")
    .eq("chart_type", chartType)
    .order("version", { ascending: false })
    .limit(1);

  return isChart(data?.[0]) ? data[0].version : 0;
};

export const deleteChart = async (key: string) => {
  const { error: chartError } = await supabase
    .from("charts")
    .delete()
    .eq("key", key);

  if (chartError) throw chartError;

  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([`${key}.pdf`]);

  if (storageError) throw storageError;
};
