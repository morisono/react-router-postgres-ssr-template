import React from 'react'
import ReactDOM from 'react-dom/client'
import EmailTestForm from './components/EmailTestForm'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-50 py-12">
      <EmailTestForm />
    </div>
  </React.StrictMode>,
)