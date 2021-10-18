import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'
import WebFont from 'webfontloader'
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://d048e5af08fb42eea06fc5d72c033bcd@o1037119.ingest.sentry.io/6004826",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
)

WebFont.load({
  google: {
    families: [
      'Sora:300,400,500,600,700',
      'Inter',
      'Nunito Sans:300,400,700',
      'IBM Plex Sans',
      'Poppins',
      'Montserrat',
      'Open Sans',
      'Roboto',
      'Space Mono',
      'sans-serif'
    ]
  }
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
