async function send() {
    const input = document.getElementById('msg');
    const display = document.getElementById('chat');
    const userText = input.value;
    if(!userText) return;

    display.innerHTML += `<p><b>You:</b> ${userText}</p>`;
    input.value = '';

    try{
        const response = await fetch("http://localhost:3000/chat", {
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
            display.innerHTML += `<p><b>AI:</b> ${data.choices[0].message.content}</p>`;
        } else {
            display.innerHTML += `<p style="color:red"><b>Error:</b> Invalid response from AI.</p>`;
        }

    } catch(error) {
        console.error(error);
        display.innerHTML += `<p style="color:red"><b>Error:</b> Could not reach AI.</p>`;
    }
}