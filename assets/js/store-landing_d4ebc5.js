(function($) {
    window.client_storeLanding = {
        init : function(){
            var freshopUi = freshop.ui;

            this.setMenuActiveState();

            freshopUi.on('loaded', function(event){
                client_storeLanding.buildStoreOptions(storeJsonData);
            });


            freshop.on('storeChanged', function(event, store){
                freshop.ui.setSelectedStore(store);
                client_storeLanding.buildStoreOptions(store);
            });
        }
        ,setMenuActiveState : function(){
            $('#menu-main-menu').find('.nav-my-store').addClass('current-menu-item');
        }
        ,buildTitle : function(isStore){
            var $pageWrapper = $('.single-stores');

            if(isStore){
                $pageWrapper.removeClass('single-stores-other-store');
                $pageWrapper.addClass('single-stores-my-store');
            }
            else{
                $pageWrapper.addClass('single-stores-other-store');
                $pageWrapper.removeClass('single-stores-my-store');

                // Set Breadcrumb's stores link to the store locator
                var $otherBreadcrumb = $pageWrapper.find('#breadcrumb-other-store')
                    ,$storesLink = $otherBreadcrumb.find('li:eq(1) > span > a');

                $storesLink.attr('href', fpClient.URLs.storeLocator);
            }
        }
        ,buildStoreOptions : function(s){
            var fpStoreOptionsHtml = ''
                ,$fpStoreOptions = $('.fp-store-options')
                ,$fpMakeMyStore = $('.fp-make-my-store');

            $fpMakeMyStore.addClass('hidden');
            $fpStoreOptions.html('');

            var store = freshop.ui.getSelectedStore();
            if(s.id && (s.id == store.id)){
                fpStoreOptionsHtml = fpStoreOptionsHtml + '<span class="fp-icon fp-icon-star" title="My Store"></span>';
                $('body').addClass('selected-store');
                $fpMakeMyStore.addClass('hidden');
                this.buildTitle(true);
            }
            else {
                if(s.is_selectable){
                    fpMakeMyStoreHtml = '<input type="button" class="fp-btn fp-btn-mystore" value="Make This My Store" data-store-id="' + freshop.ui.encodeForHtml(s.id) + '" />';
                    $fpMakeMyStore.html(fpMakeMyStoreHtml);
                    $fpMakeMyStore.removeClass('hidden');
                }
                this.buildTitle(false);
            }

            $fpStoreOptions.html(fpStoreOptionsHtml);
            $fpStoreOptions.removeClass('hidden');

            $('.fp-btn-mystore').on('click', function(event){
                event.preventDefault();
                freshop.ui.setStore(s.id);
            });
        }
    };
    $(document)
        .on('freshopInitialized', function () {
            if($('.single-stores').length){
                client_storeLanding.init();
            }
        });

    $(function() {
        $('.breadcrumb a.post-stores-archive').prop('href', '/my-store/store-locator');
    });
})(jQuery);