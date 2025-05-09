import { Injectable } from '@nestjs/common';
const jwt = require('jsonwebtoken');
require('dotenv').config();


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  verifyToken(req, action) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return { message: 'No token provided in the request headers', success: false };
    }
  
    return jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return { message: 'Token has expired', success: false };
        }
        return { message: err.message, success: false };
      } else {
        const decoded = jwt.decode(token);
        if (!decoded) {
          return { message: 'Invalid token', success: false };
        }
        const { permissions } = decoded;
        if (!permissions || !permissions.includes(action)) {
          return { message: 'Permission denied', success: false };
        }
        return { message: 'Token is valid', success: true };
      }
    });
  }
}
