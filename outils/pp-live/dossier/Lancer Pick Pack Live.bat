@echo off
rem Pick & Pack Live : ouvre le classeur PP_LIVE (la journee demarre seule) puis l'ecran en plein ecran.
rem Sortir du plein ecran : touche F11.  Fermer l'ecran : Alt+F4.  Les mises a jour s'arretent en fermant le classeur.
cd /d "%~dp0"
start "" "%~dp0PP_LIVE.xlsm"
rem quelques secondes pour qu'Excel s'ouvre avant l'ecran
timeout /t 8 /nobreak >nul
set "PAGE=%~dp0pilotage.html"
where msedge >nul 2>nul
if %errorlevel%==0 (
  start "" msedge --new-window --start-fullscreen "%PAGE%"
  goto :eof
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --new-window --start-fullscreen "%PAGE%"
  goto :eof
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --new-window --start-fullscreen "%PAGE%"
  goto :eof
)
start "" "%PAGE%"
