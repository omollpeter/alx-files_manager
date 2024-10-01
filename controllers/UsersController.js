import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const postNew = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  let user = await dbClient.findUser(email);

  if (user) {
    return res.status(400).json({ error: 'Already exists' });
  }

  user = await dbClient.createUser(email, sha1(password));
  return res.status(201).json(user);
};

const getMe = async (req, res) => {
    const authToken = req.header("X-Token");
    if (!authToken) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const userId = await redisClient.get(`auth_${authToken}`);
    if (!userId) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const user = await dbClient.findUserById(userId);

    return res.status(200).json(user);
}

export { postNew, getMe };
