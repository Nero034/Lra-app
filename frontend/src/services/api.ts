import axios from 'axios'
const API = axios.create({ baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:8000' })

export function setAuthToken(token: string){
  API.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const api = {
  login: (username: string, password: string) => API.post('/login', {username, password}).then(r=>r.data),
  lists: () => API.get('/lists').then(r=>r.data),
  createList: (nome: string) => API.post('/lists', {nome}).then(r=>r.data),
  itemsByLista: (lista: string) => API.get(`/items/${encodeURIComponent(lista)}`).then(r=>r.data),
  processImage: (b64: string, lista='Estoque') => API.post('/process-image', {image_base64: b64, lista_origem: lista}).then(r=>r.data),
  saveManual: (payload:any) => API.post('/save-manual-item', payload).then(r=>r.data),
  moveRetirada: (item_id:string, quantidade?:number) => API.post('/move/retiradas', {item_id, quantidade}).then(r=>r.data),
  moveSaida: (item_id:string, quantidade?:number) => API.post('/move/saidas', {item_id, quantidade}).then(r=>r.data),
  getConfig: () => API.get('/config').then(r=>r.data),
  setConfig: (payload:any) => API.post('/config', payload).then(r=>r.data),
}
