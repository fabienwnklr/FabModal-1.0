export default class FabWindow {
  /**
   * 
   * @param {Object} options 
   */
  constructor(customOptions) {
    let options = customOptions || {};
    let defaults = {
      id: 'fabWindow_'+Math.round(new Date().getTime() + (Math.random() * 100)),
      selectors: {
        modal: '.fab-window',
        header: '.fab-header',
        body: '.fab-content',
        footer: '.fab-footer',
        reduce: '.reduce',
        close: '.close',
      },
      elements: {
        header: null,
        reduce: null,
        close: null,
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
      minimizable: true,
      bodyContent: '<div class="loader"></div>',
      footerContent: ''
    };
    this.options = Object.assign(defaults, options);
    this._initialize(this.options)
  }

  _initialize(options) {
    this.$el = this.createWindow();

    options.elements.header = this.$el.querySelector(options.selectors.header);
    options.elements.reduce = this.$el.querySelector(options.selectors.reduce);
    options.elements.close = this.$el.querySelector(options.selectors.close);
    options.elements.body = this.$el.querySelector(options.selectors.body);
    options.elements.footer = this.$el.querySelector(options.selectors.footer);

    this.setBodyContent(options.bodyContent);
    this.setFooterContent(options.footerContent);

    this.options.references.body.appendChild(this.$el);
    this.initHandlers();
  }

  createWindow() {
    let fabWindow = document.createElement('div');
    fabWindow.className = `fab-window ${this.options.effect}`;
    fabWindow.id = this.options.id;

    let fabWindowHeader = document.createElement('div');
    fabWindowHeader.className = 'fab-header';

    let fabWindowBody = document.createElement('div');
    fabWindowBody.className = 'fab-content';

    let recudeFabWindow = document.createElement('span');
    recudeFabWindow.className = 'reduce'

    let closefabWindow = document.createElement('span');
    closefabWindow.className = 'close'

    let fabWindowFooter = document.createElement('div');
    fabWindowFooter.className = 'fab-footer';

    fabWindow.appendChild(fabWindowHeader);
    fabWindow.appendChild(fabWindowBody);
    fabWindow.appendChild(fabWindowFooter);

    // J'ajoute l'icon pour fermer la window
    fabWindowHeader.appendChild(recudeFabWindow);
    fabWindowHeader.appendChild(closefabWindow);

    setTimeout(() => {
      fabWindow.classList.remove('fade-in');
    }, 1000)

    return fabWindow;
  }

  initHandlers() {
    let _this = this;

    this.$el.querySelector(this.options.selectors.close).onclick = null;
    this.$el.querySelector(this.options.selectors.close).addEventListener('click', function (event) {
      event.stopPropagation();
      event.preventDefault();

      _this.closeWindow();
    })

    if (this.options.draggable) {
      this.initDragWindow();
    } else {
      this.options.elements.header.style.cursor = 'default';
    }
  }

  initDragWindow() {
    let elmnt = this.$el;
    let dragMouseDown = (e) => {
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
    if (document.getElementById(elmnt.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    };



    let elementDrag = (e) => {
      this.options.isMoving = true
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    let closeDragElement = () => {
      console.log(`Window stop to moving dude ... :( !`)
      this.options.isMoving = false;
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }


  setBodyContent(content) {
    if (content) {
      this.options.elements.body.innerHTML = content;
    }
  }

  setFooterContent(content) {
    if (content) {
      this.options.elements.footer.innerHTML = content;
    }
  }

  closeWindow() {
    let _this = this;

    this.$el.classList.remove('fade-in');
    this.$el.classList.add('fade-out')
    // On remove la window une fois l'effet fade-out terminé
    window.setTimeout(function () {
      _this.$el.dispatchEvent(new CustomEvent("fabWindowClose"));
      _this.$el.remove();
    }, 800);
  }
}