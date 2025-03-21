const app = require('./app');
const serverless = require('serverless-http');

app.get("/", (req, res) => res.send("Express on Vercel"));

module.exports = serverless(app);

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;