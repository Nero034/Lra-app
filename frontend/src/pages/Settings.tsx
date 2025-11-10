import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Settings(){
  const [key, setKey] = useState('')
  const [status, setStatus] = useState<any>(null)

  async function load(){ setStatus(await api.getConfig()) }
  useEffect(()=>{ load() }, [])

  async function save(){
    await api.setConfig({ openai_api_key: key })
    setKey(''); load(); alert('Configurações salvas.')
  }

  return <div>
    <h2>Configurações</h2>
    <p>OpenAI API Key definida? <b>{status?.OPENAI_API_KEY_SET ? 'Sim' : 'Não'}</b></p>
    <input placeholder="Nova OpenAI API Key" value={key} onChange={e=>setKey((e.target as HTMLInputElement).value)} />
    <button onClick={save}>Salvar</button>
  </div>
}
