
import './App.css'

import {BrowserRouter, Routes, Route} from "react-router-dom"
import Home from "./pages/Home"
import Query from './pages/Query'
import Login from './pages/Login'
import Signup from './pages/Signup'
function App() {
  

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/query/:id' element={<Query/>}/>
    </Routes>
    </BrowserRouter>
   
  )
}

export default App
