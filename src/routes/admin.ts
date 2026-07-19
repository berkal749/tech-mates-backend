import { Router, Request, Response } from 'express';
import Registration from '../models/Registration';
import User from '../models/User';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// GET /api/admin/stats — admin only
router.get('/stats', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const confirmed = await Registration.countDocuments({ status: 'confirmed' });
    const pending = await Registration.countDocuments({ status: 'pending' });
    const cancelled = await Registration.countDocuments({ status: 'cancelled' });
    const totalUsers = await User.countDocuments();

    const recentRegistrations = await Registration.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email github discord status createdAt');

    res.json({
      stats: {
        totalRegistrations,
        confirmed,
        pending,
        cancelled,
        totalUsers,
        spotsRemaining: Math.max(0, 200 - confirmed),
      },
      recentRegistrations,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
