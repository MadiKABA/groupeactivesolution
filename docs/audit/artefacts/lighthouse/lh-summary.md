# Lighthouse 12.8.2 — http://localhost:3100/ (next start, build de production)

Commande : `CHROME_PATH=/usr/bin/google-chrome npx lighthouse http://localhost:3100/ --form-factor=mobile|--preset=desktop [--throttling-method=devtools] [--throttling.cpuSlowdownMultiplier=6]`

exécution | form-factor | méthode | CPU | Perf | A11y | BP | SEO | FCP ms | LCP ms | TBT ms | CLS | SI ms | TTI ms
----------|-------------|---------|-----|------|------|----|-----|--------|--------|--------|-----|-------|-------
desktop-1 | desktop | simulate | cpu×1 | 98 | 100 | 96 | 100 | 378 | 702 | 0 | 0.000 | 1560 | 704
desktop-2 | desktop | simulate | cpu×1 | 82 | 100 | 96 | 100 | 464 | 911 | 319 | 0.000 | 1837 | 1650
desktop-3 | desktop | simulate | cpu×1 | 94 | 100 | 96 | 100 | 657 | 697 | 75 | 0.000 | 2361 | 1308
mobile-1 | mobile | simulate | cpu×4 | 36 | 93 | 96 | 100 | 1581 | 7787 | 5916 | 0.000 | 10975 | 8024
mobile-2 | mobile | simulate | cpu×4 | 91 | 97 | 96 | 100 | 1363 | 3308 | 110 | 0.000 | 2233 | 3394
mobile-3 | mobile | simulate | cpu×4 | 90 | 97 | 96 | 100 | 1366 | 3308 | 85 | 0.000 | 3509 | 3538
mobile-4 | mobile | simulate | cpu×4 | 75 | 97 | 96 | 100 | 1477 | 3433 | 617 | 0.000 | 2754 | 3444
mobile-5 | mobile | simulate | cpu×4 | 71 | 97 | 96 | 100 | 1359 | 3376 | 685 | 0.000 | 5037 | 4103
mobile-cpu6 | mobile | simulate | cpu×6 | 82 | - | - | - | 1358 | 3479 | 370 | 0.000 | 2389 | 3778
mobile-devtools | mobile | devtools | cpu×4 | 77 | - | - | - | 1862 | 5118 | 169 | 0.000 | 3508 | 4020
