const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Health check for Render
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('FATAL: DATABASE_URL env var is not set!');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
let db, bucket;

async function connectDB() {
  await client.connect();
  db = client.db('swiftdrop');
  bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  console.log("Connected to MongoDB & GridFS initialized");

  // Seed Global Space
  try {
    const spaces = db.collection('spaces');
    const globalSpace = await spaces.findOne({ isGlobal: true });
    if (!globalSpace) {
      await spaces.insertOne({
        name: "Espace Commun",
        isGlobal: true,
        ownerId: null,
        sharedWith: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Global Space seeded');
    }
  } catch (error) {
    console.error("Seeding error:", error);
  }
}

connectDB().catch(console.error);

// Multer GridFS Storage
const storage = new GridFsStorage({
  url: MONGODB_URI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `${Date.now()}-${file.originalname}`,
      metadata: {
        spaceId: req.body.spaceId ? new ObjectId(req.body.spaceId) : null,
        ownerId: req.body.ownerId ? new ObjectId(req.body.ownerId) : null,
        folderId: req.body.folderId && req.body.folderId !== 'null' ? new ObjectId(req.body.folderId) : null,
        originalName: file.originalname,
        contentType: file.mimetype
      }
    };
  }
});

const upload = multer({ storage });

// API Endpoints
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { spaceId, ownerId, folderId } = req.body;

    // Create file record in our custom 'files' collection for metadata management
    const filesCollection = db.collection('files');
    const newFile = {
      name: file.metadata.originalName,
      type: file.metadata.contentType,
      size: file.size,
      storageId: file.id, // ID in GridFS
      spaceId: spaceId ? new ObjectId(spaceId) : null,
      folderId: folderId && folderId !== 'null' ? new ObjectId(folderId) : null,
      ownerId: ownerId ? new ObjectId(ownerId) : null,
      createdAt: new Date(),
    };

    await filesCollection.insertOne(newFile);

    // Notify clients via WebSocket
    io.emit('file_uploaded', { 
      spaceId, 
      fileName: file.metadata.originalName,
      ownerId 
    });

    res.status(200).json({ success: true, file: newFile });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get('/api/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const filesCollection = db.collection('files');
    const fileRecord = await filesCollection.findOne({ _id: new ObjectId(fileId) });

    if (!fileRecord) return res.status(404).send('File not found');

    const downloadStream = bucket.openDownloadStream(fileRecord.storageId);
    
    res.set({
      'Content-Type': fileRecord.type,
      'Content-Disposition': `attachment; filename="${fileRecord.name}"`,
      'Content-Length': fileRecord.size
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).send('Download failed');
  }
});

// Space & Folder management (Direct API for fast operations)
app.post('/api/spaces', async (req, res) => {
    const { name, ownerId } = req.body;
    const spaces = db.collection('spaces');
    const result = await spaces.insertOne({
      name,
      ownerId: new ObjectId(ownerId),
      sharedWith: [],
      createdAt: new Date()
    });
    io.emit('space_created', { ownerId, name });
    res.status(201).json({ id: result.insertedId });
});

app.post('/api/folders', async (req, res) => {
    const { name, spaceId, parentId, ownerId } = req.body;
    const folders = db.collection('folders');
    const result = await folders.insertOne({
      name,
      spaceId: new ObjectId(spaceId),
      parentId: parentId ? new ObjectId(parentId) : null,
      ownerId: new ObjectId(ownerId),
      createdAt: new Date()
    });
    io.emit('folder_created', { spaceId, name });
    res.status(201).json({ id: result.insertedId });
});

// Rename Item
app.patch('/api/items/rename', async (req, res) => {
    const { id, type, newName } = req.body;
    const collection = type === 'folder' ? db.collection('folders') : db.collection('files');
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { name: newName } });
    res.json({ success: true });
});

// Delete Item
app.delete('/api/items', async (req, res) => {
    const { id, type } = req.body;
    if (type === 'folder') {
        // Recursive delete would be better, but for now simple delete
        await db.collection('folders').deleteOne({ _id: new ObjectId(id) });
        // Also delete sub-folders and files? (MVP: just the folder)
    } else {
        const filesCollection = db.collection('files');
        const file = await filesCollection.findOne({ _id: new ObjectId(id) });
        if (file) {
            await bucket.delete(file.storageId);
            await filesCollection.deleteOne({ _id: new ObjectId(id) });
        }
    }
    res.json({ success: true });
});

// Toggle Favorite
app.post('/api/favorites/toggle', async (req, res) => {
    const { id, type } = req.body;
    const collection = type === 'folder' ? db.collection('folders') : db.collection('files');
    const item = await collection.findOne({ _id: new ObjectId(id) });
    await collection.updateOne(
        { _id: new ObjectId(id) }, 
        { $set: { isFavorite: !item.isFavorite } }
    );
    res.json({ success: true, isFavorite: !item.isFavorite });
});

// Simple Socket.io implementation
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

server.listen(PORT, () => {
  console.log(`Backend engine running on port ${PORT}`);
});
