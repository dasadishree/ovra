async function send() {
    const input = document.getElementById('msg');
    const display = document.getElementById('chat');
    const userText = input.value;
    if(!userText) return;

    display.innerHTML += `<div class="user-bubble"><b>You:</b> ${userText}</div>`;
    input.value = '';

    try{
        const response = await fetch("/.netlify/functions/chat", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a helpful expert in answering questions about women's menstrual health / reproduction specifically."},
                    { role: "user", content: userText }
                ]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || `Server error: ${response.status} ${response.statusText}`;
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        // Check if the response contains an error
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            display.innerHTML += `<div class="ai-bubble"><b>AI:</b> ${data.choices[0].message.content}</div>`;
        } else {
            display.innerHTML += `<div class="error-bubble"><b>Error:</b> Invalid response from AI. Response: ${JSON.stringify(data).substring(0, 100)}</div>`;
        }

    } catch(error) {
        console.error('AI Error:', error);
        let errorMessage = error.message || 'Could not reach AI.';
        
        // Provide helpful messages for common errors
        if (errorMessage.includes('API_KEY')) {
            errorMessage = 'Server configuration error: API key is missing. Please contact the site administrator.';
        } else if (errorMessage.includes('404')) {
            errorMessage = 'The server endpoint was not found. Please make sure the server is deployed and running.';
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (errorMessage.includes('timeout')) {
            errorMessage = 'The request took too long. Please try again.';
        }
        
        display.innerHTML += `<div class="error-bubble"><b>Error:</b> ${errorMessage}</div>`;
    }
}