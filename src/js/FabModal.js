var FabModal = null,
  $window = null,
  $body = null;
(function () {
  'use strict';
  /**
   * Create you're custom FabModal
   * @param {Object} options
   * @param {String} options.title default is empty
   * @param {String} options.content default is loader
   * @param {Boolean} options.maximizable default is true
   * @param {Boolean} options.minimizable default is true
   * @param {Boolean} options.timeoutProgressBar default is false
   * @param {Number} options.timeout Default is false
   * @param {Boolean} options.pauseOnHover Default is false
   * @param {Boolean} options.isIframe default is false
   * @param {String} options.iframeURL default is empty
   * @param {String} options.iframeHeight default is 400px
   * @param {Function} options.onFullscreen called when fullscreen completed
   * @param {Function} options.onRestore called when restore modal size
   * @param {Function} options.onResize called on resize
   * @param {Function} options.onOpen called when modal showing
   * @param {Function} options.onClosing called during closing
   * @param {Function} options.onClosed called closed is completed
   */
  FabModal = function FabModal(options) {
    // Selectors
    $window = window;
    $body = document.querySelector('body');
    // Options
    options = options || {};
    var defaults = {
      id: 'fab-modal-' + Math.round(new Date().getTime() + (Math.random() * 100)),
      selectors: {
        overlay: '.fab-overlay',
        modal: '.fab-modal',
        header: '.fab-header',
        title: '.fab-title',
        icons: '.fab-icons',
        maximize: '.maximize',
        reduce: '.reduce',
        close: '.close',
        body: '.fab-content',
        iframe: '.fab-iframe',
        loader: '.loader',
        progress: '.fab-modal-progress-bar'
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
      onFullscreen: function onFullscreen() {},
      onRestore: function onRestore() {},
      onResize: function onResize() {},
      onOpen: function onOpen() {},
      // During closing
      onClosing: function onClosing() {},
      // When modal are closed
      onClosed: function onClosed() {},
    };

    this.isPaused = false;
    this.isFullScreen = options.isFullScreen ? true : false;
    this.isMinimized = false;
    this.timerTimeout = null;
    this.oldContent = null;
    this.modalHeight = 0;

    this.cssInserted = false;

    this.options = Object.assign(defaults, options);

    this.initialize(this.options);


  };


  /** Utils private function */

  /**
   * check if url is valid
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

  /** For générate HTML custom fab-error
   * @param {String} message Message to display on modal
   */
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

  /**
   * Recalcule layout of modal
   * @param {Object} modal FabModal object
   */
  function recalcLayout(modal) {
    var fabContentHeight = modal.$modalBody.scrollHeight,
      modalHeight = modal.$el.clientHeight,
      windowHeight = $window.innerHeight,
      wrapperHeight = modal.$el.clientHeight - modal.$header.clientHeight,
      outerHeight = fabContentHeight + modal.$header.clientHeight,
      borderBottom = modal.options.isIframe ? 0 : 3;

    if (modalHeight !== modal.modalHeight) {
      modal.modalHeight = modalHeight;

      if (typeof modal.options.onResize === 'function') {
        modal.options.onResize(modal);
      }
    }

    if (!modal.isFullScreen) {
      modal.$el.style.height = parseInt(fabContentHeight) + (modal.$header.clientHeight - borderBottom) + 'px';
    }

    if (outerHeight > windowHeight) {
      if (document.querySelectorAll('.fab-modal').length === 1) {
        document.querySelector('html').style.overflow = 'hidden';
      }
      modal.$el.style.height = windowHeight + 'px';

    } else {
      modal.$el.style.height = fabContentHeight + (modal.$header.clientHeight + borderBottom) + 'px';
      if (document.querySelectorAll('.fab-modal').length === 1) {
        document.querySelector('html').style.overflow = '';
      }
    }

    if (modalHeight !== modal.modalHeight) {
      modal.modalHeight = modalHeight;

      if (modal.options.onResize && typeof modal.options.onResize === 'function') {
        modal.options.onResize(modal);
      }
    }

    if (modal.options.isIframe === true) {
      // If the height of the window is smaller than the modal with iframe
      if (windowHeight < ((modal.options.iframeHeight) + modal.$header.clientHeight + borderBottom) || modal.isFullScreen === true) {
        modal.$modalBody.style.height = windowHeight - (modal.$header.clientHeight + borderBottom) + 'px';
        if (modal.options.isIframe && modal.$iframe) {
          modal.$iframe.height = windowHeight - (modal.$header.clientHeight + borderBottom) + 'px';
        }
      } else {
        modal.$modalBody.style.height = modal.options.iframeHeight;
        if (modal.options.isIframe && modal.$iframe) {
          modal.$iframe.height = modal.options.iframeHeight;
        }
      }
    }
    (function applyScroll() {
      if (fabContentHeight > wrapperHeight) {
        modal.$modalBody.classList.add('hasScroll');
        modal.$modalBody.style.height = modalHeight - (modal.$header.clientHeight + borderBottom) + 'px';
      } else if (modal.options.isIframe === false) {
        modal.$modalBody.classList.remove('hasScroll');
        modal.$modalBody.style.height = 'auto';
      }
    })();
  };

  /** ----------------------------- */

  /**
   * Init all utilities of modal 
   * 
   * @param {Object} options 
   */
  FabModal.prototype.initialize = function initialize(options) {
    var that = this;

    if (!this.cssInserted) {
      var scripts = document.getElementsByTagName("script");
      var src = scripts[0].src;
      src = src.split('/').slice(0, 5).join('/');
      var cssFabModal = document.createElement('link');
      cssFabModal.href = src + '/assets/css/main.css';
      cssFabModal.rel = 'stylesheet';
      document.querySelector('head').appendChild(cssFabModal);
      this.cssInserted = true;
    }

    this.$el = this.createModal();

    if (options.overlayClose === true) {
      this.$overlay = $body.querySelector(options.selectors.overlay);
    }
    if (options.timeoutProgressBar) {
      this.$progressBar = this.$el.querySelector(options.selectors.progress);
    }
    this.$header = this.$el.querySelector(options.selectors.header);
    this.$title = this.$el.querySelector(options.selectors.title);
    this.$icons = this.$el.querySelector(options.selectors.icons);
    this.$reduce = this.$el.querySelector(options.selectors.reduce);
    this.$maximize = this.$el.querySelector(options.selectors.maximize)
    this.$close = this.$el.querySelector(options.selectors.close);
    this.$modalBody = this.$el.querySelector(options.selectors.body);

    $body.appendChild(this.$el);

    if (options.isIframe === false) {
      this.setContent(options.content);
    } else {
      this.generateIframe();
      this.$iframe = this.$el.querySelector(options.selectors.iframe);
    }

    this.initHandlers();
    this.show();

    (function updateTimer() {
      recalcLayout(that);
      that.timerRecalcLayout = setTimeout(updateTimer, 300);
    })();
  };

  /**
   * Create modal
   */
  FabModal.prototype.createModal = function createModal() {
    var FabModal = document.createElement('div');
    var iframe = this.options.isIframe ? ' iframe' : '';
    var fullScreen = this.isFullScreen ? ' fullScreen' : '';
    FabModal.className = 'fab-modal ' + this.options.effects.in + iframe + fullScreen;
    FabModal.id = this.options.id;
    FabModal.style.maxWidth = this.options.width;
    FabModal.style.maxHeight = this.options.height;

    if (this.options.timeoutProgressBar && this.options.isIframe === false) {
      var FabModalProgressBar = document.createElement('div');
      var div = document.createElement('div');

      FabModalProgressBar.className = 'fab-modal-progress-bar';
      FabModalProgressBar.appendChild(div);

      FabModal.appendChild(FabModalProgressBar);
    }

    var FabModalHeader = document.createElement('div');
    FabModalHeader.className = 'fab-header';
    FabModal.appendChild(FabModalHeader);

    var FabModalTitle = document.createElement('h1');
    FabModalTitle.className = 'fab-title';
    FabModalTitle.innerHTML = this.options.title;
    FabModalHeader.appendChild(FabModalTitle);

    var FabModalIcons = document.createElement('div');
    FabModalIcons.className = 'fab-icons';
    FabModalHeader.appendChild(FabModalIcons)

    if (this.options.maximizable) {
      var fullScreenModalBtn = document.createElement('button');
      fullScreenModalBtn.className = 'maximize';
      fullScreenModalBtn.title = 'Agrandir';
      FabModalIcons.appendChild(fullScreenModalBtn)
    }

    var closeBtn = document.createElement('button');
    closeBtn.className = 'close';
    closeBtn.title = 'Fermer';
    FabModalIcons.appendChild(closeBtn);

    var FabModalBody = document.createElement('div');
    FabModalBody.className = 'fab-content fade-in';
    FabModalBody.style.maxWidth = this.options.width;
    FabModalBody.style.maxHeight = this.options.height;
    FabModal.appendChild(FabModalBody);

    if (!document.querySelector(this.options.selectors.overlay) && this.options.overlayClose === true) {
      var FabModalOverlay = document.createElement('div');
      FabModalOverlay.className = 'fab-overlay fade-in';
      $body.appendChild(FabModalOverlay);
    }

    // On retire la class après l'affichage de la window pour plus de propreté
    var that = this;
    setTimeout(function removeClassEffect() {
      FabModal.classList.remove(that.options.effects.in);
    }, 1000)

    return FabModal;
  };

  /**
   * init all event on modal
   */
  FabModal.prototype.initHandlers = function initHandlers() {
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

      that.close();
    })
    document.addEventListener('keyup', function (e) {
      if (e.keyCode === 27) {
        that.close();
      }
    })

    // Overlay close on click
    if (this.options.overlayClose === true) {
      this.$overlay.onclick = null;
      this.$overlay.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();

        that.close();
      })
    }

    // Event progress bar
    if (this.options.timeoutProgressBar && this.options.timeout !== false && !isNaN(parseInt(this.options.timeout)) && this.options.timeout !== 0) {
      this.options.timeout = parseInt(this.options.timeout);
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

  /**
   * Function showing the modal 
   */
  FabModal.prototype.show = function show() {
    this.$el.style.display = 'block';
    this.$el.style.opacity = 1;
    if (this.$overlay) {
      this.$overlay.style.display = 'block';
    }

    if (this.options.onOpen && typeof this.options.onOpen === 'function') {
      this.options.onOpen(this);
    }
  };

  /**
   * Function hiding the modal
   */
  FabModal.prototype.hide = function hide() {
    this.$el.style.display = 'none';
    if (this.$overlay) {
      this.$overlay.style.display = 'none';
    }
  };

  /**
   * Function for set or unset fullscreen on modal
   */
  FabModal.prototype.toggleFullScreen = function toggleFullScreen() {
    if (this.isFullScreen) {
      this.isFullScreen = false;
      $body.style.overflow = 'auto';
      this.$el.classList.remove('fullScreen');
      this.$maximize.title = 'Agrandir';

      this.$el.dispatchEvent(new CustomEvent("restore"));
      if (typeof this.options.onRestore === 'function') {
        this.options.onRestore(this);
      }
    } else {
      this.isFullScreen = true
      $body.style.overflow = 'hidden';
      this.$el.classList.add('fullScreen');
      this.$maximize.title = 'Réstaurer';

      this.$el.dispatchEvent(new CustomEvent("fullScreen"));
      if (typeof this.options.onFullScreen === 'function') {
        this.options.onFullScreen(this);
      }
    }
  };

  /**
   * Function for setting content of modal
   * @param {string} content Content to append
   */
  FabModal.prototype.setContent = function setContent(content) {
    if (content !== '' && content !== 'undefined' && content !== null) {
      var isLoader = true;
      if (this.$modalBody.innerHTML !== this.options.loader) {
        isLoader = false;
      }
      if (!isLoader) {
        this.oldContent = this.$modalBody.innerHTML;
      }
      this.$modalBody.innerHTML = content;
      if (this.options.height === 'auto') {
        this.options.height = this.$el.clientHeight;
      }
    }
  };

  /**
   * Function for set a new title
   * @param {string} title new title
   */
  FabModal.prototype.setTitle = function setTitle(title) {
    this.options.title = title;
    this.$title.innerHTML = title;
  };

  /**
   * Getter for title property
   */
  FabModal.prototype.getTitle = function getTitle() {
    return this.options.title;
  };

  /**
   * Function create iframe node with URL and insert in modalBody
   */
  FabModal.prototype.generateIframe = function generateIframe() {
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
        this.$modalBody.appendChild(error);
        return;
      }
    } else {
      var error = generateError('URL de l\'iframe non renseigné.');
      this.$modalBody.appendChild(error);
      return;
    }

    this.$modalBody.appendChild(iframeDOMNode);
  };

  /**
   * Function for reset content to last content insert
   */
  FabModal.prototype.resetContent = function resetContent() {
    if (this.oldContent && this.oldContent !== '' && typeof this.oldContent !== 'undefined') {
      this.setContent(this.oldContent);
    }
  };

  /**
   * Function close [close, and removing from DOM] 
   */
  FabModal.prototype.close = function close() {
    var that = this;
    clearTimeout(this.timerTimeout);
    clearTimeout(this.timerRecalcLayout);

    $body.style.overflow = 'auto';

    if (typeof this.options.onClosing === "function") {
      this.options.onClosing(this);
    }

    this.$el.classList.add(this.options.effects.out)
    if (this.$overlay) {
      this.$overlay.classList.add('fade-out');
    }

    window.setTimeout(function close() {
      that.$el.dispatchEvent(new CustomEvent("FabModalClose"));
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
   * Function startLoader For init loader and clear all content in modal
   */
  FabModal.prototype.startLoader = function startLoader() {
    this.setContent(this.options.loader)
    this.$loader = this.$el.querySelector(this.options.selectors.loader);
  };

  /**
   * Function stopLoader for remove loader init with startLoader
   */
  FabModal.prototype.stopLoader = function stopLoader() {
    this.$loader.remove();
  };

  /**
   * Function starting progress bar
   * @param {Integer} timer In millisecond
   */
  FabModal.prototype.startProgress = function startProgress(timer) {
    if (!this.$progressBar) {
      var FabModalProgressBar = document.createElement('div');
      var div = document.createElement('div');

      FabModalProgressBar.className = 'fab-modal-progress-bar';
      FabModalProgressBar.appendChild(div);

      this.$el.appendChild(FabModalProgressBar);
      this.$progressBar = FabModalProgressBar;

      this.options.timeoutProgressBar = true;
      this.options.timeout = true;
    }
    if (typeof timer !== 'number' && this.options.timeout === false) {
      console.warn('please ');
      return;
    }
    if (!timer) {
      timer = this.options.timeout
    }
    this.isPaused = false;
    var that = this;

    clearTimeout(this.timerTimeout);

    if (this.options.timeoutProgressBar === true) {

      this.progressBar = {
        hideEta: null,
        maxHideTime: null,
        currentTime: new Date().getTime(),
        el: this.$el.querySelector('.fab-modal-progress-bar > div'),
        updateProgress: function updateProgress() {
          if (!that.isPaused) {

            that.progressBar.currentTime = that.progressBar.currentTime + 10;

            var percentage = ((that.progressBar.hideEta - (that.progressBar.currentTime)) / that.progressBar.maxHideTime) * 100;
            that.progressBar.el.style.width = percentage + '%';
            if (percentage < 0) {
              that.close();
            }
          }
        }
      };
      if (timer > 0) {
        this.progressBar.maxHideTime = parseFloat(timer);
        this.progressBar.hideEta = new Date().getTime() + this.progressBar.maxHideTime;
        this.timerTimeout = setInterval(this.progressBar.updateProgress, 10);
      } else {
        this.timerTimeout = setTimeout(function closeOnEndProgress() {
          that.close();
        }, that.options.timeout);
      }

    }
  };

  /** Pause progress bar */
  FabModal.prototype.pauseProgress = function pauseProgress() {
    this.isPaused = true;
  };

  /** Reset (don't restart) progress bar */
  FabModal.prototype.resetProgress = function resetProgress() {
    clearTimeout(this.timerTimeout);
    this.progressBar = {};
    this.$el.querySelector('.fab-modal-progress-bar > div').style.width = '100%';
  };

  /** Resume progress bar */
  FabModal.prototype.resumeProgress = function resumeProgress() {
    this.isPaused = false;
  };

  /** For get extern content (fetch by default, XMLHttpRequest if fetch not defined)
   * @param {string} url url to get
   */
  FabModal.prototype.getExternalContent = function getExternalContent(url) {
    var that = this;
    if (!url || typeof ulr === 'undefined' || url === null) {
      url = 'https://api.github.com/repos/fabienwnklr/FabModal';
    }

    this.startLoader();

    if (window.fetch) {
      fetch(url)
        .then(function (response) {
          return response.json().then(function (data) {
            var content = '<button id="back">Back...</button>';
            content += '<ul>';
            for (var property in data) {
              content += '<li style="margin: 20px 0 20px 0;">'
              content += '<span style="font-weight:bold;">' + property + '</span>: ' + data[property];
              content += '<li>'
            }
            content += '</ul>';
            that.setContent(content);
            that.stopLoader();
          })
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
        throw new Error('Failed to execute \'getExternalContent\' : parameter is not of type \'Object\'')
      }

      request.open('GET', url, true);

      request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          var data = JSON.parse(this.response);
          var content = '<button id="back">Back...</button>';
          content += '<ul>';
          for (var property in data) {
            content += '<li style="margin: 20px 0 20px 0;">'
            content += '<span style="font-weight:bold;">' + property + '</span>: ' + data[property];
            content += '<li>'
          }
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