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
    params.args = {};

    function loadPage() {
        // Формируем URL для запроса
        var url = params.href + (params.page ? params.page : '');
        // Получаем список радиостанций на странице
        var stationList = getStationList(url, params.args);

        // Создаем элементы на странице для радиостанций
        populateItems(page, stationList);
        // Если на странице есть элементы, то подгружаем следующую страницу
        if (stationList.length > 0) {
            pageNumber++;  // Увеличиваем номер страницы
            params.page = '?page=' + pageNumber;  // Устанавливаем параметр ?page=number
            page.haveMore(!stationList.endOfData);  // Сообщаем, что есть еще элементы
        } else {
            page.haveMore(false);  // Сообщаем, что элементы кончились
        }
    }

    function reload() {
        // Сбрасываем номер страницы
        pageNumber = 1;
        // Устанавливаем пустую строку в качестве параметра ?page=
        delete params.page;
        page.flush();
        // Вызываем функцию для загрузки страницы
        loadPage();
    }

// Опции для сортировки (Order By)
const orderByOptions = [
    ['new', 'Новые'],                    // Пункт: новые элементы
    ['popular', 'Популярные', true],     // Пункт: популярные элементы (по умолчанию выбран)
    ['discuss', 'Обсуждаемые'],          // Пункт: обсуждаемые элементы
];

// Создание выпадающего списка для сортировки с функцией обратного вызова, которая применяет сортировку
page.options.createMultiOpt('orderBy', 'Order by', orderByOptions, function(orderBy) {
    params.args.order = orderBy;  // Устанавливает выбранную сортировку в параметры запроса
    if (page.asyncPaginator) {
        reload();  // Перезагружает данные с учетом новой сортировки
    }
}, true);

const genres = [
    ['0', 'All', true], ['50', 'Аудиокниги'], ['46', 'Детям'], ['43', 'Джаз, Блюз, Соул'], ['49', 'Дискография'],
    ['57', 'Фанк, Диско'], ['51', 'Игровое, Аниме'], ['53', 'Инди'], ['42', 'Кантри, Американа, Блюграс'],
    ['44', 'Классика'], ['25', 'Метал'], ['28', 'Новости, Разговорное'], ['48', 'Национальная'],
    ['2', 'Поп'], ['45', 'Прошлых лет'], ['54', 'Разное'], ['38', 'Релакс, Легкая музыка'],
    ['47', 'Религия, Духовная'], ['1', 'Рок'], ['40', 'Рэп, Хип-хоп, RnB'], ['41', 'Ска, Рокстеди, Регги'],
    ['35', 'Смешанный'], ['59', 'Спорт'], ['30', 'Танцевальная'], ['36', 'Электронная'],
    ['37', 'Юмор'], ['52', 'Йога, Спа, Медитация'], ['39', 'Шансон']
  ];
// Создание выпадающего списка для выбора жанра с функцией обратного вызова
page.options.createMultiOpt('genres', 'Type', genres, function(genre) {
    if (genre > 0) {
        params.args.genres = genre;  // Устанавливает выбранный жанр в параметры запроса
    } else {
        delete params.args.genres;  // Удаляет параметр жанра, если выбран "Все"
    }
    if (page.asyncPaginator) {
        reload();  // Перезагружает данные с учетом нового жанра
    }
}, true);
  
