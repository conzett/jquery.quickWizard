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
            plugin = this

        children = jqueryElement.children();
        index = children.filter(this.options.startChild).index();
        length = children.length;

        this.prev = function() {
            if(index > 0) {
                $(children[index]).hide();
                index -= 1;
                $(children[index]).show();
                jqueryElement.trigger('prev');
            }
        }

        this.next = function() {
            if(index < (length - 1)) {
                $(children[index]).hide();
                index += 1;
                $(children[index]).show();
                jqueryElement.trigger('next');
            }          
        }

        $(this.element).children(":not("+this.options.startChild+")").hide();

        prevButton.click(function() {
            plugin.prev();
        });

        nextButton.click(function() {
            plugin.next();
        });

        $(this.element).append(prevButton, nextButton);
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };

}(jQuery))

/*(function($) {

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
            'disabledClass': 'form-wizard-disabled',
            'containerClass' : 'form-wizard-container',
            'breadCrumb': true,
            'breadCrumbElement': 'legend',
            'breadCrumbListOpen': '<ol class="bread-crumb">',
            'breadCrumbListClose': '</ol>',
            'breadCrumbListElementOpen': '<li>',
            'breadCrumbListElementClose': '</li>',
            'breadCrumbActiveClass': 'bread-crumb-active',
            'breadCrumbCompletedClass': 'bread-crumb-completed',
            'breadCrumbPosition': 'before'
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
            var breadCrumbList;
            
            if(settings.root === null){                
                root = children.first();
            }else{
                root = $(settings.root);
            }
            

            if(settings.containerClass != ""){
                container.addClass(settings.containerClass);
            }
            

            if (settings.breadCrumb) {
                breadCrumbList = settings.breadCrumbListOpen

                children.find(settings.breadCrumbElement).each(function (index) {
                    breadCrumbList += settings.breadCrumbListElementOpen + $(this).text() + settings.breadCrumbListElementClose;
                });

                breadCrumbList += settings.breadCrumbListClose;
                if (settings.breadCrumbPosition === 'after') {
                    breadCrumbList = $(breadCrumbList).insertAfter(container);
                } else {
                    breadCrumbList = $(breadCrumbList).insertBefore(container);
                }
                breadCrumbList.children().first().addClass(settings.breadCrumbActiveClass);
            }


            if (typeof (settings.nextArgs[settings.nextArgs.length - 1]) == "function") {


                originalNextCallback = settings.nextArgs[settings.nextArgs.length - 1];


                settings.nextArgs[settings.nextArgs.length - 1] = function () { insertedNextCallback.call(); originalNextCallback.call(); };

            } else {
                

                settings.nextArgs[settings.nextArgs.length] = function () { insertedNextCallback.call(); }
            }

            
            var prev = $(settings.prevButton).insertBefore(submitButton);
            var next = $(settings.nextButton).insertBefore(submitButton);
            submitButton.hide();
            
         
            if(root.is(':first-child')){
                disablePrev(prev);
            }

            children.hide();
            root.toggleClass(settings.activeClass).show();

            $(next).click(function () {
                var active = container.find(activeClassSelector);



                if (active.find(":input").valid()) {
                    var nextSet = active.next(settings.element);
                    var afterNextSet = nextSet.next(settings.element);
                    if (nextSet.length) {
                        $(active).toggleClass(settings.activeClass);
                        $(nextSet).toggleClass(settings.activeClass);
                        

                        active.data('posiiton', active.css('position'));


                        insertedNextCallback = function () { active.css('position', active.data('posiiton')); };


                        active.css('position', 'absolute').hide.apply(active, settings.nextArgs);
                        nextSet.show.apply(nextSet, settings.prevArgs);
                        

                        if (settings.breadCrumb) {
                            breadCrumbList.find('.' + settings.breadCrumbActiveClass).removeClass(settings.breadCrumbActiveClass).next().addClass(settings.breadCrumbActiveClass);
                        }


                        if ($(prev).is(":button")) {
                            $(prev).removeAttr('disabled');
                        } else {

                            $(prev).removeClass(settings.disabledClass);
                        }
                    }

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
                    if (settings.breadCrumb) {
                        breadCrumbList.find('.' + settings.breadCrumbActiveClass).removeClass(settings.breadCrumbActiveClass).prev().addClass(settings.breadCrumbActiveClass);
                    }
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
*/