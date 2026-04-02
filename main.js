/**
 * Image Slider
 * Handles navigation through image slides with arrow buttons and indicator dots
 */

class ImageSlider {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelectorAll('.slide');
        this.indicators = container.querySelectorAll('.indicator');
        this.prevBtn = container.querySelector('.slider-btn-prev');
        this.nextBtn = container.querySelector('.slider-btn-next');

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
    if (!video || video.classList.contains('lightbox-video')) return;

    // Prevent duplicates
    if (video.parentElement && video.parentElement.classList.contains('video-wrapper')) return;

    // Wrap the video in a positioned div so controls overlay the video only,
    // keeping any caption outside and below.
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    video.parentNode.insertBefore(wrapper, video);
    wrapper.appendChild(video);

    const controls = document.createElement('div');
    controls.className = 'video-controls';

    function makeIconBtn(iconSrc, label) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'video-ctrl-btn';
        btn.setAttribute('aria-label', label);
        const icon = document.createElement('img');
        icon.src = iconSrc;
        icon.alt = '';
        btn.appendChild(icon);
        return { btn, icon };
    }

    const { btn: playPauseBtn, icon: playPauseIcon } = makeIconBtn(
        video.paused ? 'assets/icons/play.svg' : 'assets/icons/pause.svg',
        video.paused ? 'Play' : 'Pause'
    );

    const { btn: muteBtn, icon: muteIcon } = makeIconBtn(
        video.muted ? 'assets/icons/volume-x.svg' : 'assets/icons/volume-2.svg',
        video.muted ? 'Unmute' : 'Mute'
    );
    muteBtn.style.display = 'none';

    const { btn: maximizeBtn } = makeIconBtn('assets/icons/maximize-2.svg', 'Fullscreen');

    playPauseBtn.addEventListener('click', () => {
        if (video.paused) video.play();
        else video.pause();
    });

    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        // Mute all other videos when this one is unmuted
        if (!video.muted) {
            document.querySelectorAll('video').forEach(v => {
                if (v !== video) v.muted = true;
            });
        }
    });

    video.addEventListener('play', () => {
        playPauseIcon.src = 'assets/icons/pause.svg';
        playPauseBtn.setAttribute('aria-label', 'Pause');
    });

    video.addEventListener('pause', () => {
        playPauseIcon.src = 'assets/icons/play.svg';
        playPauseBtn.setAttribute('aria-label', 'Play');
    });

    video.addEventListener('volumechange', () => {
        muteIcon.src = video.muted ? 'assets/icons/volume-x.svg' : 'assets/icons/volume-2.svg';
        muteBtn.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
    });

    // Show mute button only if video has an audio track
    function checkForAudio() {
        const hasAudio = video.mozHasAudio ||
            (video.audioTracks && video.audioTracks.length > 0) ||
            (video.webkitAudioDecodedByteCount > 0);
        if (hasAudio) muteBtn.style.display = '';
    }
    video.addEventListener('loadedmetadata', checkForAudio);
    video.addEventListener('playing', checkForAudio);
    if (video.readyState >= 1) checkForAudio();

    maximizeBtn.addEventListener('click', () => {
        if (window.openVideoLightbox) window.openVideoLightbox(video.src, video.currentTime);
    });

    controls.append(playPauseBtn, muteBtn, maximizeBtn);
    wrapper.appendChild(controls);
}

function initLightbox() {
    // Skip on home page
    if (document.querySelector('.intro')) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    const img = document.createElement('img');
    img.className = 'lightbox-img';
    img.alt = '';
    img.style.display = 'none';

    const lightboxVideo = document.createElement('video');
    lightboxVideo.className = 'lightbox-video';
    lightboxVideo.controls = true;
    lightboxVideo.loop = true;
    lightboxVideo.style.display = 'none';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close lightbox');

    overlay.append(closeBtn, img, lightboxVideo);
    document.body.appendChild(overlay);

    function closeLightbox() {
        overlay.classList.remove('active');
        img.src = '';
        img.style.display = 'none';
        lightboxVideo.pause();
        lightboxVideo.src = '';
        lightboxVideo.style.display = 'none';
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLightbox();
    });
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    document.querySelectorAll('img').forEach(el => {
        if (el.closest('.hero')) return;
        el.classList.add('lightbox-trigger');
        el.addEventListener('click', () => {
            img.src = el.src;
            img.alt = el.alt;
            img.style.display = '';
            lightboxVideo.style.display = 'none';
            overlay.classList.add('active');
        });
    });

    window.openVideoLightbox = (src, currentTime) => {
        // Mute all page videos before opening lightbox
        document.querySelectorAll('video').forEach(v => {
            if (v !== lightboxVideo) v.muted = true;
        });

        lightboxVideo.muted = false;
        lightboxVideo.src = src;
        lightboxVideo.load();
        lightboxVideo.style.display = '';
        img.style.display = 'none';
        overlay.classList.add('active');

        lightboxVideo.addEventListener('canplay', () => {
            if (currentTime) lightboxVideo.currentTime = currentTime;
            lightboxVideo.play().catch(() => {});
        }, { once: true });
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.image-slider').forEach(container => new ImageSlider(container));
    initLightbox();

    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) entry.target.muted = true;
        });
    }, { threshold: 0 });

    document.querySelectorAll('video').forEach(video => {
        attachVideoControls(video);
        if (!video.classList.contains('lightbox-video')) visibilityObserver.observe(video);
    });

    // If new videos are added dynamically, keep controls in sync
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                if (node.tagName === 'VIDEO') {
                    attachVideoControls(node);
                    if (!node.classList.contains('lightbox-video')) visibilityObserver.observe(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('video').forEach(v => {
                        attachVideoControls(v);
                        if (!v.classList.contains('lightbox-video')) visibilityObserver.observe(v);
                    });
                }
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
