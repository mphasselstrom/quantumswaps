'use client'

type TocItem = {
  id: string
  title: string
  level?: number
}

interface TocProps {
  items: TocItem[]
}

export default function TableOfContents({ items }: TocProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="hidden xl:block fixed z-20 inset-0 top-[3.8125rem] right-[max(0px,calc(50%-45rem))] left-auto w-[19.5rem] pb-10 px-8 overflow-y-auto bg-slate-900">
      <div className="pt-10 pb-8">
        <h5 className="mb-4 font-semibold text-slate-200">On this page</h5>
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.id} className={item.level === 2 ? 'ml-4' : ''}>
              <button 
                onClick={() => scrollToSection(item.id)}
                className="text-slate-400 hover:text-slate-300 text-left"
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 