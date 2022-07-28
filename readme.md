# Jest to backendowa część projektu "Systemu rezerwacyjnego kortu".
Dla kompletności należy pobrać jeszcze część frontendową.<br >
https://github.com/dao0dao/CourtReservationSystem-Frontend

## Wymagania
1. NodeJS v16.13.1
2. TypeScript v4.2.3
3. NPM 8.1.2
4. Lokalna baza SQL
5. Dla serwera HTTPS wymagany jest certyfikat.

## Ustawienie repozytoriów
1. Frontowe i backendowe repozytoria muszą znajdować się tym samym katalogu.

### Uruchomienie
1. Pobranie i wykonanie komendy `npm ci` w terminalu `<project name>/backend`
2. W pliku `<project name>/backend/app/variables.ts` ustawiamy dane do połączenia z SQL.
3. W terminalu `<project name>/backend/app` wpisujemy `tsc`, to stworzy nam folder wykonalny.
4. Dla uruchomienia serwera na protokole `http` w terminalu `<project name>/backend/server` wpisujemy `npm run dev`
5. Dla uruchomienia serwera na protokole `https` wymagane jest posiadanie certyfikatów. Jeśli takowe posiadamy to dodajemy je do folderu `<project name>/backend` i później należy w terminalu `<project name>/backend/server` wpisać `npm run local`
6. W encji `coaches` dodajemy wpis `name: Admin`, `login: admin`, `isAdmin: 1`, `password: $2b$13$hgbbVWYfAdEl/mrEhRKHE..JqMfX7jj9O3iSXEKuB1OKojXcr4MFK`, pozwoli to zalogować na konto `admin` z hasłem `admin`.

---------------

# It is a backend part of project: 'Tennis court reservation system'
For the whole system you should download frontend part <br >
https://github.com/dao0dao/CourtReservationSystem-Frontend

## Requirements
1. NodeJS v16.13.1
2. TypeScript v4.2.3
3. NPM 8.1.2
4. Local base SQL
5. For running HTTPS server you need certificates

## Repositories configurations
1. Frontend and backend repositories must be in the same folder.

### Running serve
1. Download and run `npm ci` in `<project name>/backend` terminal
2. In file `<project name>/backend/app/variables.ts` add configuration connection to your local SQL
3. In `<project name>/backend/app` terminal type `tsc`, this will create server folder
4. For running `http` server in `<project name>/backend/server` type `npm run dev`
5. For running `https` server you need to have certificates, which you should add to `<project name>/backend` destination. Then in `<project name>/backend/server` type `npm run local`
6. In entity `coaches` add `name: Admin`, `login: admin`, `isAdmin: 1`, `password: $2b$13$hgbbVWYfAdEl/mrEhRKHE..JqMfX7jj9O3iSXEKuB1OKojXcr4MFK`, this allow to login as `admin` with password `admin`
