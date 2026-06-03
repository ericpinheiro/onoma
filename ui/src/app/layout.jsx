import '@/app/globals.scss'
import Providers from '@/contexts/Providers'

export const metadata = {
  title: 'Onoma — Monitoramento de Marcas INPI',
  description: 'Monitore suas marcas no INPI em tempo real. Receba alertas de mudanças de status e acompanhe todo o histórico.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
