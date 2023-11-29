const openAI = require("openai");
const secretKey = process.env.OPENAI_API_KEY;
const openai = new openAI({
  apiKey: 'SG-secretKey',
});

module.exports = openai;
