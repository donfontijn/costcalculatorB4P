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

## Licentie

Interne tool voor BIM 4 Portfolio projecten.

