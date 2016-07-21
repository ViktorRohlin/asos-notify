var fs = require('fs'),
  request = require('request'),
  cheerio = require('cheerio'),
  path = require('path'),
  _ = require('lodash'),
  notifier = require('node-notifier'),
  JsonDB = require('node-json-db'),
  opn = require('opn'),
  connect = require('connect'),
  serveStatic = require('serve-static'),
  tcpPortUsed = require('tcp-port-used'),
  db = new JsonDB("asosDataBase", true, true);


// const
var url = 'https://marketplace.asos.com/men/just-in?tab=boutique&f:condition=12109&ctaref=mktp|mw|nav|justin|vintage#tab=boutique&f:condition=12109&ctaref=mktp%7Cmw%7Cnav%7Cjustin%7Cvintage&f:brand=10377',
  list = [];

function scrape() {

  console.log('scrape time!');

  request(url, function(error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      $('.itemList li .item ').each(function(i, element) {
        var el = $(this);
        var img = el.find('.image img').attr('src');
        var price = el.find('.price .actual-price .integer').text() + " " + el.find('.price .actual-price .symbol').text();
        var link = el.find('.title a').eq(0).attr('href');

        var obj = {
          image: img,
          price: price,
          link: 'https://marketplace.asos.com/' + link
        };

        list.push(obj);
      })
      inspect();
      startServer();
    }
  });
};



function startServer() {
  tcpPortUsed.check(1337, 'localhost').then(function(inUse) {
    console.log(inUse);
    if (!inUse) {
      connect().use(serveStatic(__dirname)).listen(1337, function() {
        console.log('Server running on 1337...');
      });
    }
  });
};


function difference(array) {
  var rest = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));

  var containsEquals = function(obj, target) {
    if (obj == null) return false;
    return _.any(obj, function(value) {
      return _.isEqual(value, target);
    });
  };

  return _.filter(array, function(value) {
    return !containsEquals(rest, value);
  });
};

function compareData(newItems, oldItems) {
  var diff = newItems.filter(function(current) {
    return oldItems.filter(function(current_a) {
      return current_a.link == current.link
    }).length == 0
  });

  if (diff.length > 0) {
    console.log(diff.length + ' new items');
    // setup json
    db.push('/adidas_new', diff);
    db.push('/adidas', diff.concat(oldItems));

    

    // notify
    notifyNewITems(diff.length);
  } else {
    console.log('nothing new :(');
    db.push('/adidas_new', {});
  }
};

function inspect() {
  console.log('inspecting');
  try {
    var data = db.getData("/adidas");;
    compareData(list, data);
  } catch (error) {
    console.log(error);
    if (error.name == 'dataError') {
      db.push("/adidas", []);
    }
  }
};

function notifyNewITems(newItemCount) {
  notifier.notify({
    title: 'Asos Adidas',
    message: newItemCount + ' new pieces of adidas swag',
    icon: path.join(__dirname, '/assets/logo.png'), // Absolute path (doesn't work on balloons)
    sound: true, // Only Notification Center or Windows Toasters
    wait: true // Wait with callback, until user action is taken against notification
  }, function(err, response) {
    // Response is response from notification
  });

  notifier.on('click', function(notifierObject, options) {
    opn('localhost:1337/web');
  });
}


// kick off

var mins = 5,
  the_interval = mins * 60 * 1000;
setInterval(function() {
  scrape();
}, the_interval);

scrape();
