document.addEventListener("DOMContentLoaded", function() {
    var container = document.getElementById('map');
    if (container) {
        var options = {
            center: new kakao.maps.LatLng(36.512884, 127.245108),
            level: 3
        };

        var map = new kakao.maps.Map(container, options);
    } else {
        console.error("Map container element not found");
    }
});