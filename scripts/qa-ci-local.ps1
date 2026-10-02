$ErrorActionPreference = 'Stop'
$portfolioRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $portfolioRoot
try {
    foreach ($scriptFile in @('assets/main.js', 'assets/preferences.js', 'assets/locales.js')) {
        node --check $scriptFile
        if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax check failed: $scriptFile" }
    }
    foreach ($testFile in @('tests/smoke.py', 'tests/preferences.py', 'tests/accessibility.py')) {
        python $testFile
        if ($LASTEXITCODE -ne 0) { throw "Browser check failed: $testFile" }
    }
    git diff --check
    if ($LASTEXITCODE -ne 0) { throw 'Git whitespace check failed' }
    Write-Output 'qa-ci-local: all checks passed'
} finally {
    Pop-Location
}
