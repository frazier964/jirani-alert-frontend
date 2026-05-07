$javaBin = 'C:\Program Files\Eclipse Adoptium\jre-21.0.11.10-hotspot\bin'

if (Test-Path $javaBin) {
  $env:PATH = "$javaBin;$env:PATH"
}

npm run emulators
