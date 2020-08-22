var fabModal = null,
  $window = null,
  $body = null;
(function () {
  'use strict';
  /**
   * 
   * @param {Object} options 
   */
  fabModal = function (options) {
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
      // Custom | default content
      content: '<div class="loader"></div>',
      loader: '<div class="loader"></div>',
      // progress bar
      timeoutProgressBar: false,
      timeout: false, // Set number for init with progressbar
      pauseOnHover: false,

      // iframe
      isIframe: false,
      iframeURL: '',
      iframeHeight: '400px',

      // function
      onFullscreen: function () { },
      onRestore: function () { },
      onResize: function () { },
      onOpen: function () { },
      /**
       * During closing
       */
      onClosing: function () { },
      /**
       * When modal are closed
       */
      onClosed: function () { },
    };

    this.isPaused = false;
    this.isFullScreen = false;
    this.isMinimized = false;
    this.timerTimeout = null;
    this.oldContent = null;
    this.modalHeight = 0;

    this.options = Object.assign(defaults, options);

    this.initialize(this.options);


  };


  /** Utils function */

  /**
   * Private function for check if url is valid
   * @param {string} url 
   */
  function validURL(url) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(url);
  };

  function generateError(message) {
    if (message && message !== '') {
      var errorDOMNode = document.createElement('div');
      errorDOMNode.className = 'fab-error';
      errorDOMNode.innerHTML = message

      return errorDOMNode;
    } else {
      console.error('Pas de message renseigné.')
    }
  };

  /** Utils function end */

  /**
   * @function initialize This function init 
   * 
   * @param {Object} options 
   */
  fabModal.prototype.initialize = function (options) {
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
      this.setContent(options.content);
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
  fabModal.prototype.createWindow = function () {
    var fabModal = document.createElement('div');
    var iframe = this.options.isIframe ? ' iframe' : '';
    fabModal.className = 'fab-window ' + this.options.effects.in + iframe;
    fabModal.id = this.options.id;
    fabModal.style.maxWidth = this.options.width;
    fabModal.style.maxHeight = this.options.height;

    if (this.options.timeoutProgressBar && this.options.isIframe === false) {
      var fabModalProgressBar = document.createElement('div');
      var div = document.createElement('div');

      fabModalProgressBar.className = 'fab-window-progress-bar';
      fabModalProgressBar.appendChild(div);

      fabModal.appendChild(fabModalProgressBar);
    }

    var fabModalHeader = document.createElement('div');
    fabModalHeader.className = 'fab-header';
    fabModal.appendChild(fabModalHeader);

    var fabModalTitle = document.createElement('h1');
    fabModalTitle.className = 'fab-title';
    fabModalTitle.innerHTML = this.options.title;
    fabModalHeader.appendChild(fabModalTitle);

    var fabModalIcons = document.createElement('div');
    fabModalIcons.className = 'fab-icons';
    fabModalHeader.appendChild(fabModalIcons)

    if (this.options.maximizable) {
      var fullScreenModalBtn = document.createElement('button');
      fullScreenModalBtn.className = 'maximize';
      fullScreenModalBtn.title = 'Agrandir';
      fabModalIcons.appendChild(fullScreenModalBtn)
    }

    var closeModalBtn = document.createElement('button');
    closeModalBtn.className = 'close';
    closeModalBtn.title = 'Fermer';
    fabModalIcons.appendChild(closeModalBtn);

    var fabModalBody = document.createElement('div');
    fabModalBody.className = 'fab-content fade-in';
    fabModalBody.style.maxWidth = this.options.width;
    fabModalBody.style.maxHeight = this.options.height;
    fabModal.appendChild(fabModalBody);

    if (!document.querySelector(this.options.selectors.overlay) && this.options.overlayClose === true) {
      var fabModalOverlay = document.createElement('div');
      fabModalOverlay.className = 'fab-overlay fade-in';
      $body.appendChild(fabModalOverlay);
    }

    // On retire la class après l'affichage de la window pour plus de propreté
    var that = this;
    setTimeout(function () {
      fabModal.classList.remove(that.options.effects.in);
    }, 1000)

    return fabModal;
  };

  fabModal.prototype.initHandlers = function () {
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
      this.startProgress(parseInt(this.options.timeout));

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

  fabModal.prototype.show = function () {
    this.$el.style.display = 'block';
    this.$el.style.opacity = 1;
    if (this.$overlay) {
      this.$overlay.style.display = 'block';
    }

    if (this.options.onOpen && typeof this.options.onOpen === 'function') {
      this.options.onOpen(this);
    }
  };

  fabModal.prototype.hide = function () {
    this.$el.style.display = 'none';
    if (this.$overlay) {
      this.$overlay.style.display = 'none';
    }
  };

  fabModal.prototype.toggleFullScreen = function () {
    if (this.isFullScreen) {
      this.isFullScreen = false;
      this.$el.classList.remove('fullScreen');
      this.$maximize.title = 'Agrandir';

      this.$el.dispatchEvent(new CustomEvent("restore"));
      if (typeof this.options.onRestore === 'function') {
        this.options.onRestore(this);
      }
    } else {
      this.isFullScreen = true
      this.$el.classList.add('fullScreen');
      this.$maximize.title = 'Réstaurer';

      this.$el.dispatchEvent(new CustomEvent("fullScreen"));
      if (typeof this.options.onFullScreen === 'function') {
        this.options.onFullScreen(this);
      }
    }
  };

  /**
   * 
   * @param {string} target Target (cf: initialize function variable starting with '$')
   * @param {string} content Content to append
   */
  fabModal.prototype.setContent = function (content) {
    if (content !== '' && content !== 'undefined' && content !== null) {
      var isLoader = true;
      if (this.$windowBody.innerHTML !== this.options.loader) {
        isLoader = false;
      }
      if (!isLoader) {
        this.oldContent = this.$windowBody.innerHTML;
      }
      this.$windowBody.innerHTML = content;
      if (this.options.height === 'auto') {
        this.options.height = this.$el.clientHeight;
      }
    }
  };

  fabModal.prototype.setTitle = function (title) {
    this.options.title = title;
    this.$title.innerHTML = title;
  };

  fabModal.prototype.getTitle = function () {
    return this.options.title;
  };

  /**
   * Function create iframe node with URL and insert in windowBody
   */
  fabModal.prototype.setIframeContent = function () {
    var iframeDOMNode = document.createElement('iframe');
    iframeDOMNode.allowFullscreen = true;
    iframeDOMNode.className = 'fab-iframe';
    iframeDOMNode.width = '100%';
    iframeDOMNode.height = this.options.iframeHeight;
    if (this.options.iframeURL !== '' && typeof this.options.iframeURL !== 'undefined' && this.options.iframeURL !== null) {
      if (validURL(this.options.iframeURL)) {
        iframeDOMNode.src = this.options.iframeURL;
      } else {
        var error = generateError('URL de l\'iframe invalide');
        this.$windowBody.appendChild(error);
        return;
      }
    } else {
      var error = generateError('URL de l\'iframe non renseigné.');
      this.$windowBody.appendChild(error);
      return;
    }

    this.$windowBody.appendChild(iframeDOMNode);
  };

  /**
   * Function for reset content to last content insert
   */
  fabModal.prototype.resetContent = function () {
    this.setContent(this.oldContent);
  };

  /**
   * @function closeWindow close, and removing from DOM 
   */
  fabModal.prototype.closeWindow = function () {
    var that = this;
    clearTimeout(this.timerTimeout);

    if (typeof this.options.onClosing === "function") {
      this.options.onClosing(this);
    }

    this.$el.classList.add(this.options.effects.out)
    if (this.$overlay) {
      this.$overlay.classList.add('fade-out');
    }
    // On remove la window une fois l'effet fade-out terminé
    window.setTimeout(function () {
      that.$el.dispatchEvent(new CustomEvent("fabModalClose"));
      that.$el.remove();
      if (that.$overlay) {
        that.$overlay.remove();
      }
      if (typeof that.options.onClosed === "function") {
        that.options.onClosed(this);
      }
    }, 800);
  };

  /**
   * @function startLoader For init loader and clear all content in window
   */
  fabModal.prototype.startLoader = function () {
    this.setContent(this.options.loader)
    this.$loader = this.$el.querySelector(this.options.selectors.loader);
  };

  /**
   * @function stopLoader for remove loader init with startLoader
   */
  fabModal.prototype.stopLoader = function () {
    this.$loader.remove();
  };

  fabModal.prototype.recalcLayout = function () {
    var fabContentHeight = this.$windowBody.scrollHeight,
      modalHeight = this.$el.clientHeight,
      windowHeight = $window.innerHeight,
      wrapperHeight = this.$el.clientHeight - this.$header.clientHeight,
      outerHeight = fabContentHeight + this.$header.clientHeight,
      borderBottom = this.options.isIframe ? 0 : 3;

    if (modalHeight !== this.modalHeight) {
      this.modalHeight = modalHeight;

      if (typeof this.options.onResize === 'function') {
        this.options.onResize(this);
      }
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

    if (modalHeight !== this.modalHeight) {
      this.modalHeight = modalHeight;

      if (this.options.onResize && typeof this.options.onResize === 'function') {
        this.options.onResize(this);
      }
    }

    if (this.options.isIframe === true) {
      // If the height of the window is smaller than the modal with iframe
      if (windowHeight < ((this.options.iframeHeight) + this.$header.clientHeight + borderBottom) || this.isFullScreen === true) {
        this.$windowBody.style.height = windowHeight - (this.$header.clientHeight + borderBottom) + 'px';
        if (this.options.isIframe && this.$iframe) {
          this.$iframe.height = windowHeight - (this.$header.clientHeight + borderBottom) + 'px';
        }
      } else {
        this.$windowBody.style.height = this.options.iframeHeight;
        if (this.options.isIframe && this.$iframe) {
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

  fabModal.prototype.startProgress = function (timer) {
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
          that.closeWindow();
        }, that.options.timeout);
      }

    }
  };

  fabModal.prototype.pauseProgress = function () {
    this.isPaused = true;
  };

  fabModal.prototype.resetProgress = function () {
    clearTimeout(this.timerTimeout);
    this.progressBar = {};
    this.$el.querySelector('.fab-window-progress-bar > div').style.width = '100%';
  };

  fabModal.prototype.resumeProgress = function () {
    this.isPaused = false;
  };

  fabModal.prototype.getExternalContent = function (url) {
    var that = this;

    this.startLoader();

    if (window.fetch) {
      fetch('https://api.github.com/repos/fabienwnklr/fabModal')
        .then(function (response) {
          return response.json()
        })
        .then(function (data) {
          console.log(data);

          var content = '<button id="back">Back...</button>';
          content += '<ul>';
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
          that.setContent(content);
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

      request.open('GET', 'https://api.github.com/repos/fabienwnklr/fabModal', true);

      request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          var data = JSON.parse(this.response);
          console.log(data);
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
          that.setContent(content);
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