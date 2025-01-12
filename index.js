// Подключаем необходимые модули
var service = require('movian/service');
var page = require('movian/page');
var http = require('movian/http');
var html = require('movian/html');

// Создаем сервис с названием "PCRADIO" и начальной страницей "pcradio:start"
service.create("PCRADIO", "pcradio:start", "music", true, Plugin.path + "logo.png");

// Создаем маршрут для страницы "pcradio:start"
new page.Route("pcradio:start", function(page) {
    page.type = "directory";  // Устанавливаем тип страницы как "directory" (каталог)
    page.model.contents = "grid";  // Задаем отображение содержимого в виде сетки

    // Устанавливаем метаданные для страницы
    page.metadata.icon = Plugin.path + "logo.png";  // Иконка для страницы
    page.metadata.title = "PCRADIO";  // Название страницы
    page.loading = true;  // Показываем индикатор загрузки

    // Вызываем функцию для получения списка радиостанций и передаем параметры params);
    list(page, {href: "https://pcradio.ru/radiostations"});  

    page.loading = false;  // Скрываем индикатор загрузки
});


// Функция для отображения списка радиостанций на странице
function list(page, params) {
    var pageNumber = 1;  // Номер страницы

    function loadPage() {
        // Формируем URL для запроса
        var url = params.href + (params.page ? params.page : '');
        // Получаем список радиостанций на странице
        var stationList = getStationList(url);
        // Создаем элементы на странице для радиостанций
        populateItems(page, stationList);
        // Если на странице есть элементы, то подгружаем следующую страницу
        if (stationList.length > 0) {
            pageNumber++;  // Увеличиваем номер страницы
            params.page = '?page=' + pageNumber;  // Устанавливаем параметр ?page=number
            page.haveMore(true);  // Сообщаем, что есть еще элементы
        } else {
            page.haveMore(false);  // Сообщаем, что элементы кончились
        }
    }

    // Установка асинхронного пагинатора
    page.asyncPaginator = loadPage;
    // Первичная загрузка
    loadPage();
}


// Функция для получения списка радиостанций с сайта
function getStationList(url) {
    // Выполняем HTTP-запрос для получения HTML-контента страницы с радиостанциями
    var response = http.request(url).toString();

    // Разбираем HTML-страницу
    var document = html.parse(response).root;

    // Получаем все элементы с классом 'col-md-five', которые содержат радиостанции
    var stations = document.getElementByClassName('col-md-five');
    
    // Маппируем (обрабатываем) каждый элемент радиостанции
    return stations.map(function(station) {
        // Извлекаем название радиостанции
        var title = station.getElementByClassName('station-in-list-title')[0].textContent;

        // Извлекаем URL иконки радиостанции (с использованием атрибута 'data-src')
        var icon = station.getElementByClassName('station-in-list-logo')[0].attributes.getNamedItem('data-src').value;

        // Извлекаем ссылки на потоки (hi, low, med качества)
        var streams = station.getElementByClassName('play-pause-button')[0].attributes;

        // Возвращаем объект с данными о радиостанции
        return {
            title: title,  // Название станции
            icon: icon,    // URL иконки
            streams: {     // Информация о потоках
                hi: streams.getNamedItem('data-hi').value,  // Поток высокого качества
                low: streams.getNamedItem('data-low').value,  // Поток низкого качества
                med: streams.getNamedItem('data-med').value  // Поток среднего качества
            }
        };
    });
}

// Функция для отображения радиостанций на странице
function populateItems(page, stationList) {
    // Для каждой радиостанции из списка создаем элемент на странице
    stationList.forEach(function(station) {
        // Добавляем элемент с типом "station" (радиостанция)
        page.appendItem('icecast:' + station.streams.hi, 'station', {
            station: station.title,  // Название станции
            title: station.title,  // Название станции
            description: '',  // Описание (пока пустое)
            icon: 'https://pcradio.ru' + station.icon,  // Иконка с размером 150x150
            album_art: 'https://pcradio.ru' + station.icon,  // Альбомный арт (та же иконка)
           // album: ''  // Альбом (пока пустой)
        });
    });
}
