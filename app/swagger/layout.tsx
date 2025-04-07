import Footer from '@/components/ui/footer'

export default function SwaggerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="relative flex min-h-screen bg-slate-900 flex-col">
        {children}
        <Footer />
      </div>
    </>
  )
} 