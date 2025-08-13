// Основной JavaScript файл для сайта "Мой Холодильник"

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация навигации
    initNavigation();
    
    // Инициализация анимаций
    initAnimations();
    
    // Инициализация таблиц
    initTables();
    
    // Инициализация поиска
    initSearch();
});

// Функция инициализации навигации
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем активный класс со всех ссылок и секций
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Добавляем активный класс к текущей ссылке
            this.classList.add('active');
            
            // Показываем соответствующую секцию
            const targetSection = this.getAttribute('data-section');
            const section = document.getElementById(targetSection);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

// Функция инициализации анимаций
function initAnimations() {
    // Анимация появления карточек
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// Функция инициализации таблиц
function initTables() {
    // Добавляем hover эффекты для строк таблиц
    const tableRows = document.querySelectorAll('tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
    
    // Сортируем таблицы холодильника по дате истечения срока годности
    sortFridgeTables();
}

// Функция для сортировки таблиц холодильника по дате истечения срока годности
function sortFridgeTables() {
    // Сортируем таблицу "Дверца холодильника"
    sortTableByExpiryDate('fridge-door-items');
    
    // Сортируем таблицу "Заморозка"
    sortTableByExpiryDate('fridge-freezer-items');
}

// Функция для сортировки таблицы по дате истечения срока годности
function sortTableByExpiryDate(tableId) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Сортируем строки по дате истечения срока годности (3-й столбец)
    rows.sort((a, b) => {
        const dateA = a.querySelector('td:nth-child(3)')?.textContent.trim();
        const dateB = b.querySelector('td:nth-child(3)')?.textContent.trim();
        
        // Если дата отсутствует, помещаем в конец
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Парсим даты в формате DD.MM.YYYY
        const parseDate = (dateStr) => {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                return new Date(parts[2], parts[1] - 1, parts[0]);
            }
            return new Date(0); // Неверная дата
        };
        
        const parsedDateA = parseDate(dateA);
        const parsedDateB = parseDate(dateB);
        
        // Сортировка по возрастанию (ближайшие даты сверху)
        return parsedDateA - parsedDateB;
    });
    
    // Очищаем таблицу и добавляем отсортированные строки
    tbody.innerHTML = '';
    rows.forEach(row => {
        tbody.appendChild(row);
    });
}

// Функция для обновления даты последнего обновления
function updateLastUpdated(date) {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = date;
    }
}

// Функция для добавления нового продукта
function addProduct(section, productData) {
    const tbody = document.getElementById(section);
    if (!tbody) return;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><i class="${productData.icon}"></i> ${productData.name}</td>
        <td>${productData.quantity}</td>
        ${productData.expiryDate ? `<td>${productData.expiryDate}</td>` : ''}
    `;
    
    tbody.appendChild(newRow);
    
    // Добавляем hover эффект к новой строке
    newRow.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    });
    
    newRow.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '';
    });
    
    // Если это таблица холодильника, пересортируем её
    if (section === 'fridge-door-items' || section === 'fridge-freezer-items') {
        sortTableByExpiryDate(section);
    }
}

// Функция для удаления продукта
function removeProduct(row) {
    row.remove();
}

// Функция инициализации поиска
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    // Поиск при вводе текста
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 0) {
            performSearch(query);
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchResults();
            clearSearchBtn.style.display = 'none';
        }
    });
    
    // Поиск при нажатии кнопки
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            performSearch(query);
            clearSearchBtn.style.display = 'flex';
        }
    });
    
    // Поиск при нажатии Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query.length > 0) {
                performSearch(query);
                clearSearchBtn.style.display = 'flex';
            }
        }
    });
    
    // Очистка поиска
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearSearchResults();
        clearSearchBtn.style.display = 'none';
    });
}

// Функция для выполнения поиска
function performSearch(query) {
    const allRows = document.querySelectorAll('tbody tr');
    let foundCount = 0;
    
    allRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const searchQuery = query.toLowerCase();
        let isMatch = false;
        
        // Проверяем первую колонку (название продукта/лекарства)
        if (cells[0]) {
            const productName = cells[0].textContent.toLowerCase();
            if (productName.includes(searchQuery)) {
                isMatch = true;
            }
        }
        
        // Для таблиц аптеки проверяем вторую колонку (для чего)
        if (cells[1] && row.closest('tbody').id.includes('pharmacy')) {
            const purpose = cells[1].textContent.toLowerCase();
            if (purpose.includes(searchQuery)) {
                isMatch = true;
            }
        }
        
        if (isMatch) {
            row.classList.remove('search-hidden');
            row.classList.add('search-highlight');
            foundCount++;
        } else {
            row.classList.add('search-hidden');
            row.classList.remove('search-highlight');
        }
    });
    
    // Показываем результат поиска
    showSearchResults(foundCount, query);
}

// Функция для очистки результатов поиска
function clearSearchResults() {
    const allRows = document.querySelectorAll('tbody tr');
    
    allRows.forEach(row => {
        row.classList.remove('search-hidden', 'search-highlight');
    });
    
    // Скрываем уведомление о результатах
    hideSearchResults();
}

// Функция для отображения результатов поиска
function showSearchResults(count, query) {
    // Удаляем существующее уведомление
    hideSearchResults();
    
    const notification = document.createElement('div');
    notification.id = 'searchNotification';
    notification.className = 'search-notification';
    notification.innerHTML = `
        <div class="search-notification-content">
            <i class="fas fa-search"></i>
            <span>Найдено ${count} продукт${count === 1 ? '' : count < 5 ? 'а' : 'ов'} по запросу "${query}"</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Функция для скрытия уведомления о результатах
function hideSearchResults() {
    const existingNotification = document.getElementById('searchNotification');
    if (existingNotification) {
        existingNotification.remove();
    }
}

// Функция для поиска продуктов (для обратной совместимости)
function searchProducts(query) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
        performSearch(query);
    }
}

