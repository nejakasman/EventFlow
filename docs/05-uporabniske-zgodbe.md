# Uporabniške zgodbe – EventFlow

### US-01: Registracija in prijava uporabnikov

- **Povezana funkcionalnost:** Registracija in prijava uporabnikov
- **Uporabniška vloga:** Neregistriran uporabnik in registrirani uporabnik

**Uporabniška zgodba:**

Kot neregistriran uporabnik želim ustvariti račun, kot registriran uporabnik pa se želim prijaviti v aplikacijo, da lahko dostopam do funkcionalnosti, ki zahtevajo prijavo.

**Acceptance criteria:**

1. Pri registraciji mora uporabnik vnesti ime, priimek, e-poštni naslov in geslo.
2. Sistem preveri, ali je e-poštni naslov že uporabljen, in prepreči registracijo z že obstoječim naslovom.
3. Ob uspešni registraciji sistem ustvari uporabniški račun.
4. Uporabnik se lahko prijavi z veljavnim e-poštnim naslovom in geslom.

### US-02: Ustvarjanje in objava dogodkov

- **Povezana funkcionalnost:** Ustvarjanje in objava dogodkov
- **Uporabniška vloga:** Organizator

**Uporabniška zgodba:**

Kot organizator želim ustvariti in objaviti dogodek z vsemi potrebnimi podatki, da ga lahko uporabniki pregledajo in se nanj prijavijo.

**Acceptance criteria:**

1. Organizator lahko vnese naslov, opis, lokacijo, datum in uro dogodka, rok za prijavo ter največje število udeležencev.
2. Organizator mora izpolniti vsa obvezna polja, preden lahko objavi dogodek.
3. Sistem preveri, ali je datum dogodka v prihodnosti, ali je rok za prijavo pred začetkom dogodka in ali je največje število udeležencev večje od nič.
4. Ob uspešni objavi sistem dogodek shrani s statusom »objavljen«.
5. Objavljen dogodek postane viden na seznamu dogodkov.

### US-03: Pregled in filtriranje dogodkov

- **Povezana funkcionalnost:** Pregled in filtriranje dogodkov
- **Uporabniška vloga:** Neregistriran uporabnik in registrirani uporabnik

**Uporabniška zgodba:**

Kot uporabnik želim pregledovati in filtrirati objavljene dogodke po imenu, datumu ali kategoriji, da lahko hitro najdem dogodke, ki me zanimajo.

**Acceptance criteria:**

1. Sistem prikaže seznam objavljenih dogodkov z njihovim naslovom, datumom, lokacijo in kategorijo.
2. Uporabnik lahko išče dogodke po naslovu.
3. Uporabnik lahko filtrira dogodke po datumu in kategoriji.
4. Če ni ustreznih rezultatov, sistem prikaže ustrezno sporočilo.

### US-04: Prijava na dogodek

- **Povezana funkcionalnost:** Prijava na dogodek
- **Uporabniška vloga:** Registrirani uporabnik

**Uporabniška zgodba:**

Kot registrirani uporabnik se želim prijaviti na izbrani dogodek, da si zagotovim mesto na dogodku, ki se ga želim udeležiti.

**Acceptance criteria:**

1. Uporabnik se lahko prijavi samo na objavljen dogodek, pri katerem rok za prijavo še ni potekel.
2. Če so na voljo prosta mesta, sistem ustvari prijavo s statusom »potrjena«.
3. Če so vsa mesta zasedena, sistem uporabnika uvrsti na čakalno listo, če je ta omogočena.
4. Sistem prepreči več aktivnih prijav istega uporabnika na isti dogodek.
5. Po prijavi sistem uporabniku prikaže status njegove prijave.

### US-05: Odpoved prijave

- **Povezana funkcionalnost:** Odpoved prijave
- **Uporabniška vloga:** Registrirani uporabnik

**Uporabniška zgodba:**

Kot registrirani uporabnik želim odpovedati svojo prijavo na dogodek, da sprostim mesto, če se dogodka ne morem udeležiti.

**Acceptance criteria:**

1. Uporabnik lahko odpove svojo prijavo, ki še ni bila odpovedana.
2. Pred odpovedjo sistem uporabnika pozove k potrditvi dejanja.
3. Po potrditvi sistem spremeni status prijave v »odpovedana«.
4. Če je bila prijava potrjena, sistem sprosti zasedeno mesto.

### US-06: Spremljanje prijav

- **Povezana funkcionalnost:** Spremljanje prijav
- **Uporabniška vloga:** Organizator

**Uporabniška zgodba:**

Kot organizator želim pregledovati prijave na svoje dogodke, da lahko spremljam število prijavljenih udeležencev in zasedenost dogodka.

**Acceptance criteria:**

