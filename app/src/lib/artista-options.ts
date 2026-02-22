// Opções para formulário de artista (gênero e tempo de carreira)

export const GENEROS_MUSICAIS = [
  "sertanejo",
  "funk",
  "pop",
  "pagode",
  "forró",
  "samba",
  "rap",
  "gospel",
  "eletrônica",
  "MPB",
  "rock",
  "outro",
] as const;

export const TEMPOS_CARREIRA = [
  "iniciante",
  "1-3 anos",
  "3-5 anos",
  "5+ anos",
] as const;

export type GeneroMusical = (typeof GENEROS_MUSICAIS)[number];
export type TempoCarreira = (typeof TEMPOS_CARREIRA)[number];
