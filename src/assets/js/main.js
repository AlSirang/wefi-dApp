(function ($) {
  "use strict";

  $(".bar").click(function () {
    $(".offcanvas-wrapper, .overlay").addClass("active");
  });
  $(".close, .overlay").click(function () {
    $(".offcanvas-wrapper, .overlay").removeClass("active");
  });
})(jQuery);
