const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });

function logError(message, err) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}: ${err?.message || err || ''}\n`;
  console.error(logMessage);
  logStream.write(logMessage);
}

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Multer config for video uploads
const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for videos
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'application/octet-stream'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.mp4')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed (MP4, MOV, AVI)'));
    }
  }
});

// Middleware to set MIME types for video files
app.use((req, res, next) => {
  if (req.url.match(/\.(mp4|mov|avi|webm)$/i)) {
    res.type('video/mp4');
    res.set('Accept-Ranges', 'bytes');
  }
  next();
});

// Serve uploaded images and videos statically
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1d',
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(mp4|mov|avi|webm)$/i)) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Initialize SQLite database connection
// SQLite uses the exact same SQL logic as MySQL but stores the database compactly in an automatically generated file.
const dbPath = path.join(__dirname, 'kingdom.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Successfully connected to the actual SQL database.');
    
    // Create the users table if it doesn't already exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )
    `);

    // Create the announcements table if it doesn't already exist
    db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        image TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        adminId INTEGER NOT NULL,
        FOREIGN KEY(adminId) REFERENCES users(id)
      )
    `);

    // Create the media table if it doesn't already exist
    db.run(`
      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT,
        videoUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        adminId INTEGER NOT NULL,
        FOREIGN KEY(adminId) REFERENCES users(id)
      )
    `);

    // Create the teachings table if it doesn't already exist
    db.run(`
      CREATE TABLE IF NOT EXISTS teachings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        series TEXT,
        duration TEXT,
        videoUrl TEXT NOT NULL,
        description TEXT,
        date TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        adminId INTEGER NOT NULL,
        FOREIGN KEY(adminId) REFERENCES users(id)
      )
    `);

    // Migrate: Add image column to announcements table if it doesn't exist
    db.all("PRAGMA table_info(announcements)", (err, columns) => {
      if (!err && columns) {
        const hasImageColumn = columns.some(col => col.name === 'image');
        if (!hasImageColumn) {
          db.run(`ALTER TABLE announcements ADD COLUMN image TEXT`, (err) => {
            if (err) {
              console.error('Error adding image column:', err.message);
            } else {
              console.log('Successfully added image column to announcements table');
            }
          });
        }
      }
    });

    // Migrate: Add role column to users table if it doesn't exist
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (!err && columns) {
        const hasRoleColumn = columns.some(col => col.name === 'role');
        if (!hasRoleColumn) {
          db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {
            if (err) {
              console.error('Error adding role column:', err.message);
            } else {
              console.log('Successfully added role column to users table');
            }
          });
        }
      }
    });

    // Migrate: Add gallery_images column to media table if it doesn't exist
    db.all("PRAGMA table_info(media)", (err, columns) => {
      if (!err && columns) {
        const hasGalleryColumn = columns.some(col => col.name === 'gallery_images');
        if (!hasGalleryColumn) {
          db.run(`ALTER TABLE media ADD COLUMN gallery_images TEXT DEFAULT '[]'`, (err) => {
            if (err) {
              console.error('Error adding gallery_images column:', err.message);
            } else {
              console.log('Successfully added gallery_images column to media table');
            }
          });
        }
      }
    });
  }
});

// Sign Up Endpoint
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all details' });
  }

  const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
  
  db.run(query, [name, email, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'An account with this email already exists in the database!' });
      }
      return res.status(500).json({ error: 'Database server error' });
    }
    
    res.status(201).json({ 
      id: this.lastID, 
      name, 
      email,
      message: 'Account correctly saved to database'
    });
  });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const query = `SELECT id, name, email FROM users WHERE email = ? AND password = ?`;
  
  db.get(query, [email, password], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    res.status(200).json(user);
  });
});

// Admin Registration Endpoint (requires secret admin code)
const ADMIN_SECRET_CODE = 'KIM2024ADMIN'; // Change this to your secret code
app.post('/api/admin/register', (req, res) => {
  const { name, email, password, adminCode } = req.body;
  
  if (!name || !email || !password || !adminCode) {
    return res.status(400).json({ error: 'Please provide all details including admin code' });
  }

  // Verify admin code
  if (adminCode !== ADMIN_SECRET_CODE) {
    return res.status(403).json({ error: 'Invalid admin code' });
  }

  const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')`;
  
  db.run(query, [name, email, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'An account with this email already exists!' });
      }
      return res.status(500).json({ error: 'Database server error' });
    }
    
    res.status(201).json({ 
      id: this.lastID, 
      name, 
      email,
      role: 'admin',
      message: 'Admin account created successfully'
    });
  });
});

// Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  const query = `SELECT id, name, email, role FROM users WHERE email = ? AND password = ? AND role = 'admin'`;
  
  db.get(query, [email, password], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email, password, or not an admin' });
    }
    
    res.status(200).json(user);
  });
});

// Get All Announcements (Public)
app.get('/api/announcements', (req, res) => {
  const query = `SELECT * FROM announcements ORDER BY date DESC`;
  
  db.all(query, (err, announcements) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(announcements || []);
  });
});

