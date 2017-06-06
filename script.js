/**
 * Created by User on 004 04.06.17.
 */


/**
 * Генерирует запрос для VK api с соответствующими параметрами
 *
 * @param {string} method используемый метод
 * @param {Object} fields параметры, которые необходимо передать
 * @returns {string}
 */
function vkQueryBuilder(method, fields) {
    if(!method) throw new Error('Empty method');
    var query = 'https://api.vk.com/method/' + method + '?';
    var params = [];
    for(key in fields) {
        params.push(key + '=' + fields[key]);
    }
    return query + params.join('&');
}


/**
 * Запрос данных по JSONP-протоколу
 *
 * @param {string} src Адрес, по которому будет выполняться запрос
 * @param {function} callback Функция, которая будет принимать JSON-данные
 */
function getJsonpData(src, callback) {
    var script = document.createElement('script');

    if(callback) {
        var callbackName = 'jsonpCallback' + Date.now();
        document[callbackName] = function (data) {
            callback(data);
            script.remove();
            delete document[callbackName];
        };

        src += '&callback=document.' + callbackName;
    }

    script.src = src;
    document.getElementsByTagName('head')[0].appendChild(script);
}

/**
 * Создает Node-элемент, сгенерированный из шаблона
 *
 * @param {string} template
 * @param {Object} args
 * @returns {Node}
 */
function renderElement(template, args) {
    var $ = template.match(/{{(.*?)}}/g);

    if (Array.isArray($)) {
        $.forEach(function (item) {
            item = item.replace("{{", "");
            item = item.replace("}}", "");
            if (args[item] === undefined){
                console.warn("Переменная "+item+" не найдена");
                template = template.replace("{{" + item + "}}", "");
            } else {
                template = template.replace("{{" + item + "}}", args[item]);
            }
        });
    }

    var wrapper = document.createElement('template');
    wrapper.innerHTML = template;
    return wrapper.content.firstChild;
}

function getRandomInt(max) {
    return Math.trunc(Math.random() * max);
}


/**
 * Функция выводит 5 случайных друзей пользователя
 *
 * @param {string} token
 */
function get5RandomFriends(token) {
    var fields = ['uid', 'first_name', 'last_name', 'photo_medium', 'education'];
    friendList = document.getElementById('friends_container');

    while (friendList.firstChild) {
        friendList.removeChild(friendList.firstChild);
    }

    getJsonpData(vkQueryBuilder('friends.get', {access_token: token, fields: fields.join(',')}), function (data) {
        if(Array.isArray(data.response)) {
            var friendsCounter = data.response.length < 5 ? data.response.length : 5;

            for(var i = 0; i < friendsCounter; i++) {
                var person = data.response.splice(getRandomInt(data.response.length), 1)[0];
                var options = {
                    fullname: person.first_name + ' ' + person.last_name,
                    photo: person.photo_medium,
                    study: person.faculty_name,
                    id: person.uid
                };

                var t = document.getElementById("friend_template");
                friendList.appendChild(renderElement(t.innerHTML.trim(), options));
            }

            document.getElementById("friends").style.display = 'block';

        }
    });
}


/**
 * Функция устанавливает куку
 *
 * @param {string} cname имя куки
 * @param {string} cvalue значение куки
 * @param {string} ctime как долго хранить (в мс)
 */
function setCookie(cname, cvalue, ctime) {
    if(ctime) {
        var d = new Date();
        d.setTime(Date.now() + ctime);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    else
        document.cookie = cname + "=" + cvalue + ";" + ";path=/";
}

/**
 * функция достает переменную с соответствующим именем из адресной строки
 *
 * @param {string} name имя переменной
 * @returns {null|string}
 */
function getVarFromHash(name) {
    var newVar = window.location.hash.match(new RegExp(name + "=([^&;]*)"));
    return newVar ? newVar [1] : null;
}

/**
 * Функция вернет куку с именем name или null
 *
 * @param {string} name
 * @returns {null|string}
 */
function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return matches ? matches[1] : null;
}


/**
 * Функция рендерит блок с информацией о пользователе
 * @param {string|int} id идентификатор пользователя, которого нужно отобразить
 * @param {string} token
 * @param callback
 */
function showProfile(id, token, callback) {
    getJsonpData(vkQueryBuilder('users.get', {access_token: token, user_ids: id, v: '5.65', fields: 'photo_200_orig,city,status,universities'}), function (data) {
        if(Array.isArray(data.response)) {
            var wrapper = document.getElementById("profile");
            var person = data.response[0];
            var options = {
                fullname: person.first_name + ' ' + person.last_name,
                photo: person.photo_200_orig,
                status: person.status,
                id: person.id
            };

            var t = document.getElementById("profile_template");
            wrapper.appendChild(renderElement(t.innerHTML.trim(), options));

            document.getElementById("profile").style.display = 'block';

        }
    });
    if(callback)
        callback();
}

