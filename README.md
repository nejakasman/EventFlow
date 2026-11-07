# EventFlow

## Opis projekta

EventFlow je spletna aplikacija, namenjena enostavnejši organizaciji dogodkov ter preglednemu upravljanju dogodkov in prijav udeležencev na enem mestu. Obiskovalcem omogoča pregledovanje in filtriranje objavljenih dogodkov, registriranim uporabnikom pa prijavo na izbrane dogodke, spremljanje statusa prijave in njeno odpoved. Organizacije lahko prek aplikacije ustvarjajo, objavljajo in upravljajo svoje dogodke ter spremljajo prijave udeležencev. Če je dogodek že zapolnjen, se lahko novi prijavljeni uvrstijo na čakalni seznam in počakajo na sprostitev prostega mesta.

## Uporabljene tehnologije

- **Frontend:** React, JavaScript, HTML, CSS
- **Backend:** Node.js, Express
- **Podatkovna baza:** PostgreSQL
- **Avtentikacija:** Keycloak
- **Komunikacija:** REST API
- **Razvojno okolje:** Docker, Docker Compose

## Dokumentacija

Projektna dokumentacija je na voljo v mapi [`docs/`](docs/).

- [Zasnova rešitve](docs/01-zasnova-resitve.md)
- [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [Podatkovni model](docs/03-podatkovni-model.md)
- [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [Wireframes](docs/06-wireframes.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)

## Lokalni zagon projekta

### 1. Predpogoji

Za lokalni zagon projekta potrebujemo:

- [Node.js](https://nodejs.org/)
- npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Kloniranje repozitorija

Repozitorij kloniramo in se premaknemo v projektno mapo:

```bash
git clone URL_REPOZITORIJA
cd EventFlow
```

### 3. Nastavitev okolja

V korenski mapi projekta se nahaja datoteka `.env.example`, ki vsebuje primer potrebnih okoljskih spremenljivk.

Iz nje ustvarimo datoteko `.env`:

```bash
cp .env.example .env
```

V datoteki `.env` nastavimo svoja gesla za obe PostgreSQL podatkovni bazi in administratorski račun Keycloaka.

Datoteka `.env` vsebuje občutljive podatke in se ne shranjuje v Git repozitorij.

### 4. Zagon Docker storitev

V korenski mapi projekta zaženemo:

```bash
docker compose up -d
```

Ukaz zažene naslednje storitve:

- **PostgreSQL** – podatkovna baza za aplikacijo EventFlow.
- **PostgreSQL za Keycloak** – podatkovna baza za shranjevanje podatkov Keycloaka.
- **Keycloak** – storitev za registracijo, prijavo in upravljanje uporabnikov.

Stanje storitev preverimo z ukazom:

```bash
docker compose ps
```

### 5. Začetna nastavitev Keycloaka

Keycloakova administracijska konzola je dostopna na naslovu:

http://localhost:8081

Za prijavo uporabimo administratorsko uporabniško ime in geslo iz datoteke `.env` (`KEYCLOAK_ADMIN` in `KEYCLOAK_ADMIN_PASSWORD`).

Po prijavi izvedemo začetno konfiguracijo:

**Ustvarjanje realma**

1. V razdelku za izbiro realma ustvarimo nov realm z imenom `EventFlow`.

**Ustvarjanje uporabniških vlog**

V razdelku **Realm roles** ustvarimo naslednje vloge:

- `PARTICIPANT` – registriran uporabnik, ki se lahko prijavlja na dogodke.
- `ORGANIZER` – organizator, ki lahko ustvarja in upravlja dogodke.
- `ADMIN` – administrator aplikacije.

Vlogo `PARTICIPANT` dodamo med privzete vloge (`default-roles-eventflow`), da jo prejmejo novi registrirani uporabniki.

**Omogočanje registracije**

V razdelku **Realm settings → Login** omogočimo:

- User registration
- Email as username
- Forgot password

**Ustvarjanje clienta**

V razdelku **Clients** ustvarimo nov client:

- Client type: `OpenID Connect`
- Client ID: `eventflow-frontend`
- Client authentication: Off
- Standard flow: On
- Direct access grants: Off
- Implicit flow: Off

Nastavimo še naslove:

- Root URL: `http://localhost:5173`
- Home URL: `http://localhost:5173`
- Valid redirect URIs: `http://localhost:5173/*`
- Valid post logout redirect URIs: `http://localhost:5173/*`
- Web origins: `http://localhost:5173`

S tem je osnovna konfiguracija Keycloaka pripravljena za povezavo z aplikacijo.

### 6. Ustavitev Docker storitev

Za ustavitev Docker storitev uporabimo:

```bash
docker compose down
```

Podatki v Docker volumnih se pri tem ohranijo.

## Razvoj aplikacije

Frontend in backend se razvijata ločeno.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

React aplikacija je dostopna na naslovu:

http://localhost:5173

**Backend:**

```bash
cd backend
npm install
npm run dev
```

Backend je dostopen na naslovu:

http://localhost:3000
