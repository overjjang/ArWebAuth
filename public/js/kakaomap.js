document.addEventListener("DOMContentLoaded", function() {
    var container = document.getElementById('map');
    if (container) {
        var options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667),
            level: 3
        };

        var map = new kakao.maps.Map(container, options);
    } else {
        console.error("Map container element not found");
    }
});