1. Organizator lahko odpre seznam prijav za posamezen dogodek, ki ga je ustvaril sam.
2. Pri posamezni prijavi so prikazani ime in priimek udeleženca ter status prijave.
3. Sistem prikaže število potrjenih prijav in največje število udeležencev.
4. Sistem prikaže tudi število uporabnikov na čakalni listi.

### US-07: Upravljanje čakalne liste

- **Povezana funkcionalnost:** Upravljanje čakalne liste
- **Uporabniška vloga:** Registrirani uporabnik

**Uporabniška zgodba:**

Kot registrirani uporabnik želim biti uvrščen na čakalno listo, ko je dogodek poln, da lahko dobim mesto, če kdo odpove prijavo.

**Acceptance criteria:**

1. Ko je dogodek poln, sistem novega prijavljenega uporabnika uvrsti na konec čakalne liste.
2. Sistem uporabnikom na čakalni listi določi vrstni red glede na čas prijave.
3. Ko se sprosti mesto, sistem ponudi mesto prvemu uporabniku na čakalni listi.
4. Ko je mesto dodeljeno, sistem ustrezno posodobi status prijave in vrstni red čakalne liste.

### US-08: Urejanje in preklic dogodkov

- **Povezana funkcionalnost:** Urejanje in preklic dogodkov
- **Uporabniška vloga:** Organizator

**Uporabniška zgodba:**

Kot organizator želim urejati podatke o svojih dogodkih ali jih preklicati, da lahko poskrbim za pravilne informacije in preprečim prijave na dogodke, ki se ne bodo izvedli.

**Acceptance criteria:**

1. Organizator lahko ureja samo dogodke, ki jih je ustvaril sam.
2. Sistem pred shranjevanjem sprememb preveri veljavnost vnesenih podatkov.
3. Pred preklicem dogodka sistem zahteva potrditev dejanja.
4. Po preklicu dogodek dobi status »preklican« in ni več na voljo za nove prijave.
5. Pošlje se sporočilo prijavljenim uporabnikom, da je bil dogodek posodobljen ali preklican.

### US-09: Pregled lastnih prijav

- **Povezana funkcionalnost:** Pregled lastnih prijav in njihovih statusov
- **Uporabniška vloga:** Registrirani uporabnik

**Uporabniška zgodba:**

Kot registrirani uporabnik želim pregledovati svoje prijave in njihove statuse, da lahko spremljam, na katere dogodke sem prijavljen.

**Acceptance criteria:**

1. Uporabnik lahko odpre seznam vseh svojih prijav.
2. Pri vsaki prijavi so prikazani naslov dogodka, datum in status prijave.
3. Sistem prikaže, ali je prijava potrjena, na čakalni listi ali odpovedana.
4. Uporabnik lahko odpre podrobnosti dogodka iz seznama svojih prijav.

### US-10: E-poštna obvestila

- **Povezana funkcionalnost:** Samodejno pošiljanje e-poštnih obvestil
- **Uporabniška vloga:** Registrirani uporabnik

**Uporabniška zgodba:**

Kot registrirani uporabnik želim prejemati e-poštna obvestila o pomembnih spremembah svojih prijav, da sem pravočasno obveščen o svoji udeležbi.

**Acceptance criteria:**

1. Sistem pošlje e-poštno obvestilo ob potrditvi prijave.
2. Sistem pošlje obvestilo, ko se status prijave spremeni, na primer ob premiku s čakalne liste med potrjene prijave.
3. Sistem pošlje obvestilo o preklicu dogodka vsem uporabnikom s prijavo na ta dogodek.

### US-11: Izvoz seznama udeležencev v CSV

- **Povezana funkcionalnost:** Izvoz seznama udeležencev
- **Uporabniška vloga:** Organizator

**Uporabniška zgodba:**

Kot organizator želim izvoziti seznam udeležencev svojega dogodka v datoteko CSV, da lahko podatke uporabim za lažje načrtovanje in izvedbo dogodka.

**Acceptance criteria:**

1. Organizator lahko izbere dogodek in zahteva izvoz seznama udeležencev.
2. Sistem pripravi datoteko CSV s podatki o udeležencih in njihovih statusih prijave.
3. Datoteka vsebuje glavo stolpcev in ločene podatke za posamezne udeležence.
5. Organizator lahko izvozi samo podatke o prijavah na svoje dogodke.

### US-12: Pregled statistike dogodkov

- **Povezana funkcionalnost:** Statistika dogodkov, število prijav in odpovedi
- **Uporabniška vloga:** Organizator

**Uporabniška zgodba:**

Kot organizator želim pregledovati statistiko svojih dogodkov, da lahko spremljam zanimanje udeležencev in uspešnost organizacije.

**Acceptance criteria:**

1. Sistem prikaže skupno število prijav za izbrani dogodek.
2. Sistem prikaže število potrjenih prijav in odpovedi.
3. Organizator lahko pregleda statistiko samo za dogodke, ki jih je ustvaril sam.
4. Statistični podatki se posodobijo ob spremembah prijav.

