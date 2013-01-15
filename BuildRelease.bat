
For /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
For /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
echo %mydate%_%mytime%

For /f %%i in ('git rev-parse --short HEAD') do (set REV=%%i)

echo %REV%

cd build
"..\vendors\7-zip\7z.exe" a -tzip "..\dist\WeavverBrowserPhone-%mydate%_%mytime%-%REV%.zip"
cd ..