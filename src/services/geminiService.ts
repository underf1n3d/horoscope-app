import { ZodiacSign, TimeFrame } from '../models/zodiac';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

interface GeminiResponse {
  candidates: {
    content?: {
      parts: {
        text: string;
      }[];
    };
    text?: string;
    finishReason: string;
  }[];
}

export class GeminiService {
  private apiKey: string;
  private model: string;
  private isConfigured: boolean;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    this.model = 'gemini-2.0-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1/models';
    this.isConfigured = !!this.apiKey;
    
    if (!this.isConfigured) {
      console.warn('Google API key is not configured. Dynamic predictions will not be available.');
    } else {
      console.log('Gemini API настроен с моделью gemini-2.0-flash и готов к использованию.');
    }
  }

  private getZodiacDescription(sign: ZodiacSign): string {
    const descriptions: Record<ZodiacSign, string> = {
      [ZodiacSign.ARIES]: "Овен (21 марта - 19 апреля): Энергичный, предприимчивый, импульсивный, любит приключения",
      [ZodiacSign.TAURUS]: "Телец (20 апреля - 20 мая): Надежный, практичный, терпеливый, любит комфорт и стабильность",
      [ZodiacSign.GEMINI]: "Близнецы (21 мая - 20 июня): Общительный, разносторонний, любознательный, интеллектуальный",
      [ZodiacSign.CANCER]: "Рак (21 июня - 22 июля): Заботливый, эмоциональный, интуитивный, любит семью и дом",
      [ZodiacSign.LEO]: "Лев (23 июля - 22 августа): Творческий, харизматичный, гордый, любит быть в центре внимания",
      [ZodiacSign.VIRGO]: "Дева (23 августа - 22 сентября): Аналитичный, трудолюбивый, внимательный к деталям, практичный",
      [ZodiacSign.LIBRA]: "Весы (23 сентября - 22 октября): Дипломатичный, справедливый, стремится к гармонии, ценит красоту",
      [ZodiacSign.SCORPIO]: "Скорпион (23 октября - 21 ноября): Страстный, решительный, проницательный, интенсивный",
      [ZodiacSign.SAGITTARIUS]: "Стрелец (22 ноября - 21 декабря): Оптимистичный, любит свободу, путешествия и философию",
      [ZodiacSign.CAPRICORN]: "Козерог (22 декабря - 19 января): Дисциплинированный, ответственный, амбициозный, терпеливый",
      [ZodiacSign.AQUARIUS]: "Водолей (20 января - 18 февраля): Оригинальный, независимый, гуманитарный, прогрессивный",
      [ZodiacSign.PISCES]: "Рыбы (19 февраля - 20 марта): Сострадательный, интуитивный, мечтательный, творческий"
    };
    
    return descriptions[sign];
  }

  private getTimeDescription(timeFrame: TimeFrame): string {
    const descriptions: Record<TimeFrame, string> = {
      [TimeFrame.TODAY]: "на сегодня",
      [TimeFrame.TOMORROW]: "на завтра",
      [TimeFrame.WEEK]: "на неделю",
      [TimeFrame.MONTH]: "на месяц"
    };
    
    return descriptions[timeFrame];
  }

  async generateHoroscope(sign: ZodiacSign, timeFrame: TimeFrame): Promise<string | null> {
    if (!this.isConfigured) {
      return null;
    }
    
    try {
      const zodiacDescription = this.getZodiacDescription(sign);
      const timeDescription = this.getTimeDescription(timeFrame);
      
      const prompt = `Создай астрологический прогноз ${timeDescription} для знака зодиака ${zodiacDescription}. Напиши развернутый и позитивный прогноз, затрагивающий различные аспекты жизни: работу, отношения, здоровье, личностный рост. Используй яркий, образный язык, метафоры и конкретные рекомендации. Ответ должен быть на русском языке в пределах 4-6 предложений.`;
      
      console.log(`Генерация гороскопа для ${sign} ${timeFrame} с использованием модели gemini-2.0-flash`);
      
      const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${error}`);
      }
      
      const data = await response.json() as GeminiResponse;
      console.log('Получен ответ от Gemini API');
      
      if (data.candidates && data.candidates.length > 0) {
        if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
          const prediction = data.candidates[0].content.parts[0].text.trim();
          console.log(`Successfully generated prediction with Gemini API for ${sign} ${timeFrame}`);
          return prediction;
        } else if (data.candidates[0].text) {
          const prediction = data.candidates[0].text.trim();
          console.log(`Successfully generated prediction with Gemini API for ${sign} ${timeFrame}`);
          return prediction;
        } else {
          console.log('Структура ответа:', JSON.stringify(data, null, 2));
          throw new Error('Unexpected response structure from Gemini API');
        }
      } else {
        console.log('Структура ответа:', JSON.stringify(data, null, 2));
        throw new Error('No candidates in Gemini API response');
      }
    } catch (error) {
      console.error(`Error generating horoscope with Gemini: ${error}`);
      return `Ваша энергия ${timeFrame} будет направлена на достижение целей. Возможны неожиданные встречи, которые могут изменить ваши планы. Уделите внимание здоровью и эмоциональному состоянию. Звезды благоприятствуют новым начинаниям и саморазвитию.`;
    }
  }
}