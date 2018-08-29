// A $( document ).ready() block.
$(document).ready(function() {
    console.log("ready!");
    $('#menu').hide();
});


// scroll down and show top-menu
$(window).scroll(function() {
    console.log($('.masthead').outerHeight());
    if ($(window).scrollTop() >= $('.masthead').outerHeight()) {
        console.log("show");
        $('#menu').show();
    } else {
        console.log("hide");
        $('#menu').hide();
    }
});
