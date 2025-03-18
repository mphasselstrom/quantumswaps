import DocSidebar from '@/components/documentation/sidebar'
import Footer from '@/components/ui/footer'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="relative flex min-h-screen bg-slate-900">
        <DocSidebar />
        <main className="grow">
          {children}
        </main>
      </div>
      <Footer />
    </>
  )
} 