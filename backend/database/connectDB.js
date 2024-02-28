import mongoose from'mongoose';

export const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(error);
    }
}