const Bot = require("./Bot/index.js").bot;
require('dotenv').config()

if(process.env.TEST) {
    Bot(process.env.TEST_TOKEN, "1", "!", "#00ff00");
} else {
    Bot(process.env.BOT_TOKEN, "1", "!", "#42f2f5");
}