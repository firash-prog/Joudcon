export type Lang = 'en' | 'ar';
export const t = (row: any, field: string, lang: Lang) =>
  row?.[`${field}_${lang}`] ?? row?.[`${field}_en`] ?? '';
