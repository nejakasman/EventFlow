# Podatkovni model – EventFlow

## 1. Uporabnik (User)

- `id` – primarni ključ
- `ime` – ime uporabnika
- `priimek` – priimek uporabnika
- `email` – enolični e-poštni naslov
- `vloga` – udeleženec ali administrator
- `created_at` – datum ustvaritve računa

## 2. Organizacija (Organization)

- `id` – primarni ključ
- `naziv` – ime organizacije
- `kontaktni_email` – kontaktni e-poštni naslov organizacije
- `opis` – kratek opis organizacije
- `created_at` – datum ustvaritve računa organizacije

## 3. Dogodek (Event)

- `id` – primarni ključ
- `naslov` – naslov dogodka
- `opis` – opis dogodka
- `lokacija` – lokacija dogodka
- `datum_zacetka` – datum in ura začetka
- `datum_konca` – datum in ura konca
- `rok_prijave` – rok za prijavo
- `max_udelezencev` – največje število udeležencev
- `status` – osnutek, objavljen ali preklican
- `organizacija_id` – tuji ključ na organizacijo, ki organizira dogodek
- `kategorija_id` – tuji ključ na kategorijo

## 4. Prijava (Registration)

- `id` – primarni ključ
- `uporabnik_id` – tuji ključ na uporabnika
- `dogodek_id` – tuji ključ na dogodek
- `datum_prijave` – datum in ura prijave
- `status` – potrjena, čakalna lista ali odpovedana
- `mesto_na_cakalni_listi` – zaporedno mesto na čakalni listi

## 5. Kategorija (Category)

- `id` – primarni ključ
- `naziv` – ime kategorije
- `opis` – opis kategorije

## 6. Povezave med entitetami

- En uporabnik ima lahko več prijav.
- Ena organizacija lahko organizira več dogodkov.
- En dogodek ima lahko več prijav.
- Ena kategorija lahko vsebuje več dogodkov.
- Vsaka prijava pripada enemu uporabniku in enemu dogodku.
- Vsak dogodek pripada eni organizaciji in eni kategoriji.

## 7. Osnutek podatkovnega modela

1. **Uporabnik** (`id`, `ime`, `priimek`, `email`, `vloga`, `created_at`)
2. **Organizacija** (`id`, `naziv`, `kontaktni_email`, `opis`, `created_at`)
3. **Dogodek** (`id`, `naslov`, `opis`, `lokacija`, `datum_zacetka`, `datum_konca`, `rok_prijave`, `max_udelezencev`, `status`, `organizacija_id`, `kategorija_id`)
4. **Prijava** (`id`, `uporabnik_id`, `dogodek_id`, `datum_prijave`, `status`, `mesto_na_cakalni_listi`)
5. **Kategorija** (`id`, `naziv`, `opis`)