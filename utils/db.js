import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || '27017';
    this.db = process.env.DB_DATABASE || 'files_manager';
    this.connected = false;

    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, {
      useUnifiedTopology: true,
    });

    this.client.connect().then(() => {
      this.connected = true;
    }).catch((error) => {
      console.log(error);
    });
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    const usersCollection = await this.client.db(this.db).collection('users');

    const users = await usersCollection.find().toArray();
    return users.length;
  }

  async nbFiles() {
    const filesCollection = await this.client.db(this.db).collection('files');

    const files = await filesCollection.find().toArray();
    return files.length;
  }

  async findUser(email, password = '') {
    const usersCollection = await this.client.db(this.db).collection('users');

    let user;
    if (!password) {
      user = await usersCollection.findOne({ email });
    } else {
      user = await usersCollection.findOne({ email, password });
    }

    return user;
  }

  async findUserById(id) {
    const usersCollection = await this.client.db(this.db).collection('users');

    const userid = new ObjectId(id);
    const user = await usersCollection.findOne({ _id: userid });

    return {
      email: user.email,
      id: user._id,
    };
  }

  async createUser(email, password) {
    const usersCollection = await this.client.db(this.db).collection('users');

    const user = await usersCollection.insertOne({
      email,
      password,
    });

    return {
      email,
      id: user.insertedId,
    };
  }

  async findFileById(id, userId = '') {
    const filesCollection = await this.client.db(this.db).collection('files');

    const fileId = new ObjectId(id);
    let file;

    if (!userId) {
      file = await filesCollection.findOne({ _id: fileId });
    } else {
      const userid = new ObjectId(userId);
      file = await filesCollection.findOne({ _id: fileId, userId: userid });
    }

    return file;
  }

  async createFile(details) {
    const filesCollection = await this.client.db(this.db).collection('files');

    const file = await filesCollection.insertOne(details);

    return file;
  }

  async findFiles(queryParam, limit, filesToSkip) {
    const filesCollection = await this.client.db(this.db).collection('files');

    const files = await filesCollection.find(queryParam).limit(limit).skip(filesToSkip).toArray();

    return files;
  }

  async updateFile(fileId, value) {
    const filesCollection = await this.client.db(this.db).collection('files');

    const id = new ObjectId(fileId);
    await filesCollection.updateOne(
      { _id: id },
      { $set: { isPublic: value } },
    );

    const updatedFile = await filesCollection.findOne({ _id: id });
    return updatedFile;
  }
}

const dbClient = new DBClient();
export default dbClient;
