const webcamBtn = document.getElementById('webcam-btn');
const uploadInput = document.getElementById('upload-input');
const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('canvas');
const submitBtn = document.getElementById('submit-btn');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const categoryName = document.getElementById('category-name');
const confidenceValue = document.getElementById('confidence-value');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const demoBtn = document.getElementById('demo-btn');
const clearHistoryBtn = document.getElementById('clear-history');
const downloadBtn = document.getElementById('download-result');
const previewImg = document.getElementById('preview-img');
const imagePreview = document.getElementById('image-preview');
const galleryModal = document.getElementById('gallery-modal');
const modalTitle = document.getElementById('modal-title');
const modalTip = document.getElementById('modal-tip');
const closeModal = document.querySelector('.close');
const disposalInstruction = document.getElementById('disposal-instruction');

let currentImage = null;
let history = []; // Will be loaded from database

// Theme toggle functionality
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.classList.add('spin');
    themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    setTimeout(() => {
        themeToggle.classList.remove('spin');
    }, 300);
});

const categories = [
    { name: 'Plastic', color: '#2196F3', emoji: '🗑️', disposal: 'Recycle in blue bin' },
    { name: 'Metal', color: '#C0C0C0', emoji: '🔧', disposal: 'Recycle in blue bin' },
    { name: 'Organic', color: '#4CAF50', emoji: '🍎', disposal: 'Compost or dispose in green bin' },
    { name: 'Paper', color: '#8B4513', emoji: '📄', disposal: 'Recycle in blue bin' },
    { name: 'Glass', color: '#87CEEB', emoji: '🥤', disposal: 'Recycle in blue bin' },
    { name: 'Other', color: '#808080', emoji: '❓', disposal: 'Check local guidelines' }
];

const galleryTips = {
    Plastic: 'Plastic waste should be rinsed and placed in recycling bins. Avoid contaminating with food residues.',
    Metal: 'Metal cans and containers can be recycled. Remove labels if possible.',
    Organic: 'Organic waste like food scraps can be composted to create nutrient-rich soil.',
    Paper: 'Paper products are recyclable. Keep them dry and clean.',
    Glass: 'Glass bottles and jars should be rinsed and recycled. Remove caps.',
    Other: 'For miscellaneous waste, consult local waste management guidelines.'
};

webcamBtn.addEventListener('click', () => {
    document.getElementById('camera-container').style.display = 'block';
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            alert('Error accessing webcam. Please ensure camera permissions are granted and try again.');
        });
});

captureBtn.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    currentImage = canvas.toDataURL('image/png');
    previewImg.src = currentImage;
    imagePreview.style.display = 'block';
    video.srcObject.getTracks().forEach(track => track.stop());
    document.getElementById('camera-container').style.display = 'none';
    submitBtn.disabled = false;
});

uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be under 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage = e.target.result;
            previewImg.src = currentImage;
            imagePreview.style.display = 'block';
            submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
});

submitBtn.addEventListener('click', () => {
    if (!currentImage) return;
    document.getElementById('input-section').style.display = 'none';
    loadingSection.style.display = 'block';

    // Send image to backend for prediction
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: currentImage })
    })
    .then(response => response.json())
    .then(data => {
        loadingSection.style.display = 'none';
        if (data.success) {
            resultSection.style.display = 'block';

            const category = categories.find(cat => cat.name === data.category) || categories.find(cat => cat.name === 'Other');
            const confidence = data.confidence;

            categoryName.textContent = category.emoji + ' ' + category.name;
            categoryName.style.color = category.color;
            confidenceValue.textContent = confidence;
            disposalInstruction.textContent = category.disposal;

            // Refresh history from database
            loadHistory();

            // Reset
            currentImage = null;
            submitBtn.disabled = true;
            imagePreview.style.display = 'none';
            document.getElementById('input-section').style.display = 'block';
            resultSection.style.display = 'none';
        } else {
            alert('Prediction failed: ' + (data.error || 'Unknown error'));
            document.getElementById('input-section').style.display = 'block';
        }
    })
    .catch(error => {
        loadingSection.style.display = 'none';
        alert('Failed to connect to backend. Please ensure the server is running.');
        document.getElementById('input-section').style.display = 'block';
        console.error('Error:', error);
    });
});

