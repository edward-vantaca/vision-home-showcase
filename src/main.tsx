import React from 'react'
import ReactDOM from 'react-dom/client'
import { UsabilityTestProvider } from '@vantaca/ux-testing-react'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UsabilityTestProvider ingestUrl={import.meta.env.VITE_UX_INGEST}>
      <App />
    </UsabilityTestProvider>
  </React.StrictMode>,
)
