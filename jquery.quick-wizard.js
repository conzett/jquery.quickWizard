(function ($) {

    var settings = {
        'prevButton': '<button id="form-wizard-prev" type="button" disabled="disabled">Previous</button>',
        'nextButton': '<button id="form-wizard-next" type="button">Next</button>',
        'activeClass': 'form-wizard-active',
        'element': 'fieldset',
        'submit': '[type = "submit"]',
        'root': null,
        'prevArgs': [0],
        'nextArgs': [0],
        'disabledClass': 'form-wizard-disabled'
    };

    $.fn.formWizard = function (options, callback) {

        if (options) {
            $.extend(settings, options);
        }

        callback = callback || function () { };

        return this.each(function () {

            var container = $(this);
            var children = container.children(settings.element);
            var root = settings.root || children.first();
            var prevID = '#' + $(settings.prevButton).attr("id");
            var nextID = '#' + $(settings.nextButton).attr("id");
            var activeClassSelector = '.' + settings.activeClass;
            var submitButton = $('[type = "submit"]');
            var insertedNextCallback;
            var originalNextCallback;

            /* Check if the last argument is a callback function */
            if (typeof (settings.nextArgs[settings.nextArgs.length - 1]) == "function") {

                /* If it is store the user provided callback */
                originalNextCallback = settings.nextArgs[settings.nextArgs.length - 1];

                /* then replace it with a wrapper function that calls both the user provided function and ours */
                settings.nextArgs[settings.nextArgs.length - 1] = function () { insertedNextCallback.call(); originalNextCallback.call(); };

            } else {
                
                /* If there is no callback function append ours */
                settings.nextArgs[settings.nextArgs.length] = function () { insertedNextCallback.call(); }
            }

            container.append(settings.prevButton, settings.nextButton);

            /* Move the submit button after the next button and hide it until we're ready */
            submitButton.insertAfter(nextID).hide();

            children.hide();
            root.toggleClass(settings.activeClass).show();

            $(nextID).click(function () {
                var active = $(activeClassSelector);

                /* Check to see if the forms are valid before moving on */

                if (active.children(":input").valid()) {
                    var next = active.next(settings.element);
                    var afterNext = next.next(settings.element);
                    if (next.length) {
                        $(active).toggleClass(settings.activeClass);
                        $(next).toggleClass(settings.activeClass);

                        /* Set our callback function */
                        insertedNextCallback = function () { active.css('position', 'static'); };

                        /* Call show and hide with the user provided arguments */
                        active.css('position', 'absolute').hide.apply(active, settings.nextArgs);
                        next.show.apply(next, settings.prevArgs);

                        /* If the previous button is a button enable it */
                        if ($(prevID).is(":button")) {
                            $(prevID).removeAttr('disabled');
                        } else {
                            /* If it's anything else, remove the disabled class */
                            $(prevID).removeClass(settings.disabledClass);
                        }
                    }

                    /* If there are no more sections, hide the next button and show the submit button */
                    if (afterNext.length <= 0) {
                        $(nextID).hide();
                        submitButton.show();
                    }
                }
            });

            $(prevID).click(function () {
                var active = $(activeClassSelector);
                var prev = active.prev(settings.element);
                var beforePrev = prev.prev(settings.element);
                if (prev.length) {
                    $(active).toggleClass(settings.activeClass);
                    $(prev).toggleClass(settings.activeClass);
                    insertedNextCallback = function () { prev.css('position', 'static'); };
                    active.hide.apply(active, settings.prevArgs);
                    prev.css('position', 'absolute').show.apply(prev, settings.nextArgs);
                    $(nextID).show();
                    submitButton.hide();
                }
                if (beforePrev.length <= 0) {
                    if ($(prevID).is(":button")) {
                        $(prevID).attr('disabled', 'disabled');
                    } else {
                        $(prevID).addClass(settings.disabledClass);
                    }
                }
            });

            callback.call(this);

        });

    };
})(jQuery);