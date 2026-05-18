$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\kjh\Desktop\fitlog'
Remove-Item 'logs\food-import-all-result.json' -ErrorAction SilentlyContinue
Remove-Item 'logs\food-import-all-error.log' -ErrorAction SilentlyContinue
$props=@{}
Get-Content 'server\local-secrets.properties' | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.*)$') { $props[$matches[1].Trim()]=$matches[2].Trim() }
}
$secret=$props['app.data-gov-food-nutrition.import-secret']
try {
  $response=Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/internal/food-nutrient-import/run?startPage=375&maxPages=180' -Headers @{ 'X-FitLog-Food-Import-Secret' = $secret } -TimeoutSec 7200
  $response | ConvertTo-Json -Depth 5 | Set-Content 'logs\food-import-all-result.json'
} catch {
  $_ | Out-String | Set-Content 'logs\food-import-all-error.log'
  throw
}
