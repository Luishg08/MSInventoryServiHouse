import { Injectable } from '@nestjs/common';
const jwt = require('jsonwebtoken');
require('dotenv').config();
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const logDirectory = path.join(__dirname, '../../logs');


@Injectable()
    export class GeneralService {
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
    logger = winston.createLogger({
    level: 'info', 
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),  
          winston.format.simple()    
        ),
      }),
      new winston.transports.DailyRotateFile({
          filename: path.join(logDirectory, '%DATE%.log'),
          datePattern: 'YYYY-MM-DD',      
        zippedArchive: true,             
        maxSize: '20m',                  
        maxFiles: '14d',                
        format: winston.format.combine(
          winston.format.timestamp(),    
          winston.format.json()       
        ),
      }),
    ],
    });
}