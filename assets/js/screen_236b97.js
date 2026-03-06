(function($) {
    //fix for "Does not use passive listeners to improve scrolling performance" message in PageInsights https://web.dev/uses-passive-event-listeners/?utm_source=lighthouse&utm_medium=devtools
    var $eventSpecial = $.event.special;

    $eventSpecial.touchstart = {
        setup: function( _, ns, handle ) {
            this.addEventListener('touchstart', handle, { passive: !ns.includes('noPreventDefault') });
        }
    };
    $eventSpecial.touchmove = {
        setup: function( _, ns, handle ) {
            this.addEventListener('touchmove', handle, { passive: !ns.includes('noPreventDefault') });
        }
    };
    $eventSpecial.wheel = {
        setup: function( _, ns, handle ){
            this.addEventListener('wheel', handle, { passive: true });
        }
    };
    $eventSpecial.mousewheel = {
        setup: function( _, ns, handle ){
            this.addEventListener('mousewheel', handle, { passive: true });
        }
    };

    $.cookie.json = true;

    window.hasMouse = 'onmousemove' in document.documentElement;
    window.hasTouch = 'ontouchstart' in document.documentElement;
    window.isSmall = false;
    window.baseUrl = location.protocol + '//' + location.host + '/';

    window.navigation = {
        menuInitialized: false
        ,menuOffsetWidth: 20
        ,menuOffsetHeight: 30
        ,menuWidth: 0
        ,menuFirstOffSet: 45
        ,init : function () {
            var $mainMenu = $("[id^='menu-main-menu']:not(#menu-main-menu-mobile)");

            if(!wpConfig.showOnlyRootLevel){
                if(!wpConfig.departmentMenuAddToRoot) {
                    // Add departments ID
                    $mainMenu
                        .find('> li.nav-shopping, > li.nav-departments')
                        .addClass('menu-item-has-children')
                        .filter('li.nav-shopping')
                        .append('<ul id="departments" class="sub-menu sf-mega" data-role="freshop-departments"></ul>');
                }

                // Add recipe categories placeholder
                $mainMenu
                    .find('li.nav-recipes')
                    .append('<ul id="recipe-categories" class="sub-menu"></ul>');

                $mainMenu
                    .find('> .menu-item-has-children > a > span:not(.divider)')
                        .addClass(wpConfig.desktopNavigationArrows);
            }

            $mainMenu
                .find('> .menu-item-has-children > a')
                .addClass(wpConfig.mobileNavigationArrows + ' mobile-nav-arrow');

            $mainMenu
                .find('.mobile-menu-favorite > a > span:not(.divider)')
                .append('<span class="my-favorites fp-icon fp-icon-star"></span>');

            // Skip sub-menu when keypress
            $mainMenu
                .off('focus', '.menu-item-has-children:not(.menu-item-show-children)')
                .on('focus', '.menu-item-has-children:not(.menu-item-show-children)', function(event) {
                    event.preventDefault();
                    $prevMenu = $(this);
                    $(this).addClass('fp-menu-focus');
                })
                .off('focusout', '.menu-item-has-children:not(.menu-item-show-children)')
                .on('focusout', '.menu-item-has-children:not(.menu-item-show-children)', function(event) {
                    event.preventDefault();
                    $(this).removeClass('fp-menu-focus');
                });

            // Attach Mobile Menu Events
            this.initMobileHandlers();
        }
        ,displayMenuArrows: function() {
            $("[id^='menu-main-menu']:not(#menu-main-menu-mobile) > .menu-item-has-children > .sub-menu").each(function(){
                var $subMenu = $(this)
                    ,$leftArrow = $subMenu.find('.left-arrow')
                    ,$rightArrow = $subMenu.find('.right-arrow')
                    ,$firstItem = $subMenu.find('> li.menu-item').first()
                    ,menuWidth = 0;

                // If arrows not added yet
                if($subMenu.find('.right-arrow').length <= 0){
                    $subMenu.append('<li class="hidden right-arrow ' + wpConfig.menuRightArrow + '"></li>');
                    $subMenu.prepend('<li class="hidden left-arrow ' + wpConfig.menuLeftArrow + '"></li>');

                    $leftArrow = $subMenu.find('.left-arrow');
                    $rightArrow = $subMenu.find('.right-arrow');

                    // Left Click
                    $leftArrow.off().on('click', function(event){
                        event.stopPropagation();

                        if(!$(this).hasClass('disabled')){
                            $rightArrow.removeClass('disabled');
                            //console.log('left click');

                            $firstItem.animate(
                                {marginLeft: window.navigation.menuFirstOffSet + 'px'}
                                , 200
                                , window.navigation.afterLeftClick($subMenu)
                            );

                            $(this).addClass('disabled');
                        }
                    });
        
                    // Right Click
                    $rightArrow.off().on('click', function(event){
                        event.stopPropagation();
                        
                        var thisMenuWidth = $subMenu.data('menu-width');
                        $leftArrow.removeClass('disabled');

                        if(!$(this).hasClass('disabled')){
                            firstItemPos = thisMenuWidth - ($(window).width());
                            firstItemPos = firstItemPos + 20;

                            $firstItem.animate(
                                {marginLeft: '-' + firstItemPos + 'px'}
                                , 200
                                , window.navigation.afterRightClick($subMenu)
                            );

                            $(this).addClass('disabled');
                        }
                    });
                }

                // Calculate whether or not arrows need to be shown
                $subMenu.show();                
                
                if($subMenu.length) { 
                    $subMenu.find('> li').each(function() {
                        menuWidth += Math.ceil($(this).width()) + 2;                    
                    });
                }

                $subMenu.data('menu-width', menuWidth);

                // Display Arrows
                if(menuWidth > $(window).width()){
                    $subMenu.addClass('activeArrows');
                    $firstItem.css('margin-left', window.navigation.menuFirstOffSet);               

                    // Reset the first link
                    window.navigation.afterLeftClick($subMenu);

                    if($rightArrow){
                        $leftArrow.addClass('disabled');

                        $leftArrow.removeClass('hidden');
                        $rightArrow.removeClass('hidden').removeClass('disabled');
                    }
                }
                // Hide Arrows
                else{
                    $subMenu.removeClass('activeArrows');

                    if($rightArrow){
                        $firstItem.css('margin-left', 0);
                        $rightArrow.addClass('hidden');
                        $leftArrow.addClass('hidden');
                    }
                }
                
                $subMenu.hide();
            });
        }
        // After animation check which link(s) are under the arrows.
        ,afterLeftClick: function($subMenu){

            var overlapFound = true
                ,$menuItems = $subMenu.find('> li.menu-item')
                ,arrowOffset = window.navigation.menuFirstOffSet + 5;
            
            $subMenu.find('> li.arrowOverlap-left').removeClass('arrowOverlap-left');
            
            for(var i = ($menuItems.length-1); i>=0; i--){
                var item = $menuItems[i]
                    ,$item = $(item)
                    ,itemRightPos = $item.position().left;

                if($(window).width() < (itemRightPos + arrowOffset + $item.width())){
                    $item.addClass('arrowOverlap-right');
                    overlapFound = true;
                }
                else{
                    overlapFound = false;
                }

                if(!overlapFound) break;
            }
        }
        // After animation check which link(s) are under the arrows.
        ,afterRightClick: function($subMenu){

            var overlapFound = true
                ,$menuItems = $subMenu.find('> li.menu-item')
                ,arrowOffset = window.navigation.menuFirstOffSet + 5;
            
            $subMenu.find('> li.arrowOverlap-right').removeClass('arrowOverlap-right');

            for(var i=0; i<$menuItems.length; i++){
                
                var item = $menuItems[i]
                    ,$item = $(item)
                    ,itemLeftPos = $item.position().left;

                if((itemLeftPos - $item.width()) < arrowOffset){
                    $item.addClass('arrowOverlap-left');
                    overlapFound = true;
                }
                else{
                    overlapFound = false;
                }

                if(!overlapFound) break;
            }                                       
        }
        ,initSuperFish : function() {
            console.log('**** init superfish ****');

            var $mainMenu = $("[id^='menu-main-menu']:not(#menu-main-menu-mobile)"),
                superfishConfig = $.extend({
                        animation:      { opacity: 'show' },
                        animationOut:  { opacity: 'hide' },
                        delay: window.hasTouch ? 0 : 250,
                        disableHI: window.hasTouch,
                        onBeforeShow: function(){
                            if(!$(this).filter(':hidden').length) return;

                            if($(this).hasClass('sub-menu') && !$(this).hasClass('activeArrows')){
                                $(document).trigger('menu.beforeShow.sf', $(this));
                            }
                        }
                    }, wpConfig.menuConfig && wpConfig.menuConfig.superfish);

            //for testing
            //return;

            if(!(wpConfig.menuConfig && wpConfig.menuConfig.megaSpreadChildren)) {
                $mainMenu.superfish('destroy')
            }

            $mainMenu.superfish(superfishConfig);
        }
        ,initSubMenuArrows: function() {
            if(!window.isSmall){
                //window.navigation.displayMenuArrows();
            }

            $(window).on('resize', function() {
                window.resizeEvt;
                clearTimeout(window.resizeEvt);
                window.resizeEvt = setTimeout(function() {
                    
                    if(!window.isSmall){
                        //window.navigation.displayMenuArrows();
                    }
                    else{                       
                        $("[id^='menu-main-menu']:not(#menu-main-menu-mobile) > .menu-item-has-children > .sub-menu").each(function(){
                            //console.log($(this).find(' > li.menu-item').first().find('> a > span:not(.divider)').html());

                            var $firstItem = $(this).find(' > li.menu-item').first();
                            $firstItem.css('marginLeft', '');
                        });
                    }
                }, 250);
            });
        }
        ,getNavHtml: function(children, level, parent, disableChildNav) {
            var config = wpConfig.menuConfig || {
                    subMenuClass: 'sub-menu',
                    menuItemClass: 'menu-item',
                    menuItemHasChildrenClass: 'menu-item-has-children',
                    menuItemSelectedClass: 'menu-item-selected',
                    maxLevel: 1,
                    enableMega: true
                };

            if(!disableChildNav && _.isFunction(wpConfig.getNavHtml)) {
                return wpConfig.getNavHtml(children, level, parent);
            }

            if(config.maxLevel > 0 && level > config.maxLevel) return '';

            var self = this,
                html = '',
                childItems,
                hasChildren,
                classNames;

            if(children && !_.isArray(children) && _.isArray(children.children)) {
                children = children.children;
            }

            if(_.isArray(children)) { 
                if(level > 1) html += '<ul class="' + config.subMenuClass + ' ' + config.subMenuClass + '-' + level + ' clearfix">';
                
                _.each(children, function(item) {
                    classNames = '';
                    childItems = item.children; 

                    if(childItems && !_.isArray(childItems) && _.isArray(childItems.children)) { 
                        childItems = childItems.children; 
                    } 
                    hasChildren = childItems && childItems.length && (config.maxLevel == -1 || level < config.maxLevel);

                    if(config.enableMega && level == 1) classNames += 'sf-mega ';
                    if(hasChildren) classNames += config.menuItemHasChildrenClass;
                    if(item.selected) classNames += config.menuItemHasChildrenClass;

                    html += '<li class="' + config.menuItemClass + ' ' + classNames + '" role="department">';
                    html += '<a href="' + item.url + '" data-id="' + freshop.ui.encodeForHtml(item.id) +'"><span>' + freshop.ui.encodeForHtml(item.title) + '</span></a>';

                    if(hasChildren) {
                        html += self.getNavHtml(childItems, level + 1, item, disableChildNav);
                    }

                    html += '</li>';
                });

                if(level > 1) html += '</ul>';
            }

            return html;
        }
        ,attachDepartmentEvents: function() {
            // Departments are created
            var $mainMenu = $("[id^='menu-main-menu']:not(#menu-main-menu-mobile)"),
                $departments;

            if(wpConfig.showOnlyRootLevel){
                $departments = $mainMenu.find('> li');

                if(wpConfig.alcoholDept) $departments.find('[data-id="' + wpConfig.alcoholDept + '"]').addClass('age-verification');
                
                if(!window.isSmall){
                    //Root level clicks won't work for menu items that have children (that are hidden)
                    //because superfish assumes these need to be toggled for mobile
                    //to fix this issue we need to manually link
                    $mainMenu
                        .off('mouseup', '> li > a')
                        .on('mouseup', '> li > a', function(event){
                            window.location.href = $(this).attr('href');                           
                        });
                }
                else {
                    $mainMenu
                        .off('mouseup', '> li > a');
                }
            }
            else {
                $departments = $mainMenu.find('#departments > li');
                
                if(!window.isSmall){
                    $departments
                        .off('mouseup', '> a')
                        .on('mouseup', '> a', function(event){
                            window.location.href = $(this).attr('href');
                        });
                }
                else {
                    $departments
                        .off('mouseup', '> a');
                }
            }

            if(!window.isSmall){
                $mainMenu
                    .off('mouseup', 'ul.department-submenu > li > a')
                    .on('mouseup', 'ul.department-submenu > li > a', function(event){
                        window.location.href = $(this).attr('href');
                    });
            }
            else {
                $mainMenu
                    .off('mouseup', 'ul.department-submenu > li > a');
            }
        }
        ,onDepartments : function() {            
            window.navigation.initSubMenuArrows();

            // Departments are created
            var $mainMenu = $("[id^='menu-main-menu']:not(#menu-main-menu-mobile)"),
                $departments;

            if(wpConfig.showOnlyRootLevel){
                $('.main-menu-container').addClass('loaded');
                $departments = $mainMenu.find('> li');
            }
            else {
                $departments = $mainMenu.find('#departments > li');
            }

            if(!wpConfig.showOnlyRootLevel){
                // Add freshop icon class
                $mainMenu
                    .find('.menu-item-has-children > a')
                    .addClass(wpConfig.mobileNavigationArrows + ' mobile-nav-arrow')
                    .find('> span:not(.divider)')
                    .addClass(wpConfig.desktopNavigationArrows);

                if(wpConfig.menuConfig && wpConfig.menuConfig.megaSpreadChildren) {
                    $("#menu-main-menu-mobile")
                        .find('.menu-item-has-children > a')
                        .addClass(wpConfig.mobileNavigationArrows + ' mobile-nav-arrow')
                        .find('> span:not(.divider)')
                        .addClass(wpConfig.desktopNavigationArrows);
                }
            }
            else {
                $mainMenu
                    .find('.menu-item-has-children > a')
                    .addClass(wpConfig.mobileNavigationArrows + ' mobile-nav-arrow');
            }

            navigation.attachDepartmentEvents();

            // Modify the menu
            if($departments.length <= 2) return;

            $departments.each(function() {
                var $item   = $(this);
                    //,$itemLink = $item.find("a")
                    //,itemId     = $itemLink.text().toLowerCase()
                    //,fpArrowClass = wpConfig.mobileNavigationArrows + ' mobile-nav-arrow';

                //itemId = itemId
                //    .replace(/ /g, "")
                //    .replace('&', '')
                //    .replace(',', '');
                    
                $item.find(" > ul").each(function() {
                    $(this).addClass('department-submenu');              
                });
            });

            if(!wpConfig.showOnlyRootLevel) {
                var imagePath = wpConfig.imgMenuPath;
                if(!(imagePath.indexOf('.jpg') || imagePath.indexOf('.png'))) imagePath += ".jpg";
                $mainMenu.find('#departments').append('<li class="menu-splash-image" style="background-image:url(\'' + imagePath + '\')"></li>');
            }
        }
        ,initMenu: function(){
            console.log('**** init Menu ****');
            var $navMobileWrapper = $('#mobile-nav-wrapper').removeData(['level', 'currentMenu']),
                $navMobileFooter = $('#mobile-menu-footer'),
                $headerNavWrapper = $('#navigation'),
                $body = $(document.body);

            $('#main-menu-container').removeClass('hidden-sm hidden-xs').css('visibility', 'hidden');

            // Rebuild Superfish
            this.initSuperFish();
            
            $navMobileWrapper.find("[id^='menu-main-menu']:not(#menu-main-menu-mobile)").prependTo($headerNavWrapper);

            $body.removeClass('mobile-menu-active');


            //reset mobile styles
            $navMobileWrapper
                .find('> .container-account-menu > .account-menu-wrapper')
                .css('left', '')
                .end()
                .find('> .nav-header-wrapper')
                .removeClass('current-menu-parent')
                .css({left: '', visibility: ''})
                .find('> .nav-header').css('left', '')
                .find('.current-menu-parent')
                .css({left: '', display: ''})
                .removeClass('current-menu-parent');
            
            $navMobileFooter.css({left: '', display: ''});

            $("[id^='menu-main-menu']:not(#menu-main-menu-mobile), #mobile-account-menu, #menu-footer-menu-mobile")
                .css({'left': '', visibility: ''})
                .filter("[id^='menu-main-menu'], #menu-footer-menu-mobile")
                .find('ul').addBack()
                    .removeClass('current-menu-parent')
                    .css({marginTop: '', left: ''})
                    .parent('li').removeClass('touch-active');

            navigation.menuInitialized = true;
            $('#main-menu-container').addClass('hidden-sm hidden-xs').css('visibility', '');
        }
        ,initMobileMenu : function() {
            console.log('**** init mobile menu ****');
            var $navMobileWrapper = $('#mobile-nav-wrapper').removeData(['level', 'currentMenu']);

            if(!(wpConfig.menuConfig && wpConfig.menuConfig.megaSpreadChildren)) {
                var $navMobile = $navMobileWrapper.find('#mobile-nav'),
                    $lgMdMenu = $("#navigation [id^='menu-main-menu']:not(#menu-main-menu-mobile)"),
                    $lgMdSuperfish = $("[id^='menu-main-menu']:not(#menu-main-menu-mobile)");
                $lgMdSuperfish.superfish('destroy');
                $lgMdMenu.appendTo($navMobile);
            }

            $('.account-menu, #reorder-indicator-mobile').on('click', 'a', function() {
                $(document.body).removeClass('mobile-menu-active');
            });
            navigation.menuInitialized = true;
        }
        ,initMenuTouchSupport : function() {
            console.log('**** init Menu Touch Support ****');
            if (window.isSmall || !window.hasTouch) return;
            
            var megaSpreadChildren = wpConfig.menuConfig && wpConfig.menuConfig.megaSpreadChildren,
                $mainMenu = megaSpreadChildren ? $('#menu-main-menu-mobile') : $("[id^='menu-main-menu']:not(#menu-main-menu-mobile)"),
                $body = $(document.body),
                lastTargetTouched = null;

            $mainMenu.find('.menu-item-has-children, .has-children').children('a')
                .off('touchend')
                .on('touchend', function(e) {
                    var lastTouchedSame = true;
                    if (lastTargetTouched != e.currentTarget) {
                        var $this = $(this)
                            ,$activeParentItem = $this.closest('li.sfHover');
                        if(!$activeParentItem.length) $mainMenu.find('> li.sfHover').superfish('hide');
                        else{
                            var $firstLevel = $mainMenu.find('> li.sfHover')
                                ,$secondLevel = $firstLevel.find('> ul > li.sfHover')
                                ,$thirdLevel = $secondLevel.find('.department-submenu');

                            if($secondLevel && $thirdLevel){
                                $thirdLevel.hide();
                                lastTouchedSame = false;
                            }
                        }

                        // if not third level
                        if((!lastTouchedSame && !$(e.currentTarget).parents('.department-submenu').length) || lastTouchedSame) {
                            e.preventDefault();
                            e.stopPropagation();
                            $this.parent().superfish('show');
                            lastTargetTouched = e.currentTarget;
                        }
                    }
                });

            // hide open menu items on click outside menu
            $body
                .off('click.superfish')
                .on('click.superfish', function(event){
                    lastTargetTouched = null;
                    $mainMenu.find('> li.sfHover').superfish('hide');
                });
        }
        ,initMobileHandlers : function() {
            $('#mobile-nav-wrapper')
                .on('click', function(event) {
                    var $this = $(this),
                        $currentMenu = $this.data('currentMenu'),
                        megaSpreadChildren = wpConfig.menuConfig && wpConfig.menuConfig.megaSpreadChildren,
                        mainMenuSelector =  megaSpreadChildren ? '#menu-main-menu-mobile' : "[id^='menu-main-menu']:not(#menu-main-menu-mobile)",
                        $menu = $(mainMenuSelector),
                        level = $this.data('level') || 0,
                        $target = $(event.target),
                        $window = $(window);
                    
                    if(event.target == $this[0] || $target.hasClass('glyphicon-remove')) {
                        event.preventDefault();
                        event.stopImmediatePropagation();

                        if($currentMenu) {                            
                            level--;
                            var $navHeader = $this.find('.nav-header-wrapper .nav-header')
                                ,$navHeaderLevel = $navHeader.find('.level-' + level)
                                ,oldWidth = $menu.data('width-' + level) || 0
                                ,width = $menu.outerWidth() + navigation.menuOffsetWidth
                                ,offsetWidth = oldWidth - width
                                ,navHeight;
                            
                            $navHeaderLevel.parent().removeClass('current-menu-parent');
                            $currentMenu.removeClass('current-menu-parent');

                            if(level == 0) {
                                $('#mobile-menu-footer').show();
                                $('#mobile-menu-footer,' + mainMenuSelector).css('visibility', 'visible');
                                var windowWidth = $window.width()
                                    ,$parent = $navHeader.parent()
                                        .animate({left: windowWidth}, function() {
                                            $parent.css({visibility: ''});
                                        });
                                $navHeader = $();
                            }

                            $currentMenu.find('> li > ul.sub-menu').css('left', width);
                            
                            var duration
                                ,easing;

                            if(event.target == $this[0] && level >= 0) {
                                duration = 200;
                                //easing = 'linear';
                            }
                            $navHeader
                                .css('left', '+=' + offsetWidth)
                                .animate({left: '+=' + width}, duration, easing, function() {
                                    $navHeader.find('.level-' + level).hide();
                                });
                            
                            $('#mobile-menu-footer, #mobile-nav-wrapper .account-menu-wrapper')
                                .css('left', '+=' + offsetWidth)
                                .animate({left: '+=' + width}, duration, easing);

                            var $childLi = $currentMenu.find('> li.touch-active')
                                .removeClass('touch-active');
                                //.addClass('animating');

                            $menu
                                .css('left', '+=' + offsetWidth)
                                .animate({left: '+=' + width}, duration, easing, function() {
                                    
                                    
                                    if(level == 0) $currentMenu = null;
                                    else $currentMenu = $currentMenu.parent().closest('ul');
                                    $this.data('currentMenu', $currentMenu);
                                    if(level > 0 && event.target == $this[0]) $this.trigger('click');
                                });
                            
                            if(level == 0) navHeight = '';
                            else navHeight = navigation.menuOffsetHeight + $currentMenu.height();

                            $menu.closest('.col-nav').css('height', navHeight);

                            $this.data('level', level);
                        }
                        return;
                    }

                    var $menuItem = $target.closest('li.menu-item'),
                        $anchor = $menuItem.filter('.menu-item-has-children, .has-children').find('> a');

                    if($anchor.length) {                    
                        if($target.prop('tagName').toLowerCase() != 'span') {
                            event.preventDefault();
                            event.stopImmediatePropagation();

                            var width = $menu.outerWidth() + navigation.menuOffsetWidth
                                ,$menu = $(mainMenuSelector)
                                ,$navHeaderWrapper = $this.find('> .nav-header-wrapper')
                                ,$navHeader = $navHeaderWrapper.find('> .nav-header')
                                ,$navHeaderLevel = $navHeader.find('.level-' + level)
                                ,navHeaderCss = {display: 'block'}
                                ,$nextMenu = $anchor.next('ul.sub-menu').css('left', width)
                                ,$nextSubMenu = $nextMenu.filter('ul.sub-menu')
                                ,navHeight
                                ,secondMenuVertOffset = 50;

                            $currentMenu = $anchor.closest('ul');
                            
                            if(level == 0) {
                                var windowWidth = $window.width();
                                $navHeader.parent()
                                    .css({visibility: 'visible', left: windowWidth})
                                    .animate({left: '-=' + windowWidth});
                                $navHeader = $();
                            }
                            else navHeaderCss.left = width;
                            
                            if(!$navHeaderLevel.length) {
                                var $lastLevel = $navHeader.find('[class^="level-"]').last();
                                $navHeaderLevel = $lastLevel
                                    .clone()
                                    .prop('className', 'level-' + level + ' page-title')
                                    .appendTo($lastLevel);
                            }
                            $navHeader.css('height', 'auto');
                            $navHeaderLevel
                                .css(navHeaderCss)
                                .find('> .page-title > span').text($anchor.text());
                            $menu.data('width-' + level, width);
                            
                            $navHeader.add('#mobile-menu-footer, #mobile-nav-wrapper .account-menu-wrapper')
                                .animate({left: '-=' + width});

                            $menu.animate({left: '-=' + width}, function (){
                                $('body,html').animate({ scrollTop: 0 }, 600);

                                $anchor.parent().addClass('touch-active');
                                $navHeaderLevel.parent().addClass('current-menu-parent');
                                $currentMenu.addClass('current-menu-parent');

                                var isAccountMenu = $currentMenu.closest('#menu-footer-menu-mobile').length > 0;

                                if($nextSubMenu.length) {
                                    var marginTop = $navHeaderWrapper.offset().top + $navHeaderWrapper.height() - ($nextMenu.parent().offset().top);
                                    if($nextSubMenu.hasClass('second-menu') && !isAccountMenu) {
                                        marginTop = marginTop + secondMenuVertOffset;
                                    }
                                    $nextSubMenu.css('marginTop', marginTop);
                                }

                                if(!isAccountMenu)  {
                                    navHeight = navigation.menuOffsetHeight + $nextMenu.height();
                                    $menu.closest('.col-nav').css({height: navHeight});
                                }

                                level++;
                                $this.data({level: level, currentMenu: $currentMenu});

                                $('#mobile-menu-footer,' + mainMenuSelector).css('visibility', 'hidden');
                            });

                            return;
                        }
                    }

                    $anchor = $menuItem.find('> a');
                    if($anchor.length) {
                        href = $anchor.attr('href') || '';
                        navigation.toggleNav();
                    }
                });
        }
        ,matchMediaHandler : function(mql) {
            mql = mql || {};

            var megaSpreadChildren = wpConfig.menuConfig && wpConfig.menuConfig.megaSpreadChildren,
                $mainMenu = megaSpreadChildren ? $('#menu-main-menu-mobile') : $("[id^='menu-main-menu']:not(#menu-main-menu-mobile)");
            $mainMenu.closest('.col-nav').css('height', '');
            
            if(mql.matches) {
                window.isSmall = true;
                navigation.initMobileMenu();
                fpClientSearch.initMobileSearch();
            }
            else {
                console.log('**** matchMediaHandler ****');
                window.isSmall = false;

                if(!navigation.menuInitialized || !mql.matches){
                    navigation.initMenu();
                }
                navigation.initMenuTouchSupport();
                fpClientSearch.initSearch();
            }

            navigation.attachDepartmentEvents();
            fpClient.initMinilistIndicator();
        }
        ,setMobileHeader : function(selectedUl){
            console.log('********** setMobileHeader');

            var $navHeaderWrapper = $('.nav-header-wrapper')                
                ,$navHeader = $navHeaderWrapper.find('.nav-header')
                ,$navHeaderHeight = $navHeader.css('height', 'auto').height()
                ,$navAccountMenuWrap = $navHeaderWrapper.parent().find('.container-account-menu');

            $navHeader.css('height', $navHeaderHeight);
            $navAccountMenuWrap.css('top', -$navHeaderHeight);
            $navAccountMenuWrap.css('margin-bottom', -$navHeaderHeight);
        }
        ,toggleNav : function() {
            $(document.body).toggleClass('mobile-menu-active');
            //navigation.setMobileHeader();
        }
    }


    window.fpClientSearch = {
        initMobileSearch : function(){
            var $mobileSearchWrapper = $('.mobile-header-wrapper').find('.mobile-search')
                ,$lgMdSearchWrapper = $('#header .top-menu-search').find('#search');

            $lgMdSearchWrapper.appendTo($mobileSearchWrapper);
        }
        ,initSearch : function(){
            var $mobileSearchWrapper = $('.mobile-header-wrapper').find('#search')
                ,$lgMdSearchWrapper = $('#header').find('.top-menu-search');

            $mobileSearchWrapper.appendTo($lgMdSearchWrapper);
        }
    };

    window.backToTop = {
        init : function () {
            var back_to_top_offset = 200,
                back_to_top_scroll_top_duration = 600,
                $back_to_top = $('#footer > .cd-top'),
                $window = $(window),
                fadeTimeout;

            $window.on('scroll', function(){
                var scrollTop = $window.scrollTop();

                if(scrollTop > back_to_top_offset ) {
                    if(!$back_to_top.hasClass('cd-is-visible')){
                        $back_to_top.addClass('cd-is-visible');

                        clearTimeout(fadeTimeout);

                        // remove button after 3 seconds with no scrolling
                        fadeTimeout = setTimeout(function() {
                            $back_to_top.removeClass('cd-is-visible');
                        }, 3000);
                    }
                }
                else{
                    $back_to_top.removeClass('cd-is-visible');
                }
            });

            //smooth scroll to top
            $back_to_top.on('click', function(event){
                event.preventDefault();
                $('body,html').animate({ scrollTop: 0 }, back_to_top_scroll_top_duration );
            });
        }
    };

    $(document).ready(function() {
        backToTop.init();
        navigation.init();
        
        var img = new Image();
        img.onerror = img.onload = function (event) {
            window.hasWebp = event && event.type === 'load' ? img.width === 1 : false;
            fpClient.init();

            fpClient.loader = new fpClient.custom.loading();

            var mql;
            if (window.matchMedia) {
                mql = window.matchMedia("screen and (max-width: 991px)");
                mql.addListener(navigation.matchMediaHandler);
            }
            navigation.matchMediaHandler(mql);

            $('form.wpcf7-form .dropdown').dropdown();

            //if freshop has not initialized in 10s there is most likely an issue
            var timeoutId = setTimeout(function() {
                window.freshopInitialized();
            }, 1000 * 10);

            window.freshopInitialized = function() {
                clearTimeout(timeoutId);
                $(document).trigger('freshopInitialized');
            };
        };
        img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

        if($('.grid-auto').html() || $('.grid-manual').html()) {
            $('.grid-auto .sow-image-grid-image_html, .grid-manual a img.so-widget-image').each(function(){
                var $gridImage = $(this),
                    altText = $gridImage.attr('alt');

                if(altText) {
                    $('<p class="imgDeptLink">' + altText + '</p>').insertAfter($gridImage);
                }
            });
        }

        //add trancend GCP click handler
        $(document)
            .on('click', '.trancendclick', function(event) {
                if(window.airgap && airgap.getRegimes && airgap.getRegimes().has('CPRA') && window.transcend) {
                    event.preventDefault();
                    transcend.showConsentManager();
                }
            });
    });
})(jQuery); 