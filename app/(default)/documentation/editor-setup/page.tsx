'use client'

import Link from 'next/link'
import DocSidebar from '@/components/documentation/sidebar'
import TableOfContents from '@/components/documentation/toc'

export default function EditorSetup() {
  const tocItems = [
    { id: 'vscode', title: 'Visual Studio Code', level: 1 },
    { id: 'intellij', title: 'IntelliJ IDEA', level: 1 },
    { id: 'vim', title: 'Vim/Neovim', level: 1 },
  ]
  
  return (
    <div className="bg-white">
      <div className="flex flex-col lg:flex-row">
        {/* Left sidebar */}
        <DocSidebar />

        {/* Main content */}
        <div className="flex-1 xl:flex xl:justify-between">
          <div className="min-w-0 flex-1 max-w-3xl px-4 sm:px-6 xl:px-8 py-10 lg:py-16">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Editor Setup</h1>
              <p className="text-lg text-gray-600">
                Setting up your editor for the best Quantum Swaps development experience can improve your productivity and make coding more enjoyable.
                Here we'll cover the recommended extensions and configurations for popular editors.
              </p>
            </div>

            <div className="prose prose-blue max-w-none">
              <h2 id="vscode" className="text-2xl font-bold text-gray-900 mt-10 mb-4">Visual Studio Code</h2>
              <p className="mb-4">
                Visual Studio Code provides an excellent experience for working with Quantum Swaps. Here are the recommended extensions:
              </p>
              <ul className="mb-6 list-disc pl-6 text-gray-600">
                <li>Quantum Swaps Extension</li>
                <li>TypeScript and JavaScript Language Features</li>
                <li>Tailwind CSS IntelliSense</li>
                <li>ESLint</li>
                <li>Prettier - Code formatter</li>
              </ul>
              <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden">
                <div className="p-4 flex items-center text-xs text-gray-500 border-b border-gray-200">
                  <span>settings.json</span>
                </div>
                <div className="px-4 py-4">
                  <pre className="text-sm text-gray-800 font-mono">
{`{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}`}
                  </pre>
                </div>
              </div>

              <h2 id="intellij" className="text-2xl font-bold text-gray-900 mt-10 mb-4">IntelliJ IDEA</h2>
              <p className="mb-4">
                IntelliJ IDEA (or WebStorm) can also be configured for optimal Quantum Swaps development:
              </p>
              <ul className="mb-6 list-disc pl-6 text-gray-600">
                <li>Quantum Swaps Plugin (via JetBrains Marketplace)</li>
                <li>Tailwind CSS Plugin</li>
                <li>JavaScript and TypeScript</li>
                <li>ESLint</li>
                <li>Prettier</li>
              </ul>

              <h2 id="vim" className="text-2xl font-bold text-gray-900 mt-10 mb-4">Vim/Neovim</h2>
              <p className="mb-4">
                For Vim or Neovim users, you can set up a productive environment with these plugins:
              </p>
              <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden">
                <div className="p-4 flex items-center text-xs text-gray-500 border-b border-gray-200">
                  <span>init.vim / .vimrc</span>
                </div>
                <div className="px-4 py-4">
                  <pre className="text-sm text-gray-800 font-mono">
{`" Recommended plugins
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'pangloss/vim-javascript'
Plug 'leafgarland/typescript-vim'
Plug 'peitalin/vim-jsx-typescript'
Plug 'styled-components/vim-styled-components'

" Install coc extensions
let g:coc_global_extensions = [
  \\ 'coc-tsserver',
  \\ 'coc-eslint',
  \\ 'coc-prettier',
  \\ 'coc-quantum-swaps',
  \\ ]`}
                  </pre>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-8">
                <div className="flex justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Previous</span>
                    <Link href="/documentation" className="block mt-1 text-blue-600 hover:text-blue-800 font-medium">Installation</Link>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Next</span>
                    <Link href="/documentation/compatibility" className="block mt-1 text-blue-600 hover:text-blue-800 font-medium">Compatibility</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar (Table of Contents) */}
          <div className="hidden xl:block xl:flex-none xl:w-64">
            <div className="sticky top-0 pl-4 py-10 xl:py-16">
              <TableOfContents items={tocItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 