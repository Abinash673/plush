document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = 'DVMHaH0ac4drRVtQQGMnKqWacExpXg2RTvZHYS07M4CFnIM1fUtP208G';
    const searchInput = document.querySelector('.search-container input');
    const searchButton = document.querySelector('.search-container button');
    const productContainer = document.querySelector('.product-container img');
    const productTitle = document.querySelector('.product-info h2');
    const productPhotographer = document.querySelector('.product-info .author');
    const sliderList = document.getElementById('slider-list'); // Similar Items Slider
    const wishlistSliderList = document.getElementById('wishlist-slider-list'); // Favorites Slider

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || []; // Load wishlist from local storage
    

    // Function to fetch images from Pexels API
    async function fetchImages(query) {
        const API_URL = `https://api.pexels.com/v1/search?query=${query}&per_page=8`;
        try {
            const response = await fetch(API_URL, {
                headers: { Authorization: API_KEY }
            });

            const data = await response.json();
            return data.photos || [];
        } catch (error) {
            console.error('Error fetching images:', error);
            return [];
        }
    }

    // Function to populate Similar Items slider
    async function populateSlider(query) {
        const images = await fetchImages(query);
        sliderList.innerHTML = ''; // Clear previous results

        if (images.length === 0) {
            sliderList.innerHTML = '<p>No images found</p>';
            return;
        }

        // **Show first image in product container**
        const firstImage = images[0];
        updateProductContainer(firstImage.src.medium, firstImage.alt, firstImage.photographer);

        // Loop through fetched images and create slider items
        images.forEach(image => {
            const listItem = document.createElement('li');
            listItem.classList.add('splide__slide');

            // Check if the image is in wishlist and update UI
            const isWishlisted = wishlist.some(item => item.id === image.id);
            const heartIcon = isWishlisted ? '❤️' : '🤍'; // Filled heart if in wishlist, empty otherwise

            listItem.innerHTML = `
                <div class="custom-card" data-src="${image.src.medium}" data-title="${image.alt}" data-photographer="${image.photographer}">
                    <img src="${image.src.medium}" alt="${image.alt}">
                    <div class="fav-icon" data-id="${image.id}">${heartIcon}</div>
                    <p class="title">${image.alt || 'Image'}</p>
                    <p class="subtitle">${image.photographer}</p>
                </div>
            `;

            // Add click event to update product container
            listItem.addEventListener('click', function () {
                updateProductContainer(image.src.medium, image.alt, image.photographer);
            });

            // Add wishlist event
            listItem.querySelector('.fav-icon').addEventListener('click', function (e) {
                e.stopPropagation();
                toggleWishlist(image, this);
            });

            sliderList.appendChild(listItem);
        });

        // Initialize Splide.js for Similar Items slider
        new Splide('#similar-results-slider', {
            type: 'loop',
            perPage: 4,
            breakpoints: {
                1024: { perPage: 3 },
                768: { perPage: 2 },
                480: { perPage: 1 }
            },
            pagination: false,
            arrows: true,
            gap: '20px'
        }).mount();
    }

    // Function to update product container
    function updateProductContainer(imgSrc, title, photographer) {
        productContainer.src = imgSrc;
        productTitle.textContent = title;
        productPhotographer.textContent = photographer;
    }

    // Wishlist Functionality
    function toggleWishlist(image, heartIconElement) {
        const index = wishlist.findIndex(item => item.id === image.id);

        if (index === -1) {
            wishlist.push(image); // Add to wishlist
            heartIconElement.textContent = '❤️'; // Filled heart
        } else {
            wishlist.splice(index, 1); // Remove from wishlist
            heartIconElement.textContent = '🤍'; // Empty heart
        }

        localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Update local storage
        updateWishlistSlider(); // Refresh wishlist slider
    }

    // Function to update the wishlist slider (1 image + 3 blank)
    function updateWishlistSlider() {
        wishlistSliderList.innerHTML = ''; // Clear previous results

        // Ensure exactly 4 slides (1 image + 3 blank if needed)
        const wishlistItems = [...wishlist];

        while (wishlistItems.length < 4) {
            wishlistItems.push(null); // Fill with blank items
        }

        wishlistItems.forEach(image => {
            const listItem = document.createElement('li');
            listItem.classList.add('splide__slide');

            if (image) {
                listItem.innerHTML = `
                    <div class="custom-card">
                        <img src="${image.src.medium}" alt="${image.alt}">
                        <div class="fav-icon active" data-id="${image.id}">❤️</div>
                        <p class="title">${image.alt || 'Image'}</p>
                        <p class="subtitle">${image.photographer}</p>
                    </div>
                `;

                // Remove from wishlist when clicked
                listItem.querySelector('.fav-icon').addEventListener('click', function () {
                    toggleWishlist(image, this);
                });
            } else {
                listItem.innerHTML = `<div class="custom-card empty-card"></div>`; 
            }

            wishlistSliderList.appendChild(listItem);
        });

        // **Show exactly 4 slides (1 image + 3 blanks)**
        new Splide('#wishlist-slider', {
            type: 'loop',
            perPage: 4,
            breakpoints: {
                1024: { perPage: 3 },
                768: { perPage: 2 },
                480: { perPage: 1 }
            }, 
            pagination: false,
            arrows: true,
            gap: '20px'
        }).mount();
    }

    // Event listener for search button
    searchButton.addEventListener('click', function () {
        const query = searchInput.value.trim();
        if (query) {
            populateSlider(query);
        }
    });

    // Event listener for pressing "Enter" in the search box
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') { // Check if Enter is pressed
            event.preventDefault(); // Prevent form submission (if inside a form)
            searchButton.click(); // Trigger search button click
        }
    });

    // Load default images on page load
    populateSlider('laptop');

    // Load wishlist on page load
    updateWishlistSlider();
});
