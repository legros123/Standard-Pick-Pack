@echo off
rem A faire une seule fois : met sur le Bureau l'icone "Pick & Pack Live" (classeur + ecran en un double-clic).
set "DOSSIER=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=[Environment]::GetFolderPath('Desktop'); $s=(New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $d 'Pick & Pack Live.lnk')); $s.TargetPath=$env:DOSSIER+'Lancer Pick Pack Live.bat'; $s.WorkingDirectory=$env:DOSSIER; $s.IconLocation=$env:DOSSIER+'pick-pack-live.ico,0'; $s.WindowStyle=7; $s.Description='Ouvre le classeur PP_LIVE et l ecran du Flip'; $s.Save()"
if errorlevel 1 goto echec
echo.
echo   C'est fait : l'icone "Pick & Pack Live" est sur le Bureau.
echo   Un double-clic dessus ouvre le classeur puis l'ecran du Flip.
echo.
pause
goto :eof
:echec
echo.
echo   Le raccourci n'a pas pu etre cree automatiquement.
echo   A la main : clic droit sur "Lancer Pick Pack Live.bat", Envoyer vers, Bureau (creer un raccourci).
echo.
pause
