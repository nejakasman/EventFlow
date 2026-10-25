# Funkcionalnosti in obseg rešitve – EventFlow

## 1. Uporabniške vloge

### Neregistrirani uporabnik
- Pregleduje objavljene dogodke in njihove podrobnosti.
- Filtrira dogodke glede na ime, datum ali kategorijo.
- Za prijavo na dogodek se mora registrirati oziroma prijaviti v aplikacijo.

### Registriran uporabnik
- Ustvari uporabniški račun in se prijavi v aplikacijo.
- Pregleduje in filtrira objavljene dogodke.
- Se prijavi na dogodek in spremlja status svoje prijave.
- Odpove svojo prijavo.
- Ne more ustvarjati ali urejati dogodkov in ne more upravljati drugih uporabnikov.

### Organizator
- Ustvarja, ureja, objavlja in prekliče svoje dogodke.
- Določa največje število udeležencev in rok za prijavo.
- Spremlja prijave, čakalno listo in seznam udeležencev.
- Ne more upravljati uporabniških računov drugih uporabnikov ali spreminjati dogodkov drugih organizatorjev.

### Administrator
- Pregleduje in upravlja uporabniške račune.
- Pregleduje vse dogodke v sistemu in lahko odstrani neprimerne ali neželene dogodke.
- Nadzira delovanje aplikacije.
- Ne spreminja prijav udeležencev brez ustreznega razloga za upravljanje sistema.

## 2. Predvidene funkcionalnosti

1. **MVP – Registracija in prijava uporabnikov:** uporabniki ustvarijo račun in se prijavijo v aplikacijo.
2. **MVP – Ustvarjanje in objava dogodkov:** organizator vnese ime, opis, lokacijo, datum, uro, rok za prijavo in največje število udeležencev.
3. **MVP – Pregled in filtriranje dogodkov:** uporabniki iščejo dogodke glede na ime, datum ali kategorijo.
4. **MVP – Prijava na dogodek:** sistem preveri rok za prijavo in razpoložljivost mest ter določi status prijave.
5. **MVP – Odpoved prijave:** uporabnik lahko odpove svojo prijavo, sistem pa sprosti zasedeno mesto.
6. **MVP – Spremljanje prijav:** organizator vidi seznam prijavljenih udeležencev, njihove statuse in število zasedenih mest.
7. **MVP – Pregled prijav:** uporabnik ima pregled nad lastnimi prijavami in njihovimi statusi.
8. Upravljanje čakalne liste, ki omogoča uvrščanje uporabnikov na čakalno listo in napredovanje ob sprostitvi mesta.
9. Urejanje in preklic dogodkov, ki jih je ustvaril organizator.
10. Samodejno pošiljanje e-poštnih obvestil ob potrditvi prijave, spremembi statusa ali odpovedi dogodka.
11. Izvoz seznama udeležencev v datoteko CSV.
12. Pregled statistike dogodkov, števila prijav in odpovedi.


## 3. Kasnejše nadgradnje

- Pošiljanje samodejnih opomnikov pred začetkom dogodka.
- Dodajanje koledarja z možnostjo izvoza dogodkov v zunanji koledar.
- Dodajanje ocen in povratnih informacij po dogodku.
- Ustvarjanje QR-kod za preverjanje prisotnosti udeležencev.
- Priprava naprednejše statistike in poročil o uspešnosti dogodkov.

## 4. Out of scope

- Spletna plačila.
- Mobilne aplikacije za Android ali iOS.
- Prenos dogodkov v živo.
- Priporočanja dogodkov na podlagi umetne inteligence.