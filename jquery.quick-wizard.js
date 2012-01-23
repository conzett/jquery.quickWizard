(function ($) {
    'use strict';
    var pluginName = 'quickWizard',
        defaults = {
            prevButton: '<button type="button">Previous</button>',
            nextButton: '<button type="button">Next</button>',
            startChild: ':first'
        };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);

        var jqueryElement = $(element),
            children,
            index,
            length,
            showHide,
            prevButton = $(this.options.prevButton),
            nextButton = $(this.options.nextButton),
            buttons = {prev : 'prev', next : 'next'},
            checkDisabled,
            enable,
            disable,
            validation = $().valid;

        children = jqueryElement.children();
        index = children.filter(this.options.startChild).index();
        length = children.length;

        disable = function (element) {
            if (element.is(':input')) {
                element.attr('disabled', 'disabled');
            } else {
                element.attr('aria-disabled', 'true');
            }
        };

        enable = function (element) {
            if (element.is(':input')) {
                element.removeAttr('disabled');
            } else {
                element.attr('aria-disabled', 'false');
            }
        };

        checkDisabled = function () {
            if (index === 0) {
                disable(prevButton);
            } else {
                enable(prevButton);
            }

            if (index === length - 1) {
                disable(nextButton);
            } else {
                enable(nextButton);
            }
        };

        showHide = function (button) {
            $(children[index]).hide();
            if (button === buttons.prev) {
                index -= 1;
            } else {
                index += 1;
            }
            $(children[index]).show();
            jqueryElement.trigger(button);
        };

        prevButton.click(function () {
            if (!validation || $(children[index]).find(':input').valid()) {
                if (index > 0) {
                    showHide(buttons.prev);
                }
                checkDisabled();
            }
        });

        nextButton.click(function () {
            if (index < length - 1) {
                showHide(buttons.next);
            }
            checkDisabled();
        });

        $(this.element).children(":not(" + this.options.startChild + ")").hide();
        $(this.element).append(prevButton, nextButton);
        checkDisabled();
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };

}(jQuery));