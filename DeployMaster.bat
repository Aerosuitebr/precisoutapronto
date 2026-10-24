@echo off
setlocal EnableExtensions DisableDelayedExpansion
title DeployMaster - Precisou, Tá Pronto
cd /d "%~dp0"

REM Launcher: deploy manual direto em producao (GitHub Actions Vultr)
REM Uso:
REM   DeployMaster.bat
REM   DeployMaster.bat -Branch feat/growth-nichos-d30
REM   DeployMaster.bat -NoPause

set "EXITCODE=1"
set "NOPAUSE="
set "PSARGS="
:parse
if "%~1"=="" goto parsed
if /I "%~1"=="-NoPause" (
  set "NOPAUSE=1"
  shift
  goto parse
)
if /I "%~1"=="/NoPause" (
  set "NOPAUSE=1"
  shift
  goto parse
)
set "PSARGS=%PSARGS% %1"
shift
goto parse
:parsed

where powershell >nul 2>&1
if errorlevel 1 (
  echo ERRO: PowerShell nao encontrado no PATH.
  goto finish
)

where git >nul 2>&1
if errorlevel 1 (
  echo ERRO: git nao encontrado no PATH.
  goto finish
)

echo  Destino: PRODUCAO - https://precisoutapronto.com.br/
echo  Opcoes:  -DryRun  -SkipPush  -SkipCommit  -Branch NOME  -NoPause
echo.

if not exist "%~dp0DeployMaster.ps1" (
  echo ERRO: DeployMaster.ps1 nao encontrado nesta pasta.
  goto finish
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0DeployMaster.ps1" %PSARGS%
set "EXITCODE=%ERRORLEVEL%"

:finish

echo.
if not "%EXITCODE%"=="0" (
  echo DeployMaster terminou com codigo %EXITCODE%.
) else (
  echo DeployMaster finalizado com sucesso.
)

if not defined NOPAUSE (
  echo.
  pause
)

exit /b %EXITCODE%
