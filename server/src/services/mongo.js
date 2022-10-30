import mongoose from 'mongoose';
import "dotenv/config.js";

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log('Mongo connection ready.');
});

mongoose.connection.on('error', (error) => {
    console.error(error)
});

export async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}

export async function mongoDisconnect() {
    await mongoose.disconnect();
}
