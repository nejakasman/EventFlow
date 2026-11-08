# EventFlow

## Opis projekta

EventFlow je spletna aplikacija, namenjena enostavnejši organizaciji dogodkov ter preglednemu upravljanju dogodkov in prijav udeležencev na enem mestu.

Obiskovalcem omogoča pregledovanje in filtriranje objavljenih dogodkov, registriranim uporabnikom pa prijavo na izbrane dogodke, spremljanje statusa prijave in njeno odpoved. Organizacije lahko prek aplikacije ustvarjajo, objavljajo in upravljajo svoje dogodke ter spremljajo prijave udeležencev.

Če je dogodek že zapolnjen, se lahko novi prijavljeni uvrstijo na čakalni seznam in počakajo na sprostitev prostega mesta.

## Uporabljene tehnologije

- **Frontend:** React, JavaScript, HTML, CSS
- **Backend:** Node.js, Express
- **Podatkovna baza:** PostgreSQL
- **Avtentikacija in upravljanje uporabnikov:** Keycloak
- **Komunikacija:** REST API
- **Razvojno okolje:** Docker, Docker Compose

## Dokumentacija

Projektna dokumentacija je na voljo v mapi [docs/](docs/).

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
git clone https://github.com/nejakasman/EventFlow.git
cd EventFlow
```

### 3. Nastavitev okolja

Projekt uporablja dve datoteki z okoljskimi spremenljivkami.

V korenski mapi projekta se nahaja `.env.example`, iz katere ustvarimo `.env`:

```bash
cp .env.example .env
```

V datoteki nastavimo gesla za PostgreSQL podatkovni bazi in administratorski račun Keycloaka.

V mapi `backend` se nahaja še druga datoteka `.env.example`, iz katere ustvarimo backendovo `.env`:

```bash
cd backend
cp .env.example .env
```

V njej so nastavitve za povezavo backenda s Keycloakom. Vrednost `KEYCLOAK_BACKEND_CLIENT_SECRET` dopolnimo s Client Secretom, ki ga pridobimo pri nastavitvi backend clienta v Keycloaku.

Datoteki `.env` vsebujeta občutljive podatke in se ne shranjujeta v Git repozitorij.

### 4. Zagon Docker storitev

Vrnemo se v korensko mapo projekta:

```bash
cd ..
```

Zaženemo Docker Desktop in nato v korenski mapi projekta izvedemo:

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

[http://localhost:8081](http://localhost:8081)

Za prijavo uporabimo administratorsko uporabniško ime in geslo iz korenske datoteke `.env` (`KEYCLOAK_ADMIN` in `KEYCLOAK_ADMIN_PASSWORD`).

#### Ustvarjanje realma

V Keycloakovi administracijski konzoli ustvarimo nov realm z imenom `EventFlow`.

#### Ustvarjanje uporabniških vlog

V razdelku **Realm roles** ustvarimo naslednje vloge:

- `PARTICIPANT` – registriran uporabnik, ki se lahko prijavlja na dogodke.
- `ORGANIZER` – organizator, ki lahko ustvarja in upravlja dogodke.
- `ADMIN` – administrator aplikacije.

Vlogo `PARTICIPANT` dodamo med privzete vloge (`default-roles-eventflow`), da jo prejmejo novi registrirani uporabniki.

#### Omogočanje registracije

V razdelku **Realm settings → Login** omogočimo:

- User registration
- Email as username
- Forgot password

#### Nastavitev prijavne teme

Projekt vsebuje lastno Keycloak temo `eventflow`, ki je shranjena v mapi:

`keycloak/themes/eventflow/`

Mapa s temami je priklopljena v Keycloakov Docker vsebnik.

V Keycloaku odpremo **Realm settings → Themes** in pri možnosti **Login theme** izberemo `eventflow`. Spremembe shranimo.

#### Ustvarjanje frontend clienta

V razdelku **Clients** ustvarimo nov client z naslednjimi nastavitvami:

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

Ta client uporablja frontend aplikacija za prijavo in registracijo uporabnikov.

#### Ustvarjanje backend clienta

V razdelku **Clients** ustvarimo še drugi client:

- Client type: `OpenID Connect`
- Client ID: `eventflow-backend`
- Client authentication: On
- Service accounts roles: On
- Standard flow: Off
- Direct access grants: Off

V zavihku **Credentials** pridobimo Client Secret in ga vpišemo v `backend/.env` kot vrednost `KEYCLOAK_BACKEND_CLIENT_SECRET`.

Backend client uporablja aplikacija za strežniško upravljanje uporabnikov v Keycloaku. Njegovemu service accountu dodelimo potrebne pravice za upravljanje uporabnikov v razdelku **Service account roles**.

### 6. Zagon backenda

V terminalu se premaknemo v mapo `backend`:

```bash
cd backend
```

Namestimo potrebne pakete:

```bash
npm install
```

Zaženemo backend:

```bash
npm run dev
```

Backend je dostopen na naslovu:

[http://localhost:3000](http://localhost:3000)

### 7. Zagon frontenda

V novem terminalu se premaknemo v mapo `frontend`:

```bash
cd frontend
```

Namestimo potrebne pakete:

```bash
npm install
```

Zaženemo frontend:

```bash
npm run dev
```

React aplikacija je dostopna na naslovu:

[http://localhost:5173](http://localhost:5173)

### 8. Ustavitev Docker storitev

Za ustavitev Docker storitev v korenski mapi projekta uporabimo:

```bash
docker compose down
```

Podatki v Docker volumnih se pri tem ohranijo.