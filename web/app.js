var app = {
  clothes: null,

  init: function() {
    this.getData();
    setTimeout(function() {
      app.fakeloadtimer = true;
      app.loadCheck();
    }, 1000);
  },

  getData: function() {
    $.ajax({
      cache: false,
      url: "../asosDataBase.json",
      dataType: "json",
      success: function(data) {
        console.log('data', data);
        app.clothes = data;
        app.loadCheck();
      }
    });
  },

  loadCheck: function() {
    if (app.fakeloadtimer && app.clothes) {
      app.switchState();
    }
  },

  switchState: function() {
    var loader = document.getElementById('js-loader');
    loader.addEventListener('webkitTransitionEnd', app.render);
    loader.classList.remove('is-visible');
  },

  render: function() {
    console.log('app', app.clothes);
    var anchor = document.getElementById('js-body');
    var el = document.createElement('ul');
    el.className = 'item-list';

    app.renderList(el, app.clothes.adidas_new, function() {
      anchor.appendChild(el);
      setTimeout(function() {
        el.classList.add('is-visible');
      }, 50)
    });
  },

  renderList: function(anchor, array, callback) {
    var html = "";
    _.each(array, function(item) {
      var _item = document.createElement('li');
      _item.className = 'list-item';
      
      var html = '<div class="list-item--image" style="background-image:url(' + item.image + ');"></div>' +
        '<div class="list-item--meta">' +
        '<span class="list-item--meta--price">' + item.price + '</span>' +
        '</div>';

      _item.innerHTML = html;

      _item.addEventListener('click', function(){
        
        window.open(item.link ,'_blank');
      });
       console.log('el', _item);
      anchor.appendChild(_item);
    });
    callback();
  }
};


$(document).ready(function() {
  app.init();
})
