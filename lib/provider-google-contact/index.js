// # papiel-core

// A node.js application powering the Core of the Papiel infrastructure
// This library exposes the core handlers, models and middleware
module.exports = {
  // Handlers
  handlers: {
    credits: function (req, res, next) { res.send("CREDIT"); next() }
  },
  // Models
  models: {
  },
  // Middleware
  middleware: {
  },
  // Helpers
  helpers: {
  }
};
