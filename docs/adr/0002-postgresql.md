# Izbira PostgreSQL za podatkovno bazo

## Kontekst in opis problema

EventFlow bo shranjeval uporabnike, dogodke, kategorije in prijave. Med temi podatki obstajajo povezave,zato potrebujemo podatkovno bazo, ki omogoča ohranjanje teh povezav in preverjanje pravilnosti podatkov.

## Obravnavane možnosti

- PostgreSQL.
- MySQL.
- MongoDB.

## Odločitev in utemeljitev

Izbrana možnost: **PostgreSQL**, ker je relacijska podatkovna baza, ki omogoča povezovanje podatkov s tujimi ključi in zagotavlja njihovo celovitost. Primerna je za podatke aplikacije EventFlow, pri kateri so uporabniki, dogodki in prijave med seboj povezani.

### Posledice

- Pozitivno, ker lahko s primarnimi in tujimi ključi ohranjamo pravilne povezave med podatki.
- Pozitivno, ker podpira transakcije, ki pomagajo zagotoviti pravilno shranjevanje podatkov.
- Pozitivno, ker omogoča uporabo SQL za poizvedbe in pripravo statistike.
- Negativno, ker je treba pripraviti podatkovni model in ustrezne relacije.
- Negativno, ker je treba skrbeti za konfiguracijo, varnostne kopije in vzdrževanje podatkovne baze.