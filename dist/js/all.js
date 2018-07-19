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

//import idb from 'idb'
/**
 * Common database helper functions.
 */

class DBHelper {


    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        const port = 1337 // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }

    /**
     * Fetch all restaurants.
     */

    static openDBData() {

        var db;
        var request = window.indexedDB.open('restaurant', 1);
        request.onerror = function (event) {
            alert("Database error:" + event.target.errorCode);
        };
        request.onsucess = function (event) {
            db.event.target.result;
            console.log("IDB created!!!")
        };


        request.onupgradeneeded = function (event) {
            console.log("Entered UPgrade!!!!!!!")
            db = event.target.result;
            var objectstore = db.createObjectStore('restaurant_name', {
                keyPath: "name"
            });
            objectstore.transaction.oncomplete = function (event) {
                console.log("Entered objectstore!!!!!!!")
                var resObjectStore = db.transaction(["restaurant_name"], "readwrite").objectStore("restaurant_name");

                if (resObjectStore.length > 0) {
                    console.log("cached data =" + resObjectStore.getAll())
                }

            };
        };

        return request;
    }

    static getCachedData(idb) {
        idb.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db) {
                return null;
            }
        }

    }

    static fetchRestaurants(callback) {
        var idb = DBHelper.openDBData();
        idb.onsucess = function (event) {
            var db = event.target.result;
            console.log("ON sucess")

            if (db) {
                var tx = db.transaction('restaurant_name');
                var store = tx.objectStore('restaurant_name');
                console.log("INSIDE HEREEEEEEEEEE!!!")
                return callback(null, store.getAll());
            }
        };
        idb.onerror = function (event) {
            console.log("Database error:" + event.target.errorCode);

        }


        fetch(DBHelper.DATABASE_URL)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                console.log(myJson);

                if (myJson.length > 0) {
                    console.log("Upgrading!!!!!!");
                    var db = idb.result;
                    var objStore = db.transaction(["restaurant_name"], "readwrite").objectStore("restaurant_name")
                    myJson.forEach(function (restaurant) {
                        objStore.add(restaurant);
                    });
                    console.log("objstore data" + objStore.getAll())

                    return callback(null, myJson);
                }
            })

            .catch(function (e) {
                console.log("Using IDB!!!!")
                alert(`Request failed. Use cached data instead`)

                return callback(e, null);
            });


    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return (`./img/${restaurant.id}` + ".jpg");
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP
        });
        return marker;
    }

}

let restaurants,
    neighborhoods,
    cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.tabIndex = '0';
    image.role = 'img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/1.jpg") {
        image.alt = "Mission Chinese Food Restaurant, classical indoor decoration"
    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/2.jpg") {
        image.alt = "Emily Restaurant, Italian pizza"
    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/3.jpg") {
        image.alt = "Kang Ho Dong Baekjeong Restaurant, street food style decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/4.jpg") {
        image.alt = "Katz's Delicatessen Restaurant, American fast food"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/5.jpg") {
        image.alt = "Roberta's Pizza Restaurant, classical Pizza decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/6.jpg") {
        image.alt = "Hometown BBQ Restaurant, casual decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/7.jpg") {
        image.alt = "Superiority Burger Restaurant, fast food style decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/8.jpg") {
        image.alt = "The Dutch Restaurant, classical indoor decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/9.jpg") {
        image.alt = "Mu Ramen Restaurant, well-designed decoration"

    } else if (DBHelper.imageUrlForRestaurant(restaurant) == "./img/10.jpg") {
        image.alt = "Casa Enrique Restaurant, modern indoor decoration"

    }
    li.append(image);

    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    name.tabIndex = '0';
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more)

    return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url
        });
        self.markers.push(marker);
    });
}

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
    if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/1.jpg"){
    image.alt ="Mission Chinese Food Restaurant, classical indoor decoration"
}   else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/2.jpg"){
    image.alt ="Emily Restaurant, Italian pizza"
}
    else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/3.jpg"){
    image.alt ="Kang Ho Dong Baekjeong Restaurant, street food style decoration"

}
    else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/4.jpg"){
            image.alt ="Katz's Delicatessen Restaurant, American fast food"

    }
    else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/5.jpg"){
            image.alt ="Roberta's Pizza Restaurant, classical Pizza decoration"

    }
    else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/6.jpg"){
            image.alt ="Hometown BBQ Restaurant, casual decoration"

    }
    else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/7.jpg"){
            image.alt ="Superiority Burger Restaurant, fast food style decoration"

    }
    else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/8.jpg"){
            image.alt ="The Dutch Restaurant, classical indoor decoration"

    }

    else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/9.jpg"){
            image.alt ="Mu Ramen Restaurant, well-designed decoration"

    }

    else if(DBHelper.imageUrlForRestaurant(restaurant)=="/img/10.jpg"){
            image.alt ="Casa Enrique Restaurant, modern indoor decoration"

    }

    image.tabIndex='0';

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
