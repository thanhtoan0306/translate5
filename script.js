// API key của Gemini
const API_KEY = 'AIzaSyDOagEi9Dd_8va8hRpOvqqMvJNppvpvpw8';

// Cập nhật số ký tự đã nhập
document.getElementById('sourceText').addEventListener('input', function(e) {
    const charCount = e.target.value.length;
    document.getElementById('charCount').textContent = `${charCount}/300 ký tự`;
});

const levelInstructions = {
    beginner: "Translate this Vietnamese text to very simple English, using basic vocabulary and short, simple sentences suitable for beginners. Avoid complex words and structures.",
    elementary: "Translate this Vietnamese text to simple English with basic vocabulary and simple sentence structures, slightly more advanced than beginner level.",
    intermediate: "Translate this Vietnamese text to standard English with moderate vocabulary and mixed sentence structures.",
    upperIntermediate: "Translate this Vietnamese text to more sophisticated English, using varied vocabulary and complex sentences where appropriate.",
    advanced: "Translate this Vietnamese text to advanced English, using rich vocabulary, idiomatic expressions, and sophisticated sentence structures."
};

async function translateText(text, level) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + API_KEY, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `You are a professional translator. ${levelInstructions[level]} Only return the translated text without any additional explanation or context: ${text}`
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
        return data.candidates[0].content.parts[0].text.trim();
    }
    throw new Error('Không nhận được kết quả dịch');
}

document.getElementById('translateBtn').addEventListener('click', async () => {
    const sourceText = document.getElementById('sourceText').value;
    const translateBtn = document.getElementById('translateBtn');
    
    if (!sourceText) {
        alert('Vui lòng nhập văn bản tiếng Việt cần dịch!');
        return;
    }

    try {
        translateBtn.disabled = true;

        // Reset all translation results
        document.querySelectorAll('.translation-result').forEach(el => {
            el.textContent = 'Đang dịch...';
        });

        // Dịch song song tất cả các cấp độ
        const translations = await Promise.all([
            translateText(sourceText, 'beginner').then(text => ({ id: 'beginnerText', text })),
            translateText(sourceText, 'elementary').then(text => ({ id: 'elementaryText', text })),
            translateText(sourceText, 'intermediate').then(text => ({ id: 'intermediateText', text })),
            translateText(sourceText, 'upperIntermediate').then(text => ({ id: 'upperIntermediateText', text })),
            translateText(sourceText, 'advanced').then(text => ({ id: 'advancedText', text }))
        ]);

        // Hiển thị kết quả
        translations.forEach(({ id, text }) => {
            document.getElementById(id).textContent = text;
        });
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
        console.error('Error:', error);
        // Reset error messages
        document.querySelectorAll('.translation-result').forEach(el => {
            el.textContent = 'Có lỗi xảy ra khi dịch';
        });
    } finally {
        translateBtn.disabled = false;
    }
}); 