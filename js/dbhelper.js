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

    static get SERVER_URL() {
        const port = 1337 // Change this to your server port
        return `http://localhost:${port}/`;
    }
    /**
     * Fetch all restaurants.
     */

    static openDBData(myJson) {
        var db;
        var request = window.indexedDB.open('restaurant', 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            var createObjStore = db.createObjectStore('Restaurants', {
                keyPath: "id"
            });
            var createObjStoreReview = db.createObjectStore('Reviews', {
                keyPath: "id"
            });
            var ObjStoreOfflineReview = db.createObjectStore('offReviews', {
                keyPath: "key",
                autoIncrement: true
            });

            myJson.forEach(function (restaurant) {
                createObjStore.add(restaurant);
            });
        }
        //Error Opening IDB
        request.onerror = function (event) {
            alert("Database error:" + event.target.errorCode);
        };
        //Open IDB
        request.onsuccess = function (event) {
            console.log("request on success!!")
            db = event.target.result;
        };

        return request;
    }


    static getCachedData(callback) {
        var db;
        var request = window.indexedDB.open('restaurant', 1);
        var allData;
        request.onsuccess = function (event) {
            db = event.target.result;
            var tx = db.transaction('Restaurants', 'readwrite');
            var store = tx.objectStore('Restaurants');
            store.getAll().onsuccess = function (event) {
                var allData = event.target.result;
                callback(allData);
            }

        }
        return allData;
    }

    static getCachedReviews(callback) {
        var db;
        var request = window.indexedDB.open('restaurant', 1);
        var allData;
        request.onsuccess = function (event) {
            db = event.target.result;
            var tx = db.transaction('Reviews', 'readwrite');
            var store = tx.objectStore('Reviews');
            store.getAll().onsuccess = function (event) {
                var allData = event.target.result;
                callback(allData);
            }

        }
        return allData;
    }


    static fetchRestaurants(callback) {
        var idb;
        fetch(DBHelper.DATABASE_URL)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                if (myJson.length > 0) {
                    idb = DBHelper.openDBData(myJson);

                }

                return callback(null, myJson);

            })

            .catch(function (e) {

                console.log(`Request failed. Use cached data instead`)

                DBHelper.getCachedData(function (data) {
                    return callback(null, data);
                });

                return callback(e, null);
            });

    }
    // Same as fetch restaurants 
    static fetchRestaurantsReviews(restaurant, callback) {

        fetch(`http://localhost:1337/reviews/?restaurant_id=${restaurant.id}`)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                console.log(myJson)
                var db;
                var request = window.indexedDB.open('restaurant', 1);
                request.onsuccess = function (event) {
                    db = event.target.result;
                    var tx = db.transaction('Reviews', 'readwrite');
                    var store = tx.objectStore('Reviews');
                    myJson.forEach(function (review) {
                        store.add(review);
                    });

                }
                return callback(null, myJson);
            })
            .catch(function (e) {
                console.log(`Request failed. Use cached data instead`)

                DBHelper.getCachedReviews(function (data) {

                    return callback(null, data);


                });
                return callback(e, null);



            })
    }
    static submitReview(data) {
        console.log(data)
        let offReview_obj = {
            name: 'addReview',
            data: data,
            object_type: 'review'
        };

        if (!navigator.onLine && (offReview_obj.name === 'addReview')) {
            console.log("entered !navigator.onLine")

            DBHelper.submitOfflineReview(offReview_obj);
            return offReview_obj;
        } else {

            return fetch(DBHelper.SERVER_URL + "reviews", {
                body: JSON.stringify(data),
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, same-origin, *omit
                headers: {
                    'content-type': 'application/json'
                },
                method: 'POST',
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // *manual, follow, error
                referrer: 'no-referrer', // *client, no-referrer
            }).then(function (response) {
                response.json()
                    .then(function (myJson) {
                        console.log("JSON is here:::" + myJson)
                        var db;
                        var request = window.indexedDB.open('restaurant', 1);
                        request.onsuccess = function (event) {
                            db = event.target.result;
                            var tx = db.transaction('Reviews', 'readwrite');
                            var store = tx.objectStore('Reviews');
                            store.add(myJson);

                        }
                        request.onerror = function (event) {
                            console.error(event.target.errorCode)
                        }

                        return myJson;
                    }).catch(function (e) {
                        console.error(e)

                    });
            }).catch(function (e) {

                console.error(e)
                DBHelper.submitOfflineReview(offReview_obj);



            });
        }
    }

    static submitOfflineReview(offReview) {
        var db;
        var request = window.indexedDB.open('restaurant', 1);
        var allData;
        request.onsuccess = function (event) {
            db = event.target.result;
            var tx = db.transaction('offReviews', 'readwrite');
            var store = tx.objectStore('offReviews');
            store.add(offReview);

        }
        request.onerror = function (event) {
            console.error(event.target.errorCode)
        }

        window.addEventListener('online', function (event) {
            console.log("Browser online again!")
            var request = window.indexedDB.open('restaurant', 1);

            request.onsuccess = function (event) {
                console.log("entered offreview Objectstore")
                db = event.target.result;
                var tx = db.transaction('offReviews', 'readwrite');
                var store = tx.objectStore('offReviews');
                store.getAll().onsuccess = function (event) {
                    var offlineReviews = event.target.result;
                    offlineReviews.forEach(function (review) {
                        DBHelper.submitReview(review.data);
                    });

                    DBHelper.clearOffReview();
                }

            }

        })

    }



    static clearOffReview() {
        var db;
        var request = window.indexedDB.open('restaurant', 1);
        request.onsuccess = function (event) {
            db = event.target.result;
            var tx = db.transaction('offReviews', 'readwrite');
            var store = tx.objectStore('offReviews').clear();
        }
    }

    static checkFavorite(restaurantID, isFavorite) {

        fetch(`${DBHelper.SERVER_URL}restaurants/${restaurantID}/?is_favorite=${isFavorite}`, {
            method: 'PUT'
        }).then(function (response) {
            return response.json
        }).then(function (myJson) {
            var db;
            var request = window.indexedDB.open('restaurant', 1);
            request.onsuccess = function (event) {
                db = event.target.result;
                var tx = db.transaction('Restaurants', 'readwrite');
                var store = tx.objectStore('Restaurants');
                store.get(restaurantID).onsuccess = function (event) {
                    var restaurant = event.target.result;
                    restaurant.is_favorite = isFavorite;
                    store.put(restaurant);

                };


            };
            return myJson;
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
        return (`./img/${restaurant.id}` + ".webp");
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


//export default DBHelper;
