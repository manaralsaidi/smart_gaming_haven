import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connect = async () => {
  if (cached.conn) return cached.conn;

  cached.promise =
    cached.promise ||
    mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("DB connected successfully to Localhost!");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("Mongoose connection error:", err);
        cached.promise = null;
        throw err;
      });

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connect; 