document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = 'DVMHaH0ac4drRVtQQGMnKqWacExpXg2RTvZHYS07M4CFnIM1fUtP208G';
    const searchInput = document.querySelector('.search-container input');
    const searchButton = document.querySelector('.search-container button');
    const productContainer = document.querySelector('.product-container img');
    const productTitle = document.querySelector('.product-info h2');
    const productPhotographer = document.querySelector('.product-info .author');
    const exploreMoreButton = document.querySelector('.explore-btn'); 
    const sliderList = document.getElementById('slider-list'); 
    const wishlistSliderList = document.getElementById('wishlist-slider-list'); 

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || []; 
    
    
    exploreMoreButton.textContent = 'Explore More';
    exploreMoreButton.classList.add('explore-more-btn'); 
    document.querySelector('.product-info').appendChild(exploreMoreButton);
    

  
    async function fetchImages(query) {
        const API_URL = `https://api.pexels.com/v1/search?query=${query}&per_page=50`;
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

    
    async function populateSlider(query) {
        const images = await fetchImages(query);
        sliderList.innerHTML = ''; 

        if (images.length === 0) {
            sliderList.innerHTML = '<p>No images found</p>';
            return;
        }

       
        const firstImage = images[0];
        updateProductContainer(firstImage.src.medium, firstImage.alt, firstImage.photographer, firstImage.photographer_url);

        
        images.forEach(image => {
            const listItem = document.createElement('li');
            listItem.classList.add('splide__slide');

            // Wishlist heart icon logic
            const isWishlisted = wishlist.some(item => item.id === image.id);
            const heartIcon = isWishlisted ? '❤️' : '🤍';

            listItem.innerHTML = `
                <div class="custom-card" data-src="${image.src.medium}" data-title="${image.alt}" data-photographer="${image.photographer}" data-url="${image.photographer_url}">
                    <img src="${image.src.medium}" alt="${image.alt}">
                    <div class="fav-icon" data-id="${image.id}">${heartIcon}</div>
                    <p class="title">${image.alt || 'Image'}</p>
                    <p class="subtitle">${image.photographer}</p>
                </div>
            `;

          
            listItem.addEventListener('click', function () {
                updateProductContainer(image.src.medium, image.alt, image.photographer, image.photographer_url);
            });

           
            listItem.querySelector('.fav-icon').addEventListener('click', function (e) {
                e.stopPropagation();
                toggleWishlist(image, this);
            });

            sliderList.appendChild(listItem);
        });

       
        new Splide('#similar-results-slider', {
            type: '',
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

    
    function updateProductContainer(imgSrc, title, photographer, photographerUrl) {
        productContainer.src = imgSrc;
        productTitle.textContent = title;
        productPhotographer.textContent = photographer;

        if (photographerUrl) {
            exploreMoreButton.style.display = 'block'; 
            exploreMoreButton.onclick = function () {
                window.open(photographerUrl, '_blank');
            };
        } else {
            exploreMoreButton.style.display = 'none'; 
        }
    }

   
    function toggleWishlist(image, heartIconElement) {
        const index = wishlist.findIndex(item => item.id === image.id);

        if (index === -1) {
            wishlist.push(image); 
            heartIconElement.textContent = '❤️'; 
        } else {
            wishlist.splice(index, 1); 
            heartIconElement.textContent = '🤍'; 
        }

        localStorage.setItem('wishlist', JSON.stringify(wishlist)); 
        updateWishlistSlider(); 
    }

   
    function updateWishlistSlider() {
        wishlistSliderList.innerHTML = ''; 

        const screenWidth = window.innerWidth;
        const maxPerPage = screenWidth <= 768 ? 2 : 4; 

        let wishlistItems = [...wishlist];

        
        if (wishlistItems.length < maxPerPage && screenWidth > 768) {
            while (wishlistItems.length < maxPerPage) {
                wishlistItems.push(null);
            }
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

                listItem.querySelector('.fav-icon').addEventListener('click', function () {
                    toggleWishlist(image, this);
                });
            }

            wishlistSliderList.appendChild(listItem);
        });

        const hasMultipleItems = wishlist.length > 1

        new Splide('#wishlist-slider', {
            type: 'slide',
            perPage: Math.min(wishlist.length, maxPerPage), 
            breakpoints: {
                1024: { perPage: 3 },
                768: { perPage: 2 },
                480: { perPage: 1 }
            },
            pagination: false,
            arrows: hasMultipleItems, 
            gap: '20px'
        }).mount();
    }

    
    window.addEventListener('resize', updateWishlistSlider);

   
    searchButton.addEventListener('click', function () {
        const query = searchInput.value.trim();
        if (query) {
            populateSlider(query);

            if (window.innerWidth <= 768) {
                window.scrollBy({ top: 300, behavior: 'smooth' });
            }
        }
    });

  
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') { 
            event.preventDefault(); 
            searchButton.click(); 
        }
    });

   
    populateSlider('laptop');
    updateWishlistSlider();
});
