(function($) {
    // a temporary fix for the race condition issue
    var initialized = false,
        selectedStoreId = $.urlParam('store_id');

    $(document).on('freshopInitialized', function () {
        if(window.freshop) {
            freshop.on('initialized', init);

            // Load the data from the stores
            function init(){
                if(initialized) return;

                initialized = true;

                var $listContainer = $("#dropdown-store .dropdown-list");

                if($listContainer && $listContainer.length > 0){
                    freshop.getStores(function(data) {
                        var items = data.items;

                        if(window.wpConfig.storeHideFromStoreDropdown) items = _.reject(items, function(item){ return _.contains(window.wpConfig.storeHideFromStoreDropdown, item.store_number) || !item.is_selectable });
                        
                        var sortedArray =   _.sortBy(items, function(item) {
                            return [item.state, item.name];
                        });

                        var listContainer = $("#dropdown-store .dropdown-list");

                        $.each(sortedArray, function(index, store) {
                            isSelected = '';
                            if(store.id == selectedStoreId) isSelected = ' data-selected="true"';
                            var listItem = '<li class="dropdown-list-item" role="presentation" data-store-id="'+ freshop.ui.encodeForHtml(store.id) + '"><a href="javascript:;" role="menuitem" data-store-name="' + freshop.ui.encodeForHtml(store.name) + '"data-value="' + freshop.ui.encodeForHtml(store.store_number) + '"' + isSelected + '>' + freshop.ui.encodeForHtml(store.state) + ' - ' + freshop.ui.encodeForHtml(store.name) + '</a></li>';
                            
                            listContainer.append(listItem);
                        });

                        $("#dropdown-store").dropdown(function(value) {
                            var $item = $(this).data('dropdown').__getSelected()
                                ,$storeName = $('#store-name').add($('#dropdown-store').closest('.store-dropdown-wrapper').next('input[type="hidden"]')).val($item.attr('data-store-name'))
                                ,$storeNumber = $storeName.parents('form').find('.contact-store-number input');

                                var selectedStore = _.findWhere(sortedArray, {name: $item.attr('data-store-name')});
                                if(selectedStore) $storeNumber.val('store_id:' + selectedStore.id);
                                else $storeNumber.val('');
                        })
                        .data('dropdown').onChange();

                        //
                        //  TODO: Update so that store names are shown for email templates
                        //
                        // var storeList = [
                        //     {id:'0', text:'Not relevent', value:'na'}
                        // ];

                        // _.each(data.items, function(store, index) {
                        //     storeList.push({id:store.id, text:store.name, value:store.store_number});
                        // });

                        // $("#dropdown-store").select2({
                        //     placeholder: "Select a store",
                        //     data: storeList,
                        //     minimumResultsForSearch: Infinity
                        // });
                    });
                }
            }
            
            setTimeout(function() {
                if(freshop.initialized) init();
            }, 1000);
        }
    });

})(jQuery);