// Функция для очистки поиска (для обратной совместимости)
function clearSearch() {
    clearSearchResults();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
}

// Функция для экспорта данных
function exportData() {
    const data = {
        fridge: {
            door: getTableData('fridge-door-items'),
            freezer: getTableData('fridge-freezer-items')
        },
        cabinet: {
            top: getTableData('cabinet-top-items'),
            bottom: getTableData('cabinet-bottom-items')
        },
        pharmacy: {
            kit1: getTableData('pharmacy-kit1-items'),
            kit2: getTableData('pharmacy-kit2-items'),
            kit3: getTableData('pharmacy-kit3-items'),
            kit4: getTableData('pharmacy-kit4-items')
        },
        lastUpdated: document.getElementById('lastUpdated').textContent
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'my-fridge-data.json';
    link.click();
}

// Функция для получения данных из таблицы
function getTableData(tableId) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return [];
    
    const rows = tbody.querySelectorAll('tr');
    const data = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = {
            name: cells[0].textContent.trim(),
            quantity: cells[1].textContent.trim()
        };
        
        // Для таблиц холодильника (3 столбца: название, количество, срок годности)
        if (cells[2] && (tableId.includes('fridge'))) {
            rowData.expiryDate = cells[2].textContent.trim();
        }
        
        // Для таблиц аптеки (3 столбца: название, для чего, количество)
        if (cells[2] && (tableId.includes('pharmacy'))) {
            rowData.purpose = cells[1].textContent.trim();
            rowData.quantity = cells[2].textContent.trim();
        }
        
        data.push(rowData);
    });
    
    return data;
}

// Функция для импорта данных
function importData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Обновляем данные в таблицах
            updateTableData('fridge-door-items', data.fridge.door);
            updateTableData('fridge-freezer-items', data.fridge.freezer);
            updateTableData('cabinet-top-items', data.cabinet.top);
            updateTableData('cabinet-bottom-items', data.cabinet.bottom);
            
            // Обновляем данные аптеки (если есть)
            if (data.pharmacy) {
                updateTableData('pharmacy-kit1-items', data.pharmacy.kit1);
                updateTableData('pharmacy-kit2-items', data.pharmacy.kit2);
                updateTableData('pharmacy-kit3-items', data.pharmacy.kit3);
                updateTableData('pharmacy-kit4-items', data.pharmacy.kit4);
            }
            
            // Обновляем дату
            if (data.lastUpdated) {
                updateLastUpdated(data.lastUpdated);
            }
            
            alert('Данные успешно импортированы!');
        } catch (error) {
            alert('Ошибка при импорте данных: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Функция для обновления данных в таблице
function updateTableData(tableId, data) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const newRow = document.createElement('tr');
        
        // Для таблиц аптеки (3 столбца: название, для чего, количество)
        if (tableId.includes('pharmacy')) {
            newRow.innerHTML = `
                <td>${item.name}</td>
                <td>${item.purpose || ''}</td>
                <td>${item.quantity}</td>
            `;
        } else {
            // Для остальных таблиц
            newRow.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                ${item.expiryDate ? `<td>${item.expiryDate}</td>` : ''}
            `;
        }
        
        tbody.appendChild(newRow);
    });
    
    // Если это таблица холодильника, пересортируем её
    if (tableId === 'fridge-door-items' || tableId === 'fridge-freezer-items') {
        sortTableByExpiryDate(tableId);
    }
}

// Добавляем глобальные функции для использования в консоли
window.addProduct = addProduct;
window.removeProduct = removeProduct;
window.searchProducts = searchProducts;
window.clearSearch = clearSearch;
window.exportData = exportData;
window.importData = importData;
window.updateLastUpdated = updateLastUpdated;
