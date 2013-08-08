// # config/routes

// Routes client requests to handlers
module.exports = function router (server, handlers) {
  'use strict';
  
  // Connection phase
  server.get('/credits', handlers.credits);
};
