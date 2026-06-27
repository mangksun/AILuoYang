Add-Type -AssemblyName System.Web
function UrlEncode([string]$s) { return [System.Web.HttpUtility]::UrlEncode($s) }

$outDir = 'c:\szz\AILuoYang\miniapp\src\assets\imgs'

$images = @(
  @{ name = 'longmen.jpg'; prompt = 'Longmen Grottoes ancient Chinese Buddhist rock carvings stone statues at sunset, golden light, Yi River reflection, photorealistic, travel photography'; size = 'landscape_16_9' },
  @{ name = 'laojun.jpg'; prompt = 'Laojun Mountain peaks with golden summit temple in clouds, misty mountains blue sky, Chinese Taoist sacred mountain, epic landscape photography'; size = 'landscape_16_9' },
  @{ name = 'baima.jpg'; prompt = 'White Horse Temple ancient Buddhist temple red walls golden roofs China Luoyang, traditional Chinese architecture, incense smoke, serene atmosphere'; size = 'landscape_16_9' },
  @{ name = 'mingtang.jpg'; prompt = 'Tang Dynasty style mingtang heavenly hall grand palace, red golden colors, traditional Chinese architecture night illumination, light show performance, Luoyang'; size = 'landscape_16_9' },
  @{ name = 'baiyun.jpg'; prompt = 'Baiyun Mountain misty forests waterfall rocks green mountains national park China Henan, photorealistic landscape photography, hiking trail'; size = 'landscape_16_9' },
  @{ name = 'guanlin.jpg'; prompt = 'Guanlin Temple ancient Chinese temple red walls traditional roof tiles, military general Guan Gong sanctuary, traditional festival, cultural heritage'; size = 'landscape_16_9' },
  @{ name = 'luoyi.jpg'; prompt = 'Chinese ancient city with hanfu women red white traditional dress, Lantern Festival night, Luoyang ancient capital, photorealistic, travel photography warm lighting'; size = 'landscape_16_9' },
  @{ name = 'food.jpg'; prompt = 'Chinese traditional soup beef broth and local Luoyang food, red bowls steam hot soup, gourmet photography, ancient capital, delicious Chinese cuisine'; size = 'landscape_16_9' },
  @{ name = 'luopu.jpg'; prompt = 'Luopu park Luoyang river scenery green trees sunset, traditional Chinese garden, peaceful park landscape'; size = 'landscape_16_9' },
  @{ name = 'balu.jpg'; prompt = 'Office of Eighth Route Army in Luoyang, historic red brick building, revolutionary history museum, China cultural heritage'; size = 'landscape_16_9' },
  @{ name = 'niurou.jpg'; prompt = 'Chinese beef soup warm bowl steam, Luoyang specialty breakfast, traditional food photography, rustic wooden table'; size = 'landscape_16_9' },
  @{ name = 'bufan-tang.jpg'; prompt = 'Bu Fan Tang Luoyang traditional sour soup bowl, special local food, Chinese cuisine photography, ceramic bowl'; size = 'landscape_16_9' },
  @{ name = 'shui.jpg'; prompt = 'Traditional Chinese water banquet soup dish Luoyang specialty food, multiple bowls, banquet table, local famous cuisine'; size = 'landscape_16_9' },
  @{ name = 'jiangmian.jpg'; prompt = 'Luoyang jiangmian noodles traditional Chinese pasta soup bowl, local specialty food, gourmet photography'; size = 'landscape_16_9' },
  @{ name = 'mudan.jpg'; prompt = 'Peony cake traditional Chinese pastry Luoyang, sweet dessert, food photography, flower shaped'; size = 'landscape_16_9' },
  @{ name = 'shaobing.jpg'; prompt = 'Rou jia bing Chinese meat sandwich Luoyang specialty, pita bread with filling, street food photography'; size = 'landscape_16_9' },
  @{ name = 'hula.jpg'; prompt = 'Chinese guotie potstickers dumpling Luoyang small street food, traditional snack, food photography'; size = 'landscape_16_9' },
  @{ name = 'peony.jpg'; prompt = 'Beautiful peony flowers pink white Luoyang peony festival, spring garden, Chinese flower photography'; size = 'landscape_16_9' },
  @{ name = 'sancai.jpg'; prompt = 'Tang Sancai tri-color glazed pottery ancient Chinese ceramic, museum exhibition, cultural relic artifact'; size = 'landscape_16_9' },
  @{ name = 'deng.jpg'; prompt = 'Traditional Chinese red lantern palace lantern festive night, Luoyang lantern craft, beautiful light'; size = 'landscape_16_9' },
  @{ name = 'piying.jpg'; prompt = 'Chinese shadow puppet theater traditional folk art, leather puppet, performance art heritage'; size = 'landscape_16_9' },
  @{ name = 'luoyangchan.jpg'; prompt = 'Luoyang chan shovel archaeological tool museum, ancient Chinese artifact, bronze tool display'; size = 'landscape_16_9' },
  @{ name = 'papercut.jpg'; prompt = 'Chinese paper cutting folk art red paper scissors, traditional intangible cultural heritage'; size = 'landscape_16_9' }
)

$success = 0
$failed = 0
foreach ($item in $images) {
  $url = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=$(UrlEncode $item.prompt)&image_size=$($item.size)"
  $outPath = Join-Path $outDir $item.name
  Write-Host "Fetching $($item.name) ..."
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
    if ($resp.StatusCode -eq 200) {
      [System.IO.File]::WriteAllBytes($outPath, $resp.Content)
      Write-Host "  OK -> $outPath ($([Math]::Round($resp.Content.Length/1024))KB)"
      $success++
    } else {
      Write-Host "  FAIL status=$($resp.StatusCode)"
      $failed++
    }
  } catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $failed++
  }
  Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Done. Success: $success, Failed: $failed"
