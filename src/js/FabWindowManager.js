var FabWindowManager = null;
(function () {
    'use strict';
    WindowManager = function (options) {
        this.fabWindows = [];
        options = options || {};
        this.initialize(options);
        return this;
    };

    WindowManager.prototype.findWindowByID = function (id) {
        var returnValue = null;
        $.each(this.windows, function (index, window) {
            console.log(arguments);
            if (window.id === id) {
                returnValue = window;
            }
        });
        return returnValue;
    };

    WindowManager.prototype.destroyWindow = function (window_handle) {
        var _this = this;
        var returnVal = false;
        $.each(this.windows, function (index, window) {
            if (window === window_handle) {
                window_handle.close();
                _this.windows.splice(index, 1);
                _this.resortWindows();
                returnVal = true;
            }
        });
        return returnVal;
    };

    WindowManager.prototype.closeWindow = WindowManager.prototype.destroyWindow;

    WindowManager.prototype.resortWindows = function () {
        var startZIndex = 900;
        $.each(this.windows, function (index, window) {

            window.setIndex(startZIndex + index);
        });
    };

    WindowManager.prototype.setFocused = function (focused_window) {
        var focusedWindowIndex;
        while (focused_window.getBlocker()) {
            focused_window = focused_window.getBlocker();
        }
        $.each(this.windows, function (index, windowHandle) {
            windowHandle.setActive(false);
            if (windowHandle === focused_window) {
                focusedWindowIndex = index;
            }
        });
        this.windows.push(this.windows.splice(focusedWindowIndex, 1)[0]);
        focused_window.setActive(true);
        this.resortWindows();

    };

    WindowManager.prototype.sendToBack = function (window) {
        var windowHandle = this.windows.splice(this.windows.indexOf(window), 1)[0];
        this.windows.unshift(windowHandle);
        this.resortWindows();
        return true;
    };


    WindowManager.prototype.initialize = function (options) {
        this.options = options;
        this.elements = {};

        if (this.options.container) {
            this.elements.container = $(this.options.container);
            this.elements.container.addClass('window-pane');
        }
    };

    WindowManager.prototype.getContainer = function () {
        var returnVal;
        if (this.elements && this.elements.container) {
            returnVal = this.elements.container;
        }
        return returnVal;
    };

    WindowManager.prototype.setNextFocused = function () {
        this.setFocused(this.windows[this.windows.length - 1]);
    };

    WindowManager.prototype.addWindow = function (window_object) {
        var _this = this;
        window_object.getElement().on('focused', function (event) {
            _this.setFocused(window_object);
        });
        window_object.getElement().on('close', function () {
            _this.destroyWindow(window_object);
            if (window_object.getWindowTab()) {
                window_object.getWindowTab().remove();
            }

        });

        window_object.on('bsw.restore', function () {
            _this.resortWindows();
        });

        if (this.options.container) {
            window_object.setWindowTab($('<span class="label label-default">' + window_object.getTitle() + '<button class="close">x</button></span>'));
            window_object.getWindowTab().find('.close').on('click', function (event) {
                var blocker = window_object.getBlocker();
                if (!blocker) {
                    window_object.close();
                } else {
                    blocker.blink();
                }

            });
            window_object.getWindowTab().on('click', function (event) {
                var blocker = window_object.getBlocker();
                if (!blocker) {
                    _this.setFocused(window_object);
                    if (window_object.getSticky()) {
                        window.scrollTo(0, window_object.getElement().position().top);
                    }
                } else {
                    blocker.blink();
                }
            });

            $(this.options.container).append(window_object.getWindowTab());
        }

        this.windows.push(window_object);
        window_object.setManager(this);
        this.setFocused(window_object);
        return window_object;
    };

    WindowManager.prototype.createWindow = function (window_options) {
        var _this = this;
        var final_options = Object.create(window_options);
        if (this.options.windowTemplate && !final_options.template) {
            final_options.template = this.options.windowTemplate;
        }

        var newWindow = new Window(final_options);


        return this.addWindow(newWindow);
    };
}(jQuery));