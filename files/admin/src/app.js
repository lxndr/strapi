/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */
import 'babel-polyfill';

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import _ from 'lodash';
import 'sanitize.css/sanitize.css';

import LanguageProvider from 'containers/LanguageProvider';

import App from 'containers/App';
import { showNotification } from 'containers/NotificationProvider/actions';
import { pluginLoaded, updatePlugin } from 'containers/App/actions';

import configureStore from './store';
import { translationMessages, languages } from './i18n';

// Create redux store with history
const initialState = {};
const history = createHistory();
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

/**
 * Public Strapi object exposed to the `window` object
 */

/**
 * Register a plugin
 *
 * @param params
 */
const registerPlugin = (plugin) => {
  const formattedPlugin = plugin;

  // Add routes
  // Initial list of routes
  const homeRoute = rootRoute.childRoutes[0];
  const pluginsRoute = _.find(homeRoute.childRoutes, { name: 'plugins' });

  // Create a new prefixed route for each plugin routes
  if (formattedPlugin && formattedPlugin.routes) {
    formattedPlugin.routes.forEach((route) => {
      pluginsRoute.childRoutes.push({
        path: `/plugins/${formattedPlugin.id}${route.path}`,
        name: `plugins_${formattedPlugin.id}_${route.name}`,
        getComponent: route.getComponent,
      });
    });
  }

  // Merge admin translation messages
  _.merge(translationMessages, formattedPlugin.translationMessages);

  formattedPlugin.leftMenuSections = formattedPlugin.leftMenuSections || [];

  store.dispatch(pluginLoaded(formattedPlugin));
};

const displayNotification = (message, status) => {
  store.dispatch(showNotification(message, status));
};

const port = window.Strapi && window.Strapi.port ? window.Strapi.port : 1337;
const apiUrl = window.Strapi && window.Strapi.apiUrl ? window.Strapi.apiUrl : `http://localhost:${port}`;

window.Strapi = {
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
  port,
  apiUrl,
  refresh: (pluginId) => ({
    translationMessages: (translationMessagesUpdated) => {
      render(_.merge({}, translationMessages, translationMessagesUpdated));
    },
    leftMenuSections: (leftMenuSectionsUpdated) => {
      store.dispatch(updatePlugin(pluginId, 'leftMenuSections', leftMenuSectionsUpdated));
    },
  }),
  // router: browserHistory,
  languages,
};

const dispatch = store.dispatch;
export {
  dispatch,
};
