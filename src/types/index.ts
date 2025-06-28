export type User = {
  id: number;
  name: string;
  age: number;
  gender: string;
  workplace: string;
  industry: string;
  location: string;
  birth_date: string;
};

export type Chart = {
  chart_type: string;
  status: string;
  version: number;
  key: string;
  url: string | null;
};
