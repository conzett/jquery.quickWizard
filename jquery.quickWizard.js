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
        validateForm: true,

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

            // On live
            //$(document).on('click touchend', '[data-wizard-goto]',el.goTo);

            $(el).on('keyup keypress', disableEnterKey);

            // onSliderLoad callback
            wizard.settings.onWizardLoad.call(this, el, wizard.settings.prevButton, wizard.settings.nextButton);

        };

        var disableEnterKey = function (e) {
          var keyCode = e.keyCode || e.which;
          if (keyCode === 13) { 
            e.preventDefault();
            return false;
          }
        };

        var appendControls = function () {

            /* Insert the previous and next buttons after the submit button and hide it until we're ready */
            if ( wizard.container.find('[data-wizard-prev]').length ) {
                wizard.settings.prevButton = '[data-wizard-prev]';
                wizard.controls.prev = $(wizard.settings.prevButton);
            } else {
                wizard.controls.prev = $(wizard.settings.prevButton).insertBefore(wizard.settings.submitButton);
            }

            if ( wizard.container.find('[data-wizard-next]').length ) {
                wizard.settings.nextButton = '[data-wizard-next]';
                wizard.controls.next = $(wizard.settings.nextButton);
            } else {
                wizard.controls.next = $(wizard.settings.nextButton).insertBefore(wizard.settings.submitButton);
            }

            /* If the root element is first disable the previous button */            
            if(wizard.root.is(':first-child')){
                wizard.controls.prev.addClass('hidden');
            } 

            // bind click actions to the controls
            if (wizard.controls.next.data('wizard-next') === 'on') {
                wizard.controls.next.not('.'+wizard.settings.disabledClass).on('click touchend', clickNextBind); 
            }
            if (wizard.controls.next.data('wizard-prev') === 'on') {
                wizard.controls.prev.not('.'+wizard.settings.disabledClass).on('click touchend', clickPrevBind);                
            }
        };

        var clickPrevBind = function (e) {
            e.preventDefault;
            el.goToPrevStep();

        };

        var clickNextBind = function (e) {
            e.preventDefault();
            el.goToNextStep();
        };

        var goTo = function (index, direction) {
           
            var active = $(el).find(wizard.activeClassSelector),
                current = $(wizard.settings.element).eq(index),
                prevSet = current.prev(wizard.settings.element),
                nextSet = current.next(wizard.settings.element);

            if ( active.index() === index || index < 0 ) return;

            if (direction === 'next' && wizard.settings.validateForm && !active.find(":input[required]").not('.ignore').valid() ) {
                return;
            }

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
                breadCrumbList.find('> *').children().eq(index).addClass(wizard.settings.breadCrumbActiveClass);
                
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
            } else {
                wizard.controls.next.removeClass('hidden');
                wizard.submitButton.addClass('hidden');
            }

            if (direction === 'next') {
                wizard.settings.onWizardNext.call(this, el, active, current);
            } else if (direction === 'prev') {
                wizard.settings.onWizardPrev.call(this, el, active, current);
            } 

        };


        /**
         * ==============================================
         * = PUBLIC FUNCTIONS
         * ==============================================
         */


        el.goTo = function (index) {
            var index = parseInt(index) - 1;
            goTo(index);
        };

        el.goToNextStep = function () {
            var active = $(el).find(wizard.activeClassSelector),
                next = active.next(wizard.settings.element),
                index = parseInt(next.index());

            if (active.is(':last-child')) { return; }
            goTo(index, 'next');
        };

        el.goToPrevStep = function () {
            var active = $(el).find(wizard.activeClassSelector),
                prev   = active.prev(wizard.settings.element),
                index  = parseInt(prev.index());

            if (active.is(':first-child')) { return; }
            goTo(index, 'prev');
        };

        init();

        // returns the current jQuery object
        return this;

    }

})(jQuery);