// Create Announcement (Admin Only)
app.post('/api/announcements', upload.single('image'), (req, res) => {
  const { title, description, date, adminId } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!title || !description || !date || !adminId) {
    // Delete uploaded file if validation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
    }
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  const query = `INSERT INTO announcements (title, description, date, image, adminId) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [title, description, date, imageUrl, adminId], function(err) {
    if (err) {
      // Delete uploaded file if database insert fails
      if (req.file) {
        fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.status(201).json({
      id: this.lastID,
      title,
      description,
      date,
      image: imageUrl,
      adminId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });
});

// Update Announcement (Admin Only)
app.put('/api/announcements/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, description, date } = req.body;
  
  if (!title || !description || !date) {
    // Delete uploaded file if validation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
    }
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  // If there's a new image, we need to delete the old one
  if (req.file) {
    // First get the current announcement to find the old image
    db.get(`SELECT image FROM announcements WHERE id = ?`, [id], (err, row) => {
      if (!err && row && row.image) {
        const oldImagePath = path.join(__dirname, row.image);
        fs.unlink(oldImagePath, (err) => { if (err) console.error('Error deleting old image:', err); });
      }
    });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  
  // Build dynamic query based on whether image is provided
  let query, params;
  if (imageUrl) {
    query = `UPDATE announcements SET title = ?, description = ?, date = ?, image = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    params = [title, description, date, imageUrl, id];
  } else {
    query = `UPDATE announcements SET title = ?, description = ?, date = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    params = [title, description, date, id];
  }
  
  db.run(query, params, function(err) {
    if (err) {
      // Delete uploaded file if database update fails
      if (req.file) {
        fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      // Delete uploaded file if announcement not found
      if (req.file) {
        fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json({ message: 'Announcement updated successfully' });
  });
});

// Delete Announcement (Admin Only)
app.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  
  // First get the announcement to delete its image
  db.get(`SELECT image FROM announcements WHERE id = ?`, [id], (err, row) => {
    if (!err && row && row.image) {
      const imagePath = path.join(__dirname, row.image);
      fs.unlink(imagePath, (err) => { if (err) console.error('Error deleting image:', err); });
    }
  });
  
  const query = `DELETE FROM announcements WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json({ message: 'Announcement deleted successfully' });
  });
});

// ============================================
// Media API Endpoints
// ============================================

// Get All Media (Public)
app.get('/api/media', (req, res) => {
  const query = `SELECT * FROM media ORDER BY createdAt DESC`;
  
  db.all(query, (err, media) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(media || []);
  });
});

