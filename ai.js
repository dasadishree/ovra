async function send() {
    const input = document.getElementById('msg');
    const display = document.getElementById('chat');
    const userText = input.value;
    if(!userText) return;

    display.innerHTML += `<div class="user-bubble"><b>You:</b> ${userText}</div>`;
    input.value = '';

    try{
        const response = await fetch("/chat", {
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
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            display.innerHTML += `<div class="ai-bubble"><b>AI:</b> ${data.choices[0].message.content}</div>`;
        } else {
            display.innerHTML += `<div class="error-bubble"><b>Error:</b> Invalid response from AI.</div>`;
        }

    } catch(error) {
        console.error('AI Error:', error);
        let errorMessage = 'Could not reach AI. ';
        if (error.message.includes('404')) {
            errorMessage += 'The server endpoint was not found. Please make sure the server is deployed and running.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Unable to connect to the server.';
        } else {
            errorMessage += error.message;
        }
        display.innerHTML += `<div class="error-bubble"><b>Error:</b> ${errorMessage}</div>`;
    }
}