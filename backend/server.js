
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


app.post("/api/events", authenticateToken, requireRole("ORGANIZER"), async (req, res) => {
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      categoryId
    } = req.body;

    if (
      !title?.trim() ||
      !location?.trim() ||
      !startDate ||
      !endDate ||
      !registrationDeadline ||
      maxParticipants === undefined ||
      categoryId === undefined
    ) {
      return res.status(400).json({
        message: "Izpolnite vsa obvezna polja."
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(registrationDeadline);
    const now = new Date();

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      isNaN(deadline.getTime())
    ) {
      return res.status(400).json({
        message: "Vnesite veljavne datume."
      });
    }

    if (start <= now) {
      return res.status(400).json({
        message: "Datum začetka dogodka mora biti v prihodnosti."
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "Datum konca mora biti poznejši od začetka dogodka."
      });
    }

    if (deadline <= now || deadline >= start) {
      return res.status(400).json({
        message: "Rok za prijavo mora biti v prihodnosti in pred začetkom dogodka."
      });
    }

    const participants = Number(maxParticipants);
    const category = Number(categoryId);

    if (
      !Number.isInteger(participants) ||
      participants <= 0
    ) {
      return res.status(400).json({
        message: "Največje število udeležencev mora biti pozitivno celo število."
      });
    }

    if (!Number.isInteger(category) || category <= 0) {
      return res.status(400).json({
        message: "Izberite veljavno kategorijo."
      });
    }

    try {
      const categoryResult = await pool.query(
        "SELECT id FROM categories WHERE id = $1",
        [category]
      );

      if (categoryResult.rows.length === 0) {
        return res.status(400).json({
          message: "Izbrana kategorija ne obstaja."
        });
      }

      const result = await pool.query(
        `INSERT INTO events (
          title,
          description,
          location,
          start_date,
          end_date,
          registration_deadline,
          max_participants,
          status,
          organization_keycloak_id,
          category_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT', $8, $9)
        RETURNING *`,
        [
          title.trim(),
          description?.trim() || null,
          location.trim(),
          start,
          end,
          deadline,
          participants,
          req.user.id,
          category
        ]
      );

      return res.status(201).json({
        message: "Dogodek je bil uspešno ustvarjen.",
        event: result.rows[0]
      });
    } catch (error) {
      console.error("Napaka pri ustvarjanju dogodka:", error);

      return res.status(500).json({
        message: "Pri ustvarjanju dogodka je prišlo do napake."
      });
    }
  }
);



app.listen(PORT, () => {
  console.log(`EventFlow backend deluje na portu ${PORT}`);
});
