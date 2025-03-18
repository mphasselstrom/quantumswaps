import Link from 'next/link'
import Logo from './logo'
import MobileMenu from './mobile-menu'

export default function Header() {
  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Site branding */}
          <div className="flex-1">
            <Logo />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">

            {/* Desktop menu links */}
            <ul className="flex grow justify-center flex-wrap items-center">
              {/* Menu items have been removed */}
            </ul>

          </nav>

          {/* Desktop sign in links */}
          <ul className="flex-1 flex justify-end items-center">
            {/* Sign in and Sign up links have been removed */}
          </ul>

          <MobileMenu />

        </div>
      </div>
    </header>
  )
}
