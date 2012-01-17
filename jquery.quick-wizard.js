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
            plugin = this

        children = jqueryElement.children();
        index = children.filter(this.options.startChild).index();
        length = children.length;

        checkDisabled = function() {
            if(index === 0){
                prevButton.attr('disabled', 'disabled');
            }else{
                prevButton.removeAttr('disabled');
            }
            if(index === length -1){
                nextButton.attr('disabled', 'disabled');
            }else{
                nextButton.removeAttr('disabled');
            }
        }

        showHide = function(button) {
            $(children[index]).hide();
            if(button === buttons.prev){
                index -= 1;
            }else if(button === buttons.next){
                index += 1;
            }
            $(children[index]).show();
            jqueryElement.trigger(button);
        }

        prevButton.click(function() {
            if(index > 0) {
                showHide(buttons.prev);
            }
            checkDisabled();           
        });

        nextButton.click(function() {
            if(index < length -1) {
                showHide(buttons.next);
            }
            checkDisabled();
        });

        $(this.element).children(":not("+this.options.startChild+")").hide();
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

}(jQuery))