#!/bin/bash
# Continuous WebJob — runs the background job worker alongside the Next.js app.
# Azure restarts this automatically if it exits.
cd "${WEBROOT_PATH:-/home/site/wwwroot}"
exec node_modules/.bin/tsx worker.ts
