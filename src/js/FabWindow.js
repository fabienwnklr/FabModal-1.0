var FabWindow = null;
var $window = null;
var $body = null;
(function () {
  'use strict';
  /**
   * 
   * @param {Object} options 
   */
  FabWindow = function (options) {
    $window = window;
    $body = document.querySelector('body');
    options = options || {};
    var defaults = {
      id: 'fab-window-' + Math.round(new Date().getTime() + (Math.random() * 100)),
      selectors: {
        modal: '.fab-window',
        header: '.fab-header',
        title: '.fab-title',
        body: '.fab-content',
        footer: '.fab-footer',
        maximize: '.maximize',
        reduce: '.reduce',
        close: '.close',
        loader: '.loader',
      },
      elements: {
        header: null,
        reduce: null,
        close: null,
        loader: null,
        body: null,
        footer: null
      },
      effects: {
        in: 'coming-in',
        out: 'coming-out'
      },
      draggable: false,
      maximized: false,
      minimized: false,
      maximizable: true,
      minimizable: true,
      title: 'Welcome to FabWindow',
      bodyContent: '<div class="loader"></div>',
      footerContent: '',
      loader: '<div class="loader"></div>'
    };
    this.options = Object.assign(defaults, options);
    this.initialize(this.options);
    return this;
  };

  /**
   */
  FabWindow.prototype.initialize = function (options) {
    this.$el = this.createWindow();

    this.$header = this.$el.querySelector(options.selectors.header);
    this.$title = this.$el.querySelector(options.selectors.title);
    this.$reduce = this.$el.querySelector(options.selectors.reduce);
    this.$close = this.$el.querySelector(options.selectors.close);
    this.$body = this.$el.querySelector(options.selectors.body);
    this.$footer = this.$el.querySelector(options.selectors.footer);

    this.setContent('body', options.bodyContent);
    this.setContent('footer', options.footerContent);

    $body.appendChild(this.$el);
    this.initHandlers();
  };

  FabWindow.prototype.createWindow = function () {
    var fabWindow = document.createElement('div');
    fabWindow.className = `fab-window ${this.options.effects.in}`;
    fabWindow.id = this.options.id;

    var fabWindowHeader = document.createElement('div');
    fabWindowHeader.className = 'fab-header';
    fabWindow.appendChild(fabWindowHeader);

    var fabWindowTitle = document.createElement('h1');
    fabWindowTitle.className = 'fab-title';
    fabWindowTitle.innerHTML = this.options.title;
    fabWindowHeader.appendChild(fabWindowTitle);

    var fabWindowIcons = document.createElement('div');
      fabWindowIcons.className = 'fab-icons';
      fabWindowHeader.appendChild(fabWindowIcons)

    if (this.options.minimizable) {
      var fabReduceWindow = document.createElement('button');
      fabReduceWindow.className = 'reduce';
      fabWindowIcons.appendChild(fabReduceWindow)
    }

    if (this.options.maximizable) {
      var fabMaximizeWindow = document.createElement('button');
      fabMaximizeWindow.className = 'maximize';
      fabWindowIcons.appendChild(fabMaximizeWindow)
    }

    var fabCloseWindow = document.createElement('button');
    fabCloseWindow.className = 'close'
    fabWindowIcons.appendChild(fabCloseWindow);

    var fabWindowBody = document.createElement('div');
    fabWindowBody.className = 'fab-content';
    fabWindow.appendChild(fabWindowBody);

    if (this.options.footerContent !== '' && this.options.footerContent !== null && this.footerContent !== 'undefined') {
      var fabWindowFooter = document.createElement('div');
      fabWindowFooter.className = 'fab-footer';
      fabWindow.appendChild(fabWindowFooter);
    }

    // On retire la class après l'affichage de la window pour plus de propreté
    var that = this;
    setTimeout(function () {
      fabWindow.classList.remove(that.options.effects.in);
    }, 1000)

    return fabWindow;
  };

  FabWindow.prototype.initHandlers = function () {
    var that = this;

    this.$el.querySelector(this.options.selectors.maximize).onclick = null
    this.$el.querySelector(this.options.selectors.maximize).onclick = function (event) {
      event.stopPropagation();
      event.preventDefault();

      that.toggleFullScreen();
    };


    this.$el.querySelector(this.options.selectors.close).onclick = null;
    this.$el.querySelector(this.options.selectors.close).onclick = function (event) {
      event.stopPropagation();
      event.preventDefault();

      that.closeWindow();
    };

    if (this.options.draggable) {
      this.initDragWindow();
    };
  };

  FabWindow.prototype.toggleFullScreen = function () {
    if (this.$el.classList.contains('maximized')) {
      this.$el.classList.remove('maximized');
    } else {
      this.$el.classList.add('maximized');
    }
  };

  FabWindow.prototype.initDragWindow = function () {
    var that = this;
    var el = this.$el;

    that.$header.classList.add('draggable');

    var dragMouseDown = function (e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(el.id).querySelector(that.options.selectors.header)) {
      // if present, the header is where you move the DIV from:
      document.getElementById(el.id).querySelector(that.options.selectors.header).onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      el.onmousedown = dragMouseDown;
    };



    var elementDrag = function (e) {
      that.options.isMoving = true
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";
    }

    var closeDragElement = function () {
      console.log(`Window stop to moving dude ... :( !`)
      that.options.isMoving = false;
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  };

  FabWindow.prototype.setContent = function (target, content) {
    if (content !== '' && content !== 'undefined' && content !== null) {
      if ((!target && target === '' && target === null)) {
        this.$body.innerHTML = content;
      } else {
        target = '$'+target;
        this[target].innerHTML = content;
      }
    }
  };

  FabWindow.prototype.closeWindow = function () {
    var _this = this;

    this.$el.classList.add(this.options.effects.out)
    // On remove la window une fois l'effet fade-out terminé
    window.setTimeout(function () {
      _this.$el.dispatchEvent(new CustomEvent("fabWindowClose"));
      _this.$el.remove();
    }, 800);
  };

  FabWindow.prototype.startLoader = function () {
    this.setContent('body', this.options.loader)
    this.$loader = this.$el.querySelector(this.options.selectors.loader);
  };

  FabWindow.prototype.stopLoader = function () {
    this.$loader.remove();
  }

})()