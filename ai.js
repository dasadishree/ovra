async function send() {
    const input = document.getElementById('msg');
    const display = document.getElementById('chat');
    const userText = input.value.trim();
    if(!userText) return;

    display.innerHTML += `<div class="user-bubble"><b>You:</b> ${userText}</div>`;
    input.value = '';
    input.disabled = true;

    // Show loading message
    const loadingId = 'loading-' + Date.now();
    display.innerHTML += `<div id="${loadingId}" class="ai-bubble"><b>AI:</b> Thinking...</div>`;
    display.scrollTop = display.scrollHeight;

    try {
        // Try Netlify function first
        let response;
        try {
            response = await fetch("/.netlify/functions/chat", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are a helpful expert in answering questions about women's menstrual health / reproduction specifically in a caring/comforting tone."},
                        { role: "user", content: userText }
                    ]
                }),
                credentials: 'omit'
            });
        } catch(netlifyError) {
            // If Netlify function fails, try direct API (for local development)
            throw new Error('NETLIFY_FUNCTION_FAILED');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            let errorMsg = errorData.error || `Server error: ${response.status} ${response.statusText}`;
            
            if (response.status === 405) {
                // Method not allowed - this means function isn't working
                throw new Error('FUNCTION_405_ERROR');
            } else if (response.status === 502 || response.status === 504) {
                // Gateway/timeout errors
                throw new Error('GATEWAY_ERROR');
            }
            
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        // Remove loading message
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        // check if error
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            display.innerHTML += `<div class="ai-bubble"><b>AI:</b> ${data.choices[0].message.content}</div>`;
        } else {
            display.innerHTML += `<div class="error-bubble"><b>Error:</b> Invalid response from AI. Response: ${JSON.stringify(data).substring(0, 100)}</div>`;
        }

    } catch(error) {
        // Remove loading message
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        let errorMessage = error.message || 'Could not reach AI.';
        
        // Specific error handling
        if (errorMessage === 'FUNCTION_NOT_DEPLOYED' || errorMessage === 'FUNCTION_405_ERROR' || errorMessage.includes('405') || errorMessage.includes('Method not allowed')) {
            errorMessage = 'AI chat function needs configuration. Please check:\n\n1. Function is deployed in Netlify\n2. API_KEY environment variable is set in Netlify\n3. Function is at: netlify/functions/chat.js\n\nFor now, please contact your healthcare provider or email us at contact@ovra.health';
        } else if (errorMessage === 'GATEWAY_ERROR' || errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
            errorMessage = 'The AI service is temporarily unavailable. This could mean:\n\n• The API is slow or down\n• Your API_KEY might be invalid\n• The function timed out\n\nPlease try again in a moment or contact support.';
        } else if (errorMessage.includes('504') || errorMessage.includes('Gateway Timeout')) {
            errorMessage = 'The request timed out. Please try again with a shorter question.';
        } else if (errorMessage.includes('API_KEY') || errorMessage.includes('MISSING_API_KEY')) {
            errorMessage = 'API key is missing. Please set API_KEY in Netlify environment variables.';
        } else if (errorMessage.includes('404')) {
            errorMessage = 'Function not found. Make sure the function is deployed at netlify/functions/chat.js';
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (errorMessage.includes('timeout')) {
            errorMessage = 'The request took too long. Please try again with a shorter question.';
        }
        
        display.innerHTML += `<div class="error-bubble"><b>Error:</b> ${errorMessage}</div>`;
    } finally {
        input.disabled = false;
        display.scrollTop = display.scrollHeight;
    }
}