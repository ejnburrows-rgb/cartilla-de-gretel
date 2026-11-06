@echo off
cd /d "%~dp0ART_REVIEW_APP"
echo Abriendo la Revision de Arte... No cierres esta ventana mientras trabajas.
node server.mjs
pause
