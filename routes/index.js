import express from 'express';
// import redisClient from "../utils/redis";
// import dbClient from "../utils/db";
import { getStatus, getStats } from '../controllers/AppController';

const router = express.Router();

router.get('/status', getStatus);

router.get('/stats', getStats);

export default router;
