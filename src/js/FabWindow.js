let FabWindow = null;
(function () {
  'use strict'
  const namespace = 'fbw'
  FabWindow = function (options) {
    options = options || {};
    let defaults = {
      selectors: {
        modal: '.fab',
        body: '.fab-content',
        footer: '.fab-footer'
      },
      references: {
        body: document.querySelector('body')
      },
      effect: 'fade-in',
      maximized: false,
      minimized: false,
      maximizable: true,
      minimizable: true,
      bodyContent: '',
      footerContent: ''
    };
    this.options = Object.assign(defaults, options);
    this.initialize(this.options);
    return this;
  };

  FabWindow.prototype.initialize = function (options) {

    let modal = document.createElement('div');
        modal.className = `fab-window ${options.effect}`;

    let modalBody = document.createElement('div');
        modalBody.className = 'fab-content';
        if (options.bodyContent) {
          modalBody.innerHTML = options.bodyContent;
        }

    let closeModal = document.createElement('span');
        closeModal.className = 'close'

    let modalFooter = document.createElement('div');
        modalFooter.className = 'fab-footer';
        if (options.footerContent) {
          modalFooter.innerHTML = options.footerContent;
        }

    modal.appendChild(modalBody);
    modalBody.appendChild(closeModal);
    modal.appendChild(modalFooter);

    options.references.body.appendChild(modal)
    this.$el = modal;
    this.initHandlers();
  }

  FabWindow.prototype.initHandlers = function() {
    let _this = this;

    
    this.$el.querySelector('.close').addEventListener('click', function(event) {
      event.stopPropagation();
      event.preventDefault();

      _this.closeWindow();
    })
  }

  FabWindow.prototype.closeWindow = function() {
    let _this = this;
    this.$el.dispatchEvent(new CustomEvent("fabWindowClose"));
    this.$el.classList.remove('fade-in');
    this.$el.classList.add('fade-out')
    // On remove la window une fois l'effet fade-out terminé
    window.setTimeout(function () {
      _this.$el.remove();
    }, 800);
  }


})()