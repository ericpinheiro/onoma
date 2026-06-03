import Link from 'next/link'
import MarketingNav from '@/components/layout/MarketingNav/MarketingNav'
import Button from '@/components/ui/Button/Button'
import styles from './page.module.scss'

export default function HomePage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.pill}>
            <span className={styles.pillDot} />
            Novo: importação automática toda terça-feira
          </div>
          <h1 className={styles.heroTitle}>
            Monitore suas marcas no INPI sem esforço
          </h1>
          <p className={styles.heroSub}>
            O Onoma importa a RPI semanalmente e notifica você em tempo real sobre
            mudanças de status. Sem planilhas, sem surpresas.
          </p>
          <div className={styles.heroCta}>
            <Link href="/signup">
              <Button size="lg">Começar gratuitamente</Button>
            </Link>
            <Link href="#como-funciona">
              <Button variant="secondary" size="lg">Como funciona</Button>
            </Link>
          </div>
        </div>

        <div className={styles.mockWrap}>
          <div className={styles.mockGlow} />
          <div className={styles.mock}>
            <div className={styles.mockBar}>
              <div className={styles.mockDot} />
              <div className={styles.mockDot} />
              <div className={styles.mockDot} />
            </div>
            <div className={styles.mockBody}>
              <div className={styles.mockSidebar}>
                {['Visão geral', 'Marcas', 'Billing', 'Logs RPI'].map((item, i) => (
                  <div key={item} className={[styles.mockSideItem, i === 0 ? styles.active : ''].filter(Boolean).join(' ')}>
                    {item}
                  </div>
                ))}
              </div>
              <div className={styles.mockContent}>
                <div className={styles.mockKpis}>
                  {[
                    { label: 'Marcas ativas', val: '24' },
                    { label: 'Atualizações', val: '3' },
                    { label: 'Custo/mês', val: 'R$28' },
                  ].map(({ label, val }) => (
                    <div key={label} className={styles.mockKpi}>
                      <div className={styles.mockKpiLabel}>{label}</div>
                      <div className={styles.mockKpiValue}>{val}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.mockTable}>
                  <div className={styles.mockTh}>
                    <span>Processo</span><span>Nome</span><span>Status</span>
                  </div>
                  {[
                    { p: '910123456', n: 'Marca Alfa', s: 'Deferido', v: 'success' },
                    { p: '910234567', n: 'Beta Corp', s: 'Em análise', v: 'info' },
                    { p: '910345678', n: 'Gama Trade', s: 'Oposição', v: 'warn' },
                  ].map(({ p, n, s, v }) => (
                    <div key={p} className={styles.mockTr}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{p}</span>
                      <span>{n}</span>
                      <span className={[styles.mockBadge, styles[v]].join(' ')}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.steps} id="como-funciona">
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Como funciona</p>
            <h2 className={styles.sectionTitle}>Simples como deve ser</h2>
          </div>
          <div className={styles.stepsGrid}>
            {[
              {
                n: '01',
                title: 'Cadastre seus processos',
                desc: 'Informe os números de processo do INPI que deseja monitorar. Você pode adicionar quantos quiser.',
              },
              {
                n: '02',
                title: 'Importamos a RPI automaticamente',
                desc: 'Toda terça-feira importamos a Revista da Propriedade Industrial e verificamos mudanças de status.',
              },
              {
                n: '03',
                title: 'Receba notificações em tempo real',
                desc: 'Quando alguma marca mudar de status, você é notificado imediatamente via webhook ou email.',
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className={styles.step}>
                <div className={styles.stepNum}>{n}</div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing} id="precos">
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Preços</p>
            <h2 className={styles.sectionTitle}>Pague só pelo que usar</h2>
          </div>
          <div className={styles.pricingGrid}>
            <div className={`${styles.pricingCard} ${styles.featured}`}>
              <p className={styles.pricingLabel}>Monitoramento de marcas</p>
              <div className={styles.pricingPrice}>
                R$0,30 <span className={styles.pricingUnit}>/marca/mês</span>
              </div>
              <p className={styles.pricingDesc}>
                Cada marca monitorada gera até 4 consultas de status por mês.
                Você paga apenas pelas marcas ativas.
              </p>
              <div className={styles.pricingItems}>
                {[
                  'Importação semanal da RPI',
                  'Histórico completo de status',
                  'Alertas via webhook',
                  'API REST inclusa',
                ].map((item) => (
                  <div key={item} className={styles.pricingItem}>{item}</div>
                ))}
              </div>
            </div>
            <div className={styles.pricingCard}>
              <p className={styles.pricingLabel}>Calculadora</p>
              <p className={styles.stepDesc} style={{ marginBottom: 24, color: 'var(--fg-muted)' }}>
                Estime seu custo mensal com base no número de marcas monitoradas.
              </p>
              <PricingCalculatorStatic />
            </div>
          </div>
        </div>
      </section>

      {/* API */}
      <section className={styles.api} id="api">
        <div className="container">
          <div className={styles.apiGrid}>
            <div>
              <p className={styles.eyebrow}>API REST</p>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>
                Integre com sua stack
              </h2>
              <p className={styles.stepDesc} style={{ marginBottom: 24 }}>
                Acesse todos os dados via API REST com autenticação JWT.
                Consulte marcas, históricos e configure webhooks programaticamente.
              </p>
              <Link href="/signup">
                <Button>Obter chave de API</Button>
              </Link>
            </div>
            <div className={styles.apiCode}>
              <pre className={styles.apiCodePre}><span className={styles.apiCodeComment}># Listar marcas monitoradas
</span>{`curl `}<span className={styles.apiCodeStr}>{`"https://onoma.up.railway.app/trademarks"`}</span>{`
  -H `}<span className={styles.apiCodeStr}>{`"Authorization: Bearer $TOKEN"`}</span>{`

`}<span className={styles.apiCodeComment}># Resposta
</span>{`{
  `}<span className={styles.apiCodeKey}>{`"items"`}</span>{`: [
    {
      `}<span className={styles.apiCodeKey}>{`"id"`}</span>{`: `}<span className={styles.apiCodeStr}>{`"uuid"`}</span>{`,
      `}<span className={styles.apiCodeKey}>{`"process_number"`}</span>{`: `}<span className={styles.apiCodeStr}>{`"910123456"`}</span>{`,
      `}<span className={styles.apiCodeKey}>{`"current_status"`}</span>{`: `}<span className={styles.apiCodeStr}>{`"Deferido"`}</span>
{`    }
  ]
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Comece hoje, sem cartão de crédito</h2>
          <p className={styles.ctaSub}>
            Monitore suas primeiras marcas gratuitamente. Pague só quando precisar de mais.
          </p>
          <Link href="/signup">
            <Button style={{ background: '#fff', color: '#000' }} size="lg">
              Criar conta gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <span className={styles.footerCopy}>© 2025 Onoma. Todos os direitos reservados.</span>
          <div className={styles.footerLinks}>
            <Link href="#" className={styles.footerLink}>Privacidade</Link>
            <Link href="#" className={styles.footerLink}>Termos</Link>
            <Link href="#api" className={styles.footerLink}>API</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

function PricingCalculatorStatic() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div className={styles.calcLabel}>Marcas monitoradas: <strong>24</strong></div>
        <input type="range" min={1} max={200} defaultValue={24} className={styles.calcInput} disabled />
      </div>
      <div className={styles.calcTotal}>
        <span className={styles.calcTotalLabel}>Total estimado/mês</span>
        <div>
          <div className={styles.calcTotalVal}>R$7,20</div>
          <div className={styles.calcSub}>24 × R$0,30</div>
        </div>
      </div>
    </div>
  )
}