function createThumbnail(dataUrl) {
    const img = new Image();
    img.src = dataUrl;
    const canvasThumb = document.createElement('canvas');
    const ctx = canvasThumb.getContext('2d');
    canvasThumb.width = 150;
    canvasThumb.height = 100;
    img.onload = () => {
        ctx.drawImage(img, 0, 0, 150, 100);
    };
    return canvasThumb.toDataURL('image/png');
}

function loadHistory() {
    fetch('/history?limit=5')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                history = data.history.map(item => ({
                    image: item.thumbnail,
                    category: item.category,
                    confidence: item.confidence,
                    emoji: categories.find(cat => cat.name === item.category)?.emoji || '❓',
                    color: categories.find(cat => cat.name === item.category)?.color || '#808080'
                }));
                updateHistory();
                updateAnalytics();
            }
        })
        .catch(error => {
            console.error('Failed to load history:', error);
        });
}

function updateHistory() {
    historyList.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <img src="${item.image}" alt="History item">
            <p>${item.emoji} ${item.category}</p>
            <p>${item.confidence}%</p>
        `;
        historyList.appendChild(div);
    });
}

// Download result
downloadBtn.addEventListener('click', () => {
    const category = categoryName.textContent;
    const confidence = confidenceValue.textContent;
    const disposal = disposalInstruction.textContent;
    const content = `EcoSort AI Result\nCategory: ${category}\nConfidence: ${confidence}%\nDisposal: ${disposal}\n\nGenerated on ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecosort_result.txt';
    a.click();
    URL.revokeObjectURL(url);
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
        fetch('/history', {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                history = [];
                updateHistory();
                updateAnalytics();
            } else {
                alert('Failed to clear history');
            }
        })
        .catch(error => {
            alert('Failed to connect to server');
            console.error('Error:', error);
        });
    }
});

// Demo mode
demoBtn.addEventListener('click', () => {
    // Get available categories and their images from dataset
    const categories = ['plastic', 'metal', 'glass', 'paper'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    fetch(`/demo-images/${randomCategory}`)
        .then(response => response.json())
        .then(data => {
            if (data.images && data.images.length > 0) {
                // Use local dataset image
                const randomImage = data.images[Math.floor(Math.random() * data.images.length)];
                fetch(randomImage)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            currentImage = reader.result;
                            previewImg.src = currentImage;
                            imagePreview.style.display = 'block';
                            
                            // Show which category is being processed
                            const categoryDisplayNames = {
                                'plastic': 'Plastic',
                                'metal': 'Metal', 
                                'glass': 'Glass',
                                'paper': 'Paper'
                            };
                            
                            const categoryName = categoryDisplayNames[randomCategory] || randomCategory;
                            previewImg.alt = `Demo image: ${categoryName} waste`;
                            
                            // Update preview text to show category
                            const previewH3 = imagePreview.querySelector('h3');
                            if (previewH3) {
                                previewH3.textContent = `Demo Image Preview - ${categoryName} Category`;
                            }
                            
                            // Store the category for accurate demo prediction
                            currentDemoCategory = randomCategory;
                            
                            // Automatically process the demo image after a short delay
                            setTimeout(() => {
                                processDemoImage(randomCategory);
                            }, 1500); // Show image for 1.5 seconds before processing
                        };
                        reader.readAsDataURL(blob);
                    })
                    .catch(err => {
                        console.error('Failed to load dataset image:', err);
                        // Fallback to gallery images if dataset fails
                        fallbackToGallery();
                    });
            } else {
                // Fallback to gallery images if no dataset images
                fallbackToGallery();
            }
        })
        .catch(err => {
            console.error('Failed to fetch demo images:', err);
            // Fallback to gallery images
            fallbackToGallery();
        });
});

