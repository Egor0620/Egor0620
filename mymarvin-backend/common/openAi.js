const OpenAI = require("openai");
const secretKey = process.env.OPEN_AI_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

module.exports = openai;
