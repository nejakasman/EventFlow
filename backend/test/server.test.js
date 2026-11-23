const assert = require("node:assert/strict");
const { once } = require("node:events");
const { after, before, beforeEach, test } = require("node:test");
const axios = require("axios");
const app = require("../server");
const pool = require("../db");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach((context) => {
  context.mock.method(axios, "post", async () => {
    throw new Error("Unexpected Keycloak request");
  });
  context.mock.method(pool, "query", async () => {
    throw new Error("Unexpected PostgreSQL query");
  });
});

after(async () => {
  if (!server?.listening) return;

  const closed = once(server, "close");
  server.close();
  await closed;
});

async function request(path, options) {
  const response = await fetch(new URL(path, baseUrl), options);
  return { status: response.status, body: await response.json() };
}

function postJson(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const participant = {
  firstName: "Ana",
  lastName: "Novak",
  email: "ana@example.com",
  password: "test-password"
};

const organization = {
  name: "Društvo",
  email: "drustvo@example.com",
  password: "test-password"
};

test("GET / reports that the API is running", async () => {
  const result = await request("/");
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { message: "EventFlow backend deluje!" });
});

test("protected API requires a token", async () => {
  const result = await request("/api/protected");
  assert.equal(result.status, 401);
  assert.equal(result.body.message, "Za dostop je potrebna prijava.");
});

test("protected API rejects an authorization scheme other than Bearer", async () => {
  const result = await request("/api/protected", {
    headers: { Authorization: "Basic Zm9vOmJhcg==" }
  });
  assert.equal(result.status, 401);
});

test("participant registration requires a first name", async () => {
  const result = await postJson("/api/users/register", { ...participant, firstName: "" });
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Izpolni vsa obvezna polja.");
});

test("participant registration rejects a password shorter than eight characters", async () => {
  const result = await postJson("/api/users/register", { ...participant, password: "1234567" });
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Geslo mora vsebovati vsaj 8 znakov.");
});

test("participant registration rejects an invalid email address", async () => {
  const result = await postJson("/api/users/register", { ...participant, email: "ana@example" });
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Vnesi veljaven e-poštni naslov.");
});

test("organization registration rejects a blank name", async () => {
  const result = await postJson("/api/organizations/register", { ...organization, name: "   " });
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Izpolnite vsa obvezna polja.");
});

test("organization registration rejects an invalid email address", async () => {
  const result = await postJson("/api/organizations/register", { ...organization, email: "invalid" });
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Vnesite veljaven e-poštni naslov.");
});

test("public events require a positive integer category ID", async () => {
  const result = await request("/api/events?categoryId=0");
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Neveljavna kategorija.");
});

test("public events reject a date outside the YYYY-MM-DD format", async () => {
  const result = await request("/api/events?date=23-11-2026");
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Neveljaven datum.");
});

test("public events limit results to published events and apply all supplied filters", async () => {
  const event = { id: 42, title: "Jazz večer" };
  const query = pool.query.mock;
  query.mockImplementation(async () => ({ rows: [event] }));

  const result = await request("/api/events?search=%20Jazz%20&categoryId=2&date=2026-12-05");

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { events: [event] });
  assert.equal(query.callCount(), 1);
  const [sql, parameters] = query.calls[0].arguments;
  assert.match(sql, /events\.status = 'PUBLISHED'/);
  assert.match(sql, /events\.title ILIKE \$1/);
  assert.match(sql, /events\.category_id = \$2/);
  assert.match(sql, /events\.start_date::date = \$3::date/);
  assert.deepEqual(parameters, ["%Jazz%", 2, "2026-12-05"]);
});
