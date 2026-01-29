// Telegram Web App initialization
let tg = window.Telegram?.WebApp;
let user = null;
let currentSlide = 0;
let timerInterval = null;
let timerSeconds = 0;
let isDarkMode = false;
const adminId = '7812317222';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTelegramWebApp();
    initializeWelcomeScreen();
    initializeNavigation();
    initializeControlPanel();
    
    // Check if user is admin
    if (user && user.id.toString() === adminId) {
        document.getElementById('controlPanelBtn').classList.remove('hidden');
    }
    
    // Reset slide to 0 on page load
    currentSlide = 0;
    
    // Ensure first slide is active
    const slides = document.querySelectorAll('.slide');
    const progressBars = document.querySelectorAll('.progress-bar');
    
    slides.forEach((slide, index) => {
        if (index === 0) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    progressBars.forEach(bar => bar.classList.remove('active'));
});

function initializeTelegramWebApp() {
    if (tg) {
        tg.ready();
        user = tg.initDataUnsafe?.user;
        
        if (user) {
            // Update user info in welcome screen
            document.getElementById('userName').textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            
            // Update user info in profile page
            document.getElementById('fullName').textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            document.getElementById('username').textContent = user.username ? '@' + user.username : 'No username';
            document.getElementById('userId').textContent = user.id;
            document.getElementById('settingsName').textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            
            // Set profile photos
            if (user.photo_url) {
                document.getElementById('userAvatar').src = user.photo_url;
                document.getElementById('settingsAvatar').src = user.photo_url;
            }
        }
        
        // Set theme based on Telegram theme
        if (tg.colorScheme === 'dark') {
            toggleDarkMode();
        }
    }
}

function initializeWelcomeScreen() {
    const slides = document.querySelectorAll('.slide');
    const progressBars = document.querySelectorAll('.progress-bar');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const openBtn = document.getElementById('openAppBtn');
    
    // Reset everything
    currentSlide = 0;
    slides.forEach(slide => slide.classList.remove('active'));
    progressBars.forEach(bar => bar.classList.remove('active'));
    
    // Show first slide
    slides[0].classList.add('active');
    
    // Start first progress bar after delay
    setTimeout(() => {
        updateProgressBars();
    }, 500);
    
    // Auto advance slides
    let slideInterval = setInterval(() => {
        if (currentSlide < 2) {
            nextSlide();
        } else {
            clearInterval(slideInterval);
            openBtn.classList.remove('hidden');
        }
    }, 3000);
    
    // Manual navigation
    nextBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        if (currentSlide < 2) {
            nextSlide();
        }
        if (currentSlide === 2) {
            openBtn.classList.remove('hidden');
        }
    });
    
    prevBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        if (currentSlide > 0) {
            prevSlide();
        }
    });
    
    // Open main app
    openBtn.addEventListener('click', () => {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        if (tg) {
            tg.expand();
        }
    });
}

function updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    console.log('Updating progress bars, currentSlide:', currentSlide);
    
    // Update each progress bar
    progressBars.forEach((bar, index) => {
        const fill = bar.querySelector('.progress-fill');
        
        if (index <= currentSlide) {
            // Active bar - fill it
            bar.classList.add('active');
            if (fill) {
                fill.style.width = '100%';
                fill.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
            }
            console.log(`Activated bar ${index}`);
        } else {
            // Inactive bar - empty it
            bar.classList.remove('active');
            if (fill) {
                fill.style.width = '0%';
            }
            console.log(`Deactivated bar ${index}`);
        }
    });
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    
    if (currentSlide < 2) {
        // Hide current slide
        slides[currentSlide].classList.remove('active');
        
        // Move to next slide
        currentSlide++;
        slides[currentSlide].classList.add('active');
        
        // Update progress bars
        setTimeout(() => {
            updateProgressBars();
        }, 100);
    }
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    
    if (currentSlide > 0) {
        // Hide current slide
        slides[currentSlide].classList.remove('active');
        
        // Move to previous slide
        currentSlide--;
        slides[currentSlide].classList.add('active');
        
        // Update progress bars
        updateProgressBars();
    }
}

function initializeNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = btn.getAttribute('data-page');
            
            // Haptic feedback
            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
            
            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active page with animation
            pages.forEach(p => {
                p.classList.remove('active');
            });
            
            // Add slight delay for smooth transition
            setTimeout(() => {
                const targetElement = document.getElementById(targetPage);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            }, 50);
        });
    });
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Update dark mode button text
    const darkModeBtn = document.querySelector('.setting-btn:nth-child(2)');
    const svg = darkModeBtn.querySelector('svg');
    const text = darkModeBtn.childNodes[darkModeBtn.childNodes.length - 1];
    
    if (isDarkMode) {
        svg.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path><circle cx="12" cy="12" r="5"></circle>';
        text.textContent = ' Light Mode';
    } else {
        svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        text.textContent = ' Dark Mode';
    }
}

