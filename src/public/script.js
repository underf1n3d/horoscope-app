document.addEventListener('DOMContentLoaded', function() {
    let selectedSign = null;
    let selectedMode = 'bySign'; 
    
    const selectionTypeRadios = document.querySelectorAll('input[name="selectionType"]');
    const signSelector = document.getElementById('signSelector');
    const dateSelector = document.getElementById('dateSelector');
    const zodiacItems = document.querySelectorAll('.zodiac-item');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    const timeFrameRadios = document.querySelectorAll('input[name="timeFrame"]');
    const getHoroscopeBtn = document.getElementById('getHoroscopeBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const horoscopeResult = document.getElementById('horoscopeResult');
    const formSection = document.querySelector('.form-section');
    const backBtn = document.getElementById('backBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    const zodiacSigns = {
        'aries': {name: 'Овен', symbol: '♈'},
        'taurus': {name: 'Телец', symbol: '♉'},
        'gemini': {name: 'Близнецы', symbol: '♊'},
        'cancer': {name: 'Рак', symbol: '♋'},
        'leo': {name: 'Лев', symbol: '♌'},
        'virgo': {name: 'Дева', symbol: '♍'},
        'libra': {name: 'Весы', symbol: '♎'},
        'scorpio': {name: 'Скорпион', symbol: '♏'},
        'sagittarius': {name: 'Стрелец', symbol: '♐'},
        'capricorn': {name: 'Козерог', symbol: '♑'},
        'aquarius': {name: 'Водолей', symbol: '♒'},
        'pisces': {name: 'Рыбы', symbol: '♓'}
    };
    
    function updateDaySelect() {
        const month = parseInt(monthSelect.value);
        const daysInMonth = getDaysInMonth(month);
        
        daySelect.innerHTML = '';
        
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }
    
    function getDaysInMonth(month) {
        const daysPerMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return daysPerMonth[month];
    }
    
    selectionTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.id === 'bySign') {
                selectedMode = 'bySign';
                signSelector.classList.remove('d-none');
                dateSelector.classList.add('d-none');
            } else if (this.id === 'byDate') {
                selectedMode = 'byDate';
                signSelector.classList.add('d-none');
                dateSelector.classList.remove('d-none');
                updateDaySelect(); 
            }
        });
    });
    
    monthSelect.addEventListener('change', updateDaySelect);
    
    zodiacItems.forEach(item => {
        item.addEventListener('click', function() {
            zodiacItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            selectedSign = this.getAttribute('data-sign');
        });
    });
    
    getHoroscopeBtn.addEventListener('click', async function() {
        let sign;
        let url;
        const timeFrame = document.querySelector('input[name="timeFrame"]:checked').value;
        
        if (selectedMode === 'bySign') {
            if (!selectedSign) {
                alert('Пожалуйста, выберите знак зодиака');
                return;
            }
            sign = selectedSign;
            url = `/api/v1/horoscope/${sign}?time_frame=${timeFrame}`;
        } else {
            const month = monthSelect.value;
            const day = daySelect.value;
            url = `/api/v1/date/${month}/${day}?time_frame=${timeFrame}`;
        }
        
        formSection.classList.add('d-none');
        loadingSpinner.classList.remove('d-none');
        
        try {
            const response = await fetch(url);            
            if (!response.ok) {
                throw new Error('Ошибка при получении гороскопа');
            }
            
            const data = await response.json();
            
            updateHoroscopeResult(data);
            
            loadingSpinner.classList.add('d-none');
            horoscopeResult.classList.remove('d-none');
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при получении гороскопа. Пожалуйста, попробуйте позже.');
            
            loadingSpinner.classList.add('d-none');
            formSection.classList.remove('d-none');
        }
    });
    
    function updateHoroscopeResult(data) {
        document.getElementById('signIcon').textContent = zodiacSigns[data.sign].symbol;
        document.getElementById('signTitle').textContent = zodiacSigns[data.sign].name;
        
        document.getElementById('timeFrameText').textContent = {
            'сегодня': 'Сегодня',
            'завтра': 'Завтра',
            'неделя': 'На неделю',
            'месяц': 'На месяц'
        }[data.time_frame];
        
        const dateObj = new Date(data.date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('currentDate').textContent = dateObj.toLocaleDateString('ru-RU', options);
        document.getElementById('prediction').textContent = data.prediction;
        
        if (data.compatibility) {
            document.querySelector('#compatibility .zodiac-symbol').textContent = zodiacSigns[data.compatibility].symbol;
            document.querySelector('#compatibility .sign-name').textContent = zodiacSigns[data.compatibility].name;
        } else {
            document.querySelector('#compatibility').textContent = 'Не определено';
        }
        
        document.getElementById('mood').textContent = data.mood;
        
        const luckyNumbersContainer = document.getElementById('luckyNumbers');
        luckyNumbersContainer.innerHTML = '';
        
        data.lucky_numbers.forEach(number => {
            const numSpan = document.createElement('span');
            numSpan.className = 'lucky-number';
            numSpan.textContent = number;
            luckyNumbersContainer.appendChild(numSpan);
        });
    }
    
    backBtn.addEventListener('click', function() {
        horoscopeResult.classList.add('d-none');
        formSection.classList.remove('d-none');
    });
    
    shareBtn.addEventListener('click', function() {
        const signTitle = document.getElementById('signTitle').textContent;
        const timeFrame = document.getElementById('timeFrameText').textContent;
        const prediction = document.getElementById('prediction').textContent.slice(0, 100) + '...';
        
        const shareText = `Мой гороскоп для ${signTitle} (${timeFrame}): ${prediction}`;
        if (navigator.share) {
            navigator.share({
                title: 'Мой астрологический прогноз',
                text: shareText,
                url: window.location.href
            }).catch(error => {
                console.error('Ошибка при попытке поделиться:', error);
                fallbackShare();
            });
        } else {
            fallbackShare();
        }
        
        function fallbackShare() {
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            alert('Текст гороскопа скопирован в буфер обмена!');
        }
    });
    
    updateDaySelect();
});