/**
 * Image Slider
 * Handles navigation through image slides with arrow buttons and indicator dots
 */

class ImageSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.slider-btn-prev');
        this.nextBtn = document.querySelector('.slider-btn-next');

        this.currentIndex = 0;
        this.totalSlides = this.slides.length;

        this.init();
    }

    init() {
        // Skip slider initialization when no slider controls or slides are present.
        if (!this.prevBtn || !this.nextBtn || this.totalSlides === 0 || this.indicators.length === 0) {
            return;
        }

        // Set up event listeners for navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Set up event listeners for indicator dots
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Initialize first slide
        this.updateSlider();
    }
    
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
    }
    
    previousSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
    }
    
    updateSlider() {
        // Update active slide
        this.slides.forEach((slide, index) => {
            if (index === this.currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update active indicator
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}

// Initialize slider when DOM is loaded
function attachVideoControls(video) {
    if (!video || video.closest('.video-controls')) return;

    const container = video.closest('.media-block') || video.parentElement;
    if (!container) return;

    // Prevent duplicates if called multiple times
    if (container.querySelector('.video-controls')) return;

    const controls = document.createElement('div');
    controls.className = 'video-controls';

    const playPauseBtn = document.createElement('button');
    playPauseBtn.type = 'button';
    playPauseBtn.textContent = video.paused ? 'Play' : 'Pause';

    const muteUnmuteBtn = document.createElement('button');
    muteUnmuteBtn.type = 'button';
    muteUnmuteBtn.textContent = video.muted ? 'Unmute' : 'Mute';

    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });

    muteUnmuteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
    });

    video.addEventListener('play', () => {
        playPauseBtn.textContent = 'Pause';
    });

    video.addEventListener('pause', () => {
        playPauseBtn.textContent = 'Play';
    });

    video.addEventListener('volumechange', () => {
        muteUnmuteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
    });

    controls.append(playPauseBtn, muteUnmuteBtn);
    container.appendChild(controls);
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageSlider();

    document.querySelectorAll('video').forEach(attachVideoControls);

    // If new videos are added dynamically, keep controls in sync
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                if (node.tagName === 'VIDEO') {
                    attachVideoControls(node);
                } else {
                    node.querySelectorAll && node.querySelectorAll('video').forEach(attachVideoControls);
                }
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
