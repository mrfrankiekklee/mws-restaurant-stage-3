if ('serviceWorker' in navigator) {

    navigator.serviceWorker
        .register('./service-worker.js', {
            scope: './'
        })
        .then(function (registration) {
            console.log("SW registered!");
        })
        .catch(function (err) {
            console.log("Service Worker failed to Register", err);
        })
}





var get = function (url) {
    return new Promise(function (resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var result = xhr.responseText;
                    result = JSON.parse(result);
                    resolve(result);
                    console.log("it worked")

                } else {
                    console.log("it failed");
                    reject(xhr);
                }
            }
        };

        xhr.open("GET", url, true);
        xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

        xhr.send();


    });
};

window.addEventListener('online', function (event) {
    alert("Online!");
});
window.addEventListener('offline', function (event) {
    alert("connection lost");

});

/*get('https://maps.googleapis.com/maps/api/js?key=AIzaSyDzLHy2m5sSKhSx_-yot8xk8jXTP-T8q18&libraries=places&callback=initMap', {
        mode: 'no-cors'
    })
    .then(function (response) {
        console.log("Sucess", response);
        document.getElementsByClassName('targetMap' [0]).src = response.url;
    })
    .catch(function (err) {
        console.log("Error", err);
    });
*/
