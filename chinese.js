// API key của Gemini
const API_KEY = 'AIzaSyDOagEi9Dd_8va8hRpOvqqMvJNppvpvpw8';

// Cập nhật số ký tự đã nhập
document.getElementById('sourceText').addEventListener('input', function(e) {
    const charCount = e.target.value.length;
    document.getElementById('charCount').textContent = `${charCount}/300 ký tự`;
});

async function translateAllLevels(text) {
    const prompt = `You are a professional Vietnamese to Chinese translator. Translate the following Vietnamese text into Chinese with 5 different HSK levels. For each level, provide both Simplified Chinese characters and Pinyin (with tone marks). Return exactly in this format:

HSK1: 
汉字: [Simplified Chinese characters using only HSK1 vocabulary]
拼音: [Pinyin with tone marks]

HSK2:
汉字: [Simplified Chinese characters using up to HSK2 vocabulary]
拼音: [Pinyin with tone marks]

HSK3:
汉字: [Simplified Chinese characters using up to HSK3 vocabulary]
拼音: [Pinyin with tone marks]

HSK4:
汉字: [Simplified Chinese characters using up to HSK4 vocabulary]
拼音: [Pinyin with tone marks]

HSK5:
汉字: [Simplified Chinese characters using up to HSK5 vocabulary]
拼音: [Pinyin with tone marks]

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
    const sections = result.split('\n\n');
    sections.forEach(section => {
        if (section.includes('HSK1:')) {
            translations.beginnerText = formatChineseResult(section);
        } else if (section.includes('HSK2:')) {
            translations.elementaryText = formatChineseResult(section);
        } else if (section.includes('HSK3:')) {
            translations.intermediateText = formatChineseResult(section);
        } else if (section.includes('HSK4:')) {
            translations.upperIntermediateText = formatChineseResult(section);
        } else if (section.includes('HSK5:')) {
            translations.advancedText = formatChineseResult(section);
        }
    });

    return translations;
}

function formatChineseResult(section) {
    const lines = section.split('\n');
    let hanzi = '';
    let pinyin = '';
    
    lines.forEach(line => {
        if (line.includes('汉字:')) hanzi = line.split('汉字:')[1].trim();
        if (line.includes('拼音:')) pinyin = line.split('拼音:')[1].trim();
    });

    return `${hanzi}\n${pinyin}`;
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
            const element = document.getElementById(id);
            if (text) {
                const [hanzi, pinyin] = text.split('\n');
                element.innerHTML = `<div class="chinese-characters">${hanzi}</div><div class="pinyin">${pinyin}</div>`;
            } else {
                element.textContent = 'Không nhận được kết quả dịch';
            }
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