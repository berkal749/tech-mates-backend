import { Router, Request, Response } from 'express';
import Registration from '../models/Registration';
import { sendRegistrationConfirmation } from '../utils/email';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// POST /api/registrations — public, submit registration
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, github, discord } = req.body;

    if (!email || !github || !discord) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = await Registration.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const registration = new Registration({
      email,
      github,
      discord,
      status: 'confirmed',
    });

    await registration.save();

    // Send confirmation email (non-blocking)
    sendRegistrationConfirmation(email, github, discord).catch(console.error);

    res.status(201).json({
      message: 'Registration successful!',
      registration: {
        id: registration._id,
        email: registration.email,
        github: registration.github,
        discord: registration.discord,
        status: registration.status,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/registrations — admin only, list all
router.get('/', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Registration.countDocuments(query);

    res.json({
      registrations,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/registrations/:id — admin only
router.get('/:id', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found.' });
    }
    res.json({ registration });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/registrations/:id — admin only, update status
router.patch('/:id', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    res.json({ registration });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/registrations/:id — admin only
router.delete('/:id', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found.' });
    }
    res.json({ message: 'Registration deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
