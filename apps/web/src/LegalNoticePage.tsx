type Translate = (key: string) => string

export function LegalNoticePage({ t, navigate }: { t: Translate; navigate: (path: string) => void }) {
  return <main className="detail-page legal-page">
    <button className="text-link back" onClick={() => navigate('/')}>← {t('legal.back')}</button>
    <header className="legal-hero">
      <p className="eyebrow">{t('legal.eyebrow')}</p>
      <h1>{t('legal.title')}</h1>
      <p>{t('legal.intro')}</p>
    </header>
    <section className="settings-card legal-content">
      <h2>{t('legal.provider')}</h2>
      <address><strong>{t('legal.name')}</strong><br />{t('legal.street')}<br />{t('legal.city')}<br />{t('legal.country')}</address>
      <h2>{t('legal.contact')}</h2>
      <p>{t('legal.email')}: <a href="mailto:thomasprassel@googlemail.com">thomasprassel@googlemail.com</a></p>
    </section>
  </main>
}
