import Logo from './logo'

export default function Footer() {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Centered content */}
        <div className="py-8 md:py-12 text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <div className="text-sm text-slate-300">© quantumswaps.xyz - All rights reserved.</div>
          
          {/* Social links removed */}
        </div>

      </div>
    </footer>
  )
}
