import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || '27017';
    this.db = process.env.DB_DATABASE || 'files_manager';
    this.connected = false;

    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`);

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

  async findUser(email, password = "") {
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

    id = new ObjectId(id)
    let user = await usersCollection.findOne({ _id: id });

    return {
        email: user.email,
        id: user._id
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

  async findFileById(id) {
    const filesCollection = await this.client.db(this.db).collection('files');

    id = new ObjectId(id)
    let file = await filesCollection.findOne({ _id: id });

    return file;
  }

  async createFile(details) {
    const filesCollection = await this.client.db(this.db).collection('files');

    const file = await filesCollection.insertOne(details);

    return file;
  }
}

const dbClient = new DBClient();
export default dbClient;
