# Izbira Jave in Spring Boota za backend

## Kontekst in opis problema

Backend aplikacije EventFlow bo obdeloval zahteve uporabnikov, upravljal dogodke in prijave ter preverjal pravice dostopa. Pri prijavi na dogodek bo moral preveriti rok prijave in razpoložljivost mest. Zato potrebujemo tehnologijo, ki omogoča organiziran razvoj poslovne logike in povezavo s podatkovno bazo.

## Obravnavane možnosti

- Java s Spring Bootom.
- JavaScript z Node.js in Expressom.

## Odločitev in utemeljitev

Izbrana možnost: **Java s Spring Bootom**, ker omogoča strukturiran razvoj zalednega dela aplikacije, podporo za izdelavo REST API-ja ter povezovanje s PostgreSQL. 

### Posledice

- Pozitivno, ker omogoča jasno razdelitev kode na posamezne dele, kot so kontrolerji, storitve in dostop do podatkov.
- Pozitivno, ker olajša povezovanje z varnostnimi mehanizmi in podatkovno bazo.
- Negativno, ker je za začetno nastavitev potrebnega nekaj več znanja o Javi in ogrodju Spring Boot.
- Negativno, ker je treba pravilno konfigurirati odvisnosti in strukturo projekta.