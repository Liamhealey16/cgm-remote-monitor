'use strict';

function configure (app, wares, env, ctx) {
  var express = require('express'),
    api = express.Router( )
    ;

  api.use(wares.sendJSONStatus);
  api.use(wares.extensions([
    'json', 'svg', 'csv', 'txt', 'png', 'html', 'js'
  ]));

  api.use(ctx.authorization.isPermitted('api:status:read'));

  // Status badge/text/json
  api.get('/status', function (req, res) {
    var date = new Date();
    var info = { status: 'ok'
      , name: app.get('name')
      , version: app.get('version')
      , serverTime: date.toISOString()
      , serverTimeEpoch: date.getTime()
      , apiEnabled: app.enabled('api')
      , careportalEnabled: app.enabled('api') && env.settings.enable.indexOf('careportal') > -1
      , boluscalcEnabled: app.enabled('api') && env.settings.enable.indexOf('boluscalc') > -1
      , settings: env.settings
      , extendedSettings: app.extendedClientSettings
      , authorized: ctx.authorization.authorize(req.query.token || '')
    };

    var badge = 'http://img.shields.io/badge/Nightscout-OK-green';
    return res.format({
      html: function ( ) {
        res.send('<h1>STATUS OK</h1>');
      },
      png: function ( ) {
        res.redirect(302, badge + '.png');
      },
      svg: function ( ) {
        res.redirect(302, badge + '.svg');
      },
      js: function ( ) {
        var parts = ['this.serverSettings =', JSON.stringify(info), ';'];

        res.send(parts.join(' '));
      },
      text: function ( ) {
        res.send('STATUS OK');
      },
      json: function ( ) {
        res.json(info);
      }
    });
  });

  return api;
}
module.exports = configure;
