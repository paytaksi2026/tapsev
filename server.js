const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get("/api/status", (req, res) => {
  res.json({ status: "OK", message: "TikTok Race Server Running" });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});