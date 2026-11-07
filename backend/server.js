
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  authenticateToken,
  requireRole
} = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const pool = require("./db");

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

app.post("/api/users/me", authenticateToken, async (req, res) => {
  try {
    const { id, email, firstName, lastName } = req.user;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        message: "Manjkajo podatki o uporabniku."
      });
    }

    const result = await pool.query(
      `INSERT INTO users (keycloak_id, first_name, last_name, email)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (keycloak_id)
       DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         email = EXCLUDED.email
       RETURNING *`,
      [id, firstName, lastName, email]
    );

    res.status(200).json({
      message: "Podatki uporabnika so uspešno shranjeni.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Napaka pri shranjevanju uporabnika:", error);

    res.status(500).json({
      message: "Pri shranjevanju uporabnika je prišlo do napake."
    });
  }
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Povezava s PostgreSQL je uspešna.",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error("Napaka PostgreSQL:", error);
    res.status(500).json({
      message: "Napaka pri povezavi s PostgreSQL."
    });
  }
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
