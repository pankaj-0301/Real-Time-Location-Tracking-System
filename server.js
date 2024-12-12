

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const redis = require('redis');
const redisClient = redis.createClient();
redisClient.connect()
 .then(() => console.log('Redis connected'))
 .catch((err) => console.error('Redis connection error:', err));

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://<user>:<password>@cluster0.yvs1pu5.mongodb.net/gr-backend').then(() => console.log('MongoDB connected')).catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

const locationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});
const Location = mongoose.model('Location', locationSchema);

const JWT_SECRET = 'your_jwt_secret_key';


app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

io.on('connection', (socket) => {
    socket.on('locationPing', async ({ userId, latitude, longitude }) => {
        try {
            const location = { latitude, longitude, timestamp: new Date().toISOString() };
   
            const redisKey = `user:${userId}:locations`;
            await redisClient.rPush(redisKey, JSON.stringify(location));
            await redisClient.expire(redisKey, 3600); 
   
            const dbLocation = new Location({ userId, latitude, longitude });
            await dbLocation.save();
        } catch (error) {
            console.error('Error handling locationPing:', error);
        }
    });
   });

app.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/admin/user/:userId/locations', async (req, res) => {
    try {
        const { userId } = req.params;
   
        const redisKey = `user:${userId}:locations`;
        let locations = await redisClient.lRange(redisKey, 0, -1);
   
        if (locations.length > 0) {
            locations = locations.map((loc) => JSON.parse(loc));
            return res.json(locations);
        }
   
        locations = await Location.find({ userId });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch location logs' });
    }
   });
   

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
