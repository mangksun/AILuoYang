$ErrorActionPreference = "Stop"

$BaseUrl = "http://localhost:3000"
$Username = "admin"
$Password = "admin123"
$Channel = "douyin"
$LocalTicketId = 7
$RemoteProductId = "DY-LM-001"
$RemoteProductName = "Douyin Longmen Adult Ticket"
$RetailPrice = 90
$SettlementPrice = 82
$VerifyCode = "TEST-CODE-001"

function Invoke-JsonRequest {
  param(
    [string]$Uri,
    [string]$Method = "GET",
    [hashtable]$Headers = @{},
    [object]$Body = $null
  )

  $params = @{
    Uri = $Uri
    Method = $Method
    Headers = $Headers
  }

  if ($null -ne $Body) {
    $params.ContentType = "application/json; charset=utf-8"
    $params.Body = ($Body | ConvertTo-Json -Depth 8 -Compress)
  }

  return Invoke-RestMethod @params
}

Write-Host "1. Login admin user: $Username ..."
$login = Invoke-JsonRequest `
  -Uri "$BaseUrl/api/auth/login" `
  -Method "POST" `
  -Body @{ username = $Username; password = $Password }

$token = $login.data.token
if (-not $token) {
  throw "登录失败：未取得 token"
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host "2. Ensure OTA channel exists: $Channel ..."
$channelQueryUrl = "${BaseUrl}/api/ota/channels?page=1&pageSize=100&keyword=$Channel"
$channels = Invoke-JsonRequest `
  -Uri $channelQueryUrl `
  -Headers $headers

$channelExists = $false
foreach ($item in $channels.data.list) {
  if ($item.name -eq $Channel) {
    $channelExists = $true
    break
  }
}

if (-not $channelExists) {
  Invoke-JsonRequest `
    -Uri "$BaseUrl/api/ota/channels" `
    -Method "POST" `
    -Headers $headers `
    -Body @{ name = $Channel; status = "active"; apiConfigJson = @{ demo = $true } } | Out-Null
  Write-Host "   Created channel $Channel"
} else {
  Write-Host "   Channel already exists"
}

Write-Host "3. Ensure OTA product mapping exists: $RemoteProductId -> local ticket $LocalTicketId ..."
$mappingQueryUrl = "${BaseUrl}/api/ota/mappings?page=1&pageSize=100&channel=$Channel"
$mappings = Invoke-JsonRequest `
  -Uri $mappingQueryUrl `
  -Headers $headers

$mappingExists = $false
foreach ($item in $mappings.data.list) {
  if ($item.remoteProductId -eq $RemoteProductId) {
    $mappingExists = $true
    break
  }
}

if (-not $mappingExists) {
  Invoke-JsonRequest `
    -Uri "$BaseUrl/api/ota/mappings" `
    -Method "POST" `
    -Headers $headers `
    -Body @{
      channel = $Channel
      localTicketId = $LocalTicketId
      remoteProductId = $RemoteProductId
      remoteProductName = $RemoteProductName
      retailPrice = $RetailPrice
      settlementPrice = $SettlementPrice
    } | Out-Null
  Write-Host "   Created product mapping"
} else {
  Write-Host "   Product mapping already exists"
}

Write-Host "4. Mock OTA verification: $VerifyCode ..."
$verify = Invoke-JsonRequest `
  -Uri "$BaseUrl/api/ota/verify" `
  -Method "POST" `
  -Headers $headers `
  -Body @{
    channel = $Channel
    remoteProductId = $RemoteProductId
    verifyCode = $VerifyCode
  }

Write-Host ""
Write-Host "Verification result:"
$verify | ConvertTo-Json -Depth 8

Write-Host ""
Write-Host "Demo tip: open Web Admin -> OTA -> OTA Reconciliation and click Search to see the new verify log."
