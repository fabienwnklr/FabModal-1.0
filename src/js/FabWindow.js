var FabWindow = null,
  $window = null,
  $body = null,
  $header = null,
  $title = null,
  $icons = null,
  $maximize = null,
  $reduce = null,
  $close = null,
  $body = null,
  $resizer = null,
  $loader = null,
  $footer = null;
(function () {
  'use strict';
  /**
   * 
   * @param {Object} options 
   */
  FabWindow = function (options) {
    // Selectors
    $window = window;
    $body = document.querySelector('body');
    // Options
    options = options || {};
    var defaults = {
      id: 'fab-window-' + Math.round(new Date().getTime() + (Math.random() * 100)),
      selectors: {
        modal: '.fab-window',
        header: '.fab-header',
        title: '.fab-title',
        icons: '.fab-icons',
        maximize: '.maximize',
        reduce: '.reduce',
        close: '.close',
        body: '.fab-content',
        resizer: '.resizer',
        loader: '.loader',
        footer: '.fab-footer',
      },
      effects: {
        in: 'coming-in', // Also fade-in
        out: 'coming-out' // Also fade-out
      },
      draggable: false,
      resizable: false,
      maximized: false,
      minimized: false,
      maximizable: true,
      minimizable: false,
      title: '',
      bodyContent: '<div class="loader"></div>',
      footerContent: '',
      loader: '<div class="loader"></div>'
    };
    this.options = Object.assign(defaults, options);
    this.initialize(this.options);
    return this;
  };

  /**
   * @function initialize This function init 
   * 
   * @param {Object} options 
   */
  FabWindow.prototype.initialize = function (options) {
    this.$el = this.createWindow();

    this.$header = this.$el.querySelector(options.selectors.header);
    this.$title = this.$el.querySelector(options.selectors.title);
    this.$icons = this.$el.querySelector(options.selectors.icons);
    this.$reduce = this.$el.querySelector(options.selectors.reduce);
    this.$close = this.$el.querySelector(options.selectors.close);
    this.$resizer = this.$el.querySelector(options.selectors.resizer);
    this.$body = this.$el.querySelector(options.selectors.body);
    this.$footer = this.$el.querySelector(options.selectors.footer);

    this.setContent('body', options.bodyContent);
    this.setContent('footer', options.footerContent);

    $body.appendChild(this.$el);
    this.initHandlers();
  };

  /**
   * @function createWindow This function (like this name saying..) literally construct the html window
   */
  FabWindow.prototype.createWindow = function () {
    var fabWindow = document.createElement('div');
    fabWindow.className = `fab-window ${this.options.effects.in} transition`;
    fabWindow.id = this.options.id;

    if (this.options.resizable) {
      var fabWindowResizer = document.createElement('span');
      fabWindowResizer.className = 'resizer';
      fabWindow.appendChild(fabWindowResizer);
    }

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

    if (this.options.resizable) {
      this.$resizer.addEventListener('mousedown', initResize);

      function initResize(e) {
        window.addEventListener('mousemove', Resize, false);
        window.addEventListener('mouseup', stopResize, false);
      }
      function Resize(e) {
        that.$el.classList.remove('transition');

        if (e.clientX >= window.outerWidth) return;
        if (e.clientY >= window.outerHeight) return;
        that.$el.style.width = (e.clientX - that.$el.offsetLeft) + 'px';
        that.$el.style.height = (e.clientY - that.$el.offsetTop) + 'px';
      }
      function stopResize(e) {
        that.$el.classList.add('transition');
        window.removeEventListener('mousemove', Resize, false);
        window.removeEventListener('mouseup', stopResize, false);
      }
    };

    if (this.options.draggable) {
      this.initDragWindow();
    };
  };

  FabWindow.prototype.toggleFullScreen = function () {
    if (!this.window_infos) {
      this.window_infos = {
        width: this.$el.style.width,
        height: this.$el.style.height
      };
    }
    this.$el.style.width = '';
    this.$el.style.height = '';
    if (this.$el.classList.contains('maximized')) {
      this.$el.classList.remove('maximized');
      if (this.window_infos) {
        this.$el.style.width = this.window_infos.width;
        this.$el.style.height = this.window_infos.height;
        delete this.window_infos;
      }
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

  /**
   * 
   * @param {string} target Target (cf: initialize function variable starting with '$')
   * @param {string} content Content to append
   */
  FabWindow.prototype.setContent = function (target, content) {
    if (content !== '' && content !== 'undefined' && content !== null) {
      if ((!target && target === '' && target === null)) {
        this.$body.innerHTML = content;
      } else {
        target = '$' + target;
        this[target].innerHTML = content;
      }
    }
  };

  FabWindow.prototype.closeWindow = function () {
    var that = this;

    this.$el.classList.add(this.options.effects.out)
    // On remove la window une fois l'effet fade-out terminé
    window.setTimeout(function () {
      that.$el.dispatchEvent(new CustomEvent("fabWindowClose"));
      that.$el.remove();
    }, 800);
  };

  /**
   * @function startLoader For init loader and clear all content in window
   */
  FabWindow.prototype.startLoader = function () {
    this.setContent('body', this.options.loader)
    this.$loader = this.$el.querySelector(this.options.selectors.loader);
  };

  /**
   * @function stopLoader for remove loader init with startLoader
   */
  FabWindow.prototype.stopLoader = function () {
    this.$loader.remove();
  }

})()