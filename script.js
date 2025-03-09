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

async function translateAllLevels(text) {
    const prompt = `You are a professional translator. Translate the following Vietnamese text into English with 5 different levels. Return exactly in this format:
A1: [A1 translation using very simple English, basic vocabulary, and short sentences]
A2: [A2 translation using simple English with slightly more advanced vocabulary]
B1: [B1 translation using standard English with moderate vocabulary]
B2: [B2 translation using more sophisticated English and complex sentences]
C1: [C1 translation using advanced English with rich vocabulary and idiomatic expressions]

Vietnamese text to translate: ${text}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + API_KEY, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
        throw new Error('Không nhận được kết quả dịch');
    }

    const result = data.candidates[0].content.parts[0].text.trim();
    const translations = {
        'beginnerText': '',
        'elementaryText': '',
        'intermediateText': '',
        'upperIntermediateText': '',
        'advancedText': ''
    };

    // Parse the result
    const lines = result.split('\n');
    lines.forEach(line => {
        if (line.startsWith('A1:')) translations.beginnerText = line.substring(3).trim();
        if (line.startsWith('A2:')) translations.elementaryText = line.substring(3).trim();
        if (line.startsWith('B1:')) translations.intermediateText = line.substring(3).trim();
        if (line.startsWith('B2:')) translations.upperIntermediateText = line.substring(3).trim();
        if (line.startsWith('C1:')) translations.advancedText = line.substring(3).trim();
    });

    return translations;
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

        // Gọi API một lần và nhận về tất cả các bản dịch
        const translations = await translateAllLevels(sourceText);

        // Hiển thị kết quả
        Object.entries(translations).forEach(([id, text]) => {
            document.getElementById(id).textContent = text || 'Không nhận được kết quả dịch';
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