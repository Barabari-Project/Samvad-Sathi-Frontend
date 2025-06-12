// Theme management
document.addEventListener('DOMContentLoaded', function() {
    setupThemeToggle();
    setupEventListeners();
});

// Setup theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set the initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
    }
    
    // Handle toggle change
    themeToggle.addEventListener('change', function(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
    });
}

// Form state
let formData = {
    position: '',
    description: '',
    questions: 1,
    resume: null
};    // Store fetched questions
let generatedQuestions = [];

// API configuration
const API_ENDPOINTS = {
    proxy: 'https://ai.backend.barabaricollective.org/extract-resume-and-gen-questions',
    primary: 'https://ai.backend.barabaricollective.org/extract-resume-and-gen-questions',
    fallback: 'https://api-fallback.barabaricollective.org/extract-resume-and-gen-questions'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('applicationForm');
    if (form) {
    form.addEventListener('submit', handleSubmit);
    }
    
    // Position input
    const positionInput = document.getElementById('position');
    if (positionInput) {
    positionInput.addEventListener('input', function(e) {
        formData.position = e.target.value;
        
        if (formData.position.trim()) {
        document.getElementById('positionError').style.display = 'none';
        this.classList.remove('error');
        }
    });
    }
    
    // Description input
    const descriptionInput = document.getElementById('description');
    if (descriptionInput) {
    descriptionInput.addEventListener('input', function(e) {
        formData.description = e.target.value;
    });
    }
    
    // Questions input
    const questionsInput = document.getElementById('questions');
    if (questionsInput) {
    questionsInput.addEventListener('input', function(e) {
        const value = parseInt(e.target.value, 10);
        formData.questions = value;
        
        if (value >= 1 && value <= 10) {
        document.getElementById('questionsError').style.display = 'none';
        this.classList.remove('error');
        }
    });
    }
    
    // PDF upload
    setupPdfUpload();
}

// PDF Upload functionality
function setupPdfUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('resumeUpload');
    const removeFileBtn = document.getElementById('removeFileBtn');
    
    if (!uploadArea || !fileInput || !removeFileBtn) return;
    
    // Click event
    uploadArea.addEventListener('click', function() {
    fileInput.click();
    });
    
    // Change event
    fileInput.addEventListener('change', function(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        const error = validateFile(selectedFile);
        if (error) {
        showError('resumeError', error);
        uploadArea.classList.add('error');
        } else {
        handleFileSelect(selectedFile);
        document.getElementById('resumeError').style.display = 'none';
        uploadArea.classList.remove('error');
        }
    }
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    });
    
    uploadArea.addEventListener('dragenter', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add('dragging');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragging');
    });
    
    uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragging');
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
        const error = validateFile(droppedFile);
        if (error) {
        showError('resumeError', error);
        this.classList.add('error');
        } else {
        handleFileSelect(droppedFile);
        document.getElementById('resumeError').style.display = 'none';
        this.classList.remove('error');
        }
    }
    });
    
    // Remove file button
    removeFileBtn.addEventListener('click', function() {
    handleRemoveFile();
    });
}

// Validate PDF file
function validateFile(file) {
    if (file.type !== 'application/pdf') {
    return 'Please upload a PDF file only.';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return 'File size must be less than 10MB.';
    }
    return null;
}

// Handle file select
function handleFileSelect(file) {
    formData.resume = file;
    
    // Update UI to show file preview
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('filePreviewArea').style.display = 'block';
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
}

// Handle file removal
function handleRemoveFile() {
    formData.resume = null;
    document.getElementById('resumeUpload').value = '';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('filePreviewArea').style.display = 'none';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) {
    return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
    } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