// Create Media (Admin Only)
app.post('/api/media', (req, res, next) => {
  uploadVideo.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 20 },
    { name: 'videoFile', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, (req, res) => {
  try {
    const { title, type, description, videoUrl, adminId } = req.body;
    const thumbnailUrl = req.files?.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : null;
    const videoFileUrl = req.files?.videoFile ? `/uploads/${req.files.videoFile[0].filename}` : null;
    const finalVideoUrl = videoFileUrl || videoUrl || '';
    
    // Handle multiple gallery images
    const galleryImages = req.files?.images 
      ? req.files.images.map(file => `/uploads/${file.filename}`)
      : [];
    
    const logMsg = `POST /api/media - title: ${title}, type: ${type}, adminId: ${adminId}, videoUrl: ${videoUrl}, has thumbnail: ${!!req.files?.thumbnail}, has videoFile: ${!!req.files?.videoFile}, gallery images: ${galleryImages.length}`;
    console.log(logMsg);
    logStream.write(`[${new Date().toISOString()}] ${logMsg}\n`);
    
    if (!title || !type || !adminId) {
      if (req.files?.thumbnail) {
        fs.unlink(req.files.thumbnail[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      if (req.files?.videoFile) {
        fs.unlink(req.files.videoFile[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      if (req.files?.images) {
        req.files.images.forEach(file => {
          fs.unlink(file.path, (err) => { if (err) console.error('Error deleting file:', err); });
        });
      }
      return res.status(400).json({ error: 'Please provide title, type, and adminId' });
    }

    if (!finalVideoUrl) {
      if (req.files?.thumbnail) {
        fs.unlink(req.files.thumbnail[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      if (req.files?.videoFile) {
        fs.unlink(req.files.videoFile[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      if (req.files?.images) {
        req.files.images.forEach(file => {
          fs.unlink(file.path, (err) => { if (err) console.error('Error deleting file:', err); });
        });
      }
      return res.status(400).json({ error: 'Please provide a video file or video URL' });
    }

    const query = `INSERT INTO media (title, type, description, thumbnail, videoUrl, gallery_images, adminId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [title, type, description || '', thumbnailUrl, finalVideoUrl, JSON.stringify(galleryImages), adminId], function(err) {
      if (err) {
        if (req.files?.thumbnail) {
          fs.unlink(req.files.thumbnail[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        if (req.files?.videoFile) {
          fs.unlink(req.files.videoFile[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        if (req.files?.images) {
          req.files.images.forEach(file => {
            fs.unlink(file.path, (err) => { if (err) console.error('Error deleting file:', err); });
          });
        }
        logError('DB Error in POST /api/media', err);
        return res.status(500).json({ error: err.message || 'Database error' });
      }
      
      res.status(201).json({
        id: this.lastID,
        title,
        type,
        description,
        thumbnail: thumbnailUrl,
        videoUrl: finalVideoUrl,
        gallery_images: galleryImages,
        adminId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  } catch (err) {
    console.error('Error in POST /api/media:', err);
    logError('Error in POST /api/media route', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Update Media (Admin Only)
app.put('/api/media/:id', (req, res, next) => {
  uploadVideo.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 20 },
    { name: 'videoFile', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, description, videoUrl } = req.body;
    
    console.log('PUT /api/media/:id - id:', id, 'title:', title, 'type:', type);
    
    if (!title || !type) {
      if (req.files?.thumbnail) {
        fs.unlink(req.files.thumbnail[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      if (req.files?.videoFile) {
        fs.unlink(req.files.videoFile[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      if (req.files?.images) {
        req.files.images.forEach(file => {
          fs.unlink(file.path, (err) => { if (err) console.error('Error deleting file:', err); });
        });
      }
      return res.status(400).json({ error: 'Please provide title and type' });
    }

    // Fetch current media to delete old files
    db.get(`SELECT thumbnail, videoUrl, gallery_images FROM media WHERE id = ?`, [id], (err, row) => {
      if (!err && row) {
        // Delete old thumbnail if new one is uploaded
        if (req.files?.thumbnail && row.thumbnail) {
          const oldImagePath = path.join(__dirname, row.thumbnail);
          fs.unlink(oldImagePath, (err) => { if (err) console.error('Error deleting old thumbnail:', err); });
        }
        // Delete old video if new one is uploaded
        if (req.files?.videoFile && row.videoUrl && row.videoUrl.startsWith('/uploads/')) {
          const oldVideoPath = path.join(__dirname, row.videoUrl);
          fs.unlink(oldVideoPath, (err) => { if (err) console.error('Error deleting old video:', err); });
        }
        // Delete old gallery images if new ones are uploaded
        if (req.files?.images && row.gallery_images) {
          try {
            const oldImages = JSON.parse(row.gallery_images);
            oldImages.forEach(imagePath => {
              const oldImagePath = path.join(__dirname, imagePath);
              fs.unlink(oldImagePath, (err) => { if (err) console.error('Error deleting old gallery image:', err); });
            });
          } catch (e) {
            console.error('Error parsing old gallery_images:', e);
          }
        }
      }
    });

    const thumbnailUrl = req.files?.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : undefined;
    const videoFileUrl = req.files?.videoFile ? `/uploads/${req.files.videoFile[0].filename}` : undefined;
    const finalVideoUrl = videoFileUrl || videoUrl || undefined;
    
    // Handle gallery images
    const galleryImages = req.files?.images 
      ? req.files.images.map(file => `/uploads/${file.filename}`)
      : undefined;
    
    let query, params;
    if (thumbnailUrl && finalVideoUrl && galleryImages) {
      query = `UPDATE media SET title = ?, type = ?, description = ?, thumbnail = ?, videoUrl = ?, gallery_images = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      params = [title, type, description || '', thumbnailUrl, finalVideoUrl, JSON.stringify(galleryImages), id];
    } else if (thumbnailUrl && finalVideoUrl) {
      query = `UPDATE media SET title = ?, type = ?, description = ?, thumbnail = ?, videoUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      params = [title, type, description || '', thumbnailUrl, finalVideoUrl, id];
    } else if (thumbnailUrl && galleryImages) {
      query = `UPDATE media SET title = ?, type = ?, description = ?, thumbnail = ?, gallery_images = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      params = [title, type, description || '', thumbnailUrl, JSON.stringify(galleryImages), id];
    } else if (finalVideoUrl && galleryImages) {
      query = `UPDATE media SET title = ?, type = ?, description = ?, videoUrl = ?, gallery_images = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      params = [title, type, description || '', finalVideoUrl, JSON.stringify(galleryImages), id];
    } else if (thumbnailUrl) {
      query = `UPDATE media SET title = ?, type = ?, description = ?, thumbnail = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      params = [title, type, description || '', thumbnailUrl, id];
    } else if (finalVideoUrl) {
      query = `UPDATE media SET title = ?, type = ?, description = ?, videoUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      params = [title, type, description || '', finalVideoUrl, id];
    } else if (galleryImages) {
      query = `UPDATE media SET title = ?, type = ?, description = ?, gallery_images = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      params = [title, type, description || '', JSON.stringify(galleryImages), id];
    } else {
      query = `UPDATE media SET title = ?, type = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      params = [title, type, description || '', id];
    }
    
    db.run(query, params, function(err) {
      if (err) {
        if (req.files?.thumbnail) {
          fs.unlink(req.files.thumbnail[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        if (req.files?.videoFile) {
          fs.unlink(req.files.videoFile[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        if (req.files?.images) {
          req.files.images.forEach(file => {
            fs.unlink(file.path, (err) => { if (err) console.error('Error deleting file:', err); });
          });
        }
        console.error('DB Error:', err);
        return res.status(500).json({ error: err.message || 'Database error' });
      }
      
      if (this.changes === 0) {
        if (req.files?.thumbnail) {
          fs.unlink(req.files.thumbnail[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        if (req.files?.videoFile) {
          fs.unlink(req.files.videoFile[0].path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        if (req.files?.images) {
          req.files.images.forEach(file => {
            fs.unlink(file.path, (err) => { if (err) console.error('Error deleting file:', err); });
          });
        }
        return res.status(404).json({ error: 'Media not found' });
      }
      
      res.json({ message: 'Media updated successfully' });
    });
  } catch (err) {
    console.error('Error in PUT /api/media/:id:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Delete Media (Admin Only)
app.delete('/api/media/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT thumbnail, videoUrl FROM media WHERE id = ?`, [id], (err, row) => {
    if (!err && row) {
      // Delete thumbnail if it exists
      if (row.thumbnail) {
        const imagePath = path.join(__dirname, row.thumbnail);
        fs.unlink(imagePath, (err) => { if (err) console.error('Error deleting thumbnail:', err); });
      }
      // Delete video file if it's a local file
      if (row.videoUrl && row.videoUrl.startsWith('/uploads/')) {
        const videoPath = path.join(__dirname, row.videoUrl);
        fs.unlink(videoPath, (err) => { if (err) console.error('Error deleting video:', err); });
      }
    }
  });
  
  const query = `DELETE FROM media WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    res.json({ message: 'Media deleted successfully' });
  });
});

// ============================================
// Teachings API Endpoints
// ============================================

// Get All Teachings (Public)
app.get('/api/teachings', (req, res) => {
  const query = `SELECT * FROM teachings ORDER BY date DESC, createdAt DESC`;
  
  db.all(query, (err, teachings) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(teachings || []);
  });
});

// Create Teaching (Admin Only)
app.post('/api/teachings', (req, res, next) => {
  uploadVideo.single('videoFile')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, (req, res) => {
  try {
    const { title, series, duration, videoUrl, description, date, adminId } = req.body;
    const videoFileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const finalVideoUrl = videoFileUrl || videoUrl || '';
    
    console.log('POST /api/teachings - title:', title, 'adminId:', adminId, 'has file:', !!req.file);
    
    if (!title || !adminId) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      return res.status(400).json({ error: 'Please provide title and adminId' });
    }

    if (!finalVideoUrl) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      return res.status(400).json({ error: 'Please provide a video file or video URL' });
    }

    const query = `INSERT INTO teachings (title, series, duration, videoUrl, description, date, adminId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [title, series || '', duration || '', finalVideoUrl, description || '', date || new Date().toISOString().split('T')[0], adminId], function(err) {
      if (err) {
        if (req.file) {
          fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        console.error('DB Error:', err);
        return res.status(500).json({ error: err.message || 'Database error' });
      }
      
      res.status(201).json({
        id: this.lastID,
        title,
        series,
        duration,
        videoUrl: finalVideoUrl,
        description,
        date,
        adminId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
    }
    console.error('Error in POST /api/teachings:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Update Teaching (Admin Only)
app.put('/api/teachings/:id', (req, res, next) => {
  uploadVideo.single('videoFile')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, (req, res) => {
  try {
    const { id } = req.params;
    const { title, series, duration, videoUrl, description, date } = req.body;
    
    console.log('PUT /api/teachings/:id - id:', id, 'title:', title);
    
    if (!title) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
      }
      return res.status(400).json({ error: 'Please provide title' });
    }

    // Fetch current teaching to delete old video if needed
    db.get(`SELECT videoUrl FROM teachings WHERE id = ?`, [id], (err, row) => {
      if (!err && row && req.file && row.videoUrl && row.videoUrl.startsWith('/uploads/')) {
        const oldVideoPath = path.join(__dirname, row.videoUrl);
        fs.unlink(oldVideoPath, (err) => { if (err) console.error('Error deleting old video:', err); });
      }
    });

    const videoFileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const finalVideoUrl = videoFileUrl || videoUrl;

    const query = `UPDATE teachings SET title = ?, series = ?, duration = ?, videoUrl = ?, description = ?, date = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    const params = [title, series || '', duration || '', finalVideoUrl || '', description || '', date || new Date().toISOString().split('T')[0], id];
    
    db.run(query, params, function(err) {
      if (err) {
        if (req.file) {
          fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        console.error('DB Error:', err);
        return res.status(500).json({ error: err.message || 'Database error' });
      }
      
      if (this.changes === 0) {
        if (req.file) {
          fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        return res.status(404).json({ error: 'Teaching not found' });
      }
      
      res.json({ message: 'Teaching updated successfully' });
    });
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
    }
    console.error('Error in PUT /api/teachings/:id:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Delete Teaching (Admin Only)
app.delete('/api/teachings/:id', (req, res) => {
  const { id } = req.params;
  
  // Fetch teaching to delete video file if it's local
  db.get(`SELECT videoUrl FROM teachings WHERE id = ?`, [id], (err, row) => {
    if (!err && row && row.videoUrl && row.videoUrl.startsWith('/uploads/')) {
      const videoPath = path.join(__dirname, row.videoUrl);
      fs.unlink(videoPath, (err) => { if (err) console.error('Error deleting video:', err); });
    }
  });
  
  const query = `DELETE FROM teachings WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Teaching not found' });
    }
    
    res.json({ message: 'Teaching deleted successfully' });
  });
});

// ============================================
// Bible API Endpoints - Using GitHub CDN
// ============================================

const https = require('https');

// Bible API Configuration - using GitHub CDN
const BIBLE_API_BASE = 'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles';
const DEFAULT_BIBLE_VERSION = 'en-kjv'; // King James Version (default)

// Available Bible versions
const AVAILABLE_VERSIONS = [
  { code: 'en-kjv', name: 'King James Version (KJV)', language: 'English' },
  { code: 'en-asv', name: 'American Standard Version (ASV)', language: 'English' },
  { code: 'en-web', name: 'World English Bible (WEB)', language: 'English' },
  { code: 'en-ylt', name: "Young's Literal Translation (YLT)", language: 'English' },
  { code: 'en-webster', name: 'Webster Bible (WBT)', language: 'English' },
  { code: 'af-afr1953', name: 'Afrikaans 1953 (1933)', language: 'Afrikaans' },
  { code: 'ar-van', name: 'Arabic Van Dyck (VAN)', language: 'Arabic' },
  { code: 'zh-cn', name: 'Chinese Simplified (CUV)', language: 'Chinese' },
  { code: 'nl-svv', name: 'Dutch Statenvertaling (SV)', language: 'Dutch' },
  { code: 'fi-pr92', name: 'Finnish (2DCC)', language: 'Finnish' },
  { code: 'fr-sbv', name: 'French Segond (SBV)', language: 'French' },
  { code: 'de-elb1905', name: 'German Elberfeld (ELB1905)', language: 'German' },
  { code: 'la-vg', name: 'Latin Vulgate (VG)', language: 'Latin' },
  { code: 'pt-acf', name: 'Portuguese Almeida Corrigida (ACF)', language: 'Portuguese' },
  { code: 'es-rvg', name: 'Spanish Reina Valera (RVG)', language: 'Spanish' },
];

// Helper function to fetch from GitHub CDN
const fetchFromBibleAPI = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).on('timeout', function() {
      this.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

// Helper function to clean verse text of footnote markers and extra formatting
const cleanVerseText = (text) => {
  if (!text) return text;
  
  // Remove footnote markers like .101, .6, etc.
  text = text.replace(/\.\d+/g, '');
  
  // Remove cross-reference markers
  text = text.replace(/\{[^}]*\}/g, '');
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

// Get available Bible versions
app.get('/api/bible/versions', (req, res) => {
  res.json(AVAILABLE_VERSIONS);
});

// Convert book code to display name (e.g., '1-corinthians' -> '1 Corinthians')
const getDisplayBookName = (bookCode) => {
  const displayNames = {
    'genesis': 'Genesis', 'exodus': 'Exodus', 'leviticus': 'Leviticus', 'numbers': 'Numbers',
    'deuteronomy': 'Deuteronomy', 'joshua': 'Joshua', 'judges': 'Judges', 'ruth': 'Ruth',
    '1-samuel': '1 Samuel', '2-samuel': '2 Samuel', '1-kings': '1 Kings', '2-kings': '2 Kings',
    '1-chronicles': '1 Chronicles', '2-chronicles': '2 Chronicles', 'ezra': 'Ezra', 'nehemiah': 'Nehemiah',
    'esther': 'Esther', 'job': 'Job', 'psalms': 'Psalm', 'proverbs': 'Proverbs',
    'ecclesiastes': 'Ecclesiastes', 'isaiah': 'Isaiah', 'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations',
    'ezekiel': 'Ezekiel', 'daniel': 'Daniel', 'hosea': 'Hosea', 'joel': 'Joel', 'amos': 'Amos',
    'obadiah': 'Obadiah', 'jonah': 'Jonah', 'micah': 'Micah', 'nahum': 'Nahum', 'habakkuk': 'Habakkuk',
    'zephaniah': 'Zephaniah', 'haggai': 'Haggai', 'zechariah': 'Zechariah', 'malachi': 'Malachi',
    'matthew': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John', 'acts': 'Acts',
    'romans': 'Romans', '1-corinthians': '1 Corinthians', '2-corinthians': '2 Corinthians',
    'galatians': 'Galatians', 'ephesians': 'Ephesians', 'philippians': 'Philippians',
    'colossians': 'Colossians', '1-thessalonians': '1 Thessalonians', '2-thessalonians': '2 Thessalonians',
    '1-timothy': '1 Timothy', '2-timothy': '2 Timothy', 'titus': 'Titus', 'philemon': 'Philemon',
    'hebrews': 'Hebrews', 'james': 'James', '1-peter': '1 Peter', '2-peter': '2 Peter',
    '1-john': '1 John', '2-john': '2 John', '3-john': '3 John', 'jude': 'Jude', 'revelation': 'Revelation'
  };
  return displayNames[bookCode] || bookCode;
};

// Parse verse reference (e.g., "John 3:16" -> {book, chapter, verse})
const parseVerseReference = (reference) => {
  // Try to parse verse range first: "Book Chapter:StartVerse - EndVerse"
  const rangeMatch = reference.match(/(\w+)\s+(\d+):(\d+)\s*-\s*(\d+)/i);
  if (rangeMatch) {
    const bookName = rangeMatch[1].toLowerCase();
    const chapter = rangeMatch[2];
    const startVerse = rangeMatch[3];
    const endVerse = rangeMatch[4];
    
    // Map book names to API format
    const bookMap = {
      'genesis': 'genesis', 'exodus': 'exodus', 'leviticus': 'leviticus', 'numbers': 'numbers',
      'deuteronomy': 'deuteronomy', 'joshua': 'joshua', 'judges': 'judges', 'ruth': 'ruth',
      '1samuel': '1-samuel', '2samuel': '2-samuel', '1kings': '1-kings', '2kings': '2-kings',
      '1chronicles': '1-chronicles', '2chronicles': '2-chronicles', 'ezra': 'ezra', 'nehemiah': 'nehemiah',
      'esther': 'esther', 'job': 'job', 'psalm': 'psalms', 'psalms': 'psalms', 'proverbs': 'proverbs',
      'ecclesiastes': 'ecclesiastes', 'isaiah': 'isaiah', 'jeremiah': 'jeremiah', 'lamentations': 'lamentations',
      'ezekiel': 'ezekiel', 'daniel': 'daniel', 'hosea': 'hosea', 'joel': 'joel', 'amos': 'amos',
      'obadiah': 'obadiah', 'jonah': 'jonah', 'micah': 'micah', 'nahum': 'nahum', 'habakkuk': 'habakkuk',
      'zephaniah': 'zephaniah', 'haggai': 'haggai', 'zechariah': 'zechariah', 'malachi': 'malachi',
      'matthew': 'matthew', 'mark': 'mark', 'luke': 'luke', 'john': 'john', 'acts': 'acts',
      'romans': 'romans', '1corinthians': '1-corinthians', '2corinthians': '2-corinthians',
      'galatians': 'galatians', 'ephesians': 'ephesians', 'philippians': 'philippians',
      'colossians': 'colossians', '1thessalonians': '1-thessalonians', '2thessalonians': '2-thessalonians',
      '1timothy': '1-timothy', '2timothy': '2-timothy', 'titus': 'titus', 'philemon': 'philemon',
      'hebrews': 'hebrews', 'james': 'james', '1peter': '1-peter', '2peter': '2-peter',
      '1john': '1-john', '2john': '2-john', '3john': '3-john', 'jude': 'jude', 'revelation': 'revelation'
    };
    
    return {
      book: bookMap[bookName] || bookName,
      chapter,
      startVerse,
      endVerse,
      isRange: true
    };
  }
  
  // Fall back to single verse: "Book Chapter:Verse"
  const singleMatch = reference.match(/(\w+)\s+(\d+):(\d+)/i);
  if (!singleMatch) return null;
  
  const bookName = singleMatch[1].toLowerCase();
  const chapter = singleMatch[2];
  const verse = singleMatch[3];
  
  // Map book names to API format
  const bookMap = {
    'genesis': 'genesis', 'exodus': 'exodus', 'leviticus': 'leviticus', 'numbers': 'numbers',
    'deuteronomy': 'deuteronomy', 'joshua': 'joshua', 'judges': 'judges', 'ruth': 'ruth',
    '1samuel': '1-samuel', '2samuel': '2-samuel', '1kings': '1-kings', '2kings': '2-kings',
    '1chronicles': '1-chronicles', '2chronicles': '2-chronicles', 'ezra': 'ezra', 'nehemiah': 'nehemiah',
    'esther': 'esther', 'job': 'job', 'psalm': 'psalms', 'psalms': 'psalms', 'proverbs': 'proverbs',
    'ecclesiastes': 'ecclesiastes', 'isaiah': 'isaiah', 'jeremiah': 'jeremiah', 'lamentations': 'lamentations',
    'ezekiel': 'ezekiel', 'daniel': 'daniel', 'hosea': 'hosea', 'joel': 'joel', 'amos': 'amos',
    'obadiah': 'obadiah', 'jonah': 'jonah', 'micah': 'micah', 'nahum': 'nahum', 'habakkuk': 'habakkuk',
    'zephaniah': 'zephaniah', 'haggai': 'haggai', 'zechariah': 'zechariah', 'malachi': 'malachi',
    'matthew': 'matthew', 'mark': 'mark', 'luke': 'luke', 'john': 'john', 'acts': 'acts',
    'romans': 'romans', '1corinthians': '1-corinthians', '2corinthians': '2-corinthians',
    'galatians': 'galatians', 'ephesians': 'ephesians', 'philippians': 'philippians',
    'colossians': 'colossians', '1thessalonians': '1-thessalonians', '2thessalonians': '2-thessalonians',
    '1timothy': '1-timothy', '2timothy': '2-timothy', 'titus': 'titus', 'philemon': 'philemon',
    'hebrews': 'hebrews', 'james': 'james', '1peter': '1-peter', '2peter': '2-peter',
    '1john': '1-john', '2john': '2-john', '3john': '3-john', 'jude': 'jude', 'revelation': 'revelation'
  };
  
  return {
    book: bookMap[bookName] || bookName,
    chapter,
    verse
  };
};

// Curated verses library for fallback and daily selection
const verseLibrary = [
  { reference: "John 3:16", book: "john", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", translation: "KJV" },
  { reference: "Philippians 4:13", book: "philippians", chapter: 4, verse: 13, text: "I can do all things through Christ which strengtheneth me.", translation: "KJV" },
  { reference: "John 10:17", book: "john", chapter: 10, verse: 17, text: "Therefore doth my Father love me, because I lay down my life, that I might take it again.", translation: "KJV" },
  { reference: "Proverbs 3:5", book: "proverbs", chapter: 3, verse: 5, text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", translation: "KJV" },
  { reference: "Psalm 23:1", book: "psalms", chapter: 23, verse: 1, text: "The LORD is my shepherd; I shall not want.", translation: "KJV" },
  { reference: "Romans 8:28", book: "romans", chapter: 8, verse: 28, text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", translation: "KJV" },
  { reference: "Jeremiah 29:11", book: "jeremiah", chapter: 29, verse: 11, text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", translation: "KJV" },
  { reference: "Matthew 11:28", book: "matthew", chapter: 11, verse: 28, text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", translation: "KJV" },
  { reference: "Psalm 27:1", book: "psalms", chapter: 27, verse: 1, text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?", translation: "KJV" },
  { reference: "1 Peter 5:7", book: "1-peter", chapter: 5, verse: 7, text: "Casting all your care upon him; for he careth for you.", translation: "KJV" },
  { reference: "Matthew 6:33", book: "matthew", chapter: 6, verse: 33, text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", translation: "KJV" },
  { reference: "Romans 3:23", book: "romans", chapter: 3, verse: 23, text: "For all have sinned, and come short of the glory of God.", translation: "KJV" },
  { reference: "Romans 6:23", book: "romans", chapter: 6, verse: 23, text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.", translation: "KJV" },
  { reference: "Psalm 119:105", book: "psalms", chapter: 119, verse: 105, text: "Thy word is a lamp unto my feet, and a light unto my path.", translation: "KJV" },
  { reference: "2 Corinthians 5:7", book: "2-corinthians", chapter: 5, verse: 7, text: "For we walk by faith, not by sight.", translation: "KJV" },
  { reference: "Isaiah 40:31", book: "isaiah", chapter: 40, verse: 31, text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", translation: "KJV" },
  { reference: "James 4:8", book: "james", chapter: 4, verse: 8, text: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.", translation: "KJV" },
  { reference: "Hebrews 11:1", book: "hebrews", chapter: 11, verse: 1, text: "Now faith is the substance of things hoped for, the evidence of things not seen.", translation: "KJV" },
  { reference: "Ephesians 2:8", book: "ephesians", chapter: 2, verse: 8, text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.", translation: "KJV" },
  { reference: "Proverbs 22:6", book: "proverbs", chapter: 22, verse: 6, text: "Train up a child in the way he should go: and when he is old, he will not depart from it.", translation: "KJV" },
  { reference: "John 14:6", book: "john", chapter: 14, verse: 6, text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.", translation: "KJV" },
  { reference: "John 15:5", book: "john", chapter: 15, verse: 5, text: "I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.", translation: "KJV" },
  { reference: "Proverbs 1:7", book: "proverbs", chapter: 1, verse: 7, text: "The fear of the LORD is the beginning of knowledge: but fools despise wisdom and instruction.", translation: "KJV" },
  { reference: "Luke 6:31", book: "luke", chapter: 6, verse: 31, text: "And as ye would that men should do to you, do ye also to them likewise.", translation: "KJV" },
  { reference: "Mark 12:30", book: "mark", chapter: 12, verse: 30, text: "And thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind, and with all thy strength: this is the first commandment.", translation: "KJV" },
  { reference: "John 1:1", book: "john", chapter: 1, verse: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God.", translation: "KJV" },
  { reference: "John 1:14", book: "john", chapter: 1, verse: 14, text: "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.", translation: "KJV" },
  { reference: "John 3:3", book: "john", chapter: 3, verse: 3, text: "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.", translation: "KJV" },
  { reference: "John 4:24", book: "john", chapter: 4, verse: 24, text: "God is a Spirit: and they that worship him must worship him in spirit and in truth.", translation: "KJV" },
  { reference: "John 6:35", book: "john", chapter: 6, verse: 35, text: "And Jesus said unto them, I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.", translation: "KJV" },
  { reference: "John 8:12", book: "john", chapter: 8, verse: 12, text: "Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.", translation: "KJV" },
  { reference: "John 10:10", book: "john", chapter: 10, verse: 10, text: "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.", translation: "KJV" },
  { reference: "John 14:1", book: "john", chapter: 14, verse: 1, text: "Let not your heart be troubled: ye believe in God, believe also in me.", translation: "KJV" },
  { reference: "John 14:2", book: "john", chapter: 14, verse: 2, text: "In my Father's house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.", translation: "KJV" },
  { reference: "John 14:6", book: "john", chapter: 14, verse: 6, text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.", translation: "KJV" },
  { reference: "John 14:14", book: "john", chapter: 14, verse: 14, text: "If ye shall ask any thing in my name, I will do it.", translation: "KJV" },
  { reference: "James 1:2", book: "james", chapter: 1, verse: 2, text: "My brethren, count it all joy when ye fall into divers temptations.", translation: "KJV" },
  { reference: "1 Corinthians 13:13", book: "1-corinthians", chapter: 13, verse: 13, text: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", translation: "KJV" },
  { reference: "2 Corinthians 9:7", book: "2-corinthians", chapter: 9, verse: 7, text: "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.", translation: "KJV" },
  { reference: "Philippians 4:6", book: "philippians", chapter: 4, verse: 6, text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.", translation: "KJV" },
  { reference: "Psalm 33:22", book: "psalms", chapter: 33, verse: 22, text: "Let thy mercy, O LORD, be upon us, according as we hope in thee.", translation: "KJV" },
  { reference: "Psalm 42:11", book: "psalms", chapter: 42, verse: 11, text: "Why art thou cast down, O my soul? and why art thou disquieted within me? hope thou in God: for I shall yet praise him for the help of his countenance.", translation: "KJV" },
  { reference: "Isaiah 53:5", book: "isaiah", chapter: 53, verse: 5, text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.", translation: "KJV" },
];

// Get daily verse of the day
app.get('/api/bible/verse-of-day', async (req, res) => {
  try {
    const version = req.query.version || DEFAULT_BIBLE_VERSION;
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const verseIndex = dayOfYear % verseLibrary.length;
    
    const verse = verseLibrary[verseIndex];
    
    // Try to fetch from API for more details
    try {
      const apiUrl = `${BIBLE_API_BASE}/${version}/books/${verse.book}/chapters/${verse.chapter}/verses/${verse.verse}.json`;
      const apiData = await fetchFromBibleAPI(apiUrl);
      
      if (apiData && apiData.text) {
        return res.json({
          reference: `${getDisplayBookName(verse.book)} ${verse.chapter}:${verse.verse}`,
          text: cleanVerseText(apiData.text),
          translation: version.toUpperCase()
        });
      }
    } catch (apiError) {
      console.log('API fetch failed, using fallback verse');
    }
    
    // Return fallback verse
    res.json({...verse, translation: version.toUpperCase()});
  } catch (error) {
    console.error('Error getting daily verse:', error);
    res.status(500).json({ error: 'Failed to fetch daily verse' });
  }
});

// Search verses
app.get('/api/bible/search', async (req, res) => {
  const query = req.query.q || '';
  const version = req.query.version || DEFAULT_BIBLE_VERSION;
  
  if (!query.trim()) {
    return res.status(400).json({ error: 'Search query required' });
  }

  try {
    const searchTerm = query.toLowerCase();
    console.log('Search query:', query);
    
    // First check if it's a verse reference like "John 3:16" or verse range "John 3:16 - 20"
    const parsed = parseVerseReference(query);
    console.log('Parsed result:', parsed);
    
    if (parsed) {
      try {
        // Handle verse range
        if (parsed.isRange) {
          console.log('Detected verse range:', parsed.startVerse, '-', parsed.endVerse);
          const results = [];
          const startVerse = parseInt(parsed.startVerse);
          const endVerse = parseInt(parsed.endVerse);
          
          for (let v = startVerse; v <= endVerse; v++) {
            const apiUrl = `${BIBLE_API_BASE}/${version}/books/${parsed.book}/chapters/${parsed.chapter}/verses/${v}.json`;
            console.log('Fetching:', apiUrl);
            try {
              const verseData = await fetchFromBibleAPI(apiUrl);
              if (verseData && verseData.text) {
                results.push({
                  reference: `${getDisplayBookName(parsed.book)} ${parsed.chapter}:${v}`,
                  text: cleanVerseText(verseData.text),
                  translation: version.toUpperCase()
                });
                console.log('Successfully fetched verse', v);
              }
            } catch (err) {
              console.log('Failed to fetch verse', v, ':', err.message);
              // Continue to next verse if one fails
            }
          }
          
          console.log('Total verses fetched:', results.length);
          if (results.length > 0) {
            return res.json(results);
          }
        } else {
          // Handle single verse
          console.log('Detected single verse:', parsed.verse);
          const apiUrl = `${BIBLE_API_BASE}/${version}/books/${parsed.book}/chapters/${parsed.chapter}/verses/${parsed.verse}.json`;
          console.log('Fetching single verse:', apiUrl);
          const verseData = await fetchFromBibleAPI(apiUrl);
          
          if (verseData && verseData.text) {
            return res.json([{
              reference: `${getDisplayBookName(parsed.book)} ${parsed.chapter}:${parsed.verse}`,
              text: cleanVerseText(verseData.text),
              translation: version.toUpperCase()
            }]);
          }
        }
      } catch (err) {
        console.log('Failed to fetch verse(s) from API:', err.message);
      }
    }
    
    // Search in verse library as fallback
    console.log('Falling back to library search');
    const libraryResults = verseLibrary.filter(verse => 
      verse.reference.toLowerCase().includes(searchTerm) ||
      verse.text.toLowerCase().includes(searchTerm)
    );
    
    if (libraryResults.length > 0) {
      return res.json(libraryResults.map(v => ({...v, translation: version.toUpperCase()})));
    }
    
    // If no results found in library, return empty
    res.json([]);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error searching verses' });
  }
});

// Get specific verse by reference
app.get('/api/bible/verse/:reference', async (req, res) => {
  const reference = req.params.reference || '';
  const version = req.query.version || DEFAULT_BIBLE_VERSION;

  try {
    // Parse the reference
    const parsed = parseVerseReference(reference);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid verse reference format' });
    }

    // Try to fetch from API
    try {
      const apiUrl = `${BIBLE_API_BASE}/${version}/books/${parsed.book}/chapters/${parsed.chapter}/verses/${parsed.verse}.json`;
      const verseData = await fetchFromBibleAPI(apiUrl);
      
      if (verseData && verseData.text) {
        return res.json({
          reference: `${getDisplayBookName(parsed.book)} ${parsed.chapter}:${parsed.verse}`,
          text: cleanVerseText(verseData.text),
          translation: version.toUpperCase()
        });
      }
    } catch (apiError) {
      console.log('API fetch failed for verse');
    }

    // Fallback to library
    const libraryVerse = verseLibrary.find(v => 
      v.reference.toLowerCase() === reference.toLowerCase()
    );

    if (libraryVerse) {
      return res.json({...libraryVerse, translation: version.toUpperCase()});
    }

    res.status(404).json({ error: 'Verse not found' });
  } catch (error) {
    console.error('Error fetching verse:', error);
    res.status(500).json({ error: 'Error fetching verse' });
  }
});

// Get reading plans
app.get('/api/bible/reading-plans', (req, res) => {
  const readingPlans = [
    {
      id: 1,
      name: "Daily Psalms",
      description: "Journey through the Psalms daily for encouragement and prayer",
      duration: 150,
      passages: ["Psalm 1", "Psalm 8", "Psalm 15", "Psalm 19", "Psalm 23"]
    },
    {
      id: 2,
      name: "Gospel of John",
      description: "Explore Jesus's teachings in the Gospel of John",
      duration: 21,
      passages: ["John 1", "John 3", "John 6", "John 11", "John 14"]
    },
    {
      id: 3,
      name: "Proverbs of Wisdom",
      description: "One chapter of Proverbs daily for life wisdom",
      duration: 31,
      passages: ["Proverbs 1", "Proverbs 2", "Proverbs 3", "Proverbs 4", "Proverbs 5"]
    },
    {
      id: 4,
      name: "New Testament Highlights",
      description: "Key passages from the New Testament",
      duration: 40,
      passages: ["Matthew 5-7", "Romans 1-3", "1 Corinthians 13", "Ephesians 2", "Philippians 4"]
    },
    {
      id: 5,
      name: "Old Testament Stories",
      description: "Foundation stories from the Old Testament",
      duration: 30,
      passages: ["Genesis 1-2", "Genesis 12", "Exodus 1-15", "Joshua 1-6", "1 Samuel 17"]
    }
  ];
  
  res.json(readingPlans);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Kingdom Impact Database Server seamlessly running on port ${PORT}`);
});
