# Izbira Node.js in Expressa za backend

## Kontekst in opis problema

Backend aplikacije EventFlow obdeluje zahteve uporabnikov, upravlja dogodke in prijave ter preverja pravice dostopa. Pri prijavi na dogodek mora preveriti rok prijave in razpoložljivost prostih mest. Potrebujemo tehnologijo, ki omogoča izdelavo REST API-ja, povezovanje s podatkovno bazo in izvajanje poslovne logike.

V začetni zasnovi je bila predvidena uporaba Jave in Spring Boota. Med razvojem sem ponovno ocenila izbiro tehnologije in se odločila za enostavnejšo rešitev, ki je primerna za obseg projekta.

## Obravnavane možnosti

- Java s Spring Bootom.
- JavaScript z Node.js in Expressom.

## Odločitev in utemeljitev

Izbrana možnost: **JavaScript z Node.js in Expressom**.

Za Node.js in Express sem se odločila, ker omogočata preprostejši razvoj zalednega dela aplikacije in izdelavo REST API-ja. Ker je tudi frontend izdelan v JavaScriptu z Reactom, lahko uporabljamo isti programski jezik na obeh delih aplikacije. Express omogoča jasno organizacijo API-poti in povezovanje s PostgreSQL podatkovno bazo.

### Posledice

- Pozitivno, ker na frontendu in backendu uporabljam JavaScript, zato ni treba uporabljati dveh različnih programskih jezikov.
- Pozitivno, ker Express omogoča preprosto izdelavo in upravljanje REST API-ja.
- Pozitivno, ker je povezovanje s PostgreSQL podatkovno bazo podprto z ustreznimi knjižnicami.
- Negativno, ker je nekatere funkcionalnosti treba implementirati in organizirati ročno, saj Express ne ponuja toliko vgrajenih rešitev kot Spring Boot.
- Negativno, ker je pri večjem projektu treba posebno pozornost nameniti organizaciji kode in vzdrževanju aplikacije.