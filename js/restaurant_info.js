//import DBHelper from './dbhelper.js';
let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
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
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;
    name.tabIndex = '0';

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;
    address.tabIndex = '0';

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/1.jpg") {
        image.alt = "Mission Chinese Food Restaurant, classical indoor decoration"
    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/2.jpg") {
        image.alt = "Emily Restaurant, Italian pizza"
    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/3.jpg") {
        image.alt = "Kang Ho Dong Baekjeong Restaurant, street food style decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/4.jpg") {
        image.alt = "Katz's Delicatessen Restaurant, American fast food"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/5.jpg") {
        image.alt = "Roberta's Pizza Restaurant, classical Pizza decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/6.jpg") {
        image.alt = "Hometown BBQ Restaurant, casual decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/7.jpg") {
        image.alt = "Superiority Burger Restaurant, fast food style decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/8.jpg") {
        image.alt = "The Dutch Restaurant, classical indoor decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/9.jpg") {
        image.alt = "Mu Ramen Restaurant, well-designed decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "/img/10.jpg") {
        image.alt = "Casa Enrique Restaurant, modern indoor decoration"

    }

    image.tabIndex = '0';

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;
    cuisine.tabIndex = '0';

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

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    title.tabIndex = '0';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
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
    const name = document.createElement('p');
    name.innerHTML = review.name;
    name.tabIndex = '0'
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = review.date;
    date.tabIndex = '0';
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    rating.tabIndex = '0';
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    comments.tabIndex = '0';
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
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
