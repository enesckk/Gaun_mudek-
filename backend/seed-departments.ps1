# PowerShell script to seed departments
# Kullanım: .\seed-departments.ps1

$baseUrl = "http://localhost:5000"
$endpoint = "$baseUrl/api/departments/seed"

Write-Host "🌱 Bölüm ve programları yüklüyorum..." -ForegroundColor Cyan
Write-Host "📍 Endpoint: $endpoint" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $endpoint -Method POST -ContentType "application/json" -UseBasicParsing
    
    Write-Host "✅ Başarılı!" -ForegroundColor Green
    Write-Host "📄 Yanıt:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Hata oluştu!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Hata Detayı:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Yellow
    }
}

Write-Host "`n💡 Not: Backend'in çalıştığından emin olun (npm run dev veya npm start)" -ForegroundColor Cyan
