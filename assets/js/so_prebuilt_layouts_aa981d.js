jQuery(function ($) {
    if($('.grid-auto').html() || $('.grid-manual').html()) {
             $('.grid-auto .sow-image-grid-image_html, .grid-manual a img.so-widget-image').each(function(){
                var $gridImage = $(this),
                    titleText = $gridImage.attr('title');
                if(titleText) {
                    $('<p class="imgDeptLink">' + titleText + '</p>').insertAfter($gridImage);
                }
            });
        }
});
