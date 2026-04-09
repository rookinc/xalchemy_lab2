#!/usr/bin/env bash
cd "$(dirname "$0")/public_html" || exit 1
php -S 127.0.0.1:8000
