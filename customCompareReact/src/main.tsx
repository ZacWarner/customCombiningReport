import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Navbar from './components/navbar'
import './index.css'
import { ThemeProvider } from '@mui/material/styles';
import psomasTheme from './theme';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider theme={psomasTheme}>
    <React.StrictMode>
      <Navbar />
      <App />
    </React.StrictMode>
  </ThemeProvider>
)
