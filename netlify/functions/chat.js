const axios = require('axios');

exports.handler = async (event, context) => {
    // Handle CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Check if API_KEY is set
        if (!process.env.API_KEY) {
            console.error('API_KEY environment variable is not set');
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'API_KEY environment variable is not configured. Please set it in Netlify site settings.',
                    code: 'MISSING_API_KEY'
                })
            };
        }

        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        const { messages } = requestBody;

        if (!messages || !Array.isArray(messages)) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Invalid request: messages array required' })
            };
        }

        const response = await axios.post(
            "https://ai.hackclub.com/proxy/v1/chat/completions",
            {
                model: "qwen/qwen-2.5-72b",
                messages: messages
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.API_KEY}`
                },
                timeout: 30000 // 30 second timeout
            }
        );

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        console.error('Chat error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });

        let errorMessage = error.message || 'Internal server error';
        let statusCode = 500;

        if (error.response) {
            // API returned an error response
            statusCode = error.response.status || 500;
            errorMessage = error.response.data?.error?.message || error.response.data?.error || errorMessage;
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = 'No response from AI service. Please check your API key and network connection.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. The AI service took too long to respond.';
        }

        return {
            statusCode: statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: errorMessage,
                code: error.code || 'UNKNOWN_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
