const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb://localhost:42717/swiftdrop"; 
const DB_NAME = "swiftdrop";

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(DB_NAME);

    // 1. Create Test User
    const users = db.collection('users');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    await users.updateOne(
      { email: 'test@swiftdrop.v2' },
      { 
        $set: { 
          name: 'Test SwiftDrop',
          passwordHash: passwordHash,
          createdAt: new Date()
        } 
      },
      { upsert: true }
    );
    console.log("User 'test@swiftdrop.v2' created (Password: password123)");

    // 2. Create Initial Space
    const user = await users.findOne({ email: 'test@swiftdrop.v2' });
    const spaces = db.collection('spaces');
    const spaceResult = await spaces.findOneAndUpdate(
      { name: 'Mon premier espace' },
      { 
        $set: { 
          ownerId: user._id,
          sharedWith: [],
          createdAt: new Date()
        } 
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    const spaceId = spaceResult._id || spaceResult.value?._id;
    await users.updateOne({ _id: user._id }, { $addToSet: { spaceIds: spaceId } });
    console.log("Initial space created and linked to user");

    // 3. Create a Folder
    const folders = db.collection('folders');
    const folderResult = await folders.findOneAndUpdate(
      { name: 'Documents Importants', spaceId: spaceId },
      { 
        $set: { 
          ownerId: user._id,
          parentId: null,
          createdAt: new Date()
        } 
      },
      { upsert: true, returnDocument: 'after' }
    );
    const folderId = folderResult._id || folderResult.value?._id;
    console.log("Dummy folder created");

    // 4. Create dummy files
    const files = db.collection('files');
    await files.deleteMany({ ownerId: user._id }); // Clean start
    await files.insertMany([
      {
        name: 'contrat_premium.pdf',
        type: 'application/pdf',
        size: 1024 * 1024 * 2.5,
        spaceId: spaceId,
        folderId: null,
        ownerId: user._id,
        createdAt: new Date()
      },
      {
        name: 'logo_swiftdrop.png',
        type: 'image/png',
        size: 1024 * 450,
        spaceId: spaceId,
        folderId: folderId,
        ownerId: user._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60)
      }
    ]);
    console.log("Dummy files created");

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.close();
  }
}

seed();
