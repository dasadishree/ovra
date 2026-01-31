document.addEventListener('DOMContentLoaded', async function() {
    
    try {
        // firebase
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js");
        const { getFirestore, collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js");
        const { firebaseConfig } = await import("./firebase-config.js");
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // join initiative form
        const joinForm = document.getElementById('join-form');
        if (joinForm) {
            joinForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Sending...';
                btn.disabled = true;
                
                try {
                    const data = {
                        name: document.getElementById('join-name').value.trim(),
                        phone: document.getElementById('join-phone').value.trim(),
                        email: document.getElementById('join-email').value.trim(),
                        timestamp: serverTimestamp()
                    };
                    const docRef = await addDoc(collection(db, "initiative_signups"), data);
                    
                    alert('Success! You\'ve joined the initiative.');
                    this.reset();
                } catch(err) {
                    alert('Error: Failed to submit');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
        
        // preorder form
        const preorderForm = document.getElementById('preorder-form');
        if (preorderForm) {
            preorderForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Processing...';
                btn.disabled = true;
                
                try {
                    const data = {
                        name: document.getElementById('preorder-name').value.trim(),
                        email: document.getElementById('preorder-email').value.trim(),
                        quantity: parseInt(document.getElementById('preorder-quantity').value) || 1,
                        address: document.getElementById('preorder-address').value.trim(),
                        timestamp: serverTimestamp()
                    };
                    
                    const docRef = await addDoc(collection(db, "preorders"), data);
                    
                    alert('Preorder received! We\'ll be in touch.');
                    this.reset();
                } catch(err) {
                    alert('Error: Failed to submit');
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
        }
        
    } catch(error) {
        alert('Error: Firebase failed to load.');
    }
});
        
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

// mobile menu
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    
    if (!btn || !menu) return;
    
    function closeMenu() {
        menu.classList.add('hidden');
        menu.classList.remove('translate-x-0');
        menu.classList.add('translate-x-full');
        document.body.style.overflow = '';
    }
    
    function openMenu() {
        menu.classList.remove('hidden');
        menu.classList.remove('translate-x-full');
        menu.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden';
    }
    
    btn.addEventListener('click', function() {
        const isOpen = !menu.classList.contains('hidden');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // close button
    if (!menu.querySelector('.mobile-menu-close')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-menu-close absolute top-4 right-4 p-2 text-gray-800 hover:text-gray-600 transition-colors';
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        closeBtn.addEventListener('click', closeMenu);
        menu.appendChild(closeBtn);
    }
});