import sha1 from 'sha1';
import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const getConnect = async (req, res) => {
  const authHeader = req.header('Authorization');

  const encodedCred = authHeader.split(' ')[1];

  const credentials = Buffer.from(encodedCred, 'base64').toString('utf-8');

  const [email, password] = credentials.split(':');

  const hashedPwd = sha1(password);
  const user = await dbClient.findUser(email, hashedPwd);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = v4();
  const key = `auth_${token}`;

  await redisClient.set(key, user._id.toString(), 24 * 60 * 60 * 1000);

  return res.status(200).json({ token });
};

const getDisconnect = async (req, res) => {
  const authToken = req.header('X-Token');

  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await redisClient.del(`auth_${authToken}`);

  return res.status(204).send('');
};

export { getConnect, getDisconnect };
