export enum ZodiacSign {
  ARIES = "aries",
  TAURUS = "taurus",
  GEMINI = "gemini",
  CANCER = "cancer",
  LEO = "leo",
  VIRGO = "virgo",
  LIBRA = "libra",
  SCORPIO = "scorpio",
  SAGITTARIUS = "sagittarius",
  CAPRICORN = "capricorn",
  AQUARIUS = "aquarius",
  PISCES = "pisces"
}

export enum TimeFrame {
  TODAY = "сегодня",
  TOMORROW = "завтра",
  WEEK = "неделя",
  MONTH = "месяц"
}

export interface HoroscopeResponse {
  sign: ZodiacSign;
  date: string;
  prediction: string;
  lucky_numbers: number[];
  compatibility: ZodiacSign | null;
  mood: string;
  time_frame: TimeFrame;
}

export interface ErrorResponse {
  detail: string;
}

export type DateRange = [
  [number, number],
  [number, number],
  ZodiacSign
];

export type CompatibilityMap = {
  [key in ZodiacSign]: ZodiacSign[];
};

export type PredictionMap = {
  [key in ZodiacSign]: {
    [key in TimeFrame]: string;
  };
};