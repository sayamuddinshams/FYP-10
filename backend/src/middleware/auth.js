import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/apiResponse.js';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';

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

    const rawUser = await collections.users().findOne(toIdQuery(decoded.id));

    if (!rawUser) {
      return errorResponse(res, 'Account not found.', 401);
    }

    if (rawUser.status === 'suspended') {
      return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
    }

    const user = normalizeDoc(rawUser);
    delete user.passwordHash;

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
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

    const rawUser = await collections.users().findOne(toIdQuery(decoded.id));
    if (rawUser && rawUser.status !== 'suspended') {
      const user = normalizeDoc(rawUser);
      delete user.passwordHash;
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
}
