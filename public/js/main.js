(function ($) {
  function bindEventsToCheckIn(reservation) {
    reservation.find(".checkIn").on("click", function (event) {
      event.preventDefault();
      var currentLink = $(this);
      var currentId = currentLink.data("id");

      var requestConfig = {
        method: "POST",
        url: "/users/homepage/checked/" + currentId,
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        var newElement = $(responseMessage);
        bindEventsToCheckIn(newElement);
        reservation.replaceWith(newElement);
      });
    });
  }
})(window.jQuery);
