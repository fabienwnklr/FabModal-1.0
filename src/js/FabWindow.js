var FabWindow = null,
  $window = null,
  $body = null;
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
        overlay: '.fab-overlay',
        modal: '.fab-window',
        header: '.fab-header',
        title: '.fab-title',
        icons: '.fab-icons',
        maximize: '.maximize',
        reduce: '.reduce',
        close: '.close',
        body: '.fab-content',
        loader: '.loader',
      },
      effects: {
        in: 'coming-in', // Also fade-in
        out: 'coming-out' // Also fade-out
      },
      width: '800px',
      height: 'auto',
      maximizable: false,
      minimizable: false,
      title: '',
      bodyContent: '<div class="loader"></div>',
      loader: '<div class="loader"></div>',

      // function
      onResize: function (fabWindow) { },
      onFullScreen: function (fabWindow) { }
    };

    this.isFullScreen = false,
      this.isMinimized = false,
      this.options = Object.assign(defaults, options);

    this.initialize(this.options);


  };

  /**
   * @function initialize This function init 
   * 
   * @param {Object} options 
   */
  FabWindow.prototype.initialize = function (options) {
    var that = this;
    this.$el = this.createWindow();

    this.$overlay = $body.querySelector(options.selectors.overlay);
    this.$header = this.$el.querySelector(options.selectors.header);
    this.$title = this.$el.querySelector(options.selectors.title);
    this.$icons = this.$el.querySelector(options.selectors.icons);
    this.$reduce = this.$el.querySelector(options.selectors.reduce);
    this.$maximize = this.$el.querySelector(options.selectors.maximize)
    this.$close = this.$el.querySelector(options.selectors.close);
    this.$body = this.$el.querySelector(options.selectors.body);

    $body.appendChild(this.$el);

    this.setContent('body', options.bodyContent);

    this.initHandlers();
    this.show();

    (function updateTimer() {
      that.recalcLayout();
      that.timer = setTimeout(updateTimer, 300);
    })();
  };

  /**
   * @function createWindow This function (like this name saying..) literally construct the html window
   */
  FabWindow.prototype.createWindow = function () {
    try {
      var fabWindow = document.createElement('div');
      fabWindow.className = 'fab-window ' + this.options.effects.in + ' transition';
      fabWindow.id = this.options.id;
      fabWindow.style.maxWidth = this.options.width;
      fabWindow.style.maxHeight = this.options.height;

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
      fabWindowBody.className = 'fab-content fade-in';
      fabWindowBody.style.maxWidth = this.options.width;
      fabWindowBody.style.maxHeight = this.options.height;
      fabWindow.appendChild(fabWindowBody);

      if (!document.querySelector(this.options.selectors.overlay)) {
        var fabWindowOverlay = document.createElement('div');
        fabWindowOverlay.className = 'fab-overlay fade-in';
        $body.appendChild(fabWindowOverlay);
      }

      // On retire la class après l'affichage de la window pour plus de propreté
      var that = this;
      setTimeout(function () {
        fabWindow.classList.remove(that.options.effects.in);
      }, 1000)

      return fabWindow;
    } catch (error) {
      console.error(error)
    }
  };

  FabWindow.prototype.initHandlers = function () {
    try {
      var that = this;

      // FullScreen event
      if (this.options.maximizable) {
        this.$maximize.onclick = null
        this.$maximize.addEventListener('click', function (e) {
          e.stopPropagation();
          e.preventDefault();

          that.toggleFullScreen();
        })
      }

      // Close event
      this.$close.onclick = null;
      this.$close.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();

        that.closeWindow();
      })

      // Overlay close on click
      this.$overlay.onclick = null;
      this.$overlay.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();

        that.closeWindow();
      })
    } catch (error) {
      console.error(error)
    }

  };

  FabWindow.prototype.show = function () {
    this.$el.style.display = 'block';
    this.$overlay.style.display = 'block';
  };

  FabWindow.prototype.hide = function () {
    this.$el.style.display = 'none';
    this.$overlay.style.display = 'none';
  };

  FabWindow.prototype.toggleFullScreen = function () {
    if (this.isFullScreen) {
      this.isFullScreen = false;
      this.$el.classList.remove('fullScreen');
    } else {
      this.isFullScreen = true
      this.$el.dispatchEvent(new CustomEvent("fullScreen"));
      this.$el.classList.add('fullScreen');

      if (typeof this.options.onFullScreen === 'function') {
        this.options.onFullScreen();
      }
    }
  };

  /**
   * 
   * @param {string} target Target (cf: initialize function variable starting with '$')
   * @param {string} content Content to append
   */
  FabWindow.prototype.setContent = function (target, content) {
    try {
      if (content !== '' && content !== 'undefined' && content !== null) {
        if ((!target && target === '' && target === null)) {
          this.$body.innerHTML = content;
        } else {
          target = '$' + target;
          this[target].innerHTML = content;
        }
        if (this.options.height === 'auto') {
          this.options.height = this.$el.clientHeight;
        }
      }
    } catch (error) {
      console.error(error)
    }
  };

  /**
   * @function closeWindow close, and removing from DOM 
   */
  FabWindow.prototype.closeWindow = function () {
    var that = this;

    this.$el.classList.add(this.options.effects.out)
    this.$overlay.classList.add('fade-out');
    // On remove la window une fois l'effet fade-out terminé
    window.setTimeout(function () {
      that.$el.dispatchEvent(new CustomEvent("fabWindowClose"));
      that.$el.remove();
      that.$overlay.remove();
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
  };

  FabWindow.prototype.recalcLayout = function () {
    try {
      var fabContentHeight = this.$body.scrollHeight,
        modalHeight = this.$el.clientHeight,
        windowHeight = $window.innerHeight,
        wrapperHeight = this.$el.clientHeight - this.$header.clientHeight,
        outerHeight = fabContentHeight + this.$header.clientHeight;

      if (this.options.onResize && typeof this.options.onResize === 'function') {
        this.options.onResize(this);
      }

      if ($window.innerWidth <= 600) {
        this.$maximize.style.display = 'none';
      } else {
        this.$maximize.style.display = 'block';
      }

      if (!this.isFullScreen) {
        this.$el.style.height = parseInt(fabContentHeight) + (this.$header.clientHeight - 3) + 'px';
      }

      if (outerHeight > windowHeight) {
        if (document.querySelectorAll('.fab-window').length === 1) {
          document.querySelector('html').style.overflow = 'hidden';
        }
        this.$el.style.height = windowHeight + 'px';

      } else {
        this.$el.style.height = fabContentHeight + (this.$header.clientHeight + 3) + 'px';
        if (document.querySelectorAll('.fab-window').length === 1) {
          document.querySelector('html').style.overflow = '';
        }
      }
      var that = this;
      (function applyScroll() {
        if (fabContentHeight > wrapperHeight && outerHeight > windowHeight) {
          that.$body.classList.add('hasScroll');
          that.$body.style.height = modalHeight - (that.$header.clientHeight + 3) + 'px';
        } else {
          that.$body.classList.remove('hasScroll');
          that.$body.style.height = 'auto';
        }
      })();
    } catch (error) {
      console.error(error)
    }
  };

})()