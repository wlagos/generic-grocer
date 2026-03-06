window.wpConfig = $.extend(window.wpConfig, {
	navigationArrows: '<span class="circle-left fp-icon-chevron-left-square-o disabled"></span><span class="circle-right fp-icon-chevron-right-square-o"></span>'
	,desktopNavigationArrows: 'fp-icon-chevron-down'
	,mobileNavigationArrows: 'fp-icon-chevron-right'
	,miniListId: '#mini-list-indicator'
	,imgMenuPath: '/wp-content/themes/fp-wp-c-deca/resources/images/menu/menu-revised.jpg'
	,showOnlyRootLevel: false
	,hasSiteBanner: true
	,enableStickyHeader: true
	,stickyHeaderSelectorMobile: '.mobile-header'
	,enableShopperCheck: function() {
		var currentHref = window.location.href,
		$body = $('body').removeClass('site-loaded');
		
		/* enabling for all users instead of just logged in, keeping logic in place if they want to switch back */
		if(true) {
			$body.addClass('site-loaded');

			loadTerms();
		}
		else {
			freshop.getCurrentUser(function(user) {
	        	if(!user.id) {
	    			if(currentHref.indexOf('/my-account') > 0 || $('#wpadminbar').html()) {    		
	    				$body.addClass('site-loaded');
	    				loadTerms();
	    				return;
	    			}
	    			else {
	    				window.location = '/my-account#!/login';
	    			}
	    		}
	    		else {
	    			loadTerms();
	    		}
			});

			setTimeout(function() {
	            $body.addClass('site-loaded');
	        }, 5000);
	    }

	    function loadTerms() {
	    	//check cookie
	        var allowedSaveCookie = $.cookie('fp_user_allowed_save_cookie') || {};

	        if(allowedSaveCookie != true) {
	        	//open modal
	        	$('#terms-and-conditions-modal')
	        		.on('shown.bs.modal', function () {
						var $this = $(this);

						$this.on('click', '#btn-cookie-terms-and-cons-allow', function() {
							$.cookie('fp_user_allowed_save_cookie', true, {path: '/', expires: 365, secure: window.location.protocol == 'https:'});
							$('#terms-and-conditions-modal').modal('hide');
						});
					})
	        		.modal({ show: true, backdrop: 'static' });
	        }
	    }

		if($('#wpadminbar').html()) $body.addClass('site-loaded');
    }
	,updateHeader: function() {
		var $window = $(window),
			marginTop = $(wpConfig.stickyHeaderSelector).outerHeight(true);
		
		if ($window.width() < 992) marginTop = $(wpConfig.stickyHeaderSelectorMobile).outerHeight(true);
		$('body').toggleClass('has-header-sticky', $window.scrollTop() > marginTop);
	}
});