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
        iframe: '.fab-iframe',
        loader: '.loader',
      },
      effects: {
        in: 'coming-in', // Also fade-in
        out: 'coming-out' // Also fade-out
      },
      width: '800px',
      height: 'auto',
      maximizable: true,
      minimizable: false,
      title: '',
      overlayClose: true,
      bodyContent: '<div class="loader"></div>',
      loader: '<div class="loader"></div>',
      // progress bar
      timeoutProgressBar: false,
      timeout: false,
      pauseOnHover: false,

      // iframe
      isIframe: false,
      iframeURL: '',
      iframeHeight: '400px',

      // function
      onResize: function (fabWindow) { },
      onFullScreen: function (fabWindow) { }
    };

    this.isPaused = false;
    this.isFullScreen = false;
    this.isMinimized = false;
    this.timerTimeout = null;
    this.oldContent = {};

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

    if (options.overlayClose === true) {
      this.$overlay = $body.querySelector(options.selectors.overlay);
    }
    this.$header = this.$el.querySelector(options.selectors.header);
    this.$title = this.$el.querySelector(options.selectors.title);
    this.$icons = this.$el.querySelector(options.selectors.icons);
    this.$reduce = this.$el.querySelector(options.selectors.reduce);
    this.$maximize = this.$el.querySelector(options.selectors.maximize)
    this.$close = this.$el.querySelector(options.selectors.close);
    this.$windowBody = this.$el.querySelector(options.selectors.body);
    
    $body.appendChild(this.$el);
    
    if (options.isIframe === false) {
      this.setContent('windowBody', options.bodyContent);
    } else {
      this.setIframeContent();
      this.$iframe = this.$el.querySelector(options.selectors.iframe);
    }

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
    var fabWindow = document.createElement('div');
    var iframe = this.options.isIframe ? ' iframe' : '';
    fabWindow.className = 'fab-window ' + this.options.effects.in + iframe;
    fabWindow.id = this.options.id;
    fabWindow.style.maxWidth = this.options.width;
    fabWindow.style.maxHeight = this.options.height;

    if (this.options.timeoutProgressBar) {
      var fabWindowProgressBar = document.createElement('div');
      var div = document.createElement('div');

      fabWindowProgressBar.className = 'fab-window-progress-bar';
      fabWindowProgressBar.appendChild(div);

      fabWindow.appendChild(fabWindowProgressBar);
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
      fabReduceWindow.title = 'réduire';
      fabWindowIcons.appendChild(fabReduceWindow)
    }
    
    if (this.options.maximizable) {
      var fabMaximizeWindow = document.createElement('button');
      fabMaximizeWindow.className = 'maximize';
      fabMaximizeWindow.title = 'Agrandir';
      fabWindowIcons.appendChild(fabMaximizeWindow)
    }

    var fabCloseWindow = document.createElement('button');
    fabCloseWindow.className = 'close';
    fabCloseWindow.title = 'Fermer';
    fabWindowIcons.appendChild(fabCloseWindow);

    var fabWindowBody = document.createElement('div');
    fabWindowBody.className = 'fab-content fade-in';
    fabWindowBody.style.maxWidth = this.options.width;
    fabWindowBody.style.maxHeight = this.options.height;
    fabWindow.appendChild(fabWindowBody);

    if (!document.querySelector(this.options.selectors.overlay) && this.options.overlayClose === true) {
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
  };

  FabWindow.prototype.initHandlers = function () {
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
    if (this.options.overlayClose === true) {
      this.$overlay.onclick = null;
      this.$overlay.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();

        that.closeWindow();
      })
    }

    // Event progress bar
    if (this.options.timeoutProgressBar && this.options.timeout !== false && !isNaN(parseInt(this.options.timeout)) && this.options.timeout !== 0) {
      this.startProgress();

      if (this.options.pauseOnHover === true) {
        this.$el.onmouseenter = null;
        this.$el.addEventListener('mouseenter', function (event) {
          event.preventDefault();
          that.isPaused = true;
        });
        this.$el.onmouseleave = null;
        this.$el.addEventListener('mouseleave', function (event) {
          event.preventDefault();
          that.isPaused = false;
        });
      }
    }
  };

  FabWindow.prototype.show = function () {
    this.$el.style.display = 'block';
    if (this.$overlay) {
      this.$overlay.style.display = 'block';
    }
  };

  FabWindow.prototype.hide = function () {
    this.$el.style.display = 'none';
    if (this.$overlay) {
      this.$overlay.style.display = 'none';
    }
  };

  FabWindow.prototype.toggleFullScreen = function () {
    if (this.isFullScreen) {
      this.isFullScreen = false;
      this.$el.classList.remove('fullScreen');
      this.$maximize.title = 'Agrandir';
    } else {
      this.isFullScreen = true
      this.$el.dispatchEvent(new CustomEvent("fullScreen"));
      this.$el.classList.add('fullScreen');
      this.$maximize.title = 'Réstaurer';

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
    if (content !== '' && content !== 'undefined' && content !== null) {
      var isLoader = true;
      if (this.$windowBody.innerHTML !== this.options.loader) {
        isLoader = false;
      }
      if (!target || target === '' || target === null || typeof target === 'undefined') {
        if (!isLoader) {
          this.oldContent['windowBody'] = this.$windowBody.innerHTML;
        }
        this.$windowBody.innerHTML = content;
      } else {
        target = '$' + target;
        if (!isLoader) {
          var targetName = target.replace(/\$/i, '');
          this.oldContent[targetName] = this[target].innerHTML;
        }
        this[target].innerHTML = content;
      }
      if (this.options.height === 'auto') {
        this.options.height = this.$el.clientHeight;
      }
    }
  };

  FabWindow.prototype.setIframeContent = function () {
    var iframeDOMNode = document.createElement('iframe');
    iframeDOMNode.allowFullscreen = true;
    iframeDOMNode.className = 'fab-iframe';
    iframeDOMNode.width = '100%';
    iframeDOMNode.height = this.options.iframeHeight;
    iframeDOMNode.src = this.options.iframeURL;

    this.$windowBody.appendChild(iframeDOMNode);
  };

  /**
   * Function for reset content to last content insert
   */
  FabWindow.prototype.resetContent = function (target) {
    if (!target || target === '' || typeof target === 'undefined' || target === null) {
      target = 'body';
    }
    this.setContent(target, this.oldContent[target]);
  };

  /**
   * @function closeWindow close, and removing from DOM 
   */
  FabWindow.prototype.closeWindow = function () {
    var that = this;
    clearTimeout(this.timerTimeout);

    this.$el.classList.add(this.options.effects.out)
    if (this.$overlay) {
      this.$overlay.classList.add('fade-out');
    }
    // On remove la window une fois l'effet fade-out terminé
    window.setTimeout(function () {
      that.$el.dispatchEvent(new CustomEvent("fabWindowClose"));
      that.$el.remove();
      if (that.$overlay) {
        that.$overlay.remove();
      }
    }, 800);
  };

  /**
   * @function startLoader For init loader and clear all content in window
   */
  FabWindow.prototype.startLoader = function () {
    this.setContent('windowBody', this.options.loader)
    this.$loader = this.$el.querySelector(this.options.selectors.loader);
  };

  /**
   * @function stopLoader for remove loader init with startLoader
   */
  FabWindow.prototype.stopLoader = function () {
    this.$loader.remove();
  };

  FabWindow.prototype.recalcLayout = function () {
    var fabContentHeight = this.$windowBody.scrollHeight,
      modalHeight = this.$el.clientHeight,
      windowHeight = $window.innerHeight,
      wrapperHeight = this.$el.clientHeight - this.$header.clientHeight,
      outerHeight = fabContentHeight + this.$header.clientHeight,
      borderBottom = this.options.isIframe ? 0 : 3;

    if (this.options.onResize && typeof this.options.onResize === 'function') {
      this.options.onResize(this);
    }

    if ($window.innerWidth <= 600) {
      this.$maximize.style.display = 'none';
    } else {
      this.$maximize.style.display = 'block';
    }

    if (!this.isFullScreen) {
      this.$el.style.height = parseInt(fabContentHeight) + (this.$header.clientHeight - borderBottom) + 'px';
    }

    if (outerHeight > windowHeight) {
      if (document.querySelectorAll('.fab-window').length === 1) {
        document.querySelector('html').style.overflow = 'hidden';
      }
      this.$el.style.height = windowHeight + 'px';

    } else {
      this.$el.style.height = fabContentHeight + (this.$header.clientHeight + borderBottom) + 'px';
      if (document.querySelectorAll('.fab-window').length === 1) {
        document.querySelector('html').style.overflow = '';
      }
    }

    if (this.options.isIframe === true) {
      // If the height of the window is smaller than the modal with iframe
      if (windowHeight < ((this.options.iframeHeight) + this.$header.clientHeight + borderBottom) || this.isFullScreen === true) {
        this.$windowBody.style.height = windowHeight - (this.$header.clientHeight + borderBottom) + 'px';
        if (this.options.isIframe) {
          this.$iframe.height = windowHeight - (this.$header.clientHeight + borderBottom) + 'px';
        }
      } else {
        this.$windowBody.style.height = this.options.iframeHeight;
        if (this.options.isIframe) {
          this.$iframe.height = this.options.iframeHeight;
        }
      }
    }
    var that = this;
    (function applyScroll() {
      if (fabContentHeight > wrapperHeight && outerHeight > windowHeight) {
        that.$windowBody.classList.add('hasScroll');
        that.$windowBody.style.height = modalHeight - (that.$header.clientHeight + borderBottom) + 'px';
      } else if (that.options.isIframe === false) {
        that.$windowBody.classList.remove('hasScroll');
        that.$windowBody.style.height = 'auto';
      }
    })();
  };

  FabWindow.prototype.startProgress = function (timer) {
    this.isPaused = false;
    var that = this;

    clearTimeout(this.timerTimeout);

    if (this.options.timeoutProgressBar === true) {

      this.progressBar = {
        hideEta: null,
        maxHideTime: null,
        currentTime: new Date().getTime(),
        el: this.$el.querySelector('.fab-window-progress-bar > div'),
        updateProgress: function () {
          if (!that.isPaused) {

            that.progressBar.currentTime = that.progressBar.currentTime + 10;

            var percentage = ((that.progressBar.hideEta - (that.progressBar.currentTime)) / that.progressBar.maxHideTime) * 100;
            that.progressBar.el.style.width = percentage + '%';
            if (percentage < 0) {
              that.closeWindow();
            }
          }
        }
      };
      if (timer > 0) {
        this.progressBar.maxHideTime = parseFloat(timer);
        this.progressBar.hideEta = new Date().getTime() + this.progressBar.maxHideTime;
        this.timerTimeout = setInterval(this.progressBar.updateProgress, 10);
      } else {
        this.timerTimeout = setTimeout(function () {
          that.close();
        }, that.options.timeout);
      }

    }
  };

  FabWindow.prototype.pauseProgress = function () {
    this.isPaused = true;
  };

  FabWindow.prototype.resetProgress = function () {
    clearTimeout(this.timerTimeout);
    this.progressBar = {};
    this.$el.querySelector('.fab-window-progress-bar > div').style.width = '100%';
  };

  FabWindow.prototype.resumeProgress = function () {
    this.isPaused = false;
  };

  FabWindow.prototype.getExternalContent = function (url) {
    var that = this;

    this.startLoader();

    if (window.fetch) {
      fetch('https://api.github.com/repos/fabienwnklr/fabWindow')
        .then(function (response) {
          return response.json()
        })
        .then(function (data) {
          console.log(data);
          console.log("FullName: " + data.full_name);
          console.log("URL: " + data.html_url);
          console.log("Forks: " + data.forks);
          console.log("Stars: " + data.stargazers_count);
          var content = '<ul>';
          content += '<li style="margin: 10px 0 10px 0;">'
          content += '<span style="font-weight:bold;">FullName</span>: ' + data.full_name;
          content += '<li>'
          content += '<li style="margin: 10px 0 10px 0;">'
          content += '<span style="font-weight:bold;">URL</span>: ' + data.html_url;
          content += '<li>'
          content += '<li style="margin: 10px 0 10px 0;">'
          content += '<span style="font-weight:bold;">Forks</span>: ' + data.forks;
          content += '<li>'
          content += '<li style="margin: 10px 0 10px 0;">'
          content += '<span style="font-weight:bold;">Stars</span>: ' + data.stargazers_count;
          content += '<li>'
          content += '</ul>';
          that.setContent('windowBody', content);
          that.stopLoader();
        })
        .catch(function (error) {
          throw new Error(error)
        })

    } else {
      var request;
      if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
      } else {
        request = new ActiveXObject('Microsoft.XMLHTTP')
      }

      if (typeof options !== 'object') {
        throw new Error('Failed to execute \'loadExternContent\' : parameter is not of type \'Object\'')
      }

      request.open('GET', 'https://api.github.com/repos/fabienwnklr/fabWindow', true);

      request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          var data = JSON.parse(this.response);
          console.log(data);
          console.log("FullName: " + data.full_name);
          console.log("URL: " + data.html_url);
          console.log("Forks: " + data.forks);
          console.log("Stars: " + data.stargazers_count);
          var content = '<ul>';
          content += '<li style="margin: 10px 0 10px 0;">'
          content += '<span style="font-weight:bold;">FullName</span>: ' + data.full_name;
          content += '<li>'
          content += '<li style="margin: 10px 0 10px 0;">'
          content += '<span style="font-weight:bold;">URL</span>: ' + data.html_url;
          content += '<li>'
          content += '<li style="margin: 10px 0 10px 0;">'
          content += '<span style="font-weight:bold;">Forks</span>: ' + data.forks;
          content += '<li>'
          content += '<li style="margin: 10px 0 10px 0;">'
          content += '<span style="font-weight:bold;">Stars</span>: ' + data.stargazers_count;
          content += '<li>'
          content += '</ul>';
          that.setContent('windowBody', content);
          that.stopLoader();
        }
      };

      request.onerror = function (err) {
        throw new Error(err)
      };

      request.send();
    }
  }

})()