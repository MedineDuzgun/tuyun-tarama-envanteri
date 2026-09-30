# Tuyun Akademi · Tarama Envanteri

Öğrencilerin telefondan doldurabileceği, sunucusuz (statik) bir **tarama envanteri** sayfası. Cevaplar Google Sheets'e yazılır. Sayfa bir tanı aracı değildir; puan, sonuç veya yorum göstermez. Cevaplar yalnızca Kariyer Psikolojik Danışman ekibine gider.

## Ne içerir?

```
tuyun-tarama-envanteri/
├── index.html          # Tüm sayfa: HTML + CSS + JS tek dosyada
├── apps-script/
│   └── Code.gs         # Google Apps Script web uygulaması (Sheets'e yazar)
├── reference/
│   └── 1.png           # Modal için referans ekran görüntüsü
└── README.md
```

Framework, build adımı, npm bağımlılığı **yok**. Tek dış kaynak Google Fonts (Archivo).

## Yerelde açmak

`index.html` dosyasını doğrudan tarayıcıda aç. Kurulum gerekmez.

- `index.html?reset=1` → kayıtlı ilerlemeyi (localStorage) siler, baştan başlar.
- Sayfa yenilenince kaldığı adımdan devam eder. Gönderim başarılıysa doğrudan kapanış ekranı açılır.

## Ayar sabitleri (index.html en üstü)

`<script>` bloğunun başındaki sabitleri düzenle:

| Sabit | Açıklama |
|---|---|
| `ENDPOINT` | Apps Script web uygulaması URL'i. **Boşsa yanıtlar hiçbir yere kaydedilmez** (geliştirme modu). |
| `CALENDAR_URL` | Ücretsiz görüşme randevu bağlantısı (kapanış ekranı). |
| `PACKAGE_LINKS.deneme` / `.danismanlik` | Paket sayfaları. `"#"` veya boşsa karttaki tıklama hiçbir şey yapmaz. |
| `KVKK_URL` | Aydınlatma metni bağlantısı. `"#"` ise onay metninde bağlantı gösterilmez. |
| `STORAGE_KEY` | localStorage anahtarı (`ben-envanteri-v1`). |

> ⚠️ **`ENDPOINT` boşken yayına alma.** Bu modda kapanış ekranında "paylaşıldı" yazar ama cevaplar aslında hiçbir yere gitmez. Geliştirme modunda payload yalnızca tarayıcı konsoluna `console.warn` ile yazılır.

## Soru veya bölüm ekleme / değiştirme

Tüm içerik `index.html` içindeki tek bir dizide durur: **`BOLUMLER`**. Başka hiçbir yerde soru metni tekrarlanmaz.

- Yeni madde eklemek: ilgili bölümün `maddeler` dizisine bir satır ekle.
- Yeni bölüm eklemek: `BOLUMLER` dizisine yeni bir nesne ekle (`id`, `ad`, `baslik`, `maddeler`). İlerleme göstergesindeki "taş" sayısı otomatik güncellenir.
- Soru id'leri otomatik türetilir: `<bolum.id>` + sıra numarası (örn. `calisma1`, `sinav2`). **`id` alanını değiştirmek eski Sheet başlıklarıyla uyumu bozar**; mevcut sütun düzenini korumak istiyorsan `id`'leri sabit tut.

Envanter maddelerinin metni kurumun onayıyla belirlenmiştir; değiştirmeden önce danışman ekibine danış.

## Google Sheets kurulumu

1. Yeni bir Google Sheet aç.
2. **Uzantılar > Apps Script**.
3. `apps-script/Code.gs` içeriğini yapıştır, kaydet.
4. **Dağıt > Yeni dağıtım > Web uygulaması**
   - *Şu kullanıcı olarak yürüt:* **Ben**
   - *Erişimi olan:* **Herkes**
5. Yetkileri onayla, verilen **Web uygulaması URL**'ini kopyala.
6. URL'i `index.html` içindeki `ENDPOINT` sabitine yapıştır.
7. Test: URL'i tarayıcıda açınca **"endpoint çalışıyor"** görünmeli.

**Kodu değiştirince:** Dağıt > Dağıtımları yönet > düzenle > Sürüm: **Yeni sürüm** > Dağıt. Sadece kaydetmek yeterli değildir; URL aynı kalır.

Betik: "Yanıtlar" sekmesini bulur/oluşturur, ilk gönderimde başlık satırını kurup dondurur ve kalınlaştırır, her gönderimde tek satır ekler. Telefon başındaki `0` korunur (`'` öneki). Eşzamanlı gönderimler için `LockService` kullanılır. Neden `text/plain` + `no-cors`? Apps Script CORS preflight'ı desteklemediği için tarayıcı isteği bu şekilde gönderilir; yanıt opaktır, ağ hatası olmadıkça gönderim başarılı sayılır.

## Yayına alma

`index.html` statik bir dosyadır; herhangi bir statik barındırmaya konabilir:

- **Netlify Drop** — [app.netlify.com/drop](https://app.netlify.com/drop) sayfasına klasörü sürükle.
- **GitHub Pages** — depoyu Pages ile yayınla.
- **Tuyun'un mevcut barındırması** — dosyayı sunucuya yükle.

## Erişilebilirlik ve tasarım notları

- Renkler tuyunakademi.com'dan ölçülüp CSS custom property olarak tanımlandı. Açık ve koyu tema (`prefers-color-scheme`) desteklenir.
- **Kontrast istisnası:** `--gold` (`#e0a700`) altın rengi beyaz üzerinde WCAG AA'nın altında kalır. Bu yüzden altın yalnızca 20px+ kalın başlıklarda, çizgilerde ve halkalarda kullanılır; küçük gövde metninde asla. Gövde metni ve butonlar AA'yı sağlar.
- Klavyeyle tam kullanılabilir; her etkileşimli öğede görünür odak çerçevesi. `prefers-reduced-motion` altında animasyonlar kapanır.

## Yayın öncesi kontrol listesi

- [ ] `ENDPOINT` dolduruldu ve gerçek bir gönderim Sheet'te satır oluşturdu. (Boşken yanıtlar kaydedilmez ama kapanışta "paylaşıldı" yazar; **boş `ENDPOINT` ile yayına alma.**)
- [ ] `PACKAGE_LINKS` içindeki iki adres gerçek paket sayfalarına ayarlandı.
- [ ] `KVKK_URL` aydınlatma metnine bağlandı.
- [ ] Toplanan veriler (telefon, e-posta, psikolojik nitelikte cevaplar) için KVKK süreci ve 18 yaş altı öğrenciler için **veli onayı** kurumla netleştirildi.
- [ ] Sheet'e yalnızca yetkili danışmanların erişimi var.
