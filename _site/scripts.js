$(document).ready(function() {
    $('.pattern').click(function() {
        $(this).addClass('full-screen');
        $('.overlay').show();
        $("body").addClass("overflow-hidden");
    });
    $('.overlay').click(function() {
        $('.pattern').removeClass('full-screen');
        $(this).hide();
        $("body").removeClass("overflow-hidden");
    });
});