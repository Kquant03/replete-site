import { metadata, pneumaJsonLd } from './metadata'
import ClientLayout from './ClientLayout'

export { metadata }

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pneumaJsonLd) }}
      />
      <ClientLayout>{children}</ClientLayout>
    </>
  )
}