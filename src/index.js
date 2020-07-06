import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import './App.css';
import * as serviceWorker from './serviceWorker';
import WebFont from 'webfontloader';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

WebFont.load({
  google: {
    families: [
      'Nunito Sans:300,400,700',
      'IBM Plex Sans',
      'Poppins',
      'Lobster',
      'Montserrat',
      'Roboto',
      'sans-serif',
    ],
  },
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
