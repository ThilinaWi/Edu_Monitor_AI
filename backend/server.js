const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/predict", async (req, res) => {
  try {
    const response = await axios.post("http://127.0.0.1:5001/predict", req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "ML Service Error" });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