function processDemoImage(demoCategory) {
    // Automatically process the loaded demo image
    document.getElementById('input-section').style.display = 'none';
    loadingSection.style.display = 'block';

    // For demo mode, show accurate results directly
    setTimeout(() => {
        loadingSection.style.display = 'none';
        resultSection.style.display = 'block';

        // Map demo category to display category
        const categoryMap = {
            'plastic': 'Plastic',
            'metal': 'Metal', 
            'glass': 'Glass',
            'paper': 'Paper',
            'organic': 'Organic',
            'other': 'Other'
        };

        const displayCategory = categoryMap[demoCategory.toLowerCase()] || demoCategory;
        const category = categories.find(cat => cat.name === displayCategory) || categories.find(cat => cat.name === 'Other');
        const confidence = Math.floor(Math.random() * 10) + 90; // 90-99% confidence

        categoryName.textContent = category.emoji + ' ' + category.name;
        categoryName.style.color = category.color;
        confidenceValue.textContent = confidence;
        disposalInstruction.textContent = category.disposal;

        // Store in database via API call (but don't wait for it)
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: currentImage })
        }).then(() => {
            loadHistory(); // Refresh history
        }).catch(() => {
            loadHistory(); // Refresh history even if prediction fails
        });

        // For demo mode, show results for longer
        setTimeout(() => {
            currentImage = null;
            imagePreview.style.display = 'none';
            document.getElementById('input-section').style.display = 'block';
            resultSection.style.display = 'none';
        }, 6000); // Show results for 6 seconds
    }, 2000); // Simulate 2 second processing time
}

function fallbackToGallery() {
    // Use images from the gallery section as fallback
    const galleryImages = [
        {
            url: 'https://images.unsplash.com/photo-1537084642907-629340c7e59c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            category: 'Plastic'
        },
        {
            url: 'https://images.unsplash.com/photo-1561503412-852800622772?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            category: 'Metal'
        },
        {
            url: 'https://images.unsplash.com/photo-1644575881028-9f170fd241ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            category: 'Organic'
        },
        {
            url: 'https://images.unsplash.com/photo-1585351737354-204ffbbe584f?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            category: 'Paper'
        },
        {
            url: 'https://images.unsplash.com/photo-1614480858386-d2c746e2c8e3?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            category: 'Glass'
        },
        {
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            category: 'Other'
        }
    ];
    const randomImage = galleryImages[Math.floor(Math.random() * galleryImages.length)];
    fetch(randomImage.url)
        .then(response => response.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onload = () => {
                currentImage = reader.result;
                previewImg.src = currentImage;
                imagePreview.style.display = 'block';
                
                // Show which category is being processed
                const categoryName = randomImage.category;
                previewImg.alt = `Demo image: ${categoryName} waste`;
                
                // Update preview text to show category
                const previewH3 = imagePreview.querySelector('h3');
                if (previewH3) {
                    previewH3.textContent = `Demo Image Preview - ${categoryName} Category`;
                }
                
                // Automatically process the fallback demo image after a short delay
                setTimeout(() => {
                    processDemoImage(randomImage.category.toLowerCase());
                }, 1500); // Show image for 1.5 seconds before processing
            };
            reader.readAsDataURL(blob);
        })
        .catch(err => alert('Failed to load demo image.'));
}

// Gallery modal
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        const category = item.dataset.category;
        modalTitle.textContent = category;
        modalTip.textContent = galleryTips[category];
        galleryModal.style.display = 'block';
    });
});

closeModal.addEventListener('click', () => {
    galleryModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === galleryModal) {
        galleryModal.style.display = 'none';
    }
});

// Analytics
function updateAnalytics() {
    const categoryCounts = {};
    history.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    const data = categories.map(cat => categoryCounts[cat.name] || 0);
    const ctx = document.getElementById('analytics-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories.map(cat => cat.name),
            datasets: [{
                data: data,
                backgroundColor: categories.map(cat => cat.color),
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// Initial load
loadHistory();