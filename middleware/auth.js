import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      console.log('Auth middleware: User authenticated:', req.user.username, 'Role:', req.user.role);
      next();
    } catch (error) {
      console.error('Auth middleware: Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.error('Auth middleware: No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  console.log('Admin middleware: Checking admin access for user:', req.user?.username, 'Role:', req.user?.role);
  if (req.user && req.user.role === 'admin') {
    console.log('Admin middleware: Access granted');
    next();
  } else {
    console.log('Admin middleware: Access denied - not admin');
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

export { protect, admin };