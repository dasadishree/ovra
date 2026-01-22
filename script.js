// mobile or not
function isMobile() {
    return window.innerWidth < 768;
}

const impactSection = document.getElementById('impact-section');
const slides = document.querySelectorAll('.impact-slide');
const dots = document.querySelectorAll('.impact-dot');
const semicircleContainer = document.getElementById('semicircle-container');
let currentSlide = 0;
let isTransitioning = false;
let scrollAccumulator = 0;
const scrollThreshold = 80;
let lockedScrollPosition = 0;
let isScrollLocked = false;
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
    if (isMobile()) return false; 
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

function lockScrollPosition() {
    const rect = impactSection.getBoundingClientRect();
    const isInSection = rect.top <= 0 && rect.bottom >= window.innerHeight;
    
    if (isInSection) {
        if (!isScrollLocked) {
            lockedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            isScrollLocked = true;
        }
    } else {
        isScrollLocked = false;
    }
}

function handleScroll() {
    if (isScrollLocked && checkSectionActive()) {
        if ((currentSlide > 0) || (currentSlide < 2)) {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            if (currentSlide > 0 && currentSlide < 2 && Math.abs(currentScroll - lockedScrollPosition) > 5) {
                window.scrollTo({ top: lockedScrollPosition, behavior: 'auto' });
            }
        }
        if ((currentSlide === 0) || (currentSlide === 2)) {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            if (!checkSectionActive()) {
                isScrollLocked = false;
            }
        }
    } else {
        lockScrollPosition();
    }
}

function preventScroll(e) {
    if (!checkSectionActive() || isTransitioning) {
        return;
    }
    
    if (!isScrollLocked) {
        lockedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        isScrollLocked = true;
    }
    
    if (e.deltaY < 0) {
        if (currentSlide > 0) {
            e.preventDefault();
            e.stopPropagation();
            handleWheel(e);
            return false;
        }
        else {
            isScrollLocked = false;
            return;
        }
    }
    
    if (e.deltaY > 0) {
        if (currentSlide < 2) {
            e.preventDefault();
            e.stopPropagation();
            handleWheel(e);
            return false;
        }
        else {
            isScrollLocked = false;
            return;
        }
    }
}

// only scroll if impact section exists
if (impactSection && !isMobile()) {
    impactSection.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: false });
    setInterval(lockScrollPosition, 100);
    updateSlides();
}
window.addEventListener('resize', () => {
    if (impactSection && !isMobile()) {
        updateSlides();
    }
});

// mobile menu toggle & settings
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) {
        console.log('Mobile menu elements not found');
        return; 
    }
    
    const menuSpans = mobileMenuButton.querySelectorAll('span');
    const newButton = mobileMenuButton.cloneNode(true);
    const newSpans = newButton.querySelectorAll('span');
    mobileMenuButton.parentNode.replaceChild(newButton, mobileMenuButton);
    
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = !mobileMenu.classList.contains('hidden');
        
        if (isOpen) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
            
            if (newSpans.length >= 3) {
                newSpans[0].style.transform = '';
                newSpans[1].style.opacity = '';
                newSpans[2].style.transform = '';
            }
        } else {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.classList.add('translate-x-0');
            document.body.style.overflow = 'hidden';
            
            if (newSpans.length >= 3) {
                newSpans[0].style.transform = 'rotate(45deg) translateY(8px)';
                newSpans[1].style.opacity = '0';
                newSpans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            }
        }
    });
    
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
            
            if (newSpans.length >= 3) {
                newSpans[0].style.transform = '';
                newSpans[1].style.opacity = '';
                newSpans[2].style.transform = '';
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    setTimeout(initMobileMenu, 0);
}