const mongoose = require('./backend/node_modules/mongoose');

async function inspectDatabase() {
  console.log('\x1b[36m%s\x1b[0m', '🔍 Connecting to MongoDB...');
  
  try {
    // Connect to the local MongoDB database
    await mongoose.connect('mongodb://localhost:27017/social-media-app');
    console.log('\x1b[32m%s\x1b[0m', '✅ Successfully Connected to Database: "social-media-app"\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('\x1b[33m%s\x1b[0m', '⚠️ No collections found. The database is empty.');
      process.exit(0);
    }

    for (const col of collections) {
      const collectionName = col.name;
      const count = await db.collection(collectionName).countDocuments();
      
      console.log('\x1b[35m%s\x1b[0m', `=== 📦 Collection: "${collectionName}" (${count} documents) ===`);
      
      if (count === 0) {
        console.log('   (Empty collection)');
      } else {
        const documents = await db.collection(collectionName).find().toArray();
        documents.forEach((doc, idx) => {
          console.log(`\n--- Document #${idx + 1} ---`);
          console.log(JSON.stringify(doc, null, 2));
        });
      }
      console.log('\n' + '='.repeat(50) + '\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Database Connection/Query Error:', error.message);
    process.exit(1);
  }
}

inspectDatabase();
