import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    console.error('[mongo] MONGO_URI is empty');
    process.exit(1);
  }
  let lastErr;
  for (let i = 1; i <= 10; i++) {
    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(uri, { autoIndex: true });
      console.log('[mongo] connected');
      return;
    } catch (e) {
      lastErr = e;
      console.error(`[mongo] connect failed (attempt ${i}/10): ${e.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.error('[mongo] giving up:', lastErr?.message);
  process.exit(1);
}
