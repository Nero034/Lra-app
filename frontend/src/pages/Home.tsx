import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Home(){
  const [lists, setLists] = useState<any[]>([])
  const [nome, setNome] = useState('')

  async function load(){ setLists(await api.lists()) }
  async function create(){
    if (!nome.trim()) return
    await api.createList(nome.trim()); setNome(''); load()
  }
  useEffect(()=>{ load() }, [])

  const fixedOrder = ["Estoque","Retiradas","Saídas"]

  return <div>
    <h2>Listas</h2>
    <div style={{marginBottom:12}}>
      <input placeholder="Nome da nova lista" value={nome} onChange={e=>setNome((e.target as HTMLInputElement).value)} />
      <button onClick={create}>Criar</button>
    </div>
    <div>
      <h3>Fixas</h3>
      <ul>
        {fixedOrder.map(f=>{
          const found = lists.find(l=>l.nome===f)
          return <li key={f}><Link to={`/lista/${encodeURIComponent(f)}`}>{f} {found?.fixa ? <span className="badge">fixa</span> : null}</Link></li>
        })}
      </ul>
      <h3>Outras</h3>
      <ul>
        {lists.filter(l=>!l.fixa).map(l=>(
          <li key={l._id}><Link to={`/lista/${encodeURIComponent(l.nome)}`}>{l.nome}</Link></li>
        ))}
      </ul>
    </div>
  </div>
}
