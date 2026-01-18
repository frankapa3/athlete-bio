const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = 3000;

// --- ΡΥΘΜΙΣΕΙΣ ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'athlete-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Σερβίρισμα στατικών αρχείων
app.use(express.static('public'));

// --- HELPER FUNCTIONS ---
const getData = (filename) => {
    try {
        const filePath = path.join(__dirname, 'data', filename);
        if (!fs.existsSync(filePath)) return [];
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error("Error reading file:", filename);
        return [];
    }
};

const saveData = (filename, data) => {
    try {
        const filePath = path.join(__dirname, 'data', filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing file:", filename);
    }
};

// --- API ROUTES ---
app.get('/api/achievements', (req, res) => {
    res.json(getData('achievements.json'));
});

app.post('/api/achievements', (req, res) => {
    if (!req.session.loggedIn) return res.status(403).json({ error: 'Unauthorized' });
    const data = getData('achievements.json');
    const newItem = { id: Date.now(), ...req.body };
    data.push(newItem);
    saveData('achievements.json', data);
    res.json(newItem);
});

app.get('/api/links', (req, res) => {
    res.json(getData('links.json'));
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '1234') {
        req.session.loggedIn = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// --- SPA ROUTE (Η ΔΙΟΡΘΩΣΗ) ---
// Χρησιμοποιούμε RegExp (/.*/) αντί για string ('*') για να μην κρασάρει το Express 5
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- ΕΚΚΙΝΗΣΗ ---
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});