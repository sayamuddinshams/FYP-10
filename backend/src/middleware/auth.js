import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/apiResponse.js';
import { prisma } from '../config/db.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return errorResponse(res, 'Invalid or expired session. Please log in again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        district: true,
        city: true,
        area: true,
        address: true,
        avatar: true,
        bio: true,
        status: true,
        verification: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'Account not found.', 401);
    }

    if (user.status === 'suspended') {
      return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuth(req, res, next) {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    req.user = null;
    return next();
  }

  prisma.user
    .findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, status: true, verification: true },
    })
    .then((user) => {
      req.user = user && user.status !== 'suspended' ? user : null;
      next();
    })
    .catch(() => {
      req.user = null;
      next();
    });
}
