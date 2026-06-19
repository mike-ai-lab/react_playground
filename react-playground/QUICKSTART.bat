@echo off
echo ========================================
echo React Playground Quick Start
echo ========================================
echo.

REM Change to the react-playground directory
cd /d "C:\Users\Administrator\react_playground\react-playground"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the development server and open browser
echo Starting React Playground...
echo.
start "" http://localhost:5174
npm run dev
