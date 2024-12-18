
import './App.css'

import {BrowserRouter} from "react-router-dom"

import AppRoutes from './routes/AppRoutes'
import { RecoilRoot } from 'recoil'
import { AuthProvider } from './contexts/useAuth'
function App() {
  

  return (
    <RecoilRoot>
        <AuthProvider>
         <BrowserRouter>
         <AppRoutes/>
         </BrowserRouter>

        </AuthProvider>
      </RecoilRoot>
  
   
  )
}

export default App
