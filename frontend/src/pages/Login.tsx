import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Login({ onLogin } : any){
const [u, setU] = useState('')
const [p, setP] = useState('')
  const nav = useNavigate()
  async function handle(){
    try{
      const res = await api.login(u,p)
      onLogin(res.access_token)
      nav('/')
    }catch(e:any){
      alert(e?.response?.data?.detail || 'Erro de login')
    }
  }
  return <div style={{maxWidth:420, margin:'40px auto'}}>
    <h2>Login</h2>
    <input placeholder="Usuário" value={u} onChange={e=>setU((e.target as HTMLInputElement).value)} />
    <input type="password" placeholder="Senha" value={p} onChange={e=>setP((e.target as HTMLInputElement).value)} />
    <button onClick={handle}>Entrar</button>
  </div>
}
