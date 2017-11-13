/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

/* eslint-disable */
// Retrieve remote and backend URLs.
const remoteURL = window.location.port === '4000' ? 'http://localhost:4000/admin' : process.env.REMOTE_URL || 'http://localhost:1337/admin';
const backendURL = process.env.BACKEND_URL || 'http://localhost:1337';

// Retrieve development URL to avoid to re-build.
const devFrontURL = document.getElementsByTagName('body')[0].getAttribute('front');
const devBackendURL = document.getElementsByTagName('body')[0].getAttribute('back');

import './public-path';
import 'babel-polyfill';

// Import all the third party stuff
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import { merge, isFunction } from 'lodash';
import 'sanitize.css/sanitize.css';
import 'whatwg-fetch';

import LanguageProvider from 'containers/LanguageProvider';

import App from 'containers/App';
import { showNotification } from 'containers/NotificationProvider/actions';
import { pluginLoaded, updatePlugin } from 'containers/App/actions';

import configureStore from './store';
import { translationMessages, languages } from './i18n';
/* eslint-enable */

// Create redux store with history
const initialState = {};
const history = createHistory({
  basename: (devFrontURL || remoteURL).replace(window.location.origin, ''),
});
const store = configureStore(initialState, history);

const render = (translatedMessages) => {
  ReactDOM.render(
    <Provider store={store}>
      <LanguageProvider messages={translatedMessages}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </LanguageProvider>
    </Provider>,
    document.getElementById('app')
  );
};

// Hot reloadable translation json files
if (module.hot) {
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept('./i18n', () => {
    render(translationMessages);
  });
}

// Chunked polyfill for browsers without Intl support
window.onload = function onLoad() {
  if (!window.Intl) {
    Promise.all([
      System.import('intl'),
      System.import('intl/locale-data/jsonp/en.js'),
      System.import('intl/locale-data/jsonp/fr.js'),
    ]).then(() => render(translationMessages));
  } else {
    render(translationMessages);
  }
};

// Don't inject plugins in development mode.
if (window.location.port !== '4000') {
  fetch(`${devFrontURL || remoteURL}/config/plugins.json`)
    .then(response => {
      return response.json();
    })
    .then(plugins => {
      const body = document.getElementsByTagName('body')[0];

      (plugins || []).forEach(plugin => {
        const script = document.createElement('script');
        script.src = plugin.source[process.env.NODE_ENV];

        body.appendChild(script);
      });
    })
    .catch(err => {
      console.log(err);
    });
}

/**
 * Public Strapi object exposed to the `window` object
 */

/**
 * Register a plugin
 *
 * @param params
 */
const registerPlugin = (plugin) => {
  // Merge admin translation messages
  merge(translationMessages, plugin.translationMessages);

  plugin.leftMenuSections = plugin.leftMenuSections || [];

  switch (true) {
    // Execute bootstrap function and check if plugin can be rendered
    case isFunction(plugin.bootstrap) && isFunction(plugin.pluginRequirements):
      plugin.pluginRequirements(plugin)
        .then(plugin => {
          return plugin.bootstrap(plugin);
        })
        .then(plugin => {
          store.dispatch(pluginLoaded(plugin));
        });
      break;
    // Check if plugin can be rendered
    case isFunction(plugin.pluginRequirements):
      plugin.pluginRequirements(plugin).then(plugin => {
        store.dispatch(pluginLoaded(plugin));
      });
      break;
    // Execute bootstrap function
    case isFunction(plugin.bootstrap):
      plugin.bootstrap(plugin).then(plugin => {
        store.dispatch(pluginLoaded(plugin));
      });
      break;
    default:
      store.dispatch(pluginLoaded(plugin));
  }
};

const displayNotification = (message, status) => {
  store.dispatch(showNotification(message, status));
};

window.strapi = Object.assign(window.strapi || {}, {
  remoteURL: devFrontURL || remoteURL,
  backendURL: devBackendURL || backendURL,
  registerPlugin,
  notification: {
    success: (message) => {
      displayNotification(message, 'success');
    },
    warning: (message) => {
      displayNotification(message, 'warning');
    },
    error: (message) => {
      displayNotification(message, 'error');
    },
    info: (message) => {
      displayNotification(message, 'info');
    },
  },
  refresh: (pluginId) => ({
    translationMessages: (translationMessagesUpdated) => {
      render(merge({}, translationMessages, translationMessagesUpdated));
    },
    leftMenuSections: (leftMenuSectionsUpdated) => {
      store.dispatch(updatePlugin(pluginId, 'leftMenuSections', leftMenuSectionsUpdated));
    },
  }),
  router: history,
  languages,
});

const dispatch = store.dispatch;
export {
  dispatch,
};
