import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import ListView from './pages/ListView'
import CameraUpload from './pages/CameraUpload'
import Settings from './pages/Settings'
import { setAuthToken } from './services/api'

export default function App(){
  const [token, setToken] = useState<string|null>(null)
  const nav = useNavigate()

  useEffect(()=>{
    const t = sessionStorage.getItem('token')
    if (t) { setToken(t); setAuthToken(t) }
    const onActivity = () => sessionStorage.setItem('lastActive', Date.now().toString())
    window.addEventListener('mousemove', onActivity)
    window.addEventListener('keydown', onActivity)
    const interval = setInterval(()=>{
      const last = Number(sessionStorage.getItem('lastActive') || 0)
      if (token && Date.now() - last > 30*60*1000) {
        alert('Sessão expirada por inatividade. Faça login novamente.')
        sessionStorage.removeItem('token'); setToken(null); nav('/login')
      }
    }, 60*1000)
    return ()=>{ window.removeEventListener('mousemove', onActivity); window.removeEventListener('keydown', onActivity); clearInterval(interval) }
  }, [token])

  if (!token) {
    return <Routes>
      <Route path="*" element={<Login onLogin={(t)=>{ setToken(t); setAuthToken(t); sessionStorage.setItem('token', t); sessionStorage.setItem('lastActive', Date.now().toString()); }} />} />
    </Routes>
  }

  return (
    <div>
      <header>
        <nav className="container">
          <Link to="/">Início</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/settings">Configurações</Link>
          <button style={{float:'right'}} onClick={()=>{ sessionStorage.removeItem('token'); setToken(null); }}>Sair</button>
        </nav>
      </header>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lista/:nome" element={<ListView />} />
          <Route path="/upload" element={<CameraUpload />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  )
}