// Form validation
function validateForm() {
    let isValid = true;
    
    // Position validation
    if (!formData.position.trim()) {
    showError('positionError', 'Job position is required.');
    document.getElementById('position').classList.add('error');
    isValid = false;
    }
    
    // Questions validation
    if (!formData.questions || formData.questions < 1 || formData.questions > 10) {
    showError('questionsError', 'Number of questions must be between 1 and 10.');
    document.getElementById('questions').classList.add('error');
    isValid = false;
    }
    
    // Resume validation
    if (!formData.resume) {
    showError('resumeError', 'Resume upload is required.');
    document.getElementById('uploadArea').classList.add('error');
    isValid = false;
    }
    
    return isValid;
}
    // Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
    const spanElement = errorElement.querySelector('span');
    if (spanElement) {
        spanElement.textContent = message;
    } else {
        // For error elements without a span (like resumeError)
        errorElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="8" y2="12"></line>
            <line x1="12" x2="12.01" y1="16" y2="16"></line>
        </svg>
        ${message}
        `;
    }
    errorElement.style.display = 'flex';
    }
}
    // Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
    return;
    }
    
    // Show loading state
    const submitButton = document.getElementById('submitButton');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner"></span>Submitting...';
    submitButton.disabled = true;
    
    // Clear previous errors
    document.getElementById('apiError').style.display = 'none';
    
    try {
    // Prepare form data for API submission
    const apiFormData = new FormData();
    apiFormData.append('file', formData.resume);
    apiFormData.append('target_job', formData.position);
    apiFormData.append('number_of_ques', formData.questions);
    apiFormData.append('job_description', formData.description || '');
    
    // Try each endpoint until one succeeds
    const endpoints = [
        { name: 'Proxy Server', url: API_ENDPOINTS.proxy },
        { name: 'Primary API', url: API_ENDPOINTS.primary },
        { name: 'Fallback API', url: API_ENDPOINTS.fallback }
    ];
    
    let response = null;
    let lastError = null;
    let result = null;
    
    for (const endpoint of endpoints) {
        try {
        console.log(`Trying ${endpoint.name}: ${endpoint.url}`);
        
        // Make the API request
        response = await fetch(endpoint.url, {
            method: 'POST',
            body: apiFormData
        });
        
        if (response.ok) {
            console.log(`${endpoint.name} succeeded!`);
            result = await response.json();
            break; // Exit the loop if request is successful
        } else {
            throw new Error(`Status: ${response.status}`);
        }
        } catch (error) {
        console.error(`${endpoint.name} failed:`, error);
        lastError = error;
        response = null; // Reset response for next attempt
        }
    }
    
    // If all endpoints failed
    if (!response || !result) {
        throw new Error(`All API endpoints failed. Please check your network connection.`);
    }
    
    // Process the response to extract questions
    if (result.questions && Array.isArray(result.questions)) {
        // Standard format: { questions: [ ... ] }
        generatedQuestions = result.questions;
    } else if (result.data && result.data.questions && Array.isArray(result.data.questions)) {
        // Nested format: { data: { questions: [ ... ] } }
        generatedQuestions = result.data.questions;
    } else if (Array.isArray(result)) {
        // Direct array format: [ ... ]
        generatedQuestions = result;
    } else {
        // Try to find any array in the result that might be questions
        const possibleQuestions = Object.values(result).find(val => 
        Array.isArray(val) && val.length > 0
        );
        
        if (possibleQuestions) {
        generatedQuestions = possibleQuestions;
        } else {
        throw new Error('Failed to parse questions from API response');
        }
    }
    
    // Format questions if needed
    generatedQuestions = generatedQuestions.map(question => {
        // If it's already a string, format it
        if (typeof question === 'string') {
        return { category: 'General Questions', question: question };
        }
        // If it's an object with a question property, use that structure
        else if (question && typeof question === 'object' && question.question) {
        return question;
        }
        // Fallback for unknown formats - convert to string
        return { category: 'General Questions', question: String(question) };
    });
    
    // Show success message
    showSuccessMessage(true);
    
    // Display questions
    displayQuestions(generatedQuestions);
    
    // Reset form        resetForm();
    
    } catch (error) {
    // Show error message
    document.getElementById('apiError').style.display = 'block';
    document.getElementById('apiErrorMessage').textContent = `Submission failed: ${error.message}. Please try again.`;
    } finally {
    // Restore submit button
    submitButton.innerHTML = originalButtonText;
    submitButton.disabled = false;
    }
}

// Show a temporary success message
function showSuccessMessage(hasQuestions = false) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'success-toast';
    messageContainer.innerHTML = `
    <div class="success-toast-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    </div>
    <div class="success-toast-content">
        ${hasQuestions ? 'Questions generated successfully!' : 'Application submitted successfully!'}
    </div>
    `;
    
    document.body.appendChild(messageContainer);
    
    // Fade in
    setTimeout(() => {
    messageContainer.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
    messageContainer.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(messageContainer);
    }, 500);
    }, 3000);
}

// Display the questions received from the API
function displayQuestions(questions) {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return;
    }
    
    // Create a modal to display the questions
    const modalContainer = document.createElement('div');
    modalContainer.className = 'questions-modal';
    
    // Group questions by category for better display
    const questionsByCategory = {};
    
    questions.forEach(q => {
    // Handle both string questions and object questions
    const category = q.category || 'General Questions';
    const questionText = typeof q === 'string' ? q : q.question;
    
    if (!questionsByCategory[category]) {
        questionsByCategory[category] = [];
    }
    questionsByCategory[category].push(questionText);
    });
    
    // Create HTML for all questions, organized by category
    let questionsHtml = '';
    
    Object.entries(questionsByCategory).forEach(([category, categoryQuestions], index) => {
    const showCategoryHeader = Object.keys(questionsByCategory).length > 1 || category !== 'General Questions';
    
    questionsHtml += showCategoryHeader ? `
        <div class="question-category">
        <h3>${category}</h3>
        </div>
    ` : '';
    
    questionsHtml += `
        <ol class="questions-list" ${index > 0 ? 'start="' + (index * categoryQuestions.length + 1) + '"' : ''}>
        ${categoryQuestions.map(q => `<li>${q}</li>`).join('')}
        </ol>
    `;
    });
    
    const modalContent = `
    <div class="questions-modal-content">
        <div class="questions-modal-header">
        <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <path d="M12 17h.01"></path>
            </svg>
            ${questions.length} Generated Questions
        </h2>
        <button class="questions-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="questions-modal-body">
        <div style="margin-bottom: 1rem; font-style: italic; color: var(--color-text-light); font-size: 0.875rem;">
            Questions for: <strong>${formData.position || 'Job Position'}</strong>
            ${formData.description ? ` • Based on provided job description` : ''}
        </div>
        ${questionsHtml}
        </div>
        <div class="questions-modal-footer">
        <button class="copy-btn" id="copyQuestionsBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy All Questions
        </button>
        <button class="btn btn-primary questions-modal-close-btn">Close</button>
        </div>
    </div>
    `;
    
    modalContainer.innerHTML = modalContent;
    document.body.appendChild(modalContainer);
    
    // Show modal with animation
    setTimeout(() => {
    modalContainer.classList.add('visible');
    }, 10);
    
    // Add event listeners to close the modal
    const closeModal = () => {
    modalContainer.classList.remove('visible');
    setTimeout(() => {
        document.body.removeChild(modalContainer);
    }, 300);
    };
    
    const closeButton = modalContainer.querySelector('.questions-modal-close');
    const closeButtonBottom = modalContainer.querySelector('.questions-modal-close-btn');
    closeButton.addEventListener('click', closeModal);
    closeButtonBottom.addEventListener('click', closeModal);
    
    // Close when clicking outside the modal content
    modalContainer.addEventListener('click', e => {
    if (e.target === modalContainer) {
        closeModal();
    }
    });
    
    // Close on ESC key
    window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.contains(modalContainer)) {
        closeModal();
    }
    });
    
    // Add copy functionality for the Copy All Questions button
    const copyButton = modalContainer.querySelector('#copyQuestionsBtn');
    if (copyButton) {
    copyButton.addEventListener('click', () => {
        // Create a formatted text of all questions
        const allQuestions = questions.map((q, index) => {
        const questionText = typeof q === 'string' ? q : q.question;
        const categoryText = q.category ? `[${q.category}] ` : '';
        return `${index + 1}. ${categoryText}${questionText}`;
        }).join('\n\n');
        
        // Copy to clipboard
        navigator.clipboard.writeText(allQuestions)
        .then(() => {
            // Show success feedback
            copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Copied to Clipboard!
            `;
            copyButton.style.backgroundColor = '#10b981';
            copyButton.style.borderColor = '#059669';
            copyButton.style.color = 'white';
            
            // Reset button after 2 seconds
            setTimeout(() => {
            copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy All Questions
            `;
            copyButton.style.backgroundColor = '';
            copyButton.style.borderColor = '';
            copyButton.style.color = '';
            }, 2000);
        })
        .catch(err => {
            copyButton.textContent = 'Copy failed';
            copyButton.style.backgroundColor = '#ef4444';
        });
    });
    }
}

// Reset form
function resetForm() {
    // Reset form data
    formData = {
    position: '',
    description: '',
    questions: 1,
    resume: null
    };
    
    // Reset form fields
    document.getElementById('position').value = '';
    document.getElementById('description').value = '';
    document.getElementById('questions').value = '1';
    
    // Reset file upload
    handleRemoveFile();
    
    // Hide all errors
    document.querySelectorAll('.error-message').forEach(el => {
    el.style.display = 'none';
    });
    
    document.querySelectorAll('.form-control.error').forEach(el => {
    el.classList.remove('error');
    });
    
    document.getElementById('uploadArea').classList.remove('error');
    document.getElementById('apiError').style.display = 'none';
}
