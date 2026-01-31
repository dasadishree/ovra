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
                // Method not allowed - check what method was received
                errorMsg = `Method not allowed. Received: ${errorData.received || 'unknown'}. Expected: POST. ${errorData.error || ''}`;
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
        if (errorMessage === 'FUNCTION_NOT_DEPLOYED' || errorMessage.includes('405') || errorMessage.includes('Method not allowed')) {
            errorMessage = 'AI chat is currently unavailable. The service needs to be configured on Netlify.\n\nFor menstrual health questions, please:\n• Contact your healthcare provider for medical advice\n• Email us at contact@ovra.health\n• Visit our resources section';
        } else if (errorMessage.includes('API_KEY')) {
            errorMessage = 'Server configuration error: API key is missing. Please contact the site administrator.';
        } else if (errorMessage.includes('404')) {
            errorMessage = 'The server endpoint was not found. Please make sure the server is deployed and running.';
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (errorMessage.includes('timeout')) {
            errorMessage = 'The request took too long. Please try again.';
        }
        
        display.innerHTML += `<div class="error-bubble"><b>Error:</b> ${errorMessage}</div>`;
    } finally {
        input.disabled = false;
        display.scrollTop = display.scrollHeight;
    }
}