'use strict';

/**
 * Extract the value after the "#".
 * For instance, "http://schemas.google.com/g/2005#mobile" becomes "mobile".
 * 
 * @param {String} val Value to extract. It is assumed it contains a hashbang.
 * @return {String} Value after the hashbang.
 */

var postHashbang = function(val) {
  return val.substr(val.indexOf('#') + 1);
};

// Takes as param a contact as returned by Google Contact API.
// Returns a POJO.
module.exports = function (c) {
  var r = {};

  // Extract meaningful datas
  r.id = c.id['$t'];

  if(c['gd$name']){
    if(c['gd$name']['gd$fullName']) {
      r.name = c['gd$name']['gd$fullName']['$t'];
    }
    if(c['gd$name']['gd$givenName']) {
      r.given_name = c['gd$name']['gd$givenName']['$t'];
    }
    if(c['gd$name']['gd$familyName']) {
      r.family_name = c['gd$name']['gd$familyName']['$t'];
    }
  }

  if (c['gd$email']) {
    r.emails = c['gd$email'].map(function(m) {
      return m.address;
    });
  }

  if(c['gd$phoneNumber']) {
    r.phones = c['gd$phoneNumber'].map(function(p) {
      return p['$t'];
    });
  }

  if(c['gd$im']) {
    r.im = c['gd$im'].map(function(p) {
      return {
        'address': p.address,
        'protocol': postHashbang(p.protocol)
      };
    });
  }

  if (c['gContact$birthday']) {
    r.birthday = new Date(c['gContact$birthday'].when);
  }

  if (c['gContact$website']) {
    r.websites = c['gContact$website'].map(function(w) {
      return w.href;
    });
  }

  // Compute additional datas
  var re = new RegExp('/([^/]+\\%40[^/]+)/.+/([0-9a-f]+)$');
  var results = re.exec(r.id);
  r.url = 'https://mail.google.com/mail/b/' + results[1].replace('%40', '@') + '/#contact/' + results[2];


  if(r.family_name === 'Villard') {
    console.log(require('util').inspect(c, {depth:50}));
    console.log(r);
  }

  return r;
};
