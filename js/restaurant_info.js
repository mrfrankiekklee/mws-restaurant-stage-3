let restaurant;
var map;



document.addEventListener('DOMContentLoaded', (event) => {
    fetchRestaurantFromURL();
    createReviewHTML();

});
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {

    if (window.innerWidth < 464) {
        console.log('Its mobile!!!!!');
        var deskMap = document.getElementById('map');
        deskMap.style.display = 'none';
        self.isDesktopMap = false;
        self.initMobileMap();

    } else {
        console.log('Its desktop!!!!!');
        var mobMap = document.querySelector('.static_map');
        mobMap.style.display = 'none';
        self.isMobileMap = false;
        self.initDesktopMap();
    }


}


window.initMobileMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        var mobMap = document.querySelector('.static_map_Res');
        mobMap.setAttribute('src', `https://maps.googleapis.com/maps/api/staticmap?center=${restaurant.latlng.lat},${restaurant.latlng.lng}&markers=size:large|color:red|${restaurant.latlng.lat},${restaurant.latlng.lng}&zoom=12&size=400x400&maptype=roadmap&key=AIzaSyAYs8hR5MJ-84q_MQTJYVgGYXBF8I5yrMw`);

        mobMap.addEventListener('click', function (e) {
            e.preventDefault();
            mobMap.style.display = 'none';
            self.initDesktopMap();

        });

    });


}

window.initDesktopMap = () => {
    var deskMap = document.getElementById('map');
    deskMap.style.display = 'block';



    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            google.maps.event.addListenerOnce(map, 'idle', () => {
                document.getElementsByTagName('iframe')[0].title = "Google Maps";
            })
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });

}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            DBHelper.fetchRestaurantsReviews(self.restaurant, (error, reviews) => {
                self.restaurant.reviews = reviews;
                fillRestaurantHTML();
                callback(null, restaurant)
            });
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.alt = "An image of " + restaurant.name;
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
}



/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    hours.tabIndex = '0';
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = renderHtml('td', key);
        row.appendChild(day);

        const time = renderHtml('td', operatingHours[key]);
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {


    const container = document.getElementById('reviews-container');
    const title = renderHtml('h3', 'Reviews');
    container.appendChild(title);
    const ul = document.getElementById('reviews-list');

    if (!reviews) {
        const noReviews = renderHtml('p', 'No reviews yet!');
        container.appendChild(noReviews);
        return;
    }
    //     REMEMBER HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = renderHtml('p', review.name);
    li.appendChild(name);

    const date = renderHtml('p', review.updatedAt);
    li.appendChild(date);

    const rating = renderHtml('p', `Rating: ${review.rating}`);
    li.appendChild(rating);

    const comments = renderHtml('p', review.comments);
    li.appendChild(comments);

    return li;
}


const reviewForm = document.getElementById("reviewForm");
reviewForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let review = {
        "restaurant_id": self.restaurant.id
    };
    const formdata = new FormData(reviewForm);
    for (var [key, value] of formdata.entries()) {
        review[key] = value;
    }
    DBHelper.submitReview(review);

    const ul = document.getElementById('reviews-list');
    ul.appendChild(createReviewHTML(review));
    reviewForm.reset();

});


renderHtml = (name, value) => {
    var element = document.createElement(name);
    if (value) {
        element.innerHTML = value;
    }
    return element;
}





/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    if (restaurant) {
        const breadcrumb = document.getElementById('breadcrumb');
        const li = renderHtml('li', restaurant.name);
        breadcrumb.appendChild(li);
    }
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
