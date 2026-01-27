require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/chat', async (req, res) => {
    try{
        const response = await axios.post("https://ai.hackclub.com/proxy/v1/chat/completions", {
            model: "qwen/qwen-2.5-72b",
            messages: req.body.messages
        }, {
            headers: {'Authorization': `Bearer ${process.env.API_KEY}`}
        });
        res.json(response.data);
    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.listen(3000, ()=> console.log('Server running on http://localhost:3000'));