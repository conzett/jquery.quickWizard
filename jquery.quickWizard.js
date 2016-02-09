(function ($) {

    var defaults = {

        prevButton: '<button id="form-wizard-prev" type="button">Previous</button>',
        nextButton: '<button id="form-wizard-next" type="button">Next</button>',
        activeClass: 'form-wizard-active',
        element: 'fieldset',
        submit: '[type = "submit"]',
        root: null,
        prevArgs: [0],
        nextArgs: [0],
        disabledClass: 'form-wizard-disabled',
        containerClass : 'form-wizard-container',
        breadCrumb: true,
        breadCrumbElement: 'legend',
        breadCrumbListOpen: '<ol>',
        breadCrumbListClose: '</ol>',
        breadCrumbListClass: 'bread-crumb',
        breadCrumbListElementOpen: '<li>',
        breadCrumbListElementClose: '</li>',
        breadCrumbActiveClass: 'bread-crumb-active',
        breadCrumbCompletedClass: 'bread-crumb-completed',
        breadCrumbPosition: 'before',
        clickableBreadCrumbs: false,

        // Callbacks
        onWizardLoad : function () { return true; },
        onWizardPrev : function () { return true; },
        onWizardNext : function () { return true; }
    };

    $.fn.quickWizard = function (options) {

        if (this.length === 0) {
          return this;
        }

        // support multiple elements
        if (this.length > 1) {
            this.each(function() {
                $(this).quickWizard(options);
            });
          return this;
        }

        var wizard = {},
        // set a reference to our wizard element
        el = this,

        breadCrumbList = null,
        originalNextCallback = null,
        insertedNextCallback = null;

        /**
         * ==============================================
         * = PRIVATE FUNCTIONS
         * ==============================================
         */

        var init = function() {
            
            // merge user-supplied options with the defaults
            wizard.settings = $.extend({}, defaults, options);
            wizard.container = $(el);
            wizard.children = $(el).children(wizard.settings.element);            
            wizard.activeClassSelector = '.' + wizard.settings.activeClass;
            wizard.submitButton = $(el).find(wizard.settings.submit);
            wizard.root;

            if( wizard.settings.root === null ){                
                wizard.root = wizard.children.first();
            }else{
                wizard.root = $(wizard.settings.root);
            }
            

            /* Check if the last argument is a callback function */
            if (typeof (defaults.nextArgs[defaults.nextArgs.length - 1]) == "function") {

                /* If it is store the user provided callback */
                originalNextCallback = defaults.nextArgs[defaults.nextArgs.length - 1];

                /* then replace it with a wrapper function that calls both the user provided function and ours */
                defaults.nextArgs[defaults.nextArgs.length - 1] = function () { insertedNextCallback.call(); originalNextCallback.call(); };

            } else {
                
                /* If there is no callback function append ours */
                defaults.nextArgs[defaults.nextArgs.length] = function () { insertedNextCallback.call(); }
            }

            // initialize the controls object
            wizard.controls = {};
            
            setup();
        
        };

        var setup = function () {

            /* Set up container class */
            if(wizard.settings.containerClass != ""){
                wizard.container.addClass(wizard.settings.containerClass);
            }
            
            /* Set up bread crumb menu */
            if (wizard.settings.breadCrumb) {
                
                if ( !$('.' + wizard.settings.breadCrumbListClass).length ) {

                    breadCrumbList = wizard.settings.breadCrumbListOpen;

                    wizard.children.find(wizard.settings.breadCrumbElement).each(function (index) {
                        breadCrumbList += wizard.settings.breadCrumbListElementOpen + $(this).text() + defaults.breadCrumbListElementClose;
                    });

                    breadCrumbList += wizard.settings.breadCrumbListClose;
                    if (wizard.settings.breadCrumbPosition === 'after') {
                        breadCrumbList = $(breadCrumbList).insertAfter(wizard.container);
                    } else {
                        breadCrumbList = $(breadCrumbList).insertBefore(wizard.container);
                    }
                } else {

                    breadCrumbList = $('.'+wizard.settings.breadCrumbListClass);
                }

                breadCrumbList.children().first().addClass(defaults.breadCrumbActiveClass);
                breadCrumbList.addClass(defaults.breadCrumbListClass);

            }

            wizard.submitButton.addClass('hidden');

            // Accessible hiding fix
            wizard.children.css({
                "position": "relative",
                "top": 0,
                "left": 0,
                "display": "none" 
            }); 

            wizard.root.toggleClass(wizard.settings.activeClass).show();

            appendControls();

            // onSliderLoad callback
            wizard.settings.onWizardLoad.call(el, wizard.settings.activeClass);
        };

        var appendControls = function () {

            /* Insert the previous and next buttons after the submit button and hide it until we're ready */
            if ( wizard.container.find('.form-wizard-prev').length ) {
                wizard.settings.prevButton = '.form-wizard-prev';
                wizard.controls.prev = $(wizard.settings.prevButton);
            } else {
                wizard.controls.prev = $(wizard.settings.prevButton).insertBefore(wizard.settings.wizard.submitButton);
            }


            if ( wizard.container.find('.form-wizard-next').length ) {
                wizard.settings.nextButton = '.form-wizard-next';
                wizard.controls.next = $(wizard.settings.nextButton);
            } else {
                wizard.controls.next = $(wizard.settings.nextButton).insertBefore(wizard.settings.wizard.submitButton);
            }


            /* If the root element is first disable the previous button */            
            if(wizard.root.is(':first-child')){
                wizard.controls.prev.removeClass('visible')
                                    .addClass('hidden');
            } 

            // bind click actions to the controls
            wizard.controls.next.on('click touchend', clickNextBind); 
            wizard.controls.prev.on('click touchend', clickPrevBind);

        };

        var clickPrevBind = function (e) {
            e.preventDefault;
            
            if ( $(this).hasClass('stop-event') ) return;

            var active = $(el).find(wizard.activeClassSelector),
                prevSet = active.prev(wizard.settings.element),
                beforePrevSet = prevSet.prev(wizard.settings.element);

            if (prevSet.length) {
                $(active).toggleClass(wizard.settings.activeClass);
                $(prevSet).toggleClass(wizard.settings.activeClass);                    
                prevSet.data('posiiton', prevSet.css('position'));
                insertedNextCallback = function () { prevSet.css('position', prevSet.data('posiiton')); };
                active.hide.apply(active, wizard.settings.prevArgs);
                prevSet.css('position', 'absolute').show.apply(prevSet, wizard.settings.nextArgs);
                if (wizard.settings.breadCrumb) {
                    breadCrumbList.find('.' + wizard.settings.breadCrumbActiveClass).removeClass(wizard.settings.breadCrumbActiveClass).prev().addClass(wizard.settings.breadCrumbActiveClass);
                }

                wizard.controls.next.removeClass('hidden');
                wizard.submitButton.addClass('hidden');
            }

            if (beforePrevSet.length <= 0) {
                $(this).addClass('hidden');
            }

            wizard.settings.onWizardPrev.call(el, beforePrevSet, prevSet);

        };

        var clickNextBind = function (e) {
            e.preventDefault();

            if ( $(this).hasClass('stop-event') ) return;

            var active = $(el).find(wizard.activeClassSelector);

            /* Check to see if the forms are valid before moving on */

            if (active.find(":input").not('.form-wizard-next, form-wizard-prev').valid()) {

                var nextSet = active.next(wizard.settings.element);
                var afterNextSet = nextSet.next(wizard.settings.element);
                
                if (nextSet.length) {
                    $(active).toggleClass(wizard.settings.activeClass);
                    $(nextSet).toggleClass(wizard.settings.activeClass);
                    
                    /* Get the current element's position and store it */
                    active.data('posiiton', active.css('position'));

                    /* Set our callback function */
                    insertedNextCallback = function () { active.css('position', active.data('posiiton')); };

                    /* Call show and hide with the user provided arguments */
                    active.css('position', 'absolute').hide.apply(active, wizard.settings.nextArgs);
                    nextSet.show.apply(nextSet, wizard.settings.prevArgs);
                    
                    /* If bread crumb menu is used make those changes */
                    if (wizard.settings.breadCrumb) {
                        breadCrumbList.find('.' + wizard.settings.breadCrumbActiveClass).removeClass(wizard.settings.breadCrumbActiveClass).next().addClass(wizard.settings.breadCrumbActiveClass);
                    }

                    /* If the previous button is a button enable it */
                    if ( wizard.controls.prev.is(':hidden') ) {
                         wizard.controls.prev.removeClass('hidden');
                    }

                }

                /* If there are no more sections, hide the next button and show the submit button */
                if (afterNextSet.length <= 0) {
                    $(this).addClass('hidden');
                    wizard.submitButton.removeClass('hidden');
                }

                wizard.settings.onWizardNext.call(el, nextSet, afterNextSet);
            }
        };

        /**
         * ==============================================
         * = PUBLIC FUNCTIONS
         * ==============================================
         */

        el.goTo = function (step) {
            var active = $(el).find(wizard.activeClassSelector);

            step = step - 1;

            if ( active.index() === step || 0 > step ) return;

            var current = $(wizard.settings.element).eq(step);
            var prevSet = current.prev(wizard.settings.element);
            var nextSet = current.next(wizard.settings.element);

            if ( current.length ) {
                $(active).toggleClass(wizard.settings.activeClass);
                current.toggleClass(wizard.settings.activeClass);                   
                
                /* Get the current element's position and store it */
                active.data('posiiton', active.css('position'));    
                
                /* Set our callback function */
                insertedNextCallback = function () { active.css('position', active.data('posiiton')); };    

                /* Call show and hide with the user provided arguments */
                active.css('position', 'absolute').hide.apply(active, wizard.settings.nextArgs);
                current.parents().show.apply(current, wizard.settings.prevArgs);

                breadCrumbList.find('.' + wizard.settings.breadCrumbActiveClass).removeClass(wizard.settings.breadCrumbActiveClass);
                breadCrumbList.find('> *').children().eq(step).addClass(wizard.settings.breadCrumbActiveClass);
                
            }
            

            if(prevSet.length){
                wizard.controls.next.removeClass('hidden');
                wizard.submitButton.addClass('hidden');
            }

            if (prevSet.length <= 0) {
                wizard.controls.prev.addClass('hidden');
            } else {
                wizard.controls.prev.removeClass('hidden');
            }
                    
            if (nextSet.length <= 0) {
                wizard.controls.next.addClass('hidden');
                wizard.submitButton.removeClass('hidden');
            }  

        };

        init();

        // returns the current jQuery object
        return this;

    }

})(jQuery);
