import { ZodiacSign, TimeFrame, HoroscopeResponse, DateRange, CompatibilityMap } from '../models/zodiac';
import { GeminiService } from './geminiService';
import dotenv from 'dotenv';

dotenv.config();

export class HoroscopeService {
  private dateRanges: DateRange[];
  private compatibility: CompatibilityMap;
  private moods: string[];
  private geminiService: GeminiService;
  private defaultPrediction: string;

  constructor() {
    this.dateRanges = [
      [[3, 21], [4, 19], ZodiacSign.ARIES],
      [[4, 20], [5, 20], ZodiacSign.TAURUS],
      [[5, 21], [6, 20], ZodiacSign.GEMINI],
      [[6, 21], [7, 22], ZodiacSign.CANCER],
      [[7, 23], [8, 22], ZodiacSign.LEO],
      [[8, 23], [9, 22], ZodiacSign.VIRGO],
      [[9, 23], [10, 22], ZodiacSign.LIBRA],
      [[10, 23], [11, 21], ZodiacSign.SCORPIO],
      [[11, 22], [12, 21], ZodiacSign.SAGITTARIUS],
      [[12, 22], [1, 19], ZodiacSign.CAPRICORN],
      [[1, 20], [2, 18], ZodiacSign.AQUARIUS],
      [[2, 19], [3, 20], ZodiacSign.PISCES],
    ];

    this.compatibility = {
      [ZodiacSign.ARIES]: [ZodiacSign.LEO, ZodiacSign.SAGITTARIUS, ZodiacSign.GEMINI, ZodiacSign.AQUARIUS],
      [ZodiacSign.TAURUS]: [ZodiacSign.VIRGO, ZodiacSign.CAPRICORN, ZodiacSign.CANCER, ZodiacSign.PISCES],
      [ZodiacSign.GEMINI]: [ZodiacSign.LIBRA, ZodiacSign.AQUARIUS, ZodiacSign.ARIES, ZodiacSign.LEO],
      [ZodiacSign.CANCER]: [ZodiacSign.SCORPIO, ZodiacSign.PISCES, ZodiacSign.TAURUS, ZodiacSign.VIRGO],
      [ZodiacSign.LEO]: [ZodiacSign.ARIES, ZodiacSign.SAGITTARIUS, ZodiacSign.GEMINI, ZodiacSign.LIBRA],
      [ZodiacSign.VIRGO]: [ZodiacSign.TAURUS, ZodiacSign.CAPRICORN, ZodiacSign.CANCER, ZodiacSign.SCORPIO],
      [ZodiacSign.LIBRA]: [ZodiacSign.GEMINI, ZodiacSign.AQUARIUS, ZodiacSign.LEO, ZodiacSign.SAGITTARIUS],
      [ZodiacSign.SCORPIO]: [ZodiacSign.CANCER, ZodiacSign.PISCES, ZodiacSign.VIRGO, ZodiacSign.CAPRICORN],
      [ZodiacSign.SAGITTARIUS]: [ZodiacSign.ARIES, ZodiacSign.LEO, ZodiacSign.LIBRA, ZodiacSign.AQUARIUS],
      [ZodiacSign.CAPRICORN]: [ZodiacSign.TAURUS, ZodiacSign.VIRGO, ZodiacSign.SCORPIO, ZodiacSign.PISCES],
      [ZodiacSign.AQUARIUS]: [ZodiacSign.GEMINI, ZodiacSign.LIBRA, ZodiacSign.ARIES, ZodiacSign.SAGITTARIUS],
      [ZodiacSign.PISCES]: [ZodiacSign.CANCER, ZodiacSign.SCORPIO, ZodiacSign.TAURUS, ZodiacSign.CAPRICORN]
    };

    this.moods = [
      "Счастливое", "Задумчивое", "Энергичное", "Спокойное", "Творческое", 
      "Сосредоточенное", "Страстное", "Уверенное", "Мечтательное", "Практичное",
      "Авантюрное", "Созерцательное", "Решительное", "Интуитивное", "Сбалансированное"
    ];

    this.geminiService = new GeminiService();
    this.defaultPrediction = "Звезды пока молчат. Попробуйте получить предсказание позже.";
  }

  getSignByDate(month: number, day: number): ZodiacSign {
    for (const [[startMonth, startDay], [endMonth, endDay], sign] of this.dateRanges) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
      
      if (startMonth > endMonth) {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return sign;
        }
        if (month > startMonth || month < endMonth) {
          return sign;
        }
      }
    }
    
    throw new Error(`Could not determine zodiac sign for date ${month}/${day}`);
  }
  
  async getHoroscope(sign: ZodiacSign, timeFrame: TimeFrame): Promise<HoroscopeResponse> {
    const luckyNumbers: number[] = [];
    for (let i = 0; i < 5; i++) {
      luckyNumbers.push(Math.floor(Math.random() * 99) + 1);
    }
    
    const compatibleSigns = this.compatibility[sign];
    const randomIndex = Math.floor(Math.random() * compatibleSigns.length);
    const compatibleSign = compatibleSigns[randomIndex];
    
    const mood = this.moods[Math.floor(Math.random() * this.moods.length)];
    
    let prediction: string;
    try {
      const geminiPrediction = await this.geminiService.generateHoroscope(sign, timeFrame);
      if (geminiPrediction) {
        console.log(`Generated prediction with Gemini API for ${sign} ${timeFrame}`);
        prediction = geminiPrediction;
      } else {
        throw new Error('Gemini API returned null prediction');
      }
    } catch (error) {
      console.error(`Error getting prediction from Gemini API: ${error}`);
      prediction = this.defaultPrediction;
    }
    
    return {
      sign: sign,
      date: new Date().toISOString().split('T')[0],
      prediction: prediction,
      lucky_numbers: luckyNumbers,
      compatibility: compatibleSign,
      mood: mood,
      time_frame: timeFrame
    };
  }
}