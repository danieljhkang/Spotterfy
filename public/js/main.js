(function ($) {
  var userReservations = $("#user-reservations");

  function bindEventsToReservation(reservation) {
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
        bindEventsToReservation(newElement);
        reservation.replaceWith(newElement);
      });
    });
  }

  userReservations.children().each(function (index, element) {
    bindEventsToReservation($(element));
  });
})(window.jQuery);