@echo off
echo Starting Inventory Management System...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed! Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm packages are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error installing dependencies!
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting development server...
start http://localhost:3000
npm start

pause 