import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

// --- Middleware для захисту ---
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized', message: 'Token missing' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret');
    req.user = decoded;
    next();
  } catch (error: any) {
  res.status(400).json({ 
    error: 'Помилка виконання операції', 
    detail: error.message || 'Невідома помилка' 
  });
}
};

// --- Auth роути ---

app.post('/auth/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role: role || 'user' }
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error: any) {
  res.status(400).json({ 
    error: 'Помилка виконання операції', 
    detail: error.message || 'Невідома помилка' 
  });
}
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'super_secret', { expiresIn: '1h' });
  res.json({ token });
});

// --- CRUD Movies ---

// Отримання списку з пошуком
app.get('/movies', async (req, res) => {
  const { title } = req.query;
  const movies = await prisma.movie.findMany({
    where: title ? { title: { contains: String(title), mode: 'insensitive' } } : {}
  });
  res.json(movies);
});

// Створення
app.post('/movies', authMiddleware, async (req, res) => {
  const { title,genre, duration, rating } = req.body;
  try{
  const movie = await prisma.movie.create({ 
    data: { title, genre, duration: Number(duration), rating } 
  });
  res.status(201).json(movie);
} catch (error: any) {
  res.status(400).json({ 
    error: 'Помилка виконання операції', 
    detail: error.message || 'Невідома помилка' 
  });
}
});

// Оновлення
app.put('/movies/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title,genre, duration, rating } = req.body;
  try {
    const updated = await prisma.movie.update({
      where: { id: Number(id) },
      data: { title, genre, duration: Number(duration), rating }
    });
    res.json(updated);
  } catch (error: any) {
  res.status(400).json({ 
    error: 'Помилка виконання операції', 
    detail: error.message || 'Невідома помилка' 
  });
}
});

// Видалення
app.delete('/movies/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.movie.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Фільм видалено' });
  } catch (error: any) {
  res.status(400).json({ 
    error: 'Помилка виконання операції', 
    detail: error.message || 'Невідома помилка' 
  });
}
});
// --- CRUD для Screening (Розклад сеансів) ---

// 1. Отримання розкладу (Публічно для клієнтів)
app.get('/screenings', async (req, res) => {
  const screenings = await prisma.screening.findMany({
    include: { movie: true, hall: true } // Підтягуємо дані про фільм та зал
  });
  res.json(screenings);
});

// 2. Створення сеансу (Тільки для Менеджера - захищено)
app.post('/screenings', authMiddleware, async (req, res) => {
  const { startTime, price, movieId, hallId } = req.body;
  try {
    const screening = await prisma.screening.create({
      data: {
        startTime: new Date(startTime),
        price: Number(price),
        movieId: Number(movieId),
        hallId: Number(hallId)
      }
    });
    res.status(201).json(screening);
  } catch (error: any) {
  res.status(400).json({ 
    error: 'Помилка виконання операції', 
    detail: error.message || 'Невідома помилка' 
  });
}
});

// --- Booking (Бронювання) ---

// POST /bookings - Створення бронювання (Публічно, бо клієнт сам бронює)
app.post('/bookings', async (req, res) => {
  const { seatNumber, screeningId, firstName, lastName, email, phone } = req.body;
  
  try {
    // 1. Знаходимо або створюємо клієнта
    let customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { firstName, lastName, email, phone }
      });
    }

    // 2. Створюємо бронювання
    const booking = await prisma.booking.create({
      data: {
        seatNumber,
        status: 'CONFIRMED',
        screeningId: Number(screeningId),
        customerId: customer.id
      }
    });
    
    res.status(201).json(booking);
  } catch (error: any) {
  res.status(400).json({ 
    error: 'Помилка виконання операції', 
    detail: error.message || 'Невідома помилка' 
  });
}
});
// Додай цей роут для створення зали
app.post('/halls', authMiddleware, async (req, res) => {
  const { name, capacity } = req.body;
  try {
    const hall = await prisma.hall.create({
      data: { name, capacity: Number(capacity) }
    });
    res.status(201).json(hall);
  } catch (error:any) {
    res.status(400).json({ 
      error: 'Помилка виконання операції',
     detail: error.message || 'Невідома помилка'
    });
  }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Сервер запущено на http://localhost:${PORT}`));