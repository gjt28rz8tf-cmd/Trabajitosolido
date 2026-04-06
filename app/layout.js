import './globals.css'

export const metadata = {
  title: 'Surebet Scanner',
  description: 'Analizador de arbitraje deportivo con IA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
