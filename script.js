const impactSection = document.getElementById('impact-section');
const slides = document.querySelectorAll('.impact-slide');
const dots = document.querySelectorAll('.impact-dot');
const semicircleContainer = document.getElementById('semicircle-container');
let currentSlide = 0;
let isTransitioning = false;
let scrollAccumulator = 0;
const scrollThreshold = 80;
function updateSlides() {
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.style.opacity = '1';
            slide.style.transform = 'translateX(0)';
        } else if (index < currentSlide) {
            slide.style.opacity = '0';
            slide.style.transform = 'translateX(-100%)';
        } else {
            slide.style.opacity = '0';
            slide.style.transform = 'translateX(100%)';
        }
    });
    const semicirclePositions = ['-25%', '0%', '25%'];
    semicircleContainer.style.transform = `translateX(${semicirclePositions[currentSlide]})`;
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.remove('bg-gray-300');
            dot.classList.add('bg-gray-800');
            dot.style.transform = 'scale(1.2)';
        } else {
            dot.classList.remove('bg-gray-800');
            dot.classList.add('bg-gray-300');
            dot.style.transform = 'scale(1)';
        }
    });
}
function triggerTransition(direction) {
    if (isTransitioning) return;
    
    if (direction === 'down' && currentSlide < 2) {
        isTransitioning = true;
        currentSlide++;
        updateSlides();
        
        setTimeout(() => {
            isTransitioning = false;
            scrollAccumulator = 0;
        }, 1000);
        
    } else if (direction === 'up' && currentSlide > 0) {
        isTransitioning = true;
        currentSlide--;
        updateSlides();
        
        setTimeout(() => {
            isTransitioning = false;
            scrollAccumulator = 0;
        }, 1000);
    }
}
let lastWheelTime = 0;
let wheelTimeout = null;
let isSectionActive = false;
function checkSectionActive() {
    const rect = impactSection.getBoundingClientRect();
    isSectionActive = rect.top <= 0 && rect.bottom >= window.innerHeight;
    return isSectionActive;
}
function handleWheel(e) {
    if (!checkSectionActive() || isTransitioning) {
        return;
    }
    
    const now = Date.now();
    const timeDelta = now - lastWheelTime;
    lastWheelTime = now;
    
    if (timeDelta > 200) {
        scrollAccumulator = 0;
    }
    
    if (wheelTimeout) {
        clearTimeout(wheelTimeout);
    }
    wheelTimeout = setTimeout(() => {
        scrollAccumulator = 0;
    }, 150);
    
    if (e.deltaY > 0) {
        if (currentSlide < 2) {
            e.preventDefault();
            e.stopPropagation();
            scrollAccumulator += e.deltaY;
            if (scrollAccumulator >= scrollThreshold) {
                triggerTransition('down');
                scrollAccumulator = 0;
            }
        }
    } else if (e.deltaY < 0) {
        if (currentSlide > 0) {
            e.preventDefault();
            e.stopPropagation();
            scrollAccumulator += Math.abs(e.deltaY);
            if (scrollAccumulator >= scrollThreshold) {
                triggerTransition('up');
                scrollAccumulator = 0;
            }
        }
    }
}
impactSection.addEventListener('wheel', handleWheel, { passive: false });
document.addEventListener('wheel', function(e) {
    if (checkSectionActive() && !isTransitioning) {
        if (currentSlide > 0 && currentSlide < 2 && e.deltaY !== 0) {
            e.preventDefault();
            e.stopPropagation();
            handleWheel(e);
        }
    }
}, { passive: false });
updateSlides();