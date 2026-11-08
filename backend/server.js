
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  authenticateToken,
  requireRole
} = require("./middleware/auth");

const {
  createOrganizationAccount,
  createParticipantAccount,
  deleteKeycloakUser
} = require("./keycloakAdmin");

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

app.post("/api/users/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      message: "Izpolni vsa obvezna polja."
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Geslo mora vsebovati vsaj 8 znakov."
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Vnesi veljaven e-poštni naslov."
    });
  }

  let keycloakId;

  try {
    keycloakId = await createParticipantAccount(
      firstName.trim(),
      lastName.trim(),
      email.trim().toLowerCase(),
      password
    );

    const result = await pool.query(
      `INSERT INTO users (keycloak_id, first_name, last_name, email)
       VALUES ($1, $2, $3, $4)
       RETURNING keycloak_id, first_name, last_name, email`,
      [
        keycloakId,
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase()
      ]
    );

    return res.status(201).json({
      message: "Registracija udeleženca je bila uspešna.",
      user: result.rows[0]
    });
  } catch (error) {
    if (keycloakId) {
      try {
        await deleteKeycloakUser(keycloakId);
      } catch (deleteError) {
        console.error(
          "Brisanje uporabnika iz Keycloaka ni uspelo:",
          deleteError.message
        );
      }
    }

    console.error("Napaka pri registraciji udeleženca:", error.message);

    if (error.response?.status === 409 || error.code === "23505") {
      return res.status(409).json({
        message: "Uporabnik s tem e-poštnim naslovom že obstaja."
      });
    }

    return res.status(500).json({
      message: "Registracija ni uspela. Poskusi znova."
    });
  }
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


app.post("/api/organizations/register", async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (
    !name ||
    !email ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      message: "Izpolnite vsa obvezna polja."
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: "Vnesite veljaven e-poštni naslov."
    });
  }

  let keycloakId;

  try {
    keycloakId = await createOrganizationAccount(
      name,
      email,
      password
    );

    const result = await pool.query(
      `INSERT INTO organizations (keycloak_id, name, email)
       VALUES ($1, $2, $3)
       RETURNING keycloak_id, name, email`,
      [keycloakId, name, email]
    );

    res.status(201).json({
      message: "Registracija organizacije je bila uspešna.",
      organization: result.rows[0]
    });
  } catch (error) {
    if (keycloakId) {
      try {
        await deleteKeycloakUser(keycloakId);
      } catch (deleteError) {
        console.error(
          "Brisanje računa iz Keycloaka ni uspelo:",
          deleteError.message
        );
      }
    }

    console.error("Napaka pri registraciji organizacije:", {
  status: error.response?.status,
  url: error.config?.url,
  method: error.config?.method,
  data: error.response?.data
});

    if (
      error.code === "23505" ||
      error.response?.status === 409
    ) {
      return res.status(409).json({
        message: "Račun s tem e-poštnim naslovom že obstaja."
      });
    }

    res.status(500).json({
      message: "Pri registraciji organizacije je prišlo do napake."
    });
  }
});


app.listen(PORT, () => {
  console.log(`EventFlow backend deluje na portu ${PORT}`);
});
