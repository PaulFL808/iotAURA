@echo off
title AURA Smart Parking - Servidor Windows Server IIS (Azure)
color 0A
cd /d "%~dp0"

echo =====================================================================
echo    AURA SMART PARKING - DESPLIEGUE EN MICROSOFT AZURE
echo    Windows Server 2022 + IIS 10.0 + Node.js Express API
echo =====================================================================
echo.

:: Verificar si Node.js esta instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor descarga e instala Node.js LTS en la Maquina Virtual:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js detectado correctamente:
node -v
echo.

:: Instalar dependencias si no existen
if not exist "node_modules\" (
    echo [2/3] Instalando dependencias de produccion (express, cors)...
    call npm install --omit=dev
    echo [OK] Dependencias instaladas exitosamente.
) else (
    echo [2/3] Dependencias ya instaladas en node_modules.
)
echo.

:: Iniciar servidor backend & frontend compilado
echo [3/3] Iniciando servidor web en http://localhost:3001 ...
echo.
echo =====================================================================
echo  - Aplicacion Web:  http://localhost:3001
echo  - Endpoints CRUD:  http://localhost:3001/api/parking/state
echo  - Base de Datos:   Firebase Firestore (Proyecto: nubarda)
echo =====================================================================
echo.
echo Presiona Ctrl + C para detener el servidor.
echo.

node server/index.js
pause
