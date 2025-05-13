import express, { Request, Response, NextFunction } from 'express';
import { ZodiacSign, TimeFrame, ErrorResponse } from '../models/zodiac';
import { HoroscopeService } from '../services/horoscopeService';

const router = express.Router();
const horoscopeService = new HoroscopeService();

const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

router.use(logRequest);

router.get('/horoscope/:sign', async (req: Request, res: Response): Promise<void> => {
  try {
    const signParam = req.params.sign.toLowerCase();
    const timeFrameParam = (req.query.time_frame as string) || TimeFrame.TODAY;
    
    if (!Object.values(ZodiacSign).includes(signParam as ZodiacSign)) {
      res.status(400).json({ 
        detail: `Неизвестный знак зодиака: ${signParam}. Доступные знаки: ${Object.values(ZodiacSign).join(', ')}` 
      } as ErrorResponse);
      return;
    }
    
    if (!Object.values(TimeFrame).includes(timeFrameParam as TimeFrame)) {
      res.status(400).json({ 
        detail: `Неизвестный временной период: ${timeFrameParam}. Доступные периоды: ${Object.values(TimeFrame).join(', ')}` 
      } as ErrorResponse);
      return;
    }
    
    const sign = signParam as ZodiacSign;
    const timeFrame = timeFrameParam as TimeFrame;
    
    console.log(`Request for horoscope - sign: ${sign}, time_frame: ${timeFrame}`);
    
    const horoscope = await horoscopeService.getHoroscope(sign, timeFrame);
    res.json(horoscope);
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).json({ 
      detail: 'Внутренняя ошибка сервера при получении гороскопа.'
    } as ErrorResponse);
  }
});

router.get('/date/:month/:day', async (req: Request, res: Response): Promise<void> => {
  try {
    const month = parseInt(req.params.month, 10);
    const day = parseInt(req.params.day, 10);
    const timeFrameParam = (req.query.time_frame as string) || TimeFrame.TODAY;
    
    if (isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ 
        detail: 'Месяц должен быть числом от 1 до 12.'
      } as ErrorResponse);
      return;
    }
    
    if (isNaN(day) || day < 1 || day > 31) {
      res.status(400).json({ 
        detail: 'День должен быть числом от 1 до 31.'
      } as ErrorResponse);
      return;
    }
    
    if (!Object.values(TimeFrame).includes(timeFrameParam as TimeFrame)) {
      res.status(400).json({ 
        detail: `Неизвестный временной период: ${timeFrameParam}. Доступные периоды: ${Object.values(TimeFrame).join(', ')}` 
      } as ErrorResponse);
      return;
    }
    
    const timeFrame = timeFrameParam as TimeFrame;
    
    console.log(`Request for horoscope by date - month: ${month}, day: ${day}, time_frame: ${timeFrame}`);
    
    try {
      const sign = horoscopeService.getSignByDate(month, day);
      const horoscope = await horoscopeService.getHoroscope(sign, timeFrame);
      res.json(horoscope);
    } catch (error) {
      res.status(400).json({ 
        detail: `Не удалось определить знак зодиака для даты ${month}/${day}.`
      } as ErrorResponse);
    }
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).json({ 
      detail: 'Внутренняя ошибка сервера при получении гороскопа.'
    } as ErrorResponse);
  }
});

export default router;