/**
 * Created by User on 004 04.06.17.
 */


const FRIEND_TEMPLATE = `<div class="friends_user_row clear_fix" id="friends_user_row{{id}}">
                            <div id="res{{id}}"></div>
                            <div class="friends_photo_wrap">
                                <a class="friends_photo _online" href="https://vk.com/id{{id}}"><img class="friends_photo_img"
                                                                                         alt="{{fullname}}"
                                                                                         src="{{photo}}"></a>
                            </div>
                            <div class="friends_user_info">
                                <div class="friends_field friends_field_title"><a href="https://vk.com/id{{id}}">{{fullname}}</a>
                                </div>
                                <div class="friends_field">{{study}}</div>

                                <a href="https://vk.com/write{{id}}" class="friends_field_act"
                                   onclick="return showWriteMessageBox(event, {{id}})">Написать сообщение</a>
                            </div>
                        </div>`;

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
 *
 * @param method
 * @param options
 * @param callback
 */
function getJsonpData(method, options, callback) {
    var script = document.createElement('script');

    if(callback) {
        var callbackName = 'jsonpCallback' + Date.now();
        document[callbackName] = function (data) {
            callback(data);
            script.remove();
            delete document[callbackName];
        };

        options.callback = 'document.' + callbackName;
    }

    script.src = vkQueryBuilder(method, options);
    document.getElementsByTagName('head')[0].appendChild(script);
}


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
    getJsonpData('friends.get', {access_token: token, fields: fields.join(',')}, function (data) {
        if(Array.isArray(data.response)) {
            document.getElementById("friend_list_wrapper").style.display = 'block';

            for(var i = 0; i < 5; i++) {
                var person = data.response.splice(getRandomInt(data.response.length), 1)[0];
                var options = {
                    fullname: person.first_name + ' ' + person.last_name,
                    photo: person.photo_medium,
                    study: person.faculty_name,
                    id: person.uid
                };

                var t = document.getElementById("friend_template");
                friendList.appendChild(renderElement(t.innerHTML, options));
            }
        }
    });
}



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

function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + "token" + "=([^;]*)"));
    return matches ? matches[1] : null;
}


