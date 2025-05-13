import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import horoscopeRoutes from './routes/horoscopeRoutes';

dotenv.config();

process.env.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
process.env.USE_DYNAMIC_HOROSCOPE = process.env.USE_DYNAMIC_HOROSCOPE;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', horoscopeRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ detail: 'Путь не найден' });
});

app.listen(PORT, () => {
  console.log(`✨ Сервер звездных предсказаний запущен на порту ${PORT}`);
  console.log(`🔗 Веб-интерфейс доступен по адресу: http://localhost:${PORT}`);
  console.log(`🔮 API доступно по адресу: http://localhost:${PORT}/api/v1`);
});