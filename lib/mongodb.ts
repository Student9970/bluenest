import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "bluenest";

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI.");
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise;
}

export async function getDatabase() {
  const client = await getClientPromise();
  return client.db(dbName);
}
