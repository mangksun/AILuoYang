@echo off
npm run dev:mp-weixin
echo.
echo [post-build] Copying static imgs to dist...
xcopy /E /Y /I "static\imgs" "dist\dev\mp-weixin\static\imgs" >nul
echo [post-build] Done.
