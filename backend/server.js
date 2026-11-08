
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

app.post(
  "/api/events",
  authenticateToken,
  requireRole("ORGANIZER"),
  async (req, res) => {
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


app.post(
  "/api/events/:id/register",
  authenticateToken,
  requireRole("PARTICIPANT"),
  async (req, res) => {
    const eventId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({
        message: "Neveljaven ID dogodka."
      });
    }

    const client = await pool.connect();
    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      const eventResult = await client.query(
        `SELECT
          id,
          status,
          max_participants,
          waitlist_enabled,
          registration_deadline > CURRENT_TIMESTAMP AS registration_open
         FROM events
         WHERE id = $1
         FOR UPDATE`,
        [eventId]
      );

      if (eventResult.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "Dogodek ne obstaja."
        });
      }

      const event = eventResult.rows[0];

      if (event.status !== "PUBLISHED") {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "Prijava je mogoča samo na objavljene dogodke."
        });
      }

      if (!event.registration_open) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "Rok za prijavo na ta dogodek je že potekel."
        });
      }

      const userResult = await client.query(
        `SELECT keycloak_id
         FROM users
         WHERE keycloak_id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "Podatki uporabnika niso najdeni."
        });
      }

      const existingRegistration = await client.query(
        `SELECT id, status
         FROM registrations
         WHERE event_id = $1
           AND user_keycloak_id = $2
           AND status IN ('CONFIRMED', 'WAITLISTED')
         LIMIT 1`,
        [eventId, userId]
      );

      if (existingRegistration.rows.length > 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "Na ta dogodek ste že prijavljeni.",
          registration: existingRegistration.rows[0]
        });
      }

      const countResult = await client.query(
        `SELECT COUNT(*)::integer AS confirmed_count
         FROM registrations
         WHERE event_id = $1
           AND status = 'CONFIRMED'`,
        [eventId]
      );

      const confirmedCount = countResult.rows[0].confirmed_count;

      let registrationStatus;

      if (confirmedCount < event.max_participants) {
        registrationStatus = "CONFIRMED";
      } else if (event.waitlist_enabled) {
        registrationStatus = "WAITLISTED";
      } else {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "Dogodek je že poln in čakalni seznam ni omogočen."
        });
      }

      const result = await client.query(
        `INSERT INTO registrations (
          event_id,
          user_keycloak_id,
          status
        )
        VALUES ($1, $2, $3)
        RETURNING *`,
        [eventId, userId, registrationStatus]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      const message =
        registrationStatus === "CONFIRMED"
          ? "Uspešno ste se prijavili na dogodek."
          : "Dogodek je poln. Uspešno ste se uvrstili na čakalni seznam.";

      return res.status(201).json({
        message,
        registration: result.rows[0],
        confirmedCount:
          registrationStatus === "CONFIRMED"
            ? confirmedCount + 1
            : confirmedCount,
        maxParticipants: event.max_participants
      });
    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK");
      }

      if (error.code === "23505") {
        return res.status(409).json({
          message: "Na ta dogodek ste že prijavljeni."
        });
      }

      console.error("Napaka pri prijavi na dogodek:", error);

      return res.status(500).json({
        message: "Pri prijavi na dogodek je prišlo do napake."
      });
    } finally {
      client.release();
    }
  }
);

app.get(
  "/api/events/my",
  authenticateToken,
  requireRole("ORGANIZER"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
          events.*,
          categories.name AS category_name
         FROM events
         JOIN categories ON events.category_id = categories.id
         WHERE events.organization_keycloak_id = $1
         ORDER BY events.created_at DESC`,
        [req.user.id]
      );

      return res.status(200).json({
        events: result.rows
      });
    } catch (error) {
      console.error("Napaka pri pridobivanju dogodkov:", error);

      return res.status(500).json({
        message: "Pri pridobivanju dogodkov je prišlo do napake."
      });
    }
  }
);

app.get("/api/events", async (req, res) => {
  const { search, categoryId, date } = req.query;

  const conditions = ["events.status = 'PUBLISHED'"];
  const values = [];

  if (search && search.trim()) {
    values.push(`%${search.trim()}%`);
    conditions.push(`events.title ILIKE $${values.length}`);
  }

  if (categoryId) {
    const category = Number(categoryId);

    if (!Number.isInteger(category) || category <= 0) {
      return res.status(400).json({
        message: "Neveljavna kategorija."
      });
    }

    values.push(category);
    conditions.push(`events.category_id = $${values.length}`);
  }

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Neveljaven datum."
      });
    }

    values.push(date);
    conditions.push(`events.start_date::date = $${values.length}::date`);
  }

  try {
    const result = await pool.query(
      `SELECT
        events.id,
        events.title,
        events.description,
        events.location,
        events.start_date,
        events.end_date,
        events.registration_deadline,
        events.max_participants,
        events.category_id,
        categories.name AS category_name,
        organizations.name AS organization_name
       FROM events
       JOIN categories ON events.category_id = categories.id
       JOIN organizations
         ON events.organization_keycloak_id = organizations.keycloak_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY events.start_date ASC`,
      values
    );

    return res.status(200).json({
      events: result.rows
    });
  } catch (error) {
    console.error("Napaka pri pridobivanju objavljenih dogodkov:", error);

    return res.status(500).json({
      message: "Pri pridobivanju dogodkov je prišlo do napake."
    });
  }
});

app.patch(
  "/api/events/:id/publish",
  authenticateToken,
  requireRole("ORGANIZER"),
  async (req, res) => {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({
        message: "Neveljaven ID dogodka."
      });
    }

    try {
      const existingEvent = await pool.query(
        `SELECT id, status
         FROM events
         WHERE id = $1
           AND organization_keycloak_id = $2`,
        [eventId, req.user.id]
      );

      if (existingEvent.rows.length === 0) {
        return res.status(404).json({
          message: "Dogodek ne obstaja ali pa ga niste ustvarili vi."
        });
      }

      if (existingEvent.rows[0].status !== "DRAFT") {
        return res.status(409).json({
          message: "Objaviti je mogoče samo osnutek dogodka."
        });
      }

      const result = await pool.query(
        `UPDATE events
         SET status = 'PUBLISHED'
         WHERE id = $1
           AND organization_keycloak_id = $2
           AND status = 'DRAFT'
         RETURNING *`,
        [eventId, req.user.id]
      );

      return res.status(200).json({
        message: "Dogodek je bil uspešno objavljen.",
        event: result.rows[0]
      });
    } catch (error) {
      console.error("Napaka pri objavi dogodka:", error);

      return res.status(500).json({
        message: "Pri objavi dogodka je prišlo do napake."
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`EventFlow backend deluje na portu ${PORT}`);
});
