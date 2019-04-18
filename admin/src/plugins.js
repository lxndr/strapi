// console.log(window);
const injectReducer = require('./utils/injectReducer').default;
const injectSaga = require('./utils/injectSaga').default;
const { languages } = require('./i18n');

window.strapi = Object.assign(window.strapi || {}, {
  node: MODE || 'host',
  backendURL: BACKEND_URL,
  languages,
  currentLanguage:
    window.localStorage.getItem('strapi-admin-language') ||
    window.navigator.language ||
    window.navigator.userLanguage ||
    'en',
  injectReducer,
  injectSaga,
});

module.exports = {
  documentation: require('../../../strapi-plugin-documentation/admin/dist/strapi-plugin-documentation.esm.js')
    .default,
  'content-manager': require('../../../strapi-plugin-content-manager/admin/dist/strapi-plugin-content-manager.esm.js')
    .default,
  'content-type-builder': require('../../../strapi-plugin-content-type-builder/admin/dist/strapi-plugin-content-type-builder.esm.js')
    .default,
  email: require('../../../strapi-plugin-email/admin/dist/strapi-plugin-email.esm.js')
    .default,
  'users-permissions': require('../../../strapi-plugin-users-permissions/admin/dist/strapi-plugin-users-permissions.esm.js')
    .default,
  upload: require('../../../strapi-plugin-upload/admin/dist/strapi-plugin-upload.esm.js')
    .default,
};
