import * as mongoose from "mongoose";

const url = process.env.MONGODB_URL;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as Parameters<typeof mongoose.connect>[1];
export async function connectToDatabase() {
  await mongoose.connect(url, options);
}
