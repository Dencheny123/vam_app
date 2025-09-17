import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import corsConfig from './corsConfig.js';
import cookieParser from 'cookie-parser';

const serverConfig = (app: express.Application) => {
  app.use(cors(corsConfig));
  app.use(morgan('dev'));
  // app.use(express.static('public'));
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
};

export default serverConfig;
