@echo off
setlocal EnableExtensions
title DeployMaster - Resolva Jato
cd /d "%~dp0"

REM Launcher: staging -> resumo -> producao (GitHub Actions Vultr)
REM Uso:
REM   DeployMaster.bat
REM   DeployMaster.bat -StagingOnly
REM   DeployMaster.bat -Branch feat/growth-nichos-d30
REM   DeployMaster.bat -NoPause

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
set "PSARGS=%PSARGS% %~1"
shift
goto parse
:parsed

where powershell >nul 2>&1
if errorlevel 1 (
  echo ERRO: PowerShell nao encontrado no PATH.
  exit /b 1
)

where gh >nul 2>&1
if errorlevel 1 (
  echo ERRO: GitHub CLI ^(gh^) nao encontrado. Instale: https://cli.github.com/
  exit /b 1
)

where git >nul 2>&1
if errorlevel 1 (
  echo ERRO: git nao encontrado no PATH.
  exit /b 1
)

echo  Opcoes: -StagingOnly  -SkipPush  -SkipCommit  -Branch NOME  -NoPause
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0DeployMaster.ps1" %PSARGS%
set "EXITCODE=%ERRORLEVEL%"

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
