var FabWindow = null;
(function () {
  'use strict';
  /**
   * 
   * @param {Object} options 
   */
  FabWindow = function (options) {
    options = options || {};
    var defaults = {
      id: 'fab-window-' + Math.round(new Date().getTime() + (Math.random() * 100)),
      selectors: {
        modal: '.fab-window',
        header: '.fab-header',
        body: '.fab-content',
        footer: '.fab-footer',
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
      references: {
        body: document.querySelector('body')
      },
      effect: 'fade-in',
      draggable: false,
      maximized: false,
      minimized: false,
      maximizable: true,
      minimizable: false,
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

    options.elements.header = this.$el.querySelector(options.selectors.header);
    options.elements.reduce = this.$el.querySelector(options.selectors.reduce);
    options.elements.close = this.$el.querySelector(options.selectors.close);
    options.elements.body = this.$el.querySelector(options.selectors.body);
    options.elements.footer = this.$el.querySelector(options.selectors.footer);

    this.setContent('body', options.bodyContent);
    this.setContent('footer', options.footerContent);

    this.options.references.body.appendChild(this.$el);
    this.initHandlers();
  };

  FabWindow.prototype.createWindow = function () {
    var fabWindow = document.createElement('div');
    fabWindow.className = `fab-window ${this.options.effect}`;
    fabWindow.id = this.options.id;

    var fabWindowHeader = document.createElement('div');
    fabWindowHeader.className = 'fab-header';
    fabWindow.appendChild(fabWindowHeader);

    var fabWindowBody = document.createElement('div');
    fabWindowBody.className = 'fab-content';
    fabWindow.appendChild(fabWindowBody);

    if (this.options.minimizable) {
      var fabReduceWindow = document.createElement('span');
      fabReduceWindow.className = 'reduce';
      fabWindowHeader.appendChild(fabReduceWindow)
    }

    if (this.options.maximizable) {
      var fabMaximizeWindow = document.createElement('span');
      fabMaximizeWindow.className = 'maximize';
      fabWindowHeader.appendChild(fabMaximizeWindow)
    }

    var fabCloseWindow = document.createElement('span');
    fabCloseWindow.className = 'close'
    fabWindowHeader.appendChild(fabCloseWindow);

    if (this.options.footerContent !== '' && this.options.footerContent !== null && this.footerContent !== 'undefined') {
      var fabWindowFooter = document.createElement('div');
      fabWindowFooter.className = 'fab-footer';
      fabWindow.appendChild(fabWindowFooter);
    }

    // On retire la class après l'affichage de la window pour plus de propreté
    setTimeout(function () {
      fabWindow.classList.remove('fade-in');
    }, 1000)

    return fabWindow;
  };

  FabWindow.prototype.initHandlers = function () {
    var _this = this;

    this.$el.querySelector(this.options.selectors.close).onclick = null;
    this.$el.querySelector(this.options.selectors.close).addEventListener('click', function (event) {
      event.stopPropagation();
      event.preventDefault();

      _this.closeWindow();
    })

    if (this.options.draggable) {
      this.initDragWindow();
    }
  };

  FabWindow.prototype.initDragWindow = function () {
    var that = this;
    var el = this.$el;

    that.options.elements.header.classList.add('draggable');

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
        this.options.elements.body.innerHTML = content;
      } else {
        this.options.elements[target].innerHTML = content;
      }
    }
  };

  FabWindow.prototype.closeWindow = function () {
    var _this = this;

    this.$el.classList.remove('fade-in');
    this.$el.classList.add('fade-out')
    // On remove la window une fois l'effet fade-out terminé
    window.setTimeout(function () {
      _this.$el.dispatchEvent(new CustomEvent("fabWindowClose"));
      _this.$el.remove();
    }, 800);
  };

  FabWindow.prototype.startLoader = function () {
    this.setContent('body', this.options.loader)
    this.options.elements.loader = this.$el.querySelector(this.options.selectors.loader);
  };

  FabWindow.prototype.stopLoader = function () {
    this.options.elements.loader.remove();
  }

})()