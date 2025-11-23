// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('submit-form');
const messageContainer = document.getElementById('message-container');
const descriptionField = document.getElementById('description');
const charCount = document.getElementById('char-count');

// Character counter
if (descriptionField && charCount) {
    descriptionField.addEventListener('input', () => {
        charCount.textContent = descriptionField.value.length;
    });
}

// Sanitize input - prevent XSS
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Show message
function showMessage(message, type) {
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Generate submission ID
function generateSubmissionId() {
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    const hexString = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    return `submission_${hexString}`;
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Submitting...';
    
    // Clear any previous messages
    messageContainer.innerHTML = '';
    
    try {
        // Get form data and sanitize
        const formData = new FormData(form);
        const submissionId = generateSubmissionId();
        
        const data = {
            submission_id: submissionId,
            stall_name: sanitizeInput(formData.get('stall_name').trim()),
            description: sanitizeInput(formData.get('description').trim()),
            products: sanitizeInput(formData.get('products')?.trim() || ''),
            markets: sanitizeInput(formData.get('markets')?.trim() || ''),
            website: sanitizeInput(formData.get('website')?.trim() || ''),
            instagram: sanitizeInput(formData.get('instagram')?.trim() || ''),
            is_stall_owner: formData.get('is_stall_owner'),
            submitter_email: sanitizeInput(formData.get('submitter_email')?.trim() || ''),
            status: 'pending'
        };

        // Clean up Instagram handle
        if (data.instagram && !data.instagram.startsWith('@')) {
            data.instagram = '@' + data.instagram;
        }

        // Insert into Supabase
        const { error } = await supabase
            .from('stall_submissions')
            .insert(data);
        
        if (error) throw error;

        // Success! Show submission ID
        showMessage(
            `Thank you! Your submission has been received.<br>
            <strong>Submission ID: ${submissionId}</strong><br>
            <small>Save this ID for reference. Your submission will be reviewed soon.</small>`, 
            'success'
        );
        form.reset();
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = originalBtnText;
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showMessage('Sorry, there was an error submitting your form. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = originalBtnText;
    }
});
