(function($) {
    var trailingSlash = $('html').attr('data-trailing-slash');
    window.user_trailingslashit = function (value) {
        value = (value || '').toString();
        if(trailingSlash && value.match('\/$') != '/') value += trailingSlash;
        return value;
    };

    $(document).ready(function() {
        var $body = $('body')
            ,touched = false
            ,detectMouse = function(event){
                if(event.type == 'touchstart') touched = true;
                else if(!touched && event.type == 'mousemove') fpClientUtil.device.usingMouse = true;
                $body.off('touchstart mousemove', detectMouse);
            };
        $body.on('touchstart mousemove', detectMouse);
    });

	window.fpClientUtil = {
		//expects YYYY-MM-DD
		formatDate: function(value) {
			var temp = (value || '').toString().split(' ')[0].split('-');
			return temp[1] + '/' + temp[2] + '/' + temp[0];
		}
		,msie: function() {
            if(this._msie != null) return this._msie;
            var ua = window.navigator.userAgent
                ,index = ua.indexOf('MSIE ');
            this._msie = index >= 0 ? parseInt(ua.substring(index + 5, ua.indexOf('.', index)), 10) : 0;
            if(!this._msie && 'ActiveXObject' in window) this._msie = 11;
            return this._msie;
        }
        ,getStringValue: function(value) {
			return value != null ? value.toString() : '';
		}
		,startsWith: function(value, prefix, ignoreCase) {
			value = this.getStringValue(value);
			prefix = this.getStringValue(prefix);
			if(ignoreCase) {
				value = value.toLowerCase();
				prefix = prefix.toLowerCase();
			}
			return value.indexOf(prefix) === 0;
		}
		,endsWith: function(value, suffix, ignoreCase) {
			value = this.getStringValue(value);
			suffix = this.getStringValue(suffix);
			if(ignoreCase) {
				value = value.toLowerCase();
				suffix = suffix.toLowerCase();
			}
			return value.match(suffix+"$") == suffix;
		}
		,contains: function(value, suffix, ignoreCase) {
			value = this.getStringValue(value);
			suffix = this.getStringValue(suffix);
			if(ignoreCase) {
				value = value.toLowerCase();
				suffix = suffix.toLowerCase();
			}
			return value.indexOf(suffix) >= 0;
		}
		,eq: function(value1, value2, ignoreCase) {
			value1 = this.getStringValue(value1);
			value2 = this.getStringValue(value2);
			if(ignoreCase) {
				value1 = value1.toLowerCase();
				value2 = value2.toLowerCase();
			}
			return value1 === value2;
		}
        ,device: {
            hasTouch: 'ontouchstart' in document.documentElement
            ,usingMouse: false
        }
	}

	$.fn.dropdown = function(options) {
        function dropdown($element, options){
            this.$element = $($element);
            if(this.$element.data('dropdown')) this.$element.data('dropdown').destroy();
            if(_.isFunction(options)) options = {onchange: options};
            this.options = $.extend({onchange: $.noop}, options);
            var me = this
                ,$menu = me.$element.find('> .dropdown-menu');
                
            this.__close = function(event) {
                me.close(0);
            };
            this.__onKeyup = function(event) {
                me.onKeyup(event);
            };
            
            var $combined = this.$element.add($menu)
                .on('click', function(event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if(!me.$list.length) return;
                    
                    clearTimeout(me.closeTimerId);
                    me.$element.toggleClass('is-dropdown-open');
                    if(me.$element.hasClass('is-dropdown-open')) {
                        $(document.body).addClass('is-dropdown-open');
                        $(document)
                            .trigger('close.dropdown.sd')
                            .off('click', me.__close).on('click', me.__close)
                            .off('keyup', me.__onKeyup).on('keyup', me.__onKeyup)
                            .off('close.dropdown.sd', me.__close).on('close.dropdown.sd', me.__close);
                        var borderWidth = parseInt(me.$element.css('border-left-width'), 10)
                            ,offset = me.$element.offset()
                            ,css = {}
                            ,$item = me.__getSelected()
                            ,windowWidth = $(window).width();

                        $menu.removeClass('right');
                        var width = $menu.outerWidth()
                            ,left = offset.left + borderWidth * 0.5;
                        if(left + width > windowWidth) $menu.addClass('right');

                        if($item.length) {
                            var $list = $item.closest('.dropdown-list');
                            $list.scrollTop($item.position().top + $list.scrollTop() - ($list.parent().height() - $item.height()) * 0.5);
                        }
                    }
                    else me.close(0);
                })
                .on('click', '.dropdown-list > li a', function(event) {
                    event.preventDefault();
                    me.__setSelected($(this));
                })
                .on('mouseover', function(event) {
                    if(!fpClientUtil.device.usingMouse) return;
                    if(event.target == $menu[0]) return;
                    
                    clearTimeout(me.closeTimerId);
                })
                .on('mouseout', function(event) {
                    if(!fpClientUtil.device.usingMouse) return;
                    me.close();
                });
                
            this.$list = $menu.find('.dropdown-list > li a');
            
            var value = fpClientUtil.getStringValue(this.getValue());
            if(!value.length) {
                value = this.$element.find('> input[type="hidden"]').first().val();
                if(value) this.setValue(value, true);
                else this.__setSelected(this.$list.filter('[data-selected="true"]'), true);
            }
            
            this.$element.data('dropdown', this);
        }
    
        dropdown.prototype.onChange = function() {
            this.options.onchange.call(this.$element[0], this.value);
        };
        //keyup is called in the contect of the document
        dropdown.prototype.onKeyup = function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            
            var util = fpClientUtil
                ,$item
                ,$key;
            if (event.key !== undefined) {
                // ff supports key
                $key = event.key;
            }
            else if (event.keyCode !== undefined) {
                // Chrome supports keycode
                $key = String.fromCharCode(event.keyCode);
            }

            if((/[a-z0-9]/i).test($key)) {
                var me = this.$element.data('dropdown');
                me.$list.each(function() {
                    $item = $(this);
                    if(fpClientUtil.startsWith($item.text(), $key, true)) {
                        me.__setSelected($item);
                        var $list = $item.closest('.dropdown-list');
                        $list.scrollTop($item.position().top + $list.scrollTop() - ($list.parent().height() - $item.height()) * 0.5);
                        return false;
                    }
                });
            }
        };
        dropdown.prototype.getValue = function() {
            return this.value;
        };
        dropdown.prototype.setValue = function(value) {
            var me = this
                ,util = fpClientUtil;
            value = util.getStringValue(value);
            if(value.length) {
                var $this
                    ,thisValue;
                this.$list.each(function() {
                    $this = $(this);
                    thisValue = $this.attr('data-value') || $this.text();
                    if(util.eq(thisValue, value, true)) {
                        me.__setSelected($this, true);
                        return false;
                    }
                });
            }
            else me.__setSelected(null, true);
        };
        dropdown.prototype.__getSelected = function() {
            return this.$list.filter('.is-selected');
        };
        dropdown.prototype.__setSelected = function($item, isInit) {
            var text
                ,selectedValue;
            if($item) {
                if(_.isString($item)) text = selectedValue = $item;
                else if($item && $item.jquery && $item.length) {
                    var prevItem;
                    text = $item.html();
                    selectedValue = fpClientUtil.getStringValue($item.attr('data-value'));
                    this.$list.each(function() {
                        var $this = $(this).removeClass('is-selected');
                        if($this.attr('data-selected')) {
                            $this.removeAttr('data-selected');
                            prevItem = $this[0];
                        }
                    });
                    $item.addClass('is-selected').attr('data-selected', true);
                    selectedValue = selectedValue.length > 0 ? selectedValue : text;
                }
            }
            if(!text) text = selectedValue = fpClientUtil.getStringValue(this.$element.attr('data-default'));
            this.$element.find('> .dropdown-value .value').html(text);
            
            if(this.$element.attr('data-default') != selectedValue) this.$element.addClass('has-value');
            else {
                selectedValue = '';
                this.$element.removeClass('has-value');
            }
            this.$element.find('> input[type="hidden"]').val(selectedValue);
            this.value = selectedValue;
            if(!isInit && (!$item || ($item && $item[0] != prevItem))) this.onChange();
        };
        dropdown.prototype.close = function(ms) {
            ms = (ms != null ? ms : 100);
            var me = this;
            clearTimeout(me.closeTimerId);
            if(ms) me.closeTimerId = setTimeout(close, ms);
            else close();

            function close() {
                $(document.body).removeClass('is-dropdown-open');
                $(document)
                    .off('click', me.__close)
                    .off('keyup', me.__onKeyup)
                    .off('close.dropdown.sd', this.__close);
                me.$element.removeClass('is-dropdown-open');
            }
        };
        dropdown.prototype.destroy = function() {
            this.close(0);
            //this.setValue();
            this.$list.off();
            $(document)
                .off('click', this.__close)
                .off('keyup', this.__onKeyup)
                .off('close.dropdown.sd', this.__close);
            var $menu = this.$element.find('> .dropdown-menu');
            this.$element.add($menu).off();
            this.$element.removeData('dropdown');
        };
    
        return this.each(function() {
            var $this = $(this);
            if($this.data('dropdown')) $this.data('dropdown').destroy();
            $this.data('dropdown', new dropdown($this, options));
        });
	};

    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)&?').exec(window.location.href);
        return results && results[1];
    };

    $.fn.cleanWhitespace = function() {
        textNodes = this.contents().filter(
            function() { return (this.nodeType == 3 && !/\S/.test(this.nodeValue)); })
            .remove();
        return this;
    };

    $.fn.outerHTML = function() {
        var el = this[0];
        if(el && el.outerHTML) return el.outerHTML;
        var $p = $('<p>').append(this.eq(0).clone())
            ,html = $p.html();
        $p.remove();
        return html;
    };
})(jQuery);