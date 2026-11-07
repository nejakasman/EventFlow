
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  authenticateToken,
  requireRole
} = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "EventFlow backend deluje!" });
});

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "Uspešno ste dostopali do zaščitenega API-ja.",
    user: req.user
  });
});

app.get(
  "/api/organizer",
  authenticateToken,
  requireRole("ORGANIZER"),
  (req, res) => {
    res.json({
      message: "Dostop do organizatorskega API-ja je dovoljen.",
      user: req.user
    });
  }
);

app.listen(PORT, () => {
  console.log(`EventFlow backend deluje na portu ${PORT}`);
});
