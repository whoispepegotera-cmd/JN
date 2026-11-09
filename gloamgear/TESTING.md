# Verification
Run from the JN checkout:
```
node scripts/build-gloamgear-browser.mjs
node scripts/test-gloamgear-core.mjs
QA_MODULE_DIR=/absolute/qa-tools CHROMIUM_PATH=/usr/bin/chromium node scripts/test-gloamgear-browser.mjs
```
The QA tools directory needs Playwright 1.64.1. These are developer/CI requirements, never player requirements.
11 VM tests cover all 750 bounded encounters, corrupt saves and unsafe names, all six branches,
all twelve masteries, reward deduplication, stale delayed strikes, real status effects, quest
idempotency, prestige idempotency and local backup recovery.
Browser QA covers actual kills, loot, level-up, equipping, buying a talent, reload persistence,
corrupt-save recovery, manual boss defeat, prestige, local offline persistence and all menus at
1920×1080, 1366×768, 768×1024, 390×844 and 360×800. Reports and screenshots are in `qa-results/`.
No register/login or server-offline tests exist because those online systems are not implemented.
