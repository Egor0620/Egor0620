const OpenAI = require("openai");
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

module.exports = openai;
