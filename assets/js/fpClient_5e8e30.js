(function($) {
	window.fpClient = {
		store: {}
		,user: {}
        //,newUser: $.cookie('cn-new-user') || true
		,URLs: {
			myFavoritesUrl: user_trailingslashit('/shop') + '#!/?filter=is_favorite'
            ,storeLocator: user_trailingslashit('/store/store-locator')
		}
		,init: function () {
            this.initMobileHeader();
			this.initMyFavorites();
            this.initStickyHeader();
		}
        ,showSubNav: function() {
            var $subNav = $('#freshop-account .sub-menu').removeClass('hidden')
                ,route = freshop.ui.getRoute()[0].toLowerCase();

            $subNav.find('a')
                .removeClass('is-selected')
                    .filter('[href$="#!/' + route + '"]')
                    .first().addClass('is-selected');

            if($subNav.find('.is-selected').length <= 0){
                $subNav.find('.link-my-account').addClass('is-selected');
            }
        }
        ,initMyFavorites: function() {
            var $menuFavorites = $('#menu-header-menu, #menu-footer-menu-mobile');

            $menuFavorites.find('.nav-my-favorites a')
            .attr('href', this.URLs.myFavoritesUrl)
            .append('&nbsp;<span class="fp-icon-star"></span>');

            $('#top-my-favorites').attr('href', this.URLs.myFavoritesUrl);
        }
        ,initAccountMenu: function(accountNav) {
            accountNav = accountNav || {};

            $('.user-session-indicator-mobile')
                .off('click', '.fp-my-account-right-angle')
                .on('click', '.fp-my-account-right-angle', function(event) {
                    var $myAccountLink = $('#menu-footer-menu-mobile .mobile-my-account');
                    $myAccountLink.trigger('click');
                });

            freshop.ui.on('routeChanged', toggleSubNav);

            toggleSubNav();

            function toggleSubNav() {
                var $subNavContainer = $('#freshop-account-left')
                    ,$mobileSubNavContainer = $('#menu-footer-menu-mobile .mobile-my-account')
                    ,html = ''
                    ,freshopConfig = freshop.ui.getConfig()
                    ,hasChildren = _.size(accountNav.children)
                    ,$mainAccountNav = $('.main-menu-container .nav-my-account');

                $('#freshop-account').toggleClass('full-width', !hasChildren);

                if(hasChildren) {
                    $mobileSubNavContainer
                        .addClass('menu-item-has-children')
                        .find('> a').addClass('fp-icon-chevron-right').wrapInner('<span></span>');
                }
                else $mobileSubNavContainer.removeClass('menu-item-has-children');

                var freshopUi = freshop.ui
                    ,title
                    ,menuClass;

                _.each(accountNav.children, function(item) {
                    title = freshopUi.encodeForHtml(item.title);
                    menuClass = '';
                    if(item.url.toLowerCase().indexOf('my-favorites') >= 0) {
                        menuClass = 'nav-my-favorites';
                        title += '&nbsp;<span class="fp-icon fp-icon-star"></span>';
                        title = '<span>' + title + '</span>';
                    }
                    else title = '<span>' + title + '</span>';

                    html += '<li><a href="' + freshopUi.encodeForHtml(item.url) + '" class="menu-item ' + menuClass + '">' + title + '</a></li>';
                });
                
                if(html && $mainAccountNav) $mainAccountNav.append('<ul class="sub-menu">' + html  + '</ul>');
                if(html) html = '<ul class="sub-menu second-menu">' + html + '</ul>';               

                $subNavContainer.html(html);

              var $accountSubMenu = $mobileSubNavContainer.find('ul.sub-menu');
              if ($accountSubMenu) {
                var $subMenu = $(html);
                $subMenu.attr('style', $accountSubMenu.attr('style'));

                $mobileSubNavContainer.find('ul.sub-menu').remove();
                $mobileSubNavContainer.append($subMenu);
              }

                var route = freshop.ui.getLocation()
                    ,$items = $subNavContainer.find('a').removeClass('is-selected')
                    ,$firstChild = $items.filter('[href="' + route + '"]')
                    .first().addClass('is-selected');

                if (!$firstChild.length) $items.first().addClass('is-selected');
            }
        }
		,onFreshopInit: function(){
			var pref = $.cookie('pref') || {},
                event = window.hasTouch ? 'touch' : 'click',
                $search = $('#header .header-wrapper .search');

            if(pref.showSearch) $search.trigger(event);

            if(window.freshop) {
                freshop.on('initialized', function(event){
                    if($.isFunction(wpConfig.enableShopperCheck)) {
                        wpConfig.enableShopperCheck();
                    }
                });

                freshop.ui
                    //.on('loaded', function(event) {
                    //    fpClient.storeChanged(event, fpClient.store);
                    //})
                    .on('search', function () {
                        var $body = $(document.body);
                        $body.removeClass('mobile-menu-active');
                    })
                    .on('rendered', '#products-ad-skybox', function (event) {
                        if (window.isSmall) return;

                        var $productsAdSkybox = $('#products-ad-skybox');
                        if (!$productsAdSkybox.length) return;

                        var $col2 = $productsAdSkybox.parent(),
                            $col1 = $col2.prev(),
                            moduleId = $col1.find('> .fp-module.fp-module-view').first().attr('id');

                        if (!moduleId) return;

                        if ($col2.children().height()) {
                            $col1.prop('className', 'col-md-10');
                            $col2.prop('className', 'col-sm-12 col-md-2 col-skybox-ad');
                        }
                        else {
                            $col1.prop('className', 'col-xs-12');
                            $col2.prop('className', 'col-xs-12 col-skybox-ad');
                        }

                        freshop.ui.on('loaded', function () {
                            freshop.ui.trigger('#' + moduleId, 'resize');
                            freshop.ui.trigger('#products-ad-skybox', 'resize');
                        });
                    });

                freshop
                    .on('storeChanged', fpClient.storeChanged)
                    .on('storeLoaded', fpClient.storeChanged)
                    .on('circularLoaded', function (event, circular) {
                        var $title = $('#circular-title')
                            , startDate = circular.display_start_date ? circular.display_start_date : circular.start_date
                            , endDate = circular.display_end_date ? circular.display_end_date : circular.end_date;

                        if ($title.length) {
                            $title.find('.start-date').text(fpClientUtil.formatDate(startDate));
                            $title.find('.end-date').text(fpClientUtil.formatDate(endDate));
                            $title.find('> span').css('visibility', '');
                        }
                    });

                    $(document.body)
                        .on('click', '.soliloquy-next,.soliloquy-prev,.soliloquy-pager-link', function() {
                            if(window.soliloquy_slider) {
                                var id = $(this).closest('[id^="soliloquy-container-"]').prop('id').split('-').pop(),
                                    slider = id && window.soliloquy_slider[id],
                                    src = $(slider && slider.getCurrentSlideElement()).find('img').attr('src') || '';

                                freshop.ui.trigger('trackEvent', {
                                    event: 'ViewSlider',
                                    label: 'Homepage Rotator: ' + src.split('/').pop().split('&').shift(), 
                                    category: 'Navigation'
                                });
                            }
                        })
                        .on('click', '.soliloquy-link', function() {
                            freshop.ui.trigger('trackEvent', {
                                event: 'ViewSlider',
                                label: 'Homepage Rotator: ' + $(this).attr('href'), 
                                category: 'Navigation'
                            });
                        });
            }
            else {
                fpClient.storeChanged();
            }
		}
        ,initMobileHeader: function(){
            var eventType = window.hasTouch ? 'touchstart.minilist.fc' : 'click.minilist.fc'
                ,$mobileMenu = $('.mobile-header-wrapper');

            $mobileMenu
                .off()
                .on(eventType, '#navbar-toggle', function(event) {
                    event.preventDefault();
                    if($(document.body).hasClass('mobile-menu-active')) {
                        var $navWrapper = $('#mobile-nav-wrapper')
                            ,$currentMenu = $navWrapper.data('currentMenu')
                            ,level = $navWrapper.data('level') || 0;
                        if(level == 0) navigation.toggleNav();
                        else $navWrapper.trigger('click');
                        return;
                    }
                    setTimeout(function() {
                        navigation.toggleNav();
                      }, 300);
                })
                .on(eventType, '.logo', function(event) {
                    if($(document.body).hasClass('mobile-menu-active')) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        navigation.toggleNav();
                    }
                })
                .on(eventType, '.mobile-search-icon', function (event) {
                    event.preventDefault();
                    if ($('.fp-mini-list').hasClass('hidden')) {
                        event.stopImmediatePropagation();
                    }

                    if(window.freshop) {
                        var pref = $.cookie('pref') || {}
                            ,$headerSearch = $('.mobile-header-wrapper .mobile-search')
                            ,$mobileSearchInput = $headerSearch.find('[name=fp-input-search]');

                        if($headerSearch.filter(':visible').length) {
                            pref.showSearch = false;
                            $headerSearch.slideUp(function() {
                                $headerSearch.show().addClass('hidden-xs hidden-sm');
                            });
                        }
                        else {
                            pref.showSearch = true;
                            $headerSearch.removeClass('hidden-xs hidden-sm');
                            freshop.trigger('mediaWidthChange');
                            $headerSearch.hide().slideDown(function() {
                                //$mobileSearchInput.blur();
                                //var origValue = $mobileSearchInput.val();
                                //$mobileSearchInput.val('').focus().val(origValue);
                            });
                        }
                        $.cookie('pref', pref, {path: '/', secure: window.location.protocol == 'https:'});
                    }
                });
        }
		/*,toggleMinilist: function(){
			var open = $('#fp-minilist').filter(':visible').length > 0
				,$parent = $('.mini-list #mini-list-wrapper');

			if(open){
				freshop.trigger('miniListHide');
			}
			else {
				freshop.trigger('miniListShow');
				$parent.addClass('opened');
			}
		}*/
		,storeChanged: function(event, store){
            var href,
                $anchor = $('#mobile-selected-store > .nav-my-store > a, .menu-footer-menu-col-1-container .nav-my-store > a'),
                $mainMenu = $('#menu-main-menu'),
                $mobileNav = $('#mobile-nav'),
                $mainNavMyStore = $mainMenu.find('.nav-my-store > a'),
                $mobileStoreLink = $('#mobile-selected-store'),
                $headerSelectStore = $('.nav-my-store > .dropdown > .link-my-store'),
                $headerMyStore = $('.nav-my-store > .link-my-store-primary'),
                oldStore = fpClient.store;
            
            //fpCheckWeeklyAd.check();

            var storeId = store && store.id,
                pref = $.cookie('pref') || {};
            pref.store_id = storeId;
            $.cookie('pref', pref, {path: '/', secure: window.location.protocol == 'https:'});

            if(storeId) {
                if(store.name) {
                    $('.my-store-name').text(store.name);
        
                    href = store.url;
                    //$anchor.text(store.name);
                    $headerSelectStore.find('.name').text(store.name);
                    $mobileStoreLink.find('a').text(store.name);

                    //print view, adding address
                    if(window.freshop) {
                        var $storeInfo = $('#store-main-info');
                        var storeAddress = freshop.ui.encodeForHtml(store.address_1);
                        if (store.address_2) storeAddress += ',' + freshop.ui.encodeForHtml(store.address_2);
                        storeAddress += '<br />' + freshop.ui.encodeForHtml(store.city) + ', ' + freshop.ui.encodeForHtml(store.state) + ' ' + freshop.ui.encodeForHtml(store.postal_code);
                        $storeInfo.html(freshop.ui.encodeForHtml(store.name) + '<br />' + storeAddress);
                    }

                    fpClient.store = store;
                    
                    $headerSelectStore.attr('href', 'javascript:;').attr('data-href', href);
                    $mobileStoreLink.removeClass('hidden');
                    fpClient.setMyStoreBox(store);
                }
            }
            else {
                href = fpClient.URLs.storeLocator;
                //$anchor.text("My Store");
                // $headerSelectStore.find('.name').text('Select Store');
                // $mobileStoreLink.find('.nav-my-store a').text('Select Store');
                fpClient.setMyStoreBox(null);
            }

            fpClient.setStoreLinks($anchor.add($mainNavMyStore).add($headerMyStore), href);

            if((!storeId || !oldStore.id || (oldStore.id && oldStore.id != storeId))) {
                if(window.freshop) {
                    var getNavigation = _.isFunction(wpConfig.getNavigation) ? wpConfig.getNavigation : freshop.ui.getNavigation;

                    getNavigation(function (resp) {
                        fpClient.initAccountMenu(resp.account);
                        if (wpConfig.showOnlyRootLevel) {
                            $mainMenu.html(navigation.getNavHtml(resp.shop, 1));
                            $('#recipe-categories').html(navigation.getNavHtml(resp.recipe, 1));
                        }
                        else {
                            if (wpConfig.departmentMenuAddToRoot) {
                                var $navShopping = $mainMenu.find('> .nav-shopping'),
                                    navHtml = navigation.getNavHtml(resp.shop, 0),
                                    mobileNavHtml = navigation.getNavHtml(resp.shop, 1, null, true),
                                    $mainMenuMobile;

                                if ($navShopping.length) {
                                    $mainMenu.cleanWhitespace();
                                    $mainMenu.find('> li[role="department"]').remove();
                                }

                                if (wpConfig.menuConfig && wpConfig.menuConfig.megaSpreadChildren) {
                                    $mainMenuMobile = $($mainMenu.outerHTML()).prop('id', 'menu-main-menu-mobile');
                                    $mainMenuMobile.find('#recipe-categories').prop('id', 'recipe-categories-mobile')
                                        .html(navigation.getNavHtml(resp.recipe, 1, null, true));
                                    $mainMenuMobile.appendTo($mobileNav.empty());
                                    $mainMenuMobile.find('li > .divider').remove();
                                }

                                if ($navShopping.length) {
                                    $(navHtml).insertBefore($navShopping);
                                    if ($mainMenuMobile) $(mobileNavHtml).insertBefore($mainMenuMobile.find('> .nav-shopping'));
                                }
                                else {
                                    $mainMenu.append(navHtml);
                                    if ($mainMenuMobile) $mainMenuMobile.append(mobileNavHtml);
                                }
                            }
                            else {
                                $('#departments').html(navigation.getNavHtml(resp.shop, 1));
                            }
                            $('#recipe-categories').html(navigation.getNavHtml(resp.recipe, 1, {}));
                        }

                        if (navigation.menuInitialized) {
                            if (window.isSmall) {
                                //trigger reset of menu styles
                                navigation.initMenu();
                                navigation.onDepartments();

                                if (window.matchMedia) {
                                    navigation.matchMediaHandler(window.matchMedia("screen and (max-width: 991px)"));
                                }
                            }
                            else navigation.onDepartments();

                            navigation.initMenuTouchSupport();
                        }
                    });
                }

                if(wpConfig.enableDynamicHome) {
                    var deferredPageLoad,
                        deferredFreshopLoad,
                        promiseLoadPage;

                    if (window.freshop && freshop.ui) {
                        deferredFreshopLoad = $.Deferred();
                        var onFreshopLoaded = function (event) {
                            freshop.ui.off('loaded', onFreshopLoaded);
                            deferredFreshopLoad.resolve();
                        };
                        freshop.ui.on('loaded', onFreshopLoaded);
                    }

                    if(
                        location.pathname == '/' &&
                        location.search.indexOf('post_type=home-page') == -1 &&
                        !($.urlParam('s') != null)
                    ) {
                        promiseLoadPage = deferredPageLoad = fpClient.loadHomepage(storeId);

                        if(window.freshop) {
                            deferredPageLoad = $.Deferred();
                            promiseLoadPage
                                .always(function () {
                                    freshop.ui.trigger('#content', 'moduleLoad', {
                                        callback: deferredPageLoad.resolve
                                    });
                                });
                        }
                    }

                    if(location.pathname == '/test') {
                        promiseLoadPage = deferredPageLoad = fpClient.loadGifts(storeId);

                        if(window.freshop) {
                            deferredPageLoad = $.Deferred();
                            promiseLoadPage
                                .always(function () {
                                    freshop.ui.trigger('#content', 'moduleLoad', {
                                        callback: deferredPageLoad.resolve
                                    });
                                });
                        }
                    }

                    $.when(deferredPageLoad, deferredFreshopLoad)
                        .always(function() {
                            $(document).trigger('freshoppageready');
                        });
                }
            }

            if($.isFunction(wpConfig.storeChanged)) {
                wpConfig.storeChanged(store);
            }
            if(wpConfig.hasSiteBanner && !(window.freshop && freshop.isBot)) {
                fpClient.loadSiteBanner(storeId);
            }
            if(wpConfig.hasXhrSlider) fpClient.loadSlider(storeId);
		}
        ,setStoreLinks: function($links, url) {
            $links.each(function() {
                var $this = $(this)
                    ,href = $this.data('origHref');

                if(!href) {
                    $this.data('origHref', $this.attr('href'));
                }
                if(url) {
                    href = url;
                }
                if((href || '').indexOf('www') == 0) {
                    href = 'http://' + href;
                }

                $this.attr('href', href);       
            });
        }
        ,setMyStoreBox: function(store){
            var $myStoreLink = $('#header').find('.link-my-store')
                ,$myStoreBox = $('#header').find('.dropdown-selected-store')
                ,$storeName = $myStoreBox.find('.store-name > span.name')
                ,$storeAddress = $myStoreBox.find('.store-address')
                ,$storeHours = $myStoreBox.find('.store-hours > span')
                ,$storePhone = $myStoreBox.find('.store-phone > span')
                ,$storeDirections = $myStoreBox.find('.store-directions')
                ,address = '';

            if(store){
                $myStoreLink.attr('data-toggle', 'dropdown');
                if(store.name) $storeName.html('<a href="' + store.url +'">'+ freshop.ui.encodeForHtml(store.name) +'</a>');
                if(store.address_1 && store.state && store.postal_code) {
                    address = freshop.ui.encodeForHtml(store.address_1);
                    if(store.address_2) address += ',' + freshop.ui.encodeForHtml(store.address_2);
                    address += '<br />' + freshop.ui.encodeForHtml(store.city) + ', ' + freshop.ui.encodeForHtml(store.state) + ' ' + freshop.ui.encodeForHtml(store.postal_code);
                }
                if(address) $storeAddress.html(address);
                if(store.hours) $storeHours.html(freshop.ui.encodeForHtml(store.hours));
                if(store.phone) $storePhone.html(freshop.ui.encodeForHtml(store.phone));
                if(store.latitude && store.longitude) $storeDirections.html('<a href="https://www.google.com/maps/dir//' + encodeURIComponent(address.replace("<br />", ' ')) + '" target="_blank">Get Directions</a>');

            }
            else{
                $myStoreLink.attr('data-toggle', '');
            }
        }
        ,initMinilistIndicator : function() {
            var mobileSelector = '';
            if(window.isSmall) mobileSelector = '-mobile';
            $('#mini-list' + mobileSelector + '-wrapper').append($('#mini-list-indicator'));
        }
        ,loadHomepage: function(storeId){
            var $content = $('#content'),
                loc = window.location,
                promise;

            if(storeId) {
                promise = $.ajax({
                    url: ajax_objectClient.rest_url + '/freshop/v1/content/homepage',
                    dataType: 'json',
                    data: {
                        store_id: storeId
                    }
                })
                .then(function (resp) {
                    //the default homepage is already rendered so no need to make xhr call
                    if (!$content.hasClass('loading') || (resp.url && resp.url.indexOf('/default') == -1)) {
                        var url = resp.url,
                            search;

                         if($(document.body).hasClass('logged-in')) search = 'skip_cache=1';
                        
                        if(loc.search || search) {
                            if(url.indexOf('?') >= 0) url += '&';
                            else url += '/?';

                            if(search) url += search;

                            if(loc.search) {
                                if(search) url += '&';
                                url += loc.search.substr(1);
                            }
                        }

                        return $.ajax({
                            url: url,
                            dataType: 'text',
                            headers: {
                                accept: window.hasWebp ? 'text/html,image/webp,*/*' : undefined
                            }
                        });
                    }
                });
            }

            return $.when(promise)
                .then(function(resp) {
                    if(resp) {
                        //$content = $(resp).replaceAll($content);

                        var node = document.createElement('html');
                        node.innerHTML = resp;

                        var $head = $('head'),
                            $childCss = $head.find('#child-style-css'),
                            $fragmentHead = $(node.getElementsByTagName('head')[0]),
                            $fragmentBody = $(node.getElementsByTagName('body')[0]),
                            $oldStyle,
                            $newStyle;

                        $content = $fragmentBody.find('#content').replaceAll($content);

                        _.each(['#siteorigin-panels-layouts-head', '#siteorigin-panels-front-css'], function(value) {
                            $oldStyle = $head.find(value);
                            $newStyle = $fragmentHead.find(value);

                            if($oldStyle.length) $oldStyle.replaceWith($newStyle);
                            else $newStyle.insertBefore($childCss);
                        });
                    }
                })
                .always(function() {
                    $content.removeClass('loading');

                    var $slider;
                    _.each(window.soliloquy_slider, function(value, key) {
                        $slider = $('#soliloquy-container-' + key);
                        if($slider.length && !$slider.height()) {
                            value.redrawSlider();
                        }
                    });

                    if($.isFunction(wpConfig.loadHomepageComplete)) {
                        wpConfig.loadHomepageComplete();
                    }
                });
        }
        ,loadGifts: function(storeId){
            var $content = $('#content'),
                loc = window.location,
                search = loc.search ? '/' + loc.search : '',
                promise;

            if(storeId) {
                promise = $.ajax({
                        url: ajax_objectClient.rest_url + '/freshop/v1/content/gift' + search,
                        dataType: 'json',
                        data: {
                            store_id: storeId
                        }
                    })
                    .then(function (resp) {
                        if (resp.url) return $.get(resp.url + search);
                        return '';
                    });
            }

            return $.when(promise)
                .done(function(resp) {
                    if(resp) {
                        var node = document.createElement('html');
                        node.innerHTML = resp;

                        var $head = $('head'),
                            $childCss = $head.find('#child-style-css'),
                            $fragmentHead = $(node.getElementsByTagName('head')[0]),
                            $fragmentBody = $(node.getElementsByTagName('body')[0]),
                            $oldStyle,
                            $newStyle;

                        $content = $fragmentBody.find('#content').replaceAll($content);

                        _.each(['#siteorigin-panels-layouts-head', '#siteorigin-panels-front-css', '#sow-button-base-css', '[id^="sow-button-"]'], function(value) {
                            $oldStyle = $fragmentBody.find(value);
                            $newStyle = $fragmentHead.find(value);

                            if($oldStyle.length) $oldStyle.insertBefore($childCss);
                            else $newStyle.insertBefore($childCss);
                        });
                    }
                })
                .always(function() {
                    $content.removeClass('loading');
                });
        },
        initStickyHeader: function() {

            if(!wpConfig.enableStickyHeader) return;
            var marginTop = $(wpConfig.stickyHeaderSelector).outerHeight(true),
                updateHeaderFunction;
            
            updateHeaderFunction = _.isFunction(wpConfig.updateHeader) ? wpConfig.updateHeader : updateHeader;

            $(window).on('scroll', function(){
                (!window.requestAnimationFrame) ? _.throttle(updateHeaderFunction, 300) : _.throttle(window.requestAnimationFrame(updateHeaderFunction), 300);
            });
            
            function updateHeader() {
                var $window = $(window);
                
                if ($window.width() < 992) return;
                $('body').toggleClass('has-header-sticky', $window.scrollTop() > marginTop);
            }

            /* We are using the has-header-sticky-new on mobile for site-banner, and desktop for both) */
            $(window).scroll(function () {
                $('body').toggleClass("has-header-sticky-new", ($(window).scrollTop() > 0));
            });
            
            /* need to move the site-banner outside the #header only on mobile, because we can't use duplicate IDs for ADA with hide/show */
            $(window).on('resize',function(){
                var width = $(window).width();
            
                if (width < 992){
                    $('#site-banner').insertBefore('#header');
                } else {
                    $("#site-banner").prependTo("#header");
                }
            });
        }
        ,loadSiteBanner: function(storeId){
            var pref = $.cookie('pref') || {},
                prefKey = 'site_banner_' + (storeId || '') + '_disabled';
            if(pref[prefKey]) return;

            $.ajax({
                   url: ajax_objectClient.rest_url + '/freshop/v1/content/site-banner',
                   dataType: 'json',
                   data: {
                       store_id: storeId
                   }
               })
               .done(function(resp) {
                   var html = $.trim(_.isObject(resp) ? resp.html : ''),
                       $siteBanner = $('#site-banner').css('display', ''),
                       $accountMenu = $siteBanner.closest('.account-menu'),
                       $container = $('#main-menu-container > .row').filter(':visible'),
                       $body = $('body'),
                       hadBanner = $body.hasClass('has-site-banner'),
                       hasBanner = html.length > 0;
                       
                   $siteBanner.toggleClass('hidden', html.length == 0);
                   $body.toggleClass('has-site-banner', hasBanner);

                   function closeSiteBanner() {
                        pref[prefKey] = true;
                        $.cookie('pref', pref);
                        $body.removeClass('has-site-banner');
                        $container
                            .css('margin-top', '')
                            .animate({'margin-top': $accountMenu.height()}, 'fast');

                        $siteBanner
                            .css('display', 'block')
                            .slideUp('fast', function() {
                                $siteBanner.html('');
                            });
                    }

                   if(!hadBanner && hasBanner) {
                        html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close" style="top:7.5px;right:7.5px;position:absolute;"><span aria-hidden="true">×</span></button>';
                        $siteBanner
                            .css('position', 'relative')
                            .on('close.bs.alert', function (event) {
                                event.preventDefault();
                                closeSiteBanner();
                            });
                            
                       $siteBanner.html(html);

                       $container
                           .css('margin-top', '')
                           .animate({'margin-top': $accountMenu.height()}, 'fast');

                       $siteBanner
                           .css('display', 'none')
                           .slideDown('fast');
                   }
                   else if(hadBanner && !hasBanner) {
                        closeSiteBanner();
                   } 
               });
       }
       ,loadSlider: function(storeId){
        var deferred
            ,isHome = false
            ,$slider = $('#homepage-slider').removeClass('hidden');

        if($('body').hasClass('home')) isHome = true;

        if(isHome) {
            deferred = $.ajax({
                url: ajax_objectClient.rest_url + '/freshop/v1/content/slider',
                dataType: 'json',
                headers : {
                    'accept' : window.hasWebp ? 'application/json,image/webp,*/*' : undefined
                },
                data: {
                    store_id: storeId,
                    is_home: isHome,
                    slider_slug: 'homepage-slider'
                }/*,
                beforeSend: function(request) {
                    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                }*/
            });
        }

        return $.when(deferred)
            .always(function(resp) {
                var html = (resp && resp.html) || '';
                $slider
                    .removeClass('loading')
                    .addClass('loaded')
                    .toggleClass('hidden', $.trim(html).length == 0)
                    .html(html);
            });

    }

	};
    $(document).ready(function() {
        const  $nfForm = $('.nf-form-cont');
        if($nfForm.length) {
            const observer = new MutationObserver(function() {
                let $fileButton = $nfForm.find('.ninja-forms-field.nf-fu-fileinput-button');
                let $fileInput = $fileButton.parent().find('.nf-element[type="file"]');
                if ($fileButton.length && $fileInput.length) {
                    $fileInput.css({
                        position: 'absolute',
                        opacity: 0,
                        visibility: '',
                        top: 0,
                        cursor: 'pointer',
                        width: $fileButton.outerWidth(),
                        height: $fileButton.outerHeight()
                    });
                    observer.disconnect();
                }
            });
            observer.observe($nfForm[0], {childList: true});
        }
    });
    
    $(document).on('freshopInitialized freshopNotInitialized', fpClient.onFreshopInit);
})(jQuery); 