$(document).ready(function () {
  const $viewBtn = $(".view-modal");
  const $popup = $(".popup");
  const $overlay = $(".pop-up-overlay");
  const $sharButtons = $(".share-print");
  const $close = $popup.find(".close");
  const $field = $popup.find(".field");

  $viewBtn.on("click", function () {
    $popup.toggleClass("show");
    $overlay.toggleClass("seen");
    $sharButtons.toggleClass("white");
  });

  $close.on("click", function () {
    $viewBtn.click();
  });
});

$(window).load(function(){
    $('.loader').fadeOut(3000);
});
