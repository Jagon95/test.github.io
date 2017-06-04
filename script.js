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
                template = template.replace("{{" + item + "}}", "null");
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

function get5RandomFriends() {
    var fields = ['uid', 'first_name', 'last_name', 'photo_medium', 'education'];
    friendList = document.getElementById('friends_container');

    while (friendList.firstChild) {
        friendList.removeChild(friendList.firstChild);
    }

    getJsonpData(vkQueryBuilder('friends.get', {access_token: window.token, fields: fields.join(',')}), function (data) {
        if(Array.isArray(data.response)) {
            document.getElementById("friends").style.display = 'block';

            for(var i = 0; i < 5; i++) {
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
    if(ctime > 0) {
        var d = new Date();
        d.setTime(Date.now() + ctime);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    else
        document.cookie = cname + "=" + cvalue + ";" + ";path=/";
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


function getProfile() {
    getJsonpData(vkQueryBuilder('account.getProfileInfo', {access_token: window.token, v: '5.65'}), function (data) {
        console.log(data)
    });
}

