
import './App.css'
import { Main } from './components/Main'
import { Navbar } from './components/Navbar'
import { Toaster } from "./components/ui/toaster";



function App() {

  return (
    <div>
      <Navbar />
      <Main />
      <Toaster />
    </div>
  )
}

export default App