function showNotifications() {
    // Haptic feedback
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    
    // Show notifications page with animation
    setTimeout(() => {
        document.getElementById('notificationsPage').classList.add('active');
    }, 50);
    
    // Update navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(b => b.classList.remove('active'));
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            // Haptic feedback for successful copy
            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
            showToast('Copied to clipboard!');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Haptic feedback
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
        showToast('Copied to clipboard!');
    }
}

function showToast(message) {
    if (tg && tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

function openLink(url) {
    if (tg && tg.openLink) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank');
    }
}

// Platform info modal
const platformData = {
    binance: {
        title: 'Binance',
        description: 'Binance is the world\'s largest cryptocurrency exchange by trading volume. It offers a wide range of cryptocurrencies for trading, staking, and earning. Join millions of users worldwide and start your crypto journey today.',
        link: 'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=ar&ref=GRO_28502_B0D6U&utm_source=default'
    },
    ton: {
        title: 'TON Wallet',
        description: 'TON Wallet is the official wallet for The Open Network blockchain. Store, send, and receive TON coins securely. Access TON-based applications and services directly from your wallet.',
        link: 'https://wallet.ton.org'
    },
    metamask: {
        title: 'MetaMask',
        description: 'MetaMask is a popular Web3 wallet that allows you to interact with Ethereum and other compatible blockchains. Store ETH and ERC-20 tokens, access DeFi protocols, and explore the decentralized web.',
        link: 'https://metamask.io'
    },
    bot: {
        title: 'Earning Bot',
        description: 'Automated Telegram bots that help you earn cryptocurrency through various tasks, games, and activities. Simple and easy way to start earning your first crypto.',
        link: 'https://t.me/example_bot'
    },
    site: {
        title: 'Earning Site',
        description: 'Web platforms that offer various ways to earn cryptocurrency including surveys, watching videos, completing tasks, and referral programs.',
        link: 'https://example-earning-site.com'
    },
    app: {
        title: 'Earning App',
        description: 'Mobile applications designed to help you earn cryptocurrency through gaming, completing tasks, watching ads, and participating in various activities.',
        link: 'https://example-app.com'
    }
};

function showPlatformInfo(platform) {
    // Haptic feedback
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    const modal = document.getElementById('platformModal');
    const data = platformData[platform];
    
    if (data) {
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDescription').textContent = data.description;
        document.getElementById('registerBtn').onclick = () => openLink(data.link);
        
        modal.classList.remove('hidden');
    }
}

function closeModal() {
    document.getElementById('platformModal').classList.add('hidden');
}

// Control Panel Functions
function initializeControlPanel() {
    const controlPanelBtn = document.getElementById('controlPanelBtn');
    const categorySelect = document.getElementById('projectCategory');
    const sectionSelect = document.getElementById('projectSection');
    
    controlPanelBtn.addEventListener('click', () => {
        document.getElementById('controlPanel').classList.remove('hidden');
        loadProjectsList();
    });
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTab + 'Tab').classList.add('active');
            
            // Load projects list when manage tab is opened
            if (targetTab === 'manage') {
                loadProjectsList();
            }
        });
    });
    
    categorySelect.addEventListener('change', function() {
        const category = this.value;
        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        sectionSelect.disabled = !category;
        
        if (category === 'wallets') {
            sectionSelect.innerHTML += `
                <option value="exchange">Exchange Platforms</option>
                <option value="ton">Ton Wallets</option>
                <option value="web3">Web3 Wallets</option>
            `;
        } else if (category === 'earn') {
            sectionSelect.innerHTML += `
                <option value="bots">Telegram Bots</option>
                <option value="sites">Sites</option>
                <option value="apps">Apps</option>
            `;
        }
        
        sectionSelect.disabled = false;
    });
}

function closeControlPanel() {
    document.getElementById('controlPanel').classList.add('hidden');
}

