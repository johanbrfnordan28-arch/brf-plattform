# Lokal server på port 3010

Sidan du använder lokalt är **http://127.0.0.1:3010**.

Produktionen **https://demo.styrelse-navet.se** påverkas inte av det här. Felet sitter i utvecklingsdatorn, inte i föreningsdatan.

## Vad som är fel

Next.js startar en filbevakare som håller koll på varje fil i projektet. När flera sådana servrar körs samtidigt mot samma mapp tar macOS slut på bevakare. Då händer det här:

- Port 3010 ser upptagen ut.
- Sidan laddar aldrig, eller webbläsaren visar `ERR_NETWORK_IO_SUSPENDED` (kod -331).
- I terminalen står `EMFILE: too many open files, watch` eller `EADDRINUSE`.

Det har hänt för att nya servrar startats på 3010, 3021, 3022 och 3023 utan att de gamla stängts. En av dem hade stått igång i över elva dygn.

## Återställ

I projektmappen, i terminalen:

```bash
npm run dev:aterstall
```

Kommandot stoppar bara Next-servrar för det här projektet och startar en ny på port 3010.

Öppna sedan **http://127.0.0.1:3010**.

## Så här ser du att det är friskt

1. Ett terminalfönster visar `Ready` och `Local: http://127.0.0.1:3010`.
2. Sidan svarar inom några sekunder (första laddningen efter omstart kan ta 10–20 sekunder).
3. Det finns inte flera rader med `next-server` för samma projekt.

Kontroll:

```bash
lsof -nP -iTCP:3010 -sTCP:LISTEN
```

Där ska det stå en enda `node`-rad.

## Gör inte så här

- Starta inte `npm run dev` i ett nytt fönster om ett redan kör.
- Starta inte extra servrar på 3021, 3022 eller 3055 «för säkerhets skull».
- Stäng terminalen som kör servern när du är klar för dagen, eller låt den enda vara igång.

## Om det hänger igen

1. Kör `npm run dev:aterstall` en gång till.
2. Ladda om fliken. Använd inte en gammal flik som redan visat nätverksfelet.
3. Om porten fortfarande är upptagen efter kommandot: stäng Cursor-terminaler som visar `next dev`, och kör kommandot igen.
