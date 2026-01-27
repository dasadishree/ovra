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
        
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            display.innerHTML += `<div class="ai-bubble"><b>AI:</b> ${data.choices[0].message.content}</div>`;
        } else {
            display.innerHTML += `<div class="error-bubble"><b>Error:</b> Invalid response from AI.</div>`;
        }

    } catch(error) {
        console.error(error);
        display.innerHTML += `<div class="error-bubble"><b>Error:</b> Could not reach AI.</div>`;
    }
}