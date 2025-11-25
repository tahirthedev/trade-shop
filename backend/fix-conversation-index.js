require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('conversations');

    // Drop the problematic unique index
    try {
      await collection.dropIndex('participants_1');
      console.log('✅ Dropped participants_1 index');
    } catch (err) {
      console.log('ℹ️  Index already dropped or does not exist');
    }

    console.log('✅ Fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndex();
