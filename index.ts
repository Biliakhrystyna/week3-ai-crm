import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from './prismaClient'; // Імпорт з твого файлу Prisma
import * as movieService from './services/movieService';
import * as screeningService from './services/screeningService';
import * as bookingService from './services/bookingService';
import * as hallService from './services/hallService';

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
        res.status(400).json({ error: 'Помилка авторизації', detail: error.message });
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
        res.status(400).json({ error: 'Помилка реєстрації', detail: error.message });
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

// --- Movie Routes ---
app.get('/movies', async (req, res) => {
    try {
        const movies = await movieService.getAllMovies(req.query.title as string);
        res.json(movies);
    } catch (error: any) {
        res.status(400).json({ error: 'Помилка завантаження фільмів', detail: error.message });
    }
});

app.post('/movies', authMiddleware, async (req, res) => {
    try {
        const movie = await movieService.createMovie(req.body);
        res.status(201).json(movie);
    } catch (error: any) {
        res.status(400).json({ error: 'Помилка створення фільму', detail: error.message });
    }
});

app.put('/movies/:id', authMiddleware, async (req, res) => {
    try {
        const updated = await movieService.updateMovie(Number(req.params.id), req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: 'Помилка оновлення фільму', detail: error.message });
    }
});

app.delete('/movies/:id', authMiddleware, async (req, res) => {
    try {
        await movieService.deleteMovie(Number(req.params.id));
        res.json({ message: 'Фільм видалено' });
    } catch (error: any) {
        res.status(400).json({ error: 'Помилка видалення', detail: error.message });
    }
});

// --- Screening Routes ---
app.get('/screenings', async (req, res) => {
    try {
        const screenings = await screeningService.getAllScreenings();
        res.json(screenings);
    } catch (error: any) {
        res.status(400).json({ error: 'Помилка завантаження розкладу', detail: error.message });
    }
});

app.post('/screenings', authMiddleware, async (req, res) => {
    try {
        const screening = await screeningService.createScreening(req.body);
        res.status(201).json(screening);
    } catch (error: any) {
        res.status(400).json({ error: 'Помилка створення сеансу', detail: error.message });
    }
});

// --- Booking Routes ---
app.post('/bookings', async (req, res) => {
    try {
        const booking = await bookingService.createBooking(req.body);
        res.status(201).json(booking);
    } catch (error: any) {
        res.status(400).json({ error: 'Помилка бронювання', detail: error.message });
    }
});

// --- Hall Routes ---
app.post('/halls', authMiddleware, async (req, res) => {
    try {
        const hall = await hallService.createHall(req.body);
        res.status(201).json(hall);
    } catch (error: any) {
        res.status(400).json({ error: 'Помилка створення зали', detail: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Сервер запущено на http://localhost:${PORT}`));