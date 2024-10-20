//image-card를 누르면 해당 상품의 상세페이지로 이동
$(document).ready(function(){
    $(".image-card").click(function(){
        var id = $(this).attr('id');
        // window.location.href = "/market/detail/" + id;
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    });
});