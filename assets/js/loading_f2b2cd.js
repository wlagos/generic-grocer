(function($) {
	fpClient.custom = 
	{
		loading: function() {
			var obj = function(){
				this.__showCount = 0;
				var html = '\
							<div class="animated-loading"> \
								<div class="circle circle-1"></div> \
								<div class="circle circle-2"></div> \
								<div class="circle circle-3"></div> \
								<div class="circle circle-4"></div> \
								<div class="circle circle-5"></div> \
								<div class="circle circle-6"></div> \
								<div class="circle circle-7"></div> \
								<div class="circle circle-8"></div> \
							</div> \
							'
				this.$element = $(html);
			};
			obj.prototype.show = function(options) {
				if(this.__showCount == 0) {
					this.$element.removeAttr('style');
					var appendTo = document.body;
					if(typeof(options) == 'object') {
						if(options.jquery) {
							appendTo = options;
						}
						else {
							if(options.appendTo) {
								appendTo = options.appendTo;
							}
							if(options.css) {
								this.$element.css(options.css);
							}
						}
					}
					this.$element.appendTo(appendTo);
				}
				this.$element.show();
				this.__showCount++;
			};
			obj.prototype.hide = function(force) {
				if(force && this.__showCount > 1) {
					this.__showCount = 1;	
				}
				if(this.__showCount > 0) {
					this.__showCount--;
					if(this.__showCount == 0) {
						this.$element.appendTo(document.body).hide();
					}
				}
			};
			obj.prototype.isShown = function() {
				return this.__showCount > 0;
			};
			return new obj();
		}
	};
})(jQuery);

