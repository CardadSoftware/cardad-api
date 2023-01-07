const oauth2 = require("oauth2orize");
const { AuthorizationCode } = require("oauth2orize");
var express = require('express');

var router = express.Router();

var server = oauth2.createServer();

server.grant(oauth2.grant.code(function(client, redirectURI, user, ares, done) {
    var code = utils.uid(16);
  
    var ac = new AuthorizationCode(code, client.id, redirectURI, user.id, ares.scope);
    ac.save(function(err) {
      if (err) { return done(err); }
      return done(null, code);
    });
  }));

  server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
    AuthorizationCode.findOne(code, function(err, code) {
      if (err) { return done(err); }
      if (client.id !== code.clientId) { return done(null, false); }
      if (redirectURI !== code.redirectUri) { return done(null, false); }
  
      var token = utils.uid(256);
      var at = new AccessToken(token, code.userId, code.clientId, code.scope);
      at.save(function(err) {
        if (err) { return done(err); }
        return done(null, token);
      });
    });
  }));

  router.get('/dialog/authorize',
  login.ensureLoggedIn(),
  server.authorize(function(clientID, redirectURI, done) {
    Clients.findOne(clientID, function(err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      if (client.redirectUri != redirectURI) { return done(null, false); }
      return done(null, client, client.redirectURI);
    });
  }),
  function(req, res) {
    res.render('dialog', { transactionID: req.oauth2.transactionID,
                           user: req.user, client: req.oauth2.client });
  });

router.post('/dialog/authorize/decision',
login.ensureLoggedIn(),
server.decision());

module.routes = router;
module.exports = server;