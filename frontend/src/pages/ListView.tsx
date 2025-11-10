import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'

export default function ListView(){
  const { nome } = useParams()
  const [data, setData] = useState<any>({items:[], soma_total:0})

  async function load(){ setData(await api.itemsByLista(nome!)) }
  useEffect(()=>{ load() }, [nome])

  return <div>
    <h2>Lista: {nome}</h2>
    <table>
      <thead>
        <tr>
          <th>Quantidade</th><th>Nome</th><th>Fórmula</th><th>Conteúdo</th><th>Laboratório</th><th>Validade</th><th>Preço Unit.</th><th>Total</th><th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((it:any)=>(
          <tr key={it._id}>
            <td>{it.quantidade}</td>
            <td>{it.nome}</td>
            <td>{it.formula}</td>
            <td>{it.conteudo}</td>
            <td>{it.laboratorio}</td>
            <td>{it.validade}</td>
            <td>{Number(it.preco_unitario||0).toFixed(2)}</td>
            <td>{Number(it.total||0).toFixed(2)}</td>
            <td>
              {nome==="Estoque" && <>
                <button onClick={async()=>{ await api.moveSaida(it._id); load() }}>Saída</button>
                <button onClick={async()=>{ await api.moveRetirada(it._id); load() }}>Retirada</button>
              </>}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr><th colSpan={7} style={{textAlign:'right'}}>Soma Total</th><th>{Number(data.soma_total||0).toFixed(2)}</th><th></th></tr>
      </tfoot>
    </table>
  </div>
}
