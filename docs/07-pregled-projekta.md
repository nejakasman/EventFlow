# Pregled projekta EventFlow

## Arhitektura in lokalni zagon

React/Vite uporablja REST API v Node.js in Expressu. PostgreSQL hrani dogodke, kategorije, profile in prijave. Keycloak skrbi za prijavo in vloge, Express pa preverja žetone JWT in pravice za posamezne operacije. [ADR 0005](adr/0005-nodejs-express.md) je nadomestil prvotno odločitev za Spring Boot, ki je še navedena v [opisu arhitekture](04-arhitektura-in-tehnoloski-sklad.md). Po [navodilih za zagon](../README.md) Docker Compose poganja Keycloak in obe bazi PostgreSQL, frontend in backend pa tečeta lokalno prek npm.

Frontend se odziva na vratih `5173`, API na vratih `3000`, Keycloak pa na vratih `8081`. Povezavo API-ja s PostgreSQL ter uspešno izvedena `npm run lint` in `npm run build` za frontend. Za preizkus zaščitenih poti API-ja uporabili začasno shemo PostgreSQL in podpisane testne žetone.

## Implementirane funkcionalnosti MVP

- **Računi in vloge.** V kodi je integrirana samoregistracija udeležencev in prijava prek Keycloaka. Aplikacija ima tudi obrazec za registracijo organizacije, ki za ustvarjanje računa uporablja upravljalni API Keycloaka.
- **Dogodki.** Organizator lahko ustvari osnutek, objavi svoj dogodek in pregleda svoje dogodke. Javni seznam prikazuje objavljene dogodke ter omogoča iskanje po naslovu in filtriranje po datumu in kategoriji.
- **Prijave udeležencev.** Udeleženec se lahko prijavi, pregleduje svoje prijave in statuse ter po potrditvi odpove aktivno prijavo. Pri polnem dogodku sistem upošteva nastavitev čakalne liste. Odpoved potrjene prijave sprosti mesto, prvi čakajoči pa ob tem obdrži svoj status.
- **Pregled za organizatorja.** Organizator pri svojih dogodkih vidi imena in statuse prijavljenih ter število potrjenih, čakajočih in odpovedanih prijav. Največje število udeležencev je prikazano v seznamu »Moji dogodki«.

Obseg izhaja iz [načrta MVP](02-funkcionalnosti-in-obseg.md). Ugotovitve temeljijo na pregledu [vmesnika](../frontend/src/App.jsx), [API-ja](../backend/server.js), [integracije Keycloak](../backend/keycloakAdmin.js) in [sheme PostgreSQL](../backend/database/schema.sql).

## Pokritost petih uporabniških zgodb

Za podrobno oceno sem izbral prvih pet od dvanajstih [uporabniških zgodb](05-uporabniske-zgodbe.md).

| Zgodba | Ocena | Ugotovitev |
| --- | --- | --- |
| **US-01 – Registracija in prijava** | Implementirano, delovanje v celoti | Udeleženec se registrira prek Keycloaka z imenom, priimkom, e-pošto in geslom. Keycloak je sprejel zahtevo odjemalca za prijavo. Ustvarjanja računa, zavrnitve podvojene e-pošte in prijave z geslom v brskalniku nisem potrdil. Dodatni tok za registracijo organizacije je odvisen od servisnega računa, katerega dostop do upravljalnega API-ja je lokalni Keycloak zavrnil. |
| **US-02 – Ustvarjanje in objava dogodkov** | Delno izpolnjena | API je zavrnil manjkajoči naslov, datum v preteklosti, neustrezen rok in kapaciteto nič. Osnutek je postal javno viden po objavi, ki jo lahko izvede samo lastnik. Datumi se preverijo ob ustvarjanju osnutka. Objavi se lahko tudi osnutek, katerega datum začetka je medtem že minil. |
| **US-03 – Pregled in filtriranje dogodkov** | Izpolnjena | Javni API vrne samo objavljene dogodke z naslovom, datumom, lokacijo in kategorijo. Preizkus je potrdil iskanje po naslovu, oba filtra in prazen seznam brez zadetkov. Vmesnik za prazen seznam prikaže sporočilo. |
| **US-04 – Prijava na dogodek** | Izpolnjena | API je zavrnil prijavo na osnutek, po poteku roka in pri že aktivni prijavi. Ob prostem mestu je prijavo potrdil, pri polnem dogodku pa je upošteval, ali je čakalna lista omogočena. Vmesnik izpiše rezultat prijave in prikaže status v »Mojih prijavah«. |
| **US-05 – Odpoved prijave** | Izpolnjena | Vmesnik pred odpovedjo zahteva potrditev. API je lastno aktivno prijavo označil kot odpovedano, zavrnil ponovno odpoved in omogočil naslednjo prijavo na sproščeno mesto. Po odpovedi se osvežijo »Moje prijave«. Če se je uporabnik prijavil v isti seji, lahko javna kartica do osvežitve strani še kaže prejšnji status. |
