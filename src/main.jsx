import React from 'react'
import { createRoot, ReactDOM } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'
import WebFont from 'webfontloader'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

const router = createBrowserRouter([
    {
        path: '/*',
        element: <App />,
    },
])

Sentry.init({
    dsn: 'https://d048e5af08fb42eea06fc5d72c033bcd@o1037119.ingest.sentry.io/6004826',
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
})

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)

WebFont.load({
    google: {
        families: [
            'IBM Plex Mono:400',
            'Space Mono',
            'Manrope:400',
            'Lato:400',
            'Sora:300,400,500,600,700',
            'Inter',
            'Nunito Sans:300,400,700',
            'IBM Plex Sans',
            'Poppins',
            'Montserrat',
            'Open Sans',
            'Roboto',
            'sans-serif',
        ],
    },
})

serviceWorker.unregister()
