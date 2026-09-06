@echo off
setlocal
cd /d "%~dp0"

echo Erzwelt Standalone wird erstellt...
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo FEHLER: Node.js wurde nicht gefunden.
  echo Installiere Node.js oder fuehre den Build auf einem Rechner mit Node.js aus.
  echo.
  pause
  exit /b 1
)

node scripts\build-standalone.mjs
if errorlevel 1 (
  echo.
  echo FEHLER: Standalone-Build fehlgeschlagen.
  pause
  exit /b 1
)

echo.
echo FERTIG: index.html ist als eigenstaendige Standalone-Datei erstellt und geprueft.
echo Die Datei kann danach direkt per Doppelklick geoeffnet werden.
echo.
pause
