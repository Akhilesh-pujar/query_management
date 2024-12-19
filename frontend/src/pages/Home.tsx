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
              <span className="font-bold text-xl">query_management</span>
            </Link>
            
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
                Welcome to query management application 
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Please signup to see the query management working
              </p>
            
            </div>
          </div>
        </section>

    


        <section className="py-20">
      
        </section>
      </main>

 
    </div>
  )
}

export default Home

