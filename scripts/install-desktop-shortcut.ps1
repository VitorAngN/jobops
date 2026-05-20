$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "JobOps.lnk"
$StartScript = Join-Path $Root "scripts\start-jobops-desktop.ps1"

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$StartScript`""
$Shortcut.WorkingDirectory = $Root
$Shortcut.IconLocation = "$env:SystemRoot\System32\SHELL32.dll,21"
$Shortcut.Description = "Abrir JobOps como aplicativo desktop"
$Shortcut.Save()

Write-Host "Atalho criado em: $ShortcutPath"
