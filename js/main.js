let restaurants,
    neighborhoods,
    cuisines;
var map;
var markers = [];
let isMobileMap = false,
    isDesktopMap = false;

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */

document.addEventListener('DOMContentLoaded', (event) => {
    fetchNeighborhoods();
    fetchCuisines();
    fillRestaurantsHTML();
});


observeImages = () => {
    const images = document.querySelectorAll('.restaurant-img');
    const options = {
        threshold: 0.1
    };
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(onChange, options);
        images.forEach(img => observer.observe(img));
    } else {
        images.forEach(image => loadImage(image));
    }
    const loadImage = image => {
        image.src = image.dataset.src;
    }

    function onChange(entries, observer) {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                loadImage(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }
}
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
    var mobMap = document.querySelector('.static_map');
    mobMap.style.display = 'block';
    self.isMobileMap = true;
    self.isDesktopMap = false;
    var mapMarkers = addMarkersToStatic(true);
    console.log("first time is true")
    mobMap.setAttribute('src', `https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&markers=size:large|color:red|${mapMarkers}&zoom=12&size=458x300&maptype=roadmap&key=AIzaSyAYs8hR5MJ-84q_MQTJYVgGYXBF8I5yrMw`);
    updateRestaurants();

    mobMap.addEventListener('click', function (e) {
        e.preventDefault();
        mobMap.style.display = 'none';
        self.initDesktopMap();

    });

}

window.initDesktopMap = () => {
    var deskMap = document.getElementById('map');
    deskMap.style.display = 'block';
    self.isMobileMap = false;
    self.isDesktopMap = true;
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };


    self.map = new google.maps.Map(deskMap, {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    self.isDesktopMap = true;
    google.maps.event.addListenerOnce(map, 'idle', () => {
        document.getElementsByTagName('iframe')[0].title = "Google Maps";
    })
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
    if (window.innerWidth < 450 && self.isMobileMap === true) {
        addMarkersToStatic(false);
    }
    if (self.map) {
        addMarkersToMap();
    }

    observeImages();

}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    const image = `<img class="restaurant-img" alt="${restaurant.name} restaurant" data-src="img/${restaurant.id||'10'}.webp">`;
    li.innerHTML = image;

    const name = renderHtml('h2', restaurant.name, li);
    const favorite = renderHtml('button', '❤', li);
    favorite.classList.add("fav_btn");
    favorite.onclick = function () {
        const isFavoriteNow = !restaurant.is_favorite;
        DBHelper.checkFavorite(restaurant.id, isFavoriteNow);
        restaurant.is_favorite = isFavoriteNow;
        changeFavElementClass(favorite, restaurant.is_favorite)
    };

    changeFavElementClass(favorite, restaurant.is_favorite)
    const neighborhood = renderHtml('p', restaurant.neighborhood, li);
    const address = renderHtml('p', restaurant.address, li);
    const more = renderHtml('a', 'View Details');

    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more)
    return li
}


changeFavElementClass = (el, fav) => {
    if (!fav) {
        el.classList.remove('favorite_yes');
        el.classList.add('favorite_no');
        el.setAttribute('aria-label', 'mark as favorite');

    } else {
        el.classList.remove('favorite_no');
        el.classList.add('favorite_yes');
        el.setAttribute('aria-label', 'remove as favorite');
    }
}

addMarkersToStatic = (firstTime, restaurants = self.restaurants) => {
    if (restaurants) {
        let mobMarkers = '';
        restaurants.forEach(restaurant => {
            mobMarkers += `${restaurant.latlng.lat},${restaurant.latlng.lng}|`;
        });

        if (firstTime === false) {
            console.log("first time is false")
            var mobMap = document.querySelector('.static_map');
            mobMap.style.display = 'block';
            mobMap.src = `https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&markers=size:large|color:red|${mobMarkers}&zoom=12&size=458x300&maptype=roadmap&key=AIzaSyAYs8hR5MJ-84q_MQTJYVgGYXBF8I5yrMw`;
        }
        return mobMarkers;


    }

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

renderHtml = (name, value, parent = null) => {
    var element = document.createElement(name);
    if (value) {
        element.innerHTML = value;
    }
    if (parent) {
        parent.append(element);
    }
    return element;
}
