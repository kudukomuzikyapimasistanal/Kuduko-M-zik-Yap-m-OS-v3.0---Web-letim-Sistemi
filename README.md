KUDUKO OS -> WINDOWS EXE

1) Node.js kurulu degilse https://nodejs.org adresinden LTS surumunu kurun.
2) Kuduko OS HTML dosyanizi bu klasore "index.html" adiyla koyun.
3) (Istege bagli) 256x256 bir "icon.png" koyun. Yoksa build.bat icin
   package.json icindeki "icon" satirlarini silin.
4) build.bat dosyasina cift tiklayin.
5) "dist" klasorunde:
   - "Kuduko OS 1.0.0.exe"        -> kurulumsuz, tek dosya (portable)
   - "Kuduko OS Setup 1.0.0.exe"  -> kurulum sihirbazi
   Sadece portable istiyorsaniz "npm run build", kurulum icin "npm run build:setup".

Denemek icin (exe olusturmadan): npm install, sonra npm start

Kisayollar: F11 tam ekran, F12 gelistirici araclari.

NOT:
- "Asistan AI" ve "Mesajlasma" uygulamalari Claude ortamina ozel (window.claude)
  oldugu icin exe icinde calismaz, "kullanilamiyor" yazar.
- Dosyalar, Kamera, Ses Kaydi, Bluetooth, Muzik Calar normal calisir.
