# Constructor Lab

Browser-side D4 / Thalean constructor viewer.

## Run locally

From the site root, run:

    ./run.sh

Then open:

    http://127.0.0.1:8000/labs/constructor/lab.html

## Runtime model

This lab is intended to run client-side in the browser.

Active files:

- lab.html — main interface
- lab.css — styling
- lab_boot.js — boot/controller logic
- kernel/*.js — browser-side rendering and D4 constructor engine

No Python, FastAPI, PHP API shim, or server-side graph endpoint is required for the active constructor view.

## Pending port

Witness mode was originally backed by a server endpoint in d4lab. It is currently disabled with a browser-side fallback until the witness-state builder is ported into JavaScript.
