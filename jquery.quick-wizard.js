(function ($) {

    $.fn.quickWizard = function (options, callback) {
        
        var settings = {
            'prevButton': '<button id="form-wizard-prev" type="button">Previous</button>',
            'nextButton': '<button id="form-wizard-next" type="button">Next</button>',
            'activeClass': 'form-wizard-active',
            'element': 'fieldset',
            'submit': '[type = "submit"]',
            'root': null,
            'prevArgs': [0],
            'nextArgs': [0],
            'disabledClass': 'form-wizard-disabled'
        };

        if (options) {
            $.extend(settings, options);
        }

        callback = callback || function () { };
        
        function disablePrev(prevObj){
            if ($(prevObj).is(":button")) {
                $(prevObj).attr('disabled', 'disabled');
            } else {
                $(prevObj).addClass(settings.disabledClass);
            }
        }

        return this.each(function () {

            var container = $(this);
            var children = container.children(settings.element);            
            var activeClassSelector = '.' + settings.activeClass;
            var submitButton = container.find(settings.submit);
            var insertedNextCallback;
            var originalNextCallback;
            var root;
            
            if(settings.root === null){                
                root = children.first();
            }else{
                root = $(settings.root);
            }

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

            /* Insert the previous and next buttons after the submit button and hide it until we're ready */
            
            var prev = $(settings.prevButton).insertBefore(submitButton);
            var next = $(settings.nextButton).insertBefore(submitButton);
            submitButton.hide();
            
            /* If the root element is first disable the previous button */            
            if(root.is(':first-child')){
                disablePrev(prev);
            }

            children.hide();
            root.toggleClass(settings.activeClass).show();

            $(next).click(function () {
                var active = container.find(activeClassSelector);

                /* Check to see if the forms are valid before moving on */

                if (active.children(":input").valid()) {
                    var nextSet = active.next(settings.element);
                    var afterNextSet = nextSet.next(settings.element);
                    if (nextSet.length) {
                        $(active).toggleClass(settings.activeClass);
                        $(nextSet).toggleClass(settings.activeClass);
                        
                        /* Get the current element's position and store it */
                        active.data('posiiton', active.css('position'));

                        /* Set our callback function */
                        insertedNextCallback = function () { active.css('position', active.data('posiiton')); };

                        /* Call show and hide with the user provided arguments */
                        active.css('position', 'absolute').hide.apply(active, settings.nextArgs);
                        nextSet.show.apply(nextSet, settings.prevArgs);

                        /* If the previous button is a button enable it */
                        if ($(prev).is(":button")) {
                            $(prev).removeAttr('disabled');
                        } else {
                            /* If it's anything else, remove the disabled class */
                            $(prev).removeClass(settings.disabledClass);
                        }
                    }

                    /* If there are no more sections, hide the next button and show the submit button */
                    if (afterNextSet.length <= 0) {
                        $(next).hide();
                        submitButton.show();
                    }
                }
            });

            $(prev).click(function () {
                var active = container.find(activeClassSelector);
                var prevSet = active.prev(settings.element);
                var beforePrevSet = prevSet.prev(settings.element);
                if (prevSet.length) {
                    $(active).toggleClass(settings.activeClass);
                    $(prevSet).toggleClass(settings.activeClass);                    
                    prevSet.data('posiiton', prevSet.css('position'));
                    insertedNextCallback = function () { prevSet.css('position', prevSet.data('posiiton')); };
                    active.hide.apply(active, settings.prevArgs);
                    prevSet.css('position', 'absolute').show.apply(prevSet, settings.nextArgs);
                    $(next).show();
                    submitButton.hide();
                }
                if (beforePrevSet.length <= 0) {
                    disablePrev(prev);
                }
            });

            callback.call(this);

        });

    };
})(jQuery);