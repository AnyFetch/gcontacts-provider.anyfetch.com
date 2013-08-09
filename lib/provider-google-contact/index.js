// # papiel-core

// A node.js application powering the Core of the Papiel infrastructure
// This library exposes the core handlers, models and middleware
module.exports = {
  // Handlers
  handlers: {
    init: require('./handlers/init.js'),
    retrieve: require('./handlers/retrieve.js'),
  },
  // Models
  models: {
    Token: require('./models/token.js')
  },
  // Middleware
  middleware: {
  },
  // Helpers
  helpers: {
  }
};
