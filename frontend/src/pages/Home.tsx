import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Globe } from 'lucide-react'

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-500" />
              <span className="font-bold text-xl">Atlassian</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Link to="#" className="text-sm font-medium hover:text-blue-500 transition-colors">Products</Link>
              <Link to="#" className="text-sm font-medium hover:text-blue-500 transition-colors">Solutions</Link>
              <Link to="#" className="text-sm font-medium hover:text-blue-500 transition-colors">Resources</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <form className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search"
                  className="pl-8 pr-4 py-2 w-64 rounded-full bg-gray-100 focus:bg-white transition-colors"
                />
              </div>
            </form>
            <Link to="/login" className=" space-x-4 flex text-sm font-medium hover:text-blue-500 transition-colors">
            <Button variant="ghost">Log in</Button>
            </Link>
           
            <Link to="/signup" className=" space-x-4 flex text-sm font-medium hover:text-blue-500 transition-colors">
            <Button variant="ghost">Sign Up </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-blue-50 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Unleash the potential of every team
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Powerful tools for collaboration, project management, and productivity. Designed for teams of all sizes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="w-full sm:w-auto">
                  Start for free
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See all products
                </Button>
              </div>
            </div>
          </div>
        </section>

    


        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Atlassian for teams of all sizes and stages
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Whether you're a small startup or a large enterprise, we have solutions to fit your needs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['Startups', 'Small Business', 'Enterprise'].map((category) => (
                  <div key={category} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">{category}</h3>
                    <Button variant="outline" className="w-full">
                      Learn more
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Jira Software</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Confluence</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Trello</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Bitbucket</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Technical Support</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Purchasing & Licensing</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Atlassian Community</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Knowledge Base</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-blue-400 transition-colors">About Atlassian</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Events</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <Link to="#" className="text-white hover:text-blue-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link to="#" className="text-white hover:text-blue-400 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400">
            <p>&copy; 2023 Atlassian. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

