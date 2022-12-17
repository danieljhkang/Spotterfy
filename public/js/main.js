(function ($) {
  var userReservations = $("#user-reservations");

  function bindEventsToCheckIn(reservation) {
    reservation.find(".checkIn").on("click", function (event) {
      event.preventDefault();
      var currentLink = $(this);
      var currentId = currentLink.data("_id");

      var requestConfig = {
        method: "POST",
        url: "/routesAPI/homepage/checked/" + currentId,
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        var newElement = $(responseMessage);
        bindEventsToCheckIn(newElement);
        reservation.replaceWith(newElement);
      });
    });
  }

  userReservations.children().each(function (index, element) {
    bindEventsToCheckIn($(element));
  });
})(window.jQuery);