async function loadProjectsList() {
    const projectsList = document.getElementById('projectsList');
    
    try {
        // This would typically fetch from your backend API
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        if (data.projects && data.projects.length > 0) {
            projectsList.innerHTML = data.projects.map(project => `
                <div class="project-item" data-id="${project.id}">
                    <img src="${project.image_url}" alt="${project.name}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/15208/15208359.png'">
                    <div class="project-info">
                        <h4>${project.name}</h4>
                        <p>${project.category} - ${project.section}</p>
                    </div>
                    <div class="project-actions">
                        <button class="action-btn" onclick="editProject(${project.id})" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="action-btn delete" onclick="deleteProject(${project.id}, '${project.name}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            projectsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 16px; opacity: 0.5;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                    <p>No projects found</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--error-color);">
                <p>Error loading projects</p>
            </div>
        `;
    }
}

async function deleteProject(projectId, projectName) {
    // Haptic feedback for warning
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('heavy');
    }
    
    if (!confirm(`Are you sure you want to delete "${projectName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adminId: user?.id
            })
        });
        
        if (response.ok) {
            // Success haptic feedback
            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
            showToast('Project deleted successfully!');
            loadProjectsList(); // Reload the list
        } else {
            throw new Error('Failed to delete project');
        }
    } catch (error) {
        // Error haptic feedback
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
        console.error('Error deleting project:', error);
        showToast('Error deleting project. Please try again.');
    }
}

function editProject(projectId) {
    // Switch to projects tab and populate form with project data
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Activate projects tab
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector('[data-tab="projects"]').classList.add('active');
    document.getElementById('projectsTab').classList.add('active');
    
    // Here you would typically fetch the project data and populate the form
    showToast('Edit functionality will be implemented with backend integration');
}

async function sendNotification() {
    const message = document.getElementById('notificationText').value.trim();
    
    if (!message) {
        showToast('Please enter a notification message');
        return;
    }
    
    try {
        // This would typically send to your backend API
        const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                adminId: user?.id
            })
        });
        
        if (response.ok) {
            showToast('Notification sent successfully!');
            document.getElementById('notificationText').value = '';
        } else {
            throw new Error('Failed to send notification');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
        showToast('Error sending notification. Please try again.');
    }
}

async function addProject() {
    const category = document.getElementById('projectCategory').value;
    const section = document.getElementById('projectSection').value;
    const name = document.getElementById('projectName').value.trim();
    const image = document.getElementById('projectImage').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const link = document.getElementById('projectLink').value.trim();
    
    if (!category || !section || !name || !image || !description || !link) {
        showToast('Please fill in all fields');
        return;
    }
    
    try {
        // This would typically send to your backend API
        const response = await fetch('/api/add-project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category,
                section,
                name,
                image,
                description,
                link,
                adminId: user?.id
            })
        });
        
        if (response.ok) {
            showToast('Project added successfully!');
            // Clear form
            document.getElementById('projectCategory').value = '';
            document.getElementById('projectSection').value = '';
            document.getElementById('projectName').value = '';
            document.getElementById('projectImage').value = '';
            document.getElementById('projectDescription').value = '';
            document.getElementById('projectLink').value = '';
            document.getElementById('projectSection').disabled = true;
        } else {
            throw new Error('Failed to add project');
        }
    } catch (error) {
        console.error('Error adding project:', error);
        showToast('Error adding project. Please try again.');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('platformModal');
    const controlPanel = document.getElementById('controlPanel');
    
    if (event.target === modal) {
        closeModal();
    }
    
    if (event.target === controlPanel) {
        closeControlPanel();
    }
});

// Prevent body scroll when modal is open
function toggleBodyScroll(disable) {
    document.body.style.overflow = disable ? 'hidden' : 'auto';
}

// Update modal and control panel show/hide functions
const originalShowPlatformInfo = showPlatformInfo;
showPlatformInfo = function(platform) {
    originalShowPlatformInfo(platform);
    toggleBodyScroll(true);
};

const originalCloseModal = closeModal;
closeModal = function() {
    originalCloseModal();
    toggleBodyScroll(false);
};

// Add notification button functionality
document.getElementById('notificationBtn').addEventListener('click', function() {
    showNotifications();
});

// Add mark all as read functionality
document.addEventListener('DOMContentLoaded', function() {
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            const unreadNotifications = document.querySelectorAll('.notification-item.unread');
            unreadNotifications.forEach(notification => {
                notification.classList.remove('unread');
            });
            showToast('All notifications marked as read');
        });
    }
    
    // Add click handlers for individual notifications
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.remove('unread');
        });
    });
});

// Handle Telegram Web App events
if (tg) {
    tg.onEvent('themeChanged', function() {
        if (tg.colorScheme === 'dark' && !isDarkMode) {
            toggleDarkMode();
        } else if (tg.colorScheme === 'light' && isDarkMode) {
            toggleDarkMode();
        }
    });
    
    tg.onEvent('viewportChanged', function() {
        // Handle viewport changes if needed
        console.log('Viewport changed:', tg.viewportHeight);
    });
}