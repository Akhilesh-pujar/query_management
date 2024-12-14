import { Link } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="bg-gray-800 text-white p-4">
        <nav>
          <Link to="/" className="text-xl font-bold">
            Ticket Manager
          </Link>
        </nav>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
