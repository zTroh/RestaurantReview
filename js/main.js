let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();

  // Registering the serviceWorker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('../serviceWorker.js')
      .then(function(registration) {
        console.log('serviceWorker registration successful');
      })
      .catch(function(error) {
        console.log("serviceWorker registration failed");
      })
  }
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
    option.tabIndex = -1; // add tabIndex to the option list
    option.value = neighborhood;
    select.append(option);
  });
  select.firstElementChild.tabIndex = 0; // added this to add a tabindex to the first element in the list
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
    option.tabIndex = -1; // added this
    select.append(option);
  });
  select.firstElementChild.tabIndex = 0; // added this to add a tabindex to the first element in the list
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibGlibWFubnkiLCJhIjoiY2prdTlob3E3MGI0azN3bnU1ZnB6azh2aiJ9.RVNSM_SH97FgBTIDJ9iK7A',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
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
} */

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
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
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

/*
This function will add ALT Attribute to restaurants images
*/
function addAltAttribute(imageId, image, name) {
  switch (imageId) {
    case 1:
      image.alt = 'People sitting around a table inside ' + name + ' restaurant';
      break;
    case 2:
      image.alt = 'Cheese pizza of ' + name + ' restaurant';
      break;
    case 3:
      image.alt = 'design of the inside of ' + name + ' restaurant';
      break;
    case 4:
      image.alt = 'in front of the' + name + ' restaurant';
      break;
    case 5:
      image.alt = 'People eating inside ' + name + 'restaurant';
      break;
    case 6:
      image.alt = 'People sitting and eating inside ' + name + ' restaurant';
      break;
    case 7:
      image.alt = 'People standing outside of ' + name + ' restaurant';
      break;
    case 8:
      image.alt = 'the front of ' + name + ' restaurant';
      break;
    case 9:
      image.alt = 'People eating inside ' + name + 'restaurant';
      break;
    case 10:
      image.alt = 'design of the inside of ' + name + ' restaurant';
      break;
    default:

  }
}
/*

ADD aria label to all restaurant name
so when focus, the screen reader will red the label
*/

function addAriaLabel(restaurants, name) {
  restaurants.setAttribute('aria-label', name);
}

function addAriaRole(restaurants) {
  restaurants.setAttribute('role', 'h1');
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const figure = document.createElement('figure');
  const figcaption = document.createElement('figcaption'); // I ADDED THIS NEWLEY CREATED SECTION

  figcaption.className = 'restaurant-details-container'; // Adding a class to the newley created section
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  figure.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  name.tabIndex = 0;
  addAriaLabel(name, restaurant.name);
  addAriaRole(name);
  figcaption.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  figcaption.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  figcaption.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  /*
   Created this function to add the alt Attribute
   this all restaurant images

  */
  addAltAttribute(restaurant.id, image, name.textContent);
  figcaption.append(more);
  figure.append(figcaption);
  li.append(figure);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);

    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
