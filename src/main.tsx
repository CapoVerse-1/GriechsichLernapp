import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { KilianMessagePopup } from './components/KilianMessagePopup'
import { AppProvider } from './state/AppContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
      <KilianMessagePopup />
    </AppProvider>
  </React.StrictMode>,
)
