# BIM 4 Portfolio - Kostencalculator

Een moderne, interactieve web applicatie waarmee projectmanagers van de luchthaven snel een indicatieve kostenschatting kunnen maken voor BIM 4 Portfolio projecten.

## Functies

- **Real-time berekening**: Automatische kostenberekening op basis van projectparameters
- **Dynamisch advies**: Intelligente tips en waarschuwingen op basis van gekozen parameters
- **Verschillende servicetypen**: Scan-to-BIM, Scan only, Model only
- **Ruimtetypologieën**: Ondersteuning voor alle typen ruimtes (technisch, plafonds, dak/buiten, etc.)
- **Dag/nacht scanning**: Automatische prijsaanpassing voor nachtwerk
- **Responsive design**: Werkt op desktop, tablet en mobiel
- **Moderne UI**: Donker thema geïnspireerd op startupcalculator.co

## Gebruik

1. Open `index.html` in een moderne webbrowser
2. Vul de projectparameters in:
   - Oppervlakte in m²
   - Servicetype (Scan-to-BIM, Scan only, Model only)
   - Ruimtetypologie
   - Scanning tijd (alleen voor Scan-to-BIM en Scan only)
3. De berekening wordt automatisch bijgewerkt
4. Bekijk het dynamische advies voor extra informatie

## Project Structuur

```
costcalculatorB4P/
├── index.html              # Hoofdpagina
├── css/
│   └── styles.css          # Styling
├── js/
│   ├── config.js           # Configuratie loader
│   └── calculator.js       # Calculator logic en advies systeem
├── config/
│   └── pricing.json        # Tarieven en parameters
└── README.md               # Deze file
```

## Configuratie

Alle tarieven worden beheerd in `config/pricing.json`. Dit bestand kan eenvoudig worden aangepast om prijzen te wijzigen of nieuwe ruimtetypes toe te voegen.

### Prijsstructuur

- **Scan-to-BIM**: Gewogen gemiddelde uitvoeringskosten per m²
- **Scan only**: Prijzen voor overdag en nachtwerk
- **Model only**: Modellering prijzen per ruimtetype

## Technische Details

- **Pure JavaScript**: Geen externe dependencies
- **JSON configuratie**: Makkelijk aanpasbare tarieven
- **Moderne CSS**: CSS Variables, Grid, Flexbox
- **Responsive**: Mobile-first approach

## Toekomstige Uitbreidingen

- PowerBI integratie voor data analyse
- Export functionaliteit (PDF, CSV)
- Meerdere ruimtetypes per project
- Historische data opslag
- Grafieken en visualisaties

## Opmerkingen

- Alle prijzen zijn uitvoeringskosten (geen winst/overhead)
- De calculator geeft een indicatie; detailquotes worden later gemaakt met uren × uurtarieven
- Voor "Model only" wordt de scanning tijd selector automatisch verborgen

## Deployment op Vercel

### Environment Variables
Voeg in Vercel Dashboard → Settings → Environment Variables toe:
- `ADMIN_PASSWORD`: Wachtwoord voor admin panel (bijv. `admin123`)

**BELANGRIJK:** 
- Zorg dat je de environment variable toevoegt voor **alle environments** (Production, Preview, Development)
- Of selecteer minstens "Production" als je alleen in productie gebruikt
- Na het toevoegen/wijzigen van environment variables: **Redeploy** je project (Vercel gebruikt environment variables alleen bij deployment)
- **Voor persistente opslag:**
  - `EDGE_CONFIG`: Edge Config connection string (wordt automatisch toegevoegd bij Edge Config setup)
  - `VERCEL_ACCESS_TOKEN`: Vercel API token voor Edge Config updates (maak aan in [Account Settings → Tokens](https://vercel.com/account/tokens))

### Vercel Edge Config Setup (aanbevolen voor persistente opslag)
1. Ga naar Vercel Dashboard → Storage → Create Database
2. Kies **"Edge Config"** (ideaal voor configuratie data zoals prijzen)
3. Na aanmaken wordt `EDGE_CONFIG` automatisch toegevoegd als environment variable
4. Maak een Vercel API token aan: Account Settings → Tokens → Create Token
5. Voeg `VERCEL_ACCESS_TOKEN` toe als environment variable met je token
6. De dependency `@vercel/edge-config` is al in package.json

**Waarom Edge Config?**
- Ultra-fast reads (minder dan 1ms, 99% onder 10ms)
- Globale replicatie naar alle edge locations
- Perfect voor configuratie data die weinig verandert maar vaak wordt gelezen
- Zie: [Vercel Storage Documentation](https://vercel.com/docs/storage)

Zonder Edge Config worden prijsaanpassingen tijdelijk opgeslagen (alleen in de browser).

### Admin Panel
- Toegang via: `/admin.html`
- Login met het wachtwoord dat je hebt ingesteld in `ADMIN_PASSWORD`
- Met Edge Config: prijsaanpassingen worden permanent en globaal opgeslagen
- Zonder Edge Config: prijsaanpassingen werken alleen in de huidige browser sessie

### Serverless Functions
De admin functionaliteit gebruikt Vercel Serverless Functions:
- `/api/admin` - Authenticatie endpoint
- `/api/get-pricing` - Ophalen van prijzen (van Edge Config of static file)
- `/api/save-pricing` - Opslaan van prijzen (naar Edge Config indien geconfigureerd)

## Licentie

Interne tool voor BIM 4 Portfolio projecten.

