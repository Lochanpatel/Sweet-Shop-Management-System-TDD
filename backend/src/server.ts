import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env for local development
dotenv.config();
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import serverless from 'serverless-http';

// --- CONFIG ---
const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';
const PORT = 3001;

app.use(cors());
// Increase limit to handle Base64 images
app.use(express.json({ limit: '50mb' }) as any);

// --- MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};

// --- CONTROLLERS (Inline for brevity in this Kata format) ---

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    // First user is admin for demo purposes, else USER
    const count = await prisma.user.count();
    const role = count === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Sweets Logic (Shared)
const getSweetsLogic = async (req: any, res: any) => {
  const { name, category, minPrice, maxPrice } = req.query;
  const where: any = {};
  
  if (name) where.name = { contains: String(name) };
  if (category) where.category = { equals: String(category) };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const sweets = await prisma.sweet.findMany({ where });
  res.json(sweets);
};

// Sweets Endpoints
app.get('/api/sweets', getSweetsLogic);
app.get('/api/sweets/search', getSweetsLogic);

// Protected Routes
app.use('/api/sweets', authenticateToken);

app.post('/api/sweets', requireAdmin, async (req, res) => {
  const { name, category, price, quantity, imageUrl } = req.body;
  try {
    const sweet = await prisma.sweet.create({
      data: { name, category, price, quantity, imageUrl }
    });
    res.status(201).json(sweet);
  } catch (e) {
    res.status(500).json({ error: 'Could not create sweet' });
  }
});

app.put('/api/sweets/:id', requireAdmin, async (req, res) => {
  const { name, category, price, quantity, imageUrl } = req.body;
  try {
    const updated = await prisma.sweet.update({
      where: { id: Number(req.params.id) },
      data: { name, category, price, quantity, imageUrl }
    });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'Sweet not found' });
  }
});

app.delete('/api/sweets/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.sweet.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(404).json({ error: 'Sweet not found' });
  }
});

app.post('/api/sweets/:id/purchase', async (req, res) => {
  const { quantity } = req.body;
  const id = Number(req.params.id);
  const qtyToBuy = quantity || 1;

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const sweet = await tx.sweet.findUnique({ where: { id } });
      if (!sweet) throw new Error('Sweet not found');
      if (sweet.quantity < qtyToBuy) throw new Error('Insufficient stock');

      const updated = await tx.sweet.update({
        where: { id },
        data: { quantity: sweet.quantity - qtyToBuy }
      });
      return updated;
    });
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error';
    res.status(400).json({ message: msg });
  }
});

app.post('/api/sweets/:id/restock', requireAdmin, async (req, res) => {
    const { quantity } = req.body;
    const id = Number(req.params.id);
    if (!quantity || quantity <= 0) return res.status(400).json({message: 'Invalid quantity'});

    try {
        const updated = await prisma.sweet.update({
            where: { id },
            data: { quantity: { increment: quantity } }
        });
        res.json(updated);
    } catch (e) {
        res.status(404).json({message: 'Sweet not found'});
    }
});

// Start if not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the Express `app` for testing
export { app };

// Export a serverless handler for platforms like Vercel
export const handler = serverless(app);

// Default export should be the serverless handler so platforms like Vercel
// pick it up automatically when importing the module.
export default handler as any;