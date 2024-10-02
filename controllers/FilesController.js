import dotenv from 'dotenv';
import fs from 'fs';
import { v4 } from 'uuid';
import path from 'path';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

dotenv.config();

const postUpload = async (req, res) => {
  const authToken = req.header('X-Token');
  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = await redisClient.get(`auth_${authToken}`);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // const user = await dbClient.findUserById(userId);

  const {
    name, type, parentId = 0, isPublic = false, data,
  } = req.body;
  // const name = req.body.name;
  // const type = req.body.type;
  // const parentId = req.body.parentId || 0;
  // const isPublic = req.body.isPublic || false
  // const data = req.body.data

  if (!name) return res.status(400).json({ error: 'Missing name' });
  if (!type) return res.status(400).json({ error: 'Missing type' });

  if (!(['folder', 'file', 'image'].includes(type))) {
    return res.status(400).json({ error: 'Missing type' });
  }

  if (!data && type !== 'folder') {
    return res.status(400).json({ error: 'Missing data' });
  }

  if (parentId) {
    const parentFile = await dbClient.findFileById(parentId);

    if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
    if (parentFile.type !== 'folder') {
      return res.status(400).json({ error: 'Parent is not folder' });
    }
  }

  if (type === 'folder') {
    const file = await dbClient.createFile({
      name,
      type,
      parentId,
      isPublic,
      userId,
    });

    return res.status(201).json({
      id: file.insertedId,
      name,
      type,
      parentId,
      isPublic,
      userId,
    });
  }
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  let localPath = v4();

  localPath = path.join(folderPath, localPath);

  fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

  const file = await dbClient.createFile({
    name,
    type,
    parentId,
    isPublic,
    userId,
    localPath,
  });

  return res.status(201).json({
    id: file.insertedId,
    name,
    type,
    parentId,
    isPublic,
    localPath,
    userId,
  });
};

export { postUpload };
