const Bot = require("./Bot/index.js").bot;
require('dotenv').config()

Bot(process.env.BOT_TOKEN, "1", "!", "#42f2f5");