const countries = [
  ['0', 'All', true], ['111', 'Албания'], ['19', 'Азербайджан'], ['75', 'Ангола'], ['8', 'Австрия'],
  ['7', 'Австралия'], ['50', 'Армения'], ['28', 'Аргентина'], ['68', 'Барбадос'],
  ['41', 'Бельгия'], ['5', 'Беларусь'], ['44', 'Болгария'], ['97', 'Боливия'],
  ['86', 'Босния и Герцеговина'], ['20', 'Бразилия'], ['36', 'Латвия'], ['10', 'Литва'],
  ['13', 'Ливан'], ['92', 'Люксембург'], ['57', 'Македония'], ['84', 'Мальта'],
  ['96', 'Малайзия'], ['23', 'Марокко'], ['49', 'Мексика'], ['38', 'Молдова'],
  ['106', 'Монголия'], ['99', 'Намибия'], ['22', 'Нидерланды'], ['85', 'Нигерия'],
  ['61', 'Норвегия'], ['52', 'Новая Зеландия'], ['21', 'ОАЭ'], ['102', 'Остров Мэн'],
  ['63', 'Перу'], ['11', 'Польша'], ['15', 'Португалия'], ['1', 'Россия'],
  ['24', 'Румыния'], ['46', 'Саудовская Аравия'], ['34', 'Сербия'], ['48', 'Сингапур'],
  ['69', 'Словакия'], ['79', 'Словения'], ['65', 'ЮАР'], ['12', 'Великобритания'],
  ['3', 'США'], ['6', 'Франция'], ['37', 'Финляндия'], ['107', 'Филиппины'],
  ['47', 'Чили'], ['39', 'Чехия'], ['93', 'Шри-Ланка'], ['53', 'Швеция'],
  ['42', 'Швейцария'], ['62', 'Китай'], ['60', 'Грузия'], ['54', 'Колумбия'],
  ['55', 'Кипр'], ['94', 'Кувейт'], ['95', 'Куба'], ['51', 'Коста-Рика'],
  ['31', 'Хорватия'], ['108', 'Гаити'], ['66', 'Гондурас'], ['74', 'Гана'],
  ['83', 'Гибралтар'], ['4', 'Германия'], ['29', 'Греция'], ['78', 'Гватемала'],
  ['59', 'Южная Корея'], ['25', 'Канада'], ['18', 'Казахстан'], ['17', 'Киргизия'],
  ['33', 'Узбекистан'], ['30', 'Турция'], ['88', 'Тунис'], ['56', 'Таиланд'],
  ['71', 'Тайвань'], ['2', 'Украина'], ['67', 'Уругвай'], ['98', 'Венесуэла'],
  ['35', 'Венгрия'], ['14', 'Испания'], ['9', 'Израиль'], ['43', 'Индия'],
  ['72', 'Индонезия'], ['58', 'Ирландия'], ['89', 'Иран'], ['82', 'Исландия'],
  ['16', 'Италия'], ['90', 'Ямайка'], ['40', 'Япония']
];
// Создание выпадающего списка для выбора страны с функцией обратного вызова
page.options.createMultiOpt('country', 'Выберите страну', countries, function(country) {
    if (country > 0) {
        params.args.countries = country;  // Устанавливает выбранную страну в параметры запроса
        delete params.args.genres;        // Удаляет параметр жанра, так как фильтрация теперь по стране
    } else {
        delete params.args.countries;     // Удаляет параметр страны, если выбран "Все"
    }
    if (page.asyncPaginator) {
        reload();  // Перезагружает данные с учетом новой страны
    }
}, true);



    // Установка асинхронного пагинатора
    page.asyncPaginator = loadPage;
    // Первичная загрузка
    loadPage();
}


// Функция для получения списка радиостанций с сайта
function getStationList(url, args) {

    // Выполняем HTTP-запрос для получения HTML-контента страницы с радиостанциями
    var response = http.request(url, { args: args}).toString();
    //var response = http.request('https://pcradio.ru/radiostations?order=popular&countries=62').toString();

    // Разбираем HTML-страницу
    var document = html.parse(response).root;

    // Получаем все элементы с классом 'col-md-five', которые содержат радиостанции
    var stations = document.getElementByClassName('col-md-five');

    // Проверяем наличие элемента с классом 'paginator'
    var paginator = document.getElementByClassName('pagination').length > 0;
    
    // Маппируем (обрабатываем) каждый элемент радиостанции
    var stationList = stations.map(function(station) {
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
             // Добавляем объект с информацией о конце данных
            //  stationList.push({
            //     endOfData: !paginator  // Если пагинатор не найден, то endOfData будет true
            // });
            print('endOfData: ' + !paginator);
            stationList.endOfData = !paginator;
            return stationList;
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
