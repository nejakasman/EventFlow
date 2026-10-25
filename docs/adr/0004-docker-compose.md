# Izbira Dockerja in Docker Compose za lokalni razvoj

## Kontekst in opis problema

EventFlow bo sestavljen iz več delov: frontenda, backenda in podatkovne baze PostgreSQL. Za lokalni razvoj morajo biti ti deli pravilno konfigurirani in med seboj povezani. Potrebujemo rešitev, ki olajša zagon aplikacije in zagotavlja čim bolj enotno razvojno okolje.

## Obravnavane možnosti

- Docker in Docker Compose.
- Ročna namestitev in zagon vseh komponent na lokalnem računalniku.


## Odločitev in utemeljitev

Izbrana možnost: **Docker in Docker Compose**, ker omogočata zagon posameznih delov aplikacije v ločenih vsebnikih in njihovo povezovanje z eno konfiguracijsko datoteko. Tako bo mogoče frontend, backend in podatkovno bazo zagnati na podoben način na različnih računalnikih.

### Posledice

- Pozitivno, ker je mogoče več komponent zagnati z enim ukazom.
- Pozitivno, ker so odvisnosti posameznih komponent ločene od lokalnega operacijskega sistema.
- Pozitivno, ker je razvojno okolje lažje ponoviti na drugem računalniku.
- Negativno, ker je treba pripraviti datoteko Docker Compose in konfiguracijo posameznih vsebnikov.
