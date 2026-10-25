# Izbira Keycloaka za avtentikacijo uporabnikov

## Kontekst in opis problema

EventFlow bo omogočal registracijo in prijavo uporabnikov z različnimi vlogami, kot so udeleženec, organizator in administrator. Aplikacija mora preverjati identiteto uporabnikov in omejevati dostop do funkcionalnosti glede na njihove pravice. Ker bi lastna implementacija celotnega sistema za prijavo zahtevala dodatno delo, potrebujemo rešitev, ki že ponuja osnovne funkcionalnosti za upravljanje uporabnikov.

## Obravnavane možnosti

- Keycloak za upravljanje uporabnikov in avtentikacijo.
- Lastna implementacija avtentikacije z uporabo Spring Security in JWT.
- Avtentikacija s pomočjo sej in Spring Security.

## Odločitev in utemeljitev

Izbrana možnost: **Keycloak**, ker ponuja že pripravljene funkcionalnosti za prijavo, upravljanje uporabnikov in uporabniških vlog. Omogoča povezavo s Spring Bootom prek standarda OpenID Connect, zato ni treba samostojno implementirati vseh mehanizmov za preverjanje identitete uporabnikov. 

### Posledice

- Pozitivno, ker so prijava, upravljanje uporabnikov in osnovne funkcionalnosti avtentikacije že pripravljeni.
- Pozitivno, ker lahko vloge uporabnikov upravljamo v Keycloaku.
- Pozitivno, ker je mogoče rešitev vključiti v obstoječe razvojno okolje z Docker Compose.
- Negativno, ker je treba Keycloak dodatno konfigurirati in povezati s Spring Bootom.
- Negativno, ker predstavlja dodatno komponento, ki jo je treba zagnati in vzdrževati.
- Negativno, ker je treba pravilno povezati uporabniške vloge v Keycloaku s pravicami v aplikaciji EventFlow.