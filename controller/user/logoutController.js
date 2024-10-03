const express = require('express');
const fs = require('fs');
const router = express.Router();
const uuid = require('uuid'); // Untuk menghasilkan UUID yang unik
const cors = require('cors')
const axios = require('axios');

const usersdb = './db/user.json';

router.post('/logout', async (req, res) => {
    const sessionId = req.body.sessionId; // Ambil cookie sesi dari permintaan
    const clientIP = req.ip;
  
    // Baca file user.json
    const users = JSON.parse(fs.readFileSync(usersdb));

    const user = users.find(user => user.sessionId === sessionId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    user.sessionId = ""; 
    user.Expired_Session = null;

    fs.writeFileSync(usersdb, JSON.stringify(users, null, 2));

    console.log(`User ${user.Name} Logout Session : ${sessionId} [${clientIP}]`)
    res.status(200).json({ message: `success logout` }); 
  });
  

module.exports = router;