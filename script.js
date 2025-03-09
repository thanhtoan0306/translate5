// API key của Gemini
const API_KEY = 'AIzaSyDOagEi9Dd_8va8hRpOvqqMvJNppvpvpw8';

document.getElementById('translateBtn').addEventListener('click', async () => {
    const sourceText = document.getElementById('sourceText').value;
    
    if (!sourceText) {
        alert('Vui lòng nhập văn bản tiếng Việt cần dịch!');
        return;
    }

    try {
        document.getElementById('translateBtn').disabled = true;
        document.getElementById('translateBtn').textContent = 'Đang dịch...';

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a professional translator. Translate this Vietnamese text to English. Only return the translated text without any additional explanation or context: ${sourceText}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            document.getElementById('translatedText').value = data.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Không nhận được kết quả dịch');
        }
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
        console.error('Error:', error);
    } finally {
        document.getElementById('translateBtn').disabled = false;
        document.getElementById('translateBtn').textContent = 'Dịch sang tiếng Anh';
    }
}); 