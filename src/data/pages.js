// ============================================================
//  STATİK SAYFA İÇERİKLERİ
//  〔...〕 ile işaretli yerleri kendi bilgilerinle DOLDUR.
//  Her bölüm { h: 'Başlık', p: 'Paragraf' } veya { p: '...' } olabilir.
// ============================================================

export const STATIC_PAGES = {
  hakkimizda: {
    title: 'Hakkımızda',
    intro:
      'Serev Tedarik; ev & yaşam ve mutfak gereçleri alanında perakende ve toptan tedarik sağlayan bir markadır.',
    sections: [
      {
        h: 'Biz Kimiz?',
        p: '〔Firmanızın hikâyesini buraya yazın — ne zaman kuruldu, hangi ürünlerde uzman, müşterilerine nasıl bir değer sunuyor.〕',
      },
      {
        h: 'Neden Biz?',
        p: 'Orijinal ürün garantisi, üyelere özel toptan/temsilci fiyatları ve WhatsApp üzerinden hızlı sipariş imkânı sunuyoruz.',
      },
    ],
  },

  iletisim: {
    title: 'İletişim',
    intro: 'Bize aşağıdaki kanallardan ulaşabilirsiniz.',
    sections: [
      { h: 'Firma Ünvanı', p: '〔Resmi firma ünvanı〕' },
      { h: 'Adres', p: '〔Açık adres, ilçe / il〕' },
      { h: 'Telefon / WhatsApp', p: '0544 864 18 10' },
      { h: 'E-Posta', p: 'info@serevtedarik.com' },
      { h: 'Vergi Dairesi / No', p: '〔Vergi dairesi ve numarası〕' },
      { h: 'Çalışma Saatleri', p: 'Hafta içi 09:00 – 18:00' },
    ],
  },

  gizlilik: {
    title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni',
    intro:
      '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında kişisel verilerinizin işlenmesine ilişkin aydınlatma metnidir.',
    sections: [
      {
        h: 'Veri Sorumlusu',
        p: '〔Firma ünvanı〕, kişisel verilerinizi veri sorumlusu sıfatıyla işlemektedir.',
      },
      {
        h: 'Hangi Veriler İşlenir?',
        p: 'Üyelik başvurusunda verdiğiniz ad-soyad, firma bilgisi, e-posta, telefon ve sipariş bilgileri; siparişin oluşturulması ve iletişim amacıyla işlenir.',
      },
      {
        h: 'İşleme Amaçları',
        p: 'Verileriniz; üyelik başvurunuzun değerlendirilmesi, siparişlerin oluşturulması ve takibi, sizinle iletişim kurulması ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.',
      },
      {
        h: 'Verilerin Aktarılması',
        p: 'Verileriniz yasal yükümlülükler dışında üçüncü kişilerle paylaşılmaz. 〔Kargo/ödeme gibi hizmet aldığınız taraflar varsa belirtin.〕',
      },
      {
        h: 'Saklama Süresi',
        p: 'Kişisel verileriniz, işlenme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen süreler boyunca saklanır; sürenin sonunda silinir, yok edilir veya anonim hâle getirilir.',
      },
      {
        h: 'Çerez (Cookie) Politikası',
        p: 'Sitemiz; oturumunuzun sürdürülmesi, sepet/üyelik tercihlerinizin hatırlanması ve deneyimin iyileştirilmesi için zorunlu ve işlevsel çerezler kullanır. Çerezleri tarayıcı ayarlarınızdan reddedebilir veya silebilirsiniz; ancak bu durumda bazı özellikler düzgün çalışmayabilir. Pazarlama amaçlı üçüncü taraf çerezleri 〔kullanılıyorsa belirtin; kullanılmıyorsa "kullanılmamaktadır"〕.',
      },
      {
        h: 'Veri Güvenliği',
        p: 'Siteye iletilen veriler SSL/TLS şifrelemesi ile aktarılır. Üyelik şifreleri geri döndürülemez şekilde şifrelenerek (hash) saklanır; düz metin olarak tutulmaz. Yetkisiz erişime karşı teknik ve idari tedbirler alınır.',
      },
      {
        h: 'Haklarınız',
        p: 'KVKK 11. madde kapsamında verilerinize erişme, düzeltme, silinmesini talep etme ve işlemeye itiraz etme haklarına sahipsiniz. Talepleriniz için: 0544 864 18 10 / info@serevtedarik.com',
      },
    ],
  },

  'iade-iptal': {
    title: 'İptal ve İade Koşulları',
    intro:
      'Siparişlerin iptali ve ürün iadesine ilişkin koşullar aşağıda belirtilmiştir.',
    sections: [
      {
        h: 'Sipariş İptali',
        p: 'Siparişiniz WhatsApp üzerinden onaylanmadan önce iptal talebinde bulunabilirsiniz.',
      },
      {
        h: 'İade Süresi',
        p: 'Teslimattan itibaren 〔14〕 gün içinde, kullanılmamış ve orijinal ambalajındaki ürünleri iade edebilirsiniz.',
      },
      {
        h: 'İade Süreci',
        p: 'İade talebinizi WhatsApp (0544 864 18 10) üzerinden iletin; onay sonrası ürünü 〔iade adresi〕 adresine gönderin.',
      },
    ],
  },

  'mesafeli-satis': {
    title: 'Mesafeli Satış Sözleşmesi',
    intro:
      'İşbu sözleşme, mesafeli satışlarda tarafların hak ve yükümlülüklerini düzenler.',
    sections: [
      { h: 'Satıcı', p: '〔Firma ünvanı, adres, vergi no, telefon, e-posta〕' },
      {
        h: 'Sözleşme Konusu',
        p: 'Alıcının elektronik ortamda sipariş verdiği ürünlerin satışı ve teslimi.',
      },
      {
        h: 'Genel Hükümler',
        p: '〔Teslimat, ödeme, cayma hakkı ve uyuşmazlık maddelerini hukuki danışmanlık alarak buraya ekleyin.〕',
      },
    ],
  },

  'uyelik-kosullari': {
    title: 'Üyelik Koşulları',
    intro:
      'Sitemize üyelik ve üyeliğin kullanımına ilişkin koşullar aşağıdadır.',
    sections: [
      {
        h: 'Üyelik Başvurusu',
        p: 'Üyelik başvuruları yönetici onayından sonra aktifleşir. Fiyatlar yalnızca onaylı üyelere gösterilir.',
      },
      {
        h: 'Üye Sorumluluğu',
        p: 'Üye, verdiği bilgilerin doğruluğundan ve hesap güvenliğinden sorumludur.',
      },
      {
        h: 'Fiyatlandırma',
        p: 'Perakendeci ve temsilci olmak üzere iki fiyat seviyesi vardır; seviyeniz yönetici tarafından atanır.',
      },
    ],
  },
};
