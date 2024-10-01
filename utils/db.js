import { MongoClient } from 'mongodb';
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

  async findUser(email) {
    const usersCollection = await this.client.db(this.db).collection('users');

    const user = await usersCollection.findOne({ email });

    return user;
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
}

const dbClient = new DBClient();
export default dbClient;
