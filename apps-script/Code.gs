/**
 * Tuyun Akademi · Tarama Envanteri — Google Apps Script web uygulaması
 * ---------------------------------------------------------------------
 * Bu betik, envanter sayfasından gelen yanıtları bir Google Sheet'e yazar.
 *
 * KURULUM (adım adım):
 *   1. Yeni bir Google Sheet aç (drive.google.com → Yeni → Google E-Tablolar).
 *   2. Üst menüden: Uzantılar > Apps Script.
 *   3. Açılan editördeki tüm kodu sil, bu dosyanın içeriğini yapıştır, kaydet.
 *   4. Sağ üstten: Dağıt > Yeni dağıtım.
 *   5. Tür olarak "Web uygulaması" seç.
 *        - Açıklama: istediğin bir ad (ör. "Tarama envanteri v1")
 *        - Şu kullanıcı olarak yürüt: Ben (kendi hesabın)
 *        - Erişimi olan: Herkes
 *   6. Dağıt > yetkileri onayla.
 *   7. Verilen "Web uygulaması URL"ini kopyala ve index.html içindeki
 *      ENDPOINT sabitine yapıştır.
 *
 * KODU GÜNCELLEDİĞİNDE:
 *   Değişikliğin canlıya yansıması için Dağıt > Dağıtımları yönet >
 *   (kalem/düzenle) > Sürüm: "Yeni sürüm" > Dağıt yapman gerekir.
 *   Aynı URL korunur; sadece "Kaydet" yeterli değildir.
 *
 * TEST:
 *   URL'i tarayıcıda açınca "endpoint çalışıyor" yazısını görmelisin (doGet).
 */

var SHEET_ADI = 'Yanıtlar';

// Sabit başlık sütunları (soru sütunlarından önce gelenler).
var TEMEL_BASLIKLAR = [
  'Gönderim zamanı',
  'Ad soyad',
  'Sınıf / branş',
  'Hedef okul / bölüm',
  'Telefon',
  'E-posta',
  'İletişim tercihi',
  'KVKK onayı'
];

/**
 * Kurulum testi: URL tarayıcıda açıldığında görünür.
 */
function doGet(e) {
  return ContentService
    .createTextOutput('endpoint çalışıyor')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Envanter gönderimini alır ve tek satır olarak sayfaya ekler.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Eşzamanlı gönderimlerde satırların karışmaması için kilit.
    lock.waitLock(30000);

    var payload = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet_();

    // Soru sütun başlıkları: "<Bölüm>: <soru metni>"
    var sorular = payload.sorular || [];
    var soruBasliklari = sorular.map(function (s) {
      return String(s.bolum) + ': ' + String(s.metin);
    });

    // İlk gönderimde başlık satırını kur, dondur ve kalınlaştır.
    if (sheet.getLastRow() === 0) {
      var basliklar = TEMEL_BASLIKLAR.concat(soruBasliklari);
      sheet.appendRow(basliklar);
      var basSatir = sheet.getRange(1, 1, 1, basliklar.length);
      basSatir.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Telefonun başındaki 0'ı korumak için metin olarak yaz (' öneki).
    var telefon = payload.telefon != null ? String(payload.telefon) : '';
    if (telefon && telefon.charAt(0) !== "'") telefon = "'" + telefon;

    var satir = [
      payload.gonderimZamani || '',
      payload.adSoyad || '',
      payload.sinifBrans || '',
      payload.hedef || '',
      telefon,
      payload.eposta || '',
      payload.iletisimTercihi || '',
      payload.kvkkOnay ? 'Evet' : 'Hayır'
    ];

    // Yanıtları soru sırasına göre ekle (Evet / Hayır / Bazen).
    var yanitlar = payload.yanitlar || {};
    for (var i = 0; i < sorular.length; i++) {
      var id = sorular[i].id;
      satir.push(yanitlar[id] || '');
    }

    sheet.appendRow(satir);

    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * "Yanıtlar" sekmesini bulur, yoksa oluşturur.
 */
function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_ADI);
  if (!sheet) sheet = ss.insertSheet(SHEET_ADI);
  return sheet;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
