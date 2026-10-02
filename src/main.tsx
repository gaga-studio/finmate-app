import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/global.css'
import { router } from './app/router'
import { DataSourceProvider } from './data/source'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataSourceProvider>
      <RouterProvider router={router} />
    </DataSourceProvider>
  </StrictMode>,
)
