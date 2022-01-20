var fromServerData, userID, userKey, userName, loadData, scrollTimeout, isFirstVisit, updateUploadStatus;
var isGetUserDataForAppProcessing = false;

var costPanelServer = 'https://costpanel.info';
//var costPanelServer = 'http://192.168.43.121'; // FOR TESTING !!!

var checkSuspiciousScripts = {
    allowedResources: [
        'youtube.com',
        'yandex.ru',
        'google-analytics.com',
        'ulogin.ru'
    ],
    observerConfig: {
        attributes: true,
        childList: false,
        subtree: false
    },

    init: function() {
        var self = this;

        document.getElementsByTagName('html')[0].addEventListener('DOMNodeInserted', function(event) {
            self.check(event);
        }, false);
    },
    contentAllowedResources: function(verifiableContent) {
        var isAllowed = false;

        this.allowedResources.forEach(function(expression, i){
            if (!isAllowed) {
                isAllowed = ((verifiableContent.indexOf(expression) + 1)) ? true : false;
            }
        });

        return isAllowed;
    },
    check: function(event) {
        if (event.target) {
            if (event.target.nodeName === 'SCRIPT' || event.target.nodeName === 'IFRAME') {
                if (this.contentAllowedResources(event.target.src)) {
                    console.info('<' + event.target.nodeName + '> has been allowed:', event.target.src);
                } else {
                    if (event.target.src == 'javascript:false') {
                        const observer = new MutationObserver(this.observer.bind(this));
                        observer.observe(event.target, this.observerConfig);
                    } else {
                        event.target.remove();
                        console.warn('<' + event.target.nodeName + '> has been REMOVED:', event.target.src);
                    }
                }
            }
        }
    },
    observer: function(mutationsList, observer) {
        var self = this;

        mutationsList.forEach(function(mutation) {
            if (mutation.attributeName == "src") {
                if (!self.contentAllowedResources(mutation.target.src)) {
                    mutation.target.remove();
                    console.warn('Observer: <' + mutation.target.nodeName + '> has been REMOVED:', mutation.target.src);
                } else {
                    console.info('Observer: <' + mutation.target.nodeName + '> has been allowed:', mutation.target.src);
                }

                observer.disconnect();
            }
        });
    }
}
Object.freeze(checkSuspiciousScripts);
Object.freeze(console); // запретить обнулять методы объекта console (ulogin подгружает левый скрипт, он это делает для своих хаков в рекламных айфреймах)

var isWebVersion = !!window.location.host;

if (isWebVersion) { // актуально только для веб-версии, в приложении пока не замечены подозрительные скрипты или айфреймы
    checkSuspiciousScripts.init();
}



function forEach(elements, callback) {
	Array.prototype.forEach.call(elements, callback);
}
function animateScrollTo(activeWindow, value, windowLt) {
    var speed = 50;
    var windowLt = (windowLt) ? windowLt : document.querySelectorAll('.windows-lt > li:nth-child(' + activeWindow + ') > .window-lt')[0];
    var scrollTop = windowLt.scrollTop;
    var direct = (value > scrollTop) ? 1 : -1;
    var mainSpeed = Math.abs(value - scrollTop) / 2;
    var delta = mainSpeed * direct;

    if (windowLt.scrollBy) {
        if (mainSpeed > (speed / 8)) {
            windowLt.scrollBy(0, delta);
            if (scrollTop == windowLt.scrollTop) return false;

            scrollTimeout = setTimeout(function () {
                animateScrollTo(activeWindow, value, windowLt);
            }, 20);
        } else {
            windowLt.scrollTop = value;
            clearTimeout(scrollTimeout);
        }
    } else {
        windowLt.scrollTop = value;
    }

    return false;
}
function getNormalDate(date) { // date в милисекундах с 1970г.
    date = new Date(date);

    return date.toISOString().replace(/:/g,'.');
    // return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' [' + date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds() + ']';
}
function reformatSecToNormalTime(time) {
    var unit = 'сек.';

    if (time > 60) {
        time = time / 60;
        unit = 'мин.';

        if (time > 60) {
            time = time / 60;
            unit = 'час.';

            if (time > 24) {
                time = time / 24;
                unit = 'дн.';

                if (time > 30) {
                    time = time / 30;
                    unit = 'мес.';
                }
            }
        }
    }

    return Math.round(time) + ' ' + unit;
}
function getUserNameObject(userName, loginName) {
    if (!userName) userName = '';
    if (!loginName) loginName = '';
    userName = userName.replace(/\s+/g,' ').trim();

    if (!userName && !loginName) return { name: '', initials: '' }

    var mainName = (userName) ? userName : loginName;
    var words = mainName.split(' ');
    var firstLetter = (words.length && words[0].length) ? words[0][0] : '';
    var secondLetter = (words.length > 1 && words[1].length) ? words[1][0] : '';
    var initials = firstLetter + secondLetter;

    return {
        name: (initials) ? mainName : 'Без имени',
        initials: (initials) ? initials : '--'
    }
}
function getUserDataForApp(scope, request, isSynchronization) {
    if (isSynchronization && !scope.expCalc.meta.userID) return false; // если это синхронизация данных, но пользователь не авторизован, то выход
    if (isGetUserDataForAppProcessing) return false;
    isGetUserDataForAppProcessing = true;

    if (isSynchronization) updateUploadStatus(4);

    var xhr = new XMLHttpRequest();
    var host = costPanelServer;
    var prevUserName = scope.expCalc.meta.userName;
    var userNameBlock = document.getElementById('userNameBlock');
    var setUserName = function(name) {
        userNameBlock.innerText = '';
        scope.expCalc.meta.userName = name;
    }

    if (!request) return false;

    scope.expCalc.meta.userName = 'Инициализация...';

    xhr.open("POST", host + '/app-login.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    if (ecalc) request += '&av=' + ecalc.version;


    xhr.onreadystatechange = function () {

        if (this.readyState != 4) {
            setUserName(prevUserName);
            return;
        }

        if (xhr.status != 200) {
            console.error('!!! We have a problem: ' + xhr.status + ': ' + xhr.statusText);
            setUserName(prevUserName);
        } else {
            if (xhr.responseText != 'Login failed') {
                try {
                    var responseArray = xhr.responseText.split('"""""'); // xhr.responseText -- текст ответа.
                    // responseArray: 0 - login, 1 - full name, 2 - user ID, 3 - user key, 4 - data object, 5 - some message from backend if you need

                    var fromLocalStorage = (localStorage.getItem('costpanel.info')) ? JSON.parse(localStorage.getItem('costpanel.info')) : false;

                    fromServerData = (responseArray[4] && responseArray[4].length > 5) ? JSON.parse(responseArray[4]) : getNewExpensesCalc();

                    console.info('Date fromServerData and fromLocalStorage:', fromServerData.meta.savedDate, '>', fromLocalStorage.meta.savedDate);
                    if (fromServerData.meta.savedDate > fromLocalStorage.meta.savedDate) {
                        scope.expCalc = fromServerData;
                        scope.expCalc.meta.userID = parseInt(responseArray[2]);
                        scope.expCalc.meta.userKey = responseArray[3];
                        scope.expCalc.meta.userInitials = getUserNameObject(responseArray[1], responseArray[0]).initials;

                        setUserName(getUserNameObject(responseArray[1], responseArray[0]).name);

                        if (!scope.expCalc.accounts.length) {
                            scope.createAccount();
                            scope.updateCurrencies(1);
                        }
                        scope.$apply(scope.expCalc);

                        if (document.loginFormForApp) document.loginFormForApp.reset();

                        localStorage.setItem('costpanel.info', JSON.stringify(fromServerData));

                        console.info('[getUserDataForApp] Success! We have received a response:', fromServerData);
                        if (!isSynchronization) alert('Добро пожаловать, ' + scope.expCalc.meta.userName + '!');
                        if (responseArray[5]) alert(responseArray[5]);
                    } else {
                        console.info('[getUserDataForApp] Data is used from localStorage:', fromLocalStorage);
                        setUserName(prevUserName);
                    }
                } catch (e) {
                    setUserName('Error in getUserDataForApp');
                    console.log('Произошла ошибка в getUserDataForApp:', e);
                    console.log('Пришел ответ в getUserDataForApp:', xhr.responseText);
                }
            } else {
                setUserName('');
                resetUserData(scope);
                alert('Авторизация не удалась. Логин или пароль введены неверно :(');
            }
        }

        updateUploadStatus(-1);
        isGetUserDataForAppProcessing = false;
    };

    xhr.send(request);
}
function resetUserData(scope) {
    scope.expCalc = getNewExpensesCalc();
    scope.createAccount();
    scope.updateCurrencies(1);

    setTimeout(function() {
        scope.$apply(scope.expCalc);
    }, 100);
}
function applyNewData($scope, stringNewData) {
    try {
        var newExpCalc = JSON.parse(stringNewData);
        var question = confirm('Загружаемые данные были созданы: ' + $scope.formatDate(newExpCalc.meta.savedDate) +
            '\nВы действительно хотите заменить текущие данные на новые?');

        if (question) {
            var userData = {
                userID: $scope.expCalc.meta.userID,
                userKey: $scope.expCalc.meta.userKey,
                userName: $scope.expCalc.meta.userName,
                userInitials: $scope.expCalc.meta.userInitials,
                savedDate: $scope.expCalc.meta.savedDate
            };

            $scope.expCalc = newExpCalc;
            $scope.expCalc = $scope.setUserDataObject(userData);
            $scope.layout.isChangedObject = true;
            $scope.$apply();
            alert('Новые данные загружены успешно!');
            $scope.uploadData(true, true);
        }
    } catch (err) {
        alert('ОШИБКА: Файл данных повреждён!');
    }
}
function getNewExpensesCalc(isHelpMode) {
    var currencies = {
        // names: ['usd', 'eur', 'rub', 'byn'], // The currency number of 0, 1, 2 and 3
        // rates: [ // Banks sell by these rates
        // 	[1,1.1934,0.0174,0.5186], // rates of the currency number 0
        // 	[0.8379,1,0.0146,0.4345], // rates of the currency number 1
        // 	[57.322,68.4158,1,29.7271], // rates of the currency number 2
        // 	[1.928,2.2963,0.0336,1] // rates of the currency number 3
        // ],
        names: ['RUB', 'BYN', 'UAH', 'USD', 'EUR'],
        rates: [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ],
        commonSurcharge: 0.4
    };
    var expensesTypes = [
        {name: 'Общие расходы', icon: 'donate'},
        {name: 'Питание', icon: 'utensils'},
        {name: 'Лечение', icon: 'briefcase-medical'},
        {name: 'Жильё', icon: 'home'},
        {name: 'Машина', icon: 'car'},
        {name: 'Развлечение', icon: 'theater-masks'},
        {name: 'Другое', icon: 'shopping-cart'}
    ];

    var currentDate = +new Date();

    var expensesCalc = {
        meta: {
            savedDate: currentDate,
            userID: null,
            userKey: null,
            userName: '',
            userInitials: null
        },
        settings: {
            currentAccount: 0,
            currencies: currencies,
            baseCurrency: '0', // String type is necessary for select elements - we can see a selected option by default
            expensesTypes: expensesTypes,
            isHelpMode: isHelpMode
        },
        accounts: []
    };

    localStorage.setItem('costpanel.info', JSON.stringify(expensesCalc));

    return expensesCalc;
}






"use strict";

angular.module("ngMobileClick", [])
    .directive("ngMobileClick", [function () {
        return function (scope, elem, attrs) {
            elem.bind("touchstart click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                scope.$apply(attrs["ngMobileClick"]);
            });
        }
    }]);

(function () {
    'use strict';
    angular.module('app', ['ngMobileClick']);
})();

(function (module) {

    var calculatorCtrl = ['$scope', '$timeout', 'getDataService', function ($scope, $timeout, getDataService) {

        window.addEventListener('load', function () {
//            $scope.layout.isDomReady = true;
//            $scope.layout.isDataUpdating = false;
            $scope.$apply();
        });

        //window.addEventListener('blur', function () {
            // запись при потере фокуса создает дополнительные проблемы, когда появляются алерты может происходит двойная моментальная запись
            // и появляется сообщение о том что ктото раньше успел записать!!!
            // $scope.uploadData(true, true);
        //});


        $scope.fontAwesomeIcons = fontAwesomeIcons;


        // WORKING WITH LAYOUT ==============================

        $scope.layout = {
            isOpenMenu: false,
            isOpenAside: false,
            isOpenGuidePopup: false,
            isEditAccountsMode: false,
            isRemoveMode: false,
            isPrintMode: false,
            isChangedObject: false,
            isDomReady: true, // it was 'false'
            isDataUpdating: true,
            isCalcUpdating: false,
            updatedDataTime: 0,
            activeWindow: 1,
            saveButtonTooltip: null,
            uploadStatus: 1,
            onceAgainLaterSave: false,

            openMenu: function() {
                this.isOpenMenu = true;
                this.isOpenAside = false;
            },
            closeMenu: function() {
                this.isOpenMenu = false;

                $scope.layoutControl.showAndHideBlocks([document.getElementById('navBody')]);
                $scope.layoutControl.closeNavMenuItems();
                this.closeBigData();
            },
            closeBigData: function() {
                $scope.layoutControl.toggleListView('iconsListBlock', true);
                $scope.layoutControl.toggleListView('currenciesTable', true);
            },
            openAside: function() {
                if (isWebVersion && window.location.pathname !== '/') {
                    window.location.href = "/";
                }

                this.isOpenAside = !this.isOpenAside;

                if (this.isOpenAside) {
                    this.isOpenMenu = false;
                    this.isEditAccountsMode = false;
                }
            },
            openGuidePopup: function(isOpen) {
                this.isOpenGuidePopup = isOpen;

                if(!guidePopupPlayer || !guidePopupPlayer.playVideo) {
                    console.log('Player is not found or not ready!');
                    return false;
                }

                if (isOpen) {
                    guidePopupPlayer.playVideo(); // guidePopupPlayer определена в файле www\wp-content\themes\panel\footer.php
                } else {
                    guidePopupPlayer.pauseVideo();
                }
            }
        };

        $scope.layoutControl = {
            navBody: document.getElementById('navBody'),

            init: function () {
                this.navMenuInit();
                this.checkAuthenticationIssues();
            },
            checkAuthenticationIssues: function () {
                var isIssues = window.location.href.indexOf('authentication') + 1;
                // var isLogoPageNow = window.location.href.indexOf('login') + 1;

                if (isIssues) {
                    this.closeNavMenuItems();
                    this.openNavMenuFirstSection('authentication');
                }
            },
            showAndHideBlocks: function(block) {
                var classManipulation = function(sectionBox) {
                    sectionBox.classList.add('block');

                    setTimeout(function() {
                        sectionBox.classList.remove('block');
                    }, 200);
                };
                
                if (block.length) {
                    forEach(block, function(sectionBox, i, arr) {
                        classManipulation(sectionBox);
                    });
                }
            },
            navMenuInit: function() {
                var self = this;
                var dataNextButtons = self.navBody.querySelectorAll('[data-next]');
                var dataPreviousButtons = self.navBody.querySelectorAll('[data-previous]');

                var activateMenu = function(menu) {
                    self.navBody.querySelectorAll('.active')[0].classList.remove('active');
                    menu.classList.add('active');
                };

                forEach(dataNextButtons, function(button, i, arr) {
                    button.addEventListener('click', function() {
                        var section = button.nextElementSibling;

                        if (section) {
                            section.classList.add('open');
                            activateMenu(section);

                            setTimeout(function() {
                                var firstButton = section.querySelectorAll('button')[0];

                                if (firstButton) firstButton.focus();
                            }, 400); // здесь должно было быть 200, чтобы сразу после анимации ставить фокус на кнопку,
                            // но на мобильнике часто фокус ставился раньше чем закончится анимация и получался
                            // странный сдвиг всей менюшки (браузер подскролиил к сфокусированному элементу). Поэтому это значение было увеличено аж до 400мс
                        }
                    });
                });

                forEach(dataPreviousButtons, function(button, i, arr) {
                    button.addEventListener('click', function() {
                        var activeSection = button.parentNode.parentNode;

                        self.showAndHideBlocks(activeSection.querySelectorAll('.section.open > .section-box'));
                        activateMenu(activeSection);
                        forEach(activeSection.querySelectorAll('.open'), function(section, i, arr) {
                            section.classList.remove('open');
                        });
                    });
                });
            },
            openNavMenuFirstSection: function(sectionId) {
                var self = this;

                $scope.layout.openMenu();

                setTimeout(function() {
                    self.navBody.children[0].classList.remove('active');
                    document.getElementById(sectionId).classList.add('open');
                    document.getElementById(sectionId).classList.add('active');
                }, 300);
            },
            closeNavMenuItems: function() {
                var ulMenu = this.navBody.children[0];

                setTimeout(function() {
                    forEach(ulMenu.querySelectorAll('.open'), function(item, i, arr) {
                        item.classList.remove('active');
                        item.classList.remove('open');
                        ulMenu.classList.add('active');
                    });
                }, 200);
            },
            collapseAllBodiesView: function(activeWindow, id) {
                var viewWindow = document.getElementById(id);
                var bodyArr = viewWindow.querySelectorAll('.open-body');
                var detailsArr = viewWindow.querySelectorAll('.open-details');

                $scope.layout.activeWindow = activeWindow;

                forEach(bodyArr, function(body, i, arr) {
                    body.classList.remove('open-body');
                });
                forEach(detailsArr, function(details, i, arr) {
                    details.classList.remove('open-details');
                });
            },
            toggleBodyView: function(activeWindow, id) {
                $scope.layout.activeWindow = activeWindow;

                document.getElementById(id).classList.toggle('open-body');
            },
            toggleDetailsView1: function(id, action) {
                if (action) {
                    if (action > 0) {
                        document.getElementById(id).classList.add('open-details');
                    } else {
                        document.getElementById(id).classList.remove('open-details');
                    }
                } else {
                    document.getElementById(id).classList.toggle('open-details');
                }
            },
            toggleListView: function(id, isClosed) {
                var toggleList = document.getElementById(id);
                var button = document.querySelector('[data-id=' + id + ']');

                if (isClosed) {
                    toggleList.classList.add('hidden');
                    button.classList.remove('rotated-icon');
                } else {
                    toggleList.classList.toggle('hidden');
                    button.classList.toggle('rotated-icon');
                }
            },
            scrollToLastExpense: function(activeWindow, participantId) {
                $scope.layout.activeWindow = activeWindow;

                var participant = document.getElementById(participantId);
                var body = document.getElementById('body');
                var delta = (body.clientWidth >= 480 && body.clientWidth < 640) ? 212 : 132;

                animateScrollTo(activeWindow, participant.offsetHeight + participant.offsetTop - document.getElementById('body').clientHeight + delta);
            },
            scrollUp: function(activeWindow) {
                $scope.layout.activeWindow = activeWindow;
                animateScrollTo(activeWindow, 0);
            }
        };







		// WORKING WITH DATA TO UPLOAD/DOWNLOAD ==============================

        updateUploadStatus = function(status) {
            // -1 - waiting
            // 0 - pending
            // 1 - success
            // 2 - failure
            // 3 - cancel
            // 4 - synchronization

            var tooltip = '';
            var statusHelpTextElm;

            $scope.layout.uploadStatus = status;

            switch(status) {
                case -1:
                    tooltip = 'Автоматическое сохранение на сервере: ожидание';
                    // ожидание перед сохранением, а еще для приложения этот статус появляется при запуске приложения
                    break;
                case 0:
                    tooltip = 'Автоматическое сохранение на сервере: в процессе .....';
                    break;
                case 1:
                    tooltip = 'Автоматическое сохранение на сервере: успешно';
                    break;
                case 2:
                    tooltip = 'Автоматическое сохранение на сервере: НЕ УДАЛОСЬ (восстановите интернет и нажмите здесь)';
                    break;
                case 3:
                    tooltip = 'Автоматическое сохранение на сервере: ОТМЕНА';
                    break;
                case 4:
                    tooltip = 'Синхронизация данных';
                    break;
            }

            document.getElementById('saveButton') && document.getElementById('saveButton').setAttribute('title', tooltip);
            document.getElementById('body').setAttribute('data-upload-status', status);

            statusHelpTextElm = document.getElementById('statusHelpText');
            if (statusHelpTextElm) statusHelpTextElm.innerText = tooltip;

        };

        loadData = function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function(event) {
                applyNewData($scope, event.target.result);
            };

            reader.readAsText(file);

            event.target.value = '';
        };

        $scope.validateJSON = function(obj, propertyName) {
            try {
                JSON.parse('[\"' + obj[propertyName] + '\"]');

                if (obj[propertyName].toString().search(/[']/) + 1) { // и этот символ не должен быть в адресной строке
                    throw new SyntaxError("Недопустимый символ");
                }
            } catch (e) {
                alert('Здесь нельзя использовать спец.символы:\n' + obj[propertyName]);
                obj[propertyName] = '???';
                return false;
            }
            return true;
        };

		$scope.uploadData = function (isFullObject, isDirectSave) {
		    if ($scope.expCalc.meta.isViewMode) return false; // в режиме просмотра ничего не сохраняется

            if (!isDirectSave) $scope.layout.isChangedObject = true;
            if (!$scope.layout.isChangedObject) return false; // если объект не менялся, то выход

            var delay = (isDirectSave) ? 0 : 1000;
            var currentDate = +new Date();

            $scope.expCalc.meta.savedDate = currentDate;
            $scope.layout.updatedDataTime = currentDate;

            var localStringJSON = JSON.stringify($scope.expCalc);

            localStorage.setItem('costpanel.info', localStringJSON);

			if (!$scope.expCalc.meta.userID) {
			    console.info('Не выполнен вход пользователя. Данные сохраняются только локально.');
			    return false;
            }

			$scope.layout.onceAgainLaterSave = !$scope.layout.uploadStatus;

            if ($scope.layout.uploadStatus !== 0) updateUploadStatus(-1);

            setTimeout(function () {
                var host = costPanelServer;
                var now = +new Date();

                $scope.layout.onceAgainLaterSave = !$scope.layout.uploadStatus;

                if ($scope.layout.onceAgainLaterSave) return false; // еще раз аплоад произойдет только после того как ответ от сервера придет
                if (!isDirectSave && (now - $scope.layout.updatedDataTime) < delay) return false;

                var xhr, serverStringAccountJSON, currentAccountNumber, currentAccount;

                updateUploadStatus(0);

                currentAccountNumber = $scope.expCalc.settings.currentAccount;
                currentAccount = $scope.expCalc.accounts[currentAccountNumber];

                xhr = new XMLHttpRequest();

                if (!isFullObject && $scope.expCalc.meta.userID && !currentAccount.meta.id) {
                    currentAccount.meta.id = $scope.expCalc.meta.userID + (+new Date() + '').slice(-11);
                }

                if (!isFullObject && $scope.expCalc.meta.userID) {
                    currentAccount.meta.userID = $scope.expCalc.meta.userID;
                    currentAccount.meta.userKey = $scope.expCalc.meta.userKey;
                    currentAccount.meta.savedDate = $scope.expCalc.meta.savedDate;
                }

                serverStringAccountJSON = JSON.stringify(currentAccount);

                xhr.open("POST", host + '/send.php', true);
                xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

                xhr.onreadystatechange = function () {
                    if (this.readyState != 4) return;

                    if (xhr.status != 200) {
                        console.error('!!! We have a problem: ' + xhr.status + ': ' + xhr.statusText);
                        updateUploadStatus(2);
                    } else {

                        setTimeout(function() { // setTimeout поставлен в попытке исправить выкидывание из приложения при первом запуске и появляется confirm
                            // responseArray[0] - тип сохранения (100 - весь объект, 010 - текущий расчет, 200 - объект не сохранился т.к. устарел, ктото под этим же аккаунтом внес изменения раньше),
                            // [1] - текст сообщения,
                            // [2] - было послед.сохранени на сервере,
                            // [3] - сохраненный объект
                            var responseArray = xhr.responseText.split('"""""');

                            try {
                                var fromServerData = JSON.parse(responseArray[3]);

                                switch(responseArray[0]) {
                                    case '010':
                                        currentAccount.meta.savedDate = fromServerData.meta.savedDate;
                                        $scope.expCalc.meta.savedDate = fromServerData.meta.savedDate;
                                        $scope.$digest();
                                        localStorage.setItem('costpanel.info', JSON.stringify($scope.expCalc));
                                        break;

                                    case '100':
                                        $scope.expCalc.meta.savedDate = fromServerData.meta.savedDate;
                                        localStorage.setItem('costpanel.info', responseArray[3]);
                                        break;

                                    case '200':
                                        var confirmMessage = 'ВНИМАНИЕ! Некоторые данные были изменены на другом устройстве ' + reformatSecToNormalTime(responseArray[2]) + ' назад. \n\nОК - продолжить и подгрузить последние данные \n\nОТМЕНА - оставить текущие данные, чтобы сохранить копию (МЕНЮ -> ДАННЫЕ -> ЭКСПОРТ/ИМПОРТ)';

                                        forEach(fromServerData.accounts, function(account, index, arr) {
                                            if (typeof account == 'string') {
                                                fromServerData.accounts[index] = JSON.parse(account);
                                            }
                                        });

                                        if (confirm(confirmMessage)) {
                                            $scope.expCalc = fromServerData;
                                            $scope.$digest();
                                            localStorage.setItem('costpanel.info', JSON.stringify($scope.expCalc));
                                        } else {
                                            updateUploadStatus(3);
                                        }
                                        break;
                                }
                            } catch (e) {
                                updateUploadStatus(2);
                                console.error('Данные могли не сохраниться. Returned data with issues =>', xhr.responseText);
                                if (xhr.responseText == 'The user key is not correct') alert('Не получается сохранить новые данные. Авторизуйтесь заново.');
                            }

                            if ($scope.layout.uploadStatus !== 3) {
                            console.info('We have received a response: ' + responseArray[1]); // responseText -- текст ответа.
                            $scope.layout.isChangedObject = false;
                            updateUploadStatus(1);

                            if ($scope.layout.onceAgainLaterSave) {
                                $scope.layout.onceAgainLaterSave = false;
                                $scope.layout.isChangedObject = true;
                                $scope.uploadData(isFullObject, true);
                            }
                        }
                        }, 1);

                    }
                };

                if (!$scope.layout.onceAgainLaterSave) {
                    xhr.send((isFullObject) ? localStringJSON : serverStringAccountJSON);
                }
// testclicking // var counter = 0; var lbl = $0; function testClick(){var a = Math.round(Math.random()*3000), b = Math.round(Math.random()*3000); lbl.click(); setTimeout(function(){lbl.click()}, a); setTimeout(function(){lbl.click()}, b); counter++; console.log(counter, '--------------a,b',a,b);}; for(var i=0; i<3; i++) {setTimeout(testClick, 7000*i);}
            }, delay);

		};

		$scope.getEmptyUserDataObject = function () {
            var workData = JSON.parse(JSON.stringify($scope.expCalc));
            workData.meta.userID = workData.meta.userInitials = workData.meta.userKey = workData.meta.userName = null;
            forEach(workData.accounts, function(account, index, arr) {
                arr[index].meta.userID = arr[index].meta.userKey = null;
            });
            return workData;
        };

        $scope.setUserDataObject = function (userData) {
            var workData = JSON.parse(JSON.stringify($scope.expCalc));
            workData.meta.userID = userData.userID;
            workData.meta.userKey = userData.userKey;
            workData.meta.userName =  userData.userName;
            workData.meta.userInitials = userData.userInitials;
            workData.meta.savedDate = userData.savedDate;

            forEach(workData.accounts, function(account, index, arr) {
                arr[index].meta.userID = userData.userID;
                arr[index].meta.userKey = userData.userKey;
                workData.meta.savedDate = userData.savedDate;
            });
            return workData;
        };

		$scope.downloadData = function () {
		    var dataWithoutID = $scope.getEmptyUserDataObject();
            var lastChangedDate = ($scope.expCalc.meta.userID > 0) ? getNormalDate($scope.expCalc.meta.savedDate) : 'local-' + getNormalDate(+new Date());
            var blob = new Blob([JSON.stringify(dataWithoutID)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "CostPanel-" + lastChangedDate + ".txt");
        };

		$scope.linkToAccount = function () {
		    var isIdUnique = true;
		    var currentAccountIndex = $scope.expCalc.settings.currentAccount;

            if (!$scope.expCalc.accounts.length) return false;

		    var currentAccountId = $scope.expCalc.accounts[currentAccountIndex].meta.id;
            var link = costPanelServer;

            forEach($scope.expCalc.accounts, function(account, index, arr) {
                if (currentAccountIndex != index && currentAccountId == account.meta.id) isIdUnique = false;
            });

            if (isIdUnique) {
                link += '/?u=' + $scope.expCalc.meta.userID;
                link += '&ac=' + encodeURIComponent(currentAccountId);
            } else {
                link = 'Такой ID уже существует!!!';
            }

            return link;
        };

        $scope.getUserDataForApp = function(login) {
            var usernameValue = document.getElementById('username').value;
            var passValue = document.getElementById('password').value;
            var initUserRequest = 'username=' + usernameValue + '&pass=' + passValue;

            getUserDataForApp($scope, initUserRequest);
        };

        $scope.resetUserDataForApp = function() {
            resetUserData($scope);
        };









        // METHODS OF CREATING ==============================
        $scope.createAccount = function () {
            var accounts = $scope.expCalc.accounts;
            var accountIndex = accounts.length;
            var newAccount = {
                settings: {
                    accountCurrency: $scope.expCalc.settings.baseCurrency,
                    advancedMode: false,
                    fixationDirectly: true
                },
                meta: {
					index: accountIndex,
                    title: (accountIndex) ? '' : 'Новый расчет 1',
                    total: 0,
                    fullRefund: 0,
                    negBalance: 0,
                    posBalance: 0,
                    negBalanceByBank: 0,
                    posBalanceByBank: 0,
                    bank: 0,
					savedDate: 0
                },
                participants: []
            };

            accounts.push(newAccount);
            $scope.expCalc.settings.currentAccount = accountIndex;

            $scope.createParticipant(true);
        };

        $scope.createParticipant = function (updateFullDataOnServer) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];
            var participantIndex = currentAccount.participants.length;
            var newParticipant = {
                meta: {
                    title: '',
                    participation: 1,
                    preferredCurrency: currentAccount.settings.accountCurrency,
                    total: 0,
                    share: 0,
                    balance: 0,
                    receivedSum: 0,
                    givenSum: 0,
                    fullBalance: 0,
                    fullBalanceByBank: 0
                },
                expenses: [],
                fixation: {
                    whom: [],
                    byBank: [],
                    reserve: 0
                }
            };

            currentAccount.participants.push(newParticipant);

            $scope.addParticipantToPartList();

			$scope.uploadData(updateFullDataOnServer);

			setTimeout(function() {
                $scope.layoutControl.toggleBodyView(1, 'participant.1.' + participantIndex);
            }, 0);
        };






        // METHODS OF REMOVING ===============================
        $scope.removeExpensesType = function (typeIndex) {
            var error = $scope.isExpensesTypeUsed(typeIndex);

            if (error) {
                alert(error);
            } else {
                $scope.expCalc.accounts.forEach(function(account, accountIndex, accountArr) {
                    account.participants.forEach(function(participant, participantIndex, participantArr) {
                        participant.expenses.forEach(function(expense, expenseIndex, expenseArr) {
                            if (expense.type > typeIndex) {
                                expense.type = (expense.type - 1).toString();
                            }
                        });
                    });
                });

                $scope.expCalc.settings.expensesTypes.splice(typeIndex, 1);

				$scope.uploadData(true);
            }
        };

        $scope.removeCurrency = function (currencyIndex) {
            var error = $scope.isCurrencyUsed(currencyIndex);

            if (error) {
                alert(error);
            } else {
                if ($scope.expCalc.settings.baseCurrency > currencyIndex) {
                    $scope.expCalc.settings.baseCurrency = ($scope.expCalc.settings.baseCurrency - 1).toString();
                }

                $scope.expCalc.accounts.forEach(function(account, accountIndex, accountArr) {

                    if (account.settings.accountCurrency > currencyIndex) {
                        account.settings.accountCurrency = (account.settings.accountCurrency - 1).toString();
                    }

                    account.participants.forEach(function(participant, participantIndex, participantArr) {

                        if (participant.meta.preferredCurrency > currencyIndex) {
                            participant.meta.preferredCurrency = (participant.meta.preferredCurrency - 1).toString();
                        }

                        participant.expenses.forEach(function(expense, expenseIndex, expenseArr) {
                            if (expense.currency > currencyIndex) {
                                expense.currency = (expense.currency - 1).toString();
                            }
                        });
                        participant.fixation.whom.forEach(function(whom, whomIndex, whomArr) {
                            if (whom.currency > currencyIndex) {
                                whom.currency = (whom.currency - 1).toString();
                            }
                        });

                    });
                });

                $scope.expCalc.settings.currencies.names.splice(currencyIndex, 1);
                $scope.expCalc.settings.currencies.rates.splice(currencyIndex, 1);
                $scope.expCalc.settings.currencies.rates.forEach(function(rateArr, i, arr) {
                    rateArr.splice(currencyIndex, 1);
                });

				$scope.uploadData(true);
            }
        };

        $scope.removeCurrentAccount = function (removedAccountIndex) {
            if (!confirm('Вы действительно хотите удалить расчет: ' + $scope.expCalc.accounts[removedAccountIndex].meta.title)) return false;

            $scope.expCalc.accounts.splice(removedAccountIndex, 1);
			$scope.expCalc.accounts.forEach(function(account, accountIndex, accountArr) {
				account.meta.index = accountIndex;
			});

			if ($scope.expCalc.settings.currentAccount == removedAccountIndex) {
                $scope.expCalc.settings.currentAccount = 0;
            } else {
			    if ($scope.expCalc.settings.currentAccount > removedAccountIndex) {
                    $scope.expCalc.settings.currentAccount--;
                }
            }

			$scope.uploadData(true);
        };

        $scope.removeParticipant = function (participantIndex) {
            var accountIndex = $scope.expCalc.settings.currentAccount,
                error = $scope.werePaymentsFromParticipant(participantIndex),
                participants = $scope.expCalc.accounts[accountIndex].participants;

            if (error) {
                alert(error);
            } else {
                if (confirm('Вы действительно хотите удалить участника: ' + participants[participantIndex].meta.title)) {
                    participants.splice(participantIndex, 1);
                    $scope.removeParticipantFromPartList(participantIndex);
                    $scope.updatePaymentsFromParticipant(participantIndex);

                    $scope.uploadData();
                }
            }
        };

        $scope.removeExpense = function (participantIndex, expenseIndex) {
            var accountIndex = $scope.expCalc.settings.currentAccount;

            $scope.expCalc.accounts[accountIndex].participants[participantIndex].expenses.splice(expenseIndex, 1);

			$scope.uploadData();
        };

        $scope.removeDetailsFromExpense = function (expense, detailIndex) {
            expense.details.splice(detailIndex, 1);

            $scope.uploadData();
        };

        $scope.removeParticipantFromPartList = function (participantIndex) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            currentAccount.participants.forEach(function (participant, i, arr) {
                participant.expenses.forEach(function (expense, i, arr) {
                    expense.partList.splice(participantIndex, 1);
                });
            });
        };

        $scope.removePayment = function (debtor, refundIndex) {
            debtor.fixation.whom.splice(refundIndex, 1);
            $scope.checkAllFixedRefunds(debtor);

			$scope.uploadData();
        };

        $scope.removePaymentByBank = function (participant, byBankObjectIndex) {
            participant.fixation.byBank.splice(byBankObjectIndex, 1);

			$scope.uploadData();
        };






        // METHODS OF ADDING ===============================
        $scope.addNewExpensesType = function () {
            $scope.expCalc.settings.expensesTypes.push({
                name: '',
                icon: ''
            });
        };

        $scope.addNewCurrency = function () {
            var newRateArr = [];

            $scope.expCalc.settings.currencies.names.push('');
            $scope.expCalc.settings.currencies.rates.forEach(function(rateArr, i, arr) {
                rateArr.push(1);
                newRateArr.push(1);
            });
            newRateArr.push(1);

            $scope.expCalc.settings.currencies.rates.push( newRateArr );
        };

        $scope.addNewExpense = function (participant, participantIndex) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];
            var accountIndex = $scope.expCalc.settings.currentAccount;
            var expenseIndex = participant.expenses.length;
            var newExpense = {
                title: '',
                type: '0',
                date: '' + new Date(),
                value: null,
                currency: currentAccount.settings.accountCurrency,
                details: [],
                isPaid: false,
                partList: []
            };

            $scope.expCalc.accounts[accountIndex].participants.forEach(function (participant, i, arr) {
                newExpense.partList.push(true);
            });

            participant.expenses.push(newExpense);
        };

        $scope.addNewDetailsToExpense = function (expense) {
            expense.details.push({
                isChecked: false,
                title: '',
                qty: '',
                value: null
            })
        };

        $scope.addParticipantToPartList = function () {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            currentAccount.participants.forEach(function (participant, i, arr) {
                participant.expenses.forEach(function (expense, i, arr) {
                    expense.partList.push(true);
                });
            });
        };

        $scope.addValueToParticipationLists = function (accountIndex, participantIndex) {
            $scope.expCalc.accounts[accountIndex].participants.forEach(function (item, i, arr) {
                item.participationList[participantIndex].push({
                    value: true,
                    share: null
                });
            });
        };

        $scope.addNewPayment = function(participant) {
            participant.fixation.whom.push({
                number: null,
                value: null,
                currency: null,
                date: '' + new Date(),
                isFixed: false
            });
            $scope.checkAllFixedRefunds(participant);
        };

        $scope.addNewPaymentByBank = function(participant, direction) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                value = (currentAccount.meta.bank < participant.meta.fullBalanceByBank) ? currentAccount.meta.bank : participant.meta.fullBalanceByBank,
                byBankValue = (direction > 0) ? value : (participant.meta.fullBalanceByBank < 0) ? -participant.meta.fullBalanceByBank : null;

            if (byBankValue < 0) byBankValue = null;

            if (direction == 1 && currentAccount.meta.bank == 0) {
                alert('Банк пуст и вы ничего не сможете получить');

                return false;
            }

            participant.fixation.byBank.push({
                token: direction,
                value: byBankValue,
                date: '' + new Date(),
                isFixed: false
            });
        };








        // METHODS OF GETTING ===============================
        $scope.getAccountCurrency = function() {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            return $scope.expCalc.settings.currencies.names[currentAccount.settings.accountCurrency].slice(0, 3).toUpperCase();
        };

        $scope.getAccountTotal = function () {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            currentAccount.meta.total = 0;

            currentAccount.participants.forEach(function (participant, i, arr) {
                currentAccount.meta.total += participant.meta.total;
            });

            currentAccount.meta.total = $scope.exact(currentAccount.meta.total);

            return $scope.exact(currentAccount.meta.total);
        };

        $scope.getParticipantTotal = function (participant) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];
            var rates = $scope.expCalc.settings.currencies.rates[currentAccount.settings.accountCurrency];

            participant.meta.total = 0;

            participant.expenses.forEach(function (expense, i, arr) {
                if (expense.isPaid) participant.meta.total += expense.value * rates[expense.currency];
            });

            return participant.meta.total;
        };

        $scope.getExpenseDetailsTotal = function (expenseDetails, isSumChecked) {
            var expenseDetailsTotal = 0;

            expenseDetails.forEach(function (expense, i, arr) {
                if (!isSumChecked || expense.isChecked) expenseDetailsTotal += expense.value;
            });

            return $scope.roundOff(expenseDetailsTotal);
        };

        $scope.getMoneyByAccountCurrency = function (value, exchangeCurrency) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                rate = $scope.expCalc.settings.currencies.rates[currentAccount.settings.accountCurrency][exchangeCurrency];

            return value * rate;
        };

        $scope.getMoneyByPrefferedCurrency = function (value, exchangeCurrency) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                rate = $scope.expCalc.settings.currencies.rates[currentAccount.settings.accountCurrency][exchangeCurrency];

            return value / rate;
        };

        $scope.getExpenseWithRate = function (expense) {
            return $scope.getMoneyByAccountCurrency(expense.value, expense.currency);
        };

        $scope.getPartSumOfExpense = function (expense) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                partSumOfExpense = 0;

            expense.partList.forEach(function (participation, i, arr) {
                if (participation) {
                    partSumOfExpense += currentAccount.participants[i].meta.participation;
                }
            });

            return partSumOfExpense;
        };

        $scope.getExpenseShare = function (expense, extParticipantIndex) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            if (expense.isPaid) return expense.partList[extParticipantIndex] *
                currentAccount.participants[extParticipantIndex].meta.participation *
                $scope.getExpenseWithRate(expense) /
                $scope.getPartSumOfExpense(expense);
        };

        $scope.getParticipantShare = function (extParticipantIndex) {
            var share;
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                participantShare = 0,
                expensesByTypes = [];

            $scope.expCalc.settings.expensesTypes.forEach(function (type, i, arr) {
                expensesByTypes.push(0);
            });

            currentAccount.participants.forEach(function (participant, i, arr) {
                participant.expenses.forEach(function (expense, i, arr) {
                    if (expense.isPaid) {
                        share = $scope.getExpenseShare(expense, extParticipantIndex);
                        participantShare += share;
                        expensesByTypes[expense.type] += share;
                    }
                });
            });

            expensesByTypes.forEach(function (expenseByType, i, arr) {
                arr[i] = $scope.roundOff(expenseByType);
            });

            currentAccount.participants[extParticipantIndex].meta.expensesByTypes = expensesByTypes;
            currentAccount.participants[extParticipantIndex].meta.share = $scope.roundOff(participantShare);

            return $scope.roundOff(participantShare);
        };

        $scope.getShareTotal = function () {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                shareTotal = 0;

            currentAccount.participants.forEach(function (participant, i, arr) {
                shareTotal += currentAccount.participants[i].meta.share;
            });

            return $scope.exact(shareTotal);
        };

        $scope.getFullRefund = function () {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];
            var balance, fullRefund = 0;

            currentAccount.participants.forEach(function (participant, i, arr) {
                balance = participant.meta.total - participant.meta.share;
                fullRefund += (balance < 0) ? balance : 0;
            });

            currentAccount.meta.fullRefund = $scope.exact(fullRefund);

            return $scope.exact(fullRefund);
        };

        $scope.getBalance = function (participant) {
            participant.meta.balance = $scope.roundOff($scope.exact(participant.meta.total - participant.meta.share));
            return participant.meta.balance;
        };

        $scope.getParticipantOption = function (sponsor, debtor, participantIndex) {
            var currencyNumber, option = (sponsor.meta.title) ? sponsor.meta.title : 'Участник ' + participantIndex;
            var rest = $scope.getRest(sponsor, debtor).rest;

            if (debtor.meta.fullBalance < 0 && rest > 0) {
                currencyNumber = $scope.getRest(sponsor, debtor).currency;
                option += ' - [' + $scope.expCalc.settings.currencies.names[currencyNumber].toUpperCase() + ' ' + rest + ']';
            }

            return option;
        };

        $scope.getReceivedSum = function (participant, participantIndex) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            participant.meta.receivedSum = 0;

            currentAccount.participants.forEach(function(person, i, arr) {
                person.fixation.whom.forEach(function(refund, n, arr) {
                    if (refund.isFixed && participantIndex == refund.number && refund.number !== null && refund.currency !== null) {
                        participant.meta.receivedSum += $scope.getMoneyByAccountCurrency(refund.value, refund.currency);
                    }
                });
            });

            return participant.meta.receivedSum = $scope.roundOff(participant.meta.receivedSum);
        };

        $scope.getGivenSum = function (participant) {
            participant.meta.givenSum = 0;

            participant.fixation.whom.forEach(function(refund, i, arr) {
                if (refund.isFixed && refund.number !== null && refund.currency !== null) {
                    participant.meta.givenSum += $scope.getMoneyByAccountCurrency(refund.value, refund.currency);
                }
            });

            return participant.meta.givenSum = $scope.roundOff(participant.meta.givenSum);
        };

        $scope.getRest = function (sponsor, debtor) {
            var sponsorWillReceive, debtorWillGive, preferredCurrencyRest, accountCurrencyRest;
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                accountCurrency = currentAccount.settings.accountCurrency,
                isRoundDown = (sponsor.meta.preferredCurrency != accountCurrency);

            sponsorWillReceive = sponsor.meta.fullBalance;
            debtorWillGive = Math.abs(debtor.meta.fullBalance);

            accountCurrencyRest = (sponsorWillReceive - debtorWillGive > 0) ? debtorWillGive : sponsorWillReceive;
            preferredCurrencyRest = $scope.getMoneyByPrefferedCurrency(accountCurrencyRest, sponsor.meta.preferredCurrency);
            preferredCurrencyRest = (preferredCurrencyRest < 1) ? 0 : $scope.roundOff(preferredCurrencyRest, isRoundDown);

            return {
                rest: (preferredCurrencyRest == 0) ? $scope.roundOff(accountCurrencyRest) : preferredCurrencyRest,
                currency: (preferredCurrencyRest == 0) ? accountCurrency : sponsor.meta.preferredCurrency
            }
        };

        $scope.getParticipantFullBalance = function (participant, participantIndex, byPrefferedCurrency) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                participantBalance = $scope.roundOff(participant.meta.balance),
                participantReceivedSum = $scope.getReceivedSum(participant, participantIndex),
                participantGivenSum = $scope.getGivenSum(participant),
                calculation = participantBalance - participantReceivedSum + participantGivenSum,
                result = $scope.roundOff(calculation),
                resultByPrefferedCurrency = $scope.getMoneyByPrefferedCurrency(calculation, participant.meta.preferredCurrency);

            participant.meta.fullBalance = result;

            return (byPrefferedCurrency) ? $scope.roundOff(resultByPrefferedCurrency, true) : result;
        };

        $scope.getReturnsBalance = function (method) {
            var balance,
                positive = 0,
                negative = 0,
                currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            currentAccount.participants.forEach(function(participant, i, arr) {
                balance = (method == 'byBank') ? participant.meta.fullBalanceByBank : participant.meta.fullBalance

                if (balance > 0) {
                    positive += balance;
                } else {
                    negative += balance;
                }
            });

            if (method == 'byBank') {
                currentAccount.meta.negBalanceByBank = $scope.roundOff(negative);
                currentAccount.meta.posBalanceByBank = $scope.roundOff(positive);

                return currentAccount.meta.negBalanceByBank + ' / ' + currentAccount.meta.posBalanceByBank;
            } else {
                currentAccount.meta.negBalance = $scope.roundOff(negative);
                currentAccount.meta.posBalance = $scope.roundOff(positive);

                return currentAccount.meta.negBalance + ' / ' + currentAccount.meta.posBalance;
            }
        };

        $scope.getAccountBank = function () {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                result = 0;

            currentAccount.participants.forEach(function(participant, participantIndex, arr) {
                participant.fixation.byBank.forEach(function(byBankObject, i, arr2) {
                    if (byBankObject.isFixed) result += (-1) * byBankObject.token * byBankObject.value;
                });
            });

            currentAccount.meta.bank = $scope.roundOff(result);

            return currentAccount.meta.bank;
        };

        $scope.getParticipantFullBalanceByBank = function (participant) {
            var result = 0;

            participant.fixation.byBank.forEach(function(byBankObject, i, arr) {
                if (byBankObject.isFixed) result += byBankObject.token * byBankObject.value;
            });

            participant.meta.fullBalanceByBank = $scope.roundOff(participant.meta.balance - result);

            return participant.meta.fullBalanceByBank;
        };

        $scope.getIconSymbol = function (iconName, title) {
            return (title.length) ? '<i class="fas fa-' + iconName + ' only-mobile"></i>' : '';
        };

        $scope.getCurrencySymbol = function (currency, expenseValue) {
            return $sce.trustAsHtml((expenseValue) ? '<s class="only-mobile">' + currency + '</s>' : '');
        };

        $scope.getParticipantName = function (title, index) {
            return title ? title : 'Участник ' + (index + 1);
        };

        $scope.getExpenseName = function (title, index, expenseIndex, isTruncated) {
            if (isTruncated) {
                title = (title.length > 30) ? title.slice(0, 29) + '...' : title;
            }

            return title ? title : 'Расход ' + (index + 1) + '.' + (expenseIndex + 1);
        };

        $scope.getPercentage = function (value, fromValue) {
            return Math.floor((value * 100 / fromValue) * 100) / 100;
        };

        $scope.getParticipationTooltip = function (partList) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                participantsQty = 0,
                participantsNames = '',
                message;

            partList.forEach(function(participation, i, arr) {
                if (participation) {
                    participantsQty++;
                    participantsNames += ', ' + $scope.getParticipantName(currentAccount.participants[i].meta.title, i);
                }
            });

            participantsNames = participantsNames.slice(2);

            if (participantsQty == 1) {
                message = 'Этот расход предназначен только для участника ' + participantsNames + '.';
            } else {
                message = 'Этот расход распределяется между участниками: ' + participantsNames + '.';
            }

            return message;
        }








        // OTHER METHODS ===============================
        $scope.exact = function (value) {
            return Math.round(value * 1000000000) / 1000000000; // in order to cut off a very long fractional part
        };

        $scope.roundOff = function (value, isDown) {
            if (value === undefined) return 0;
            if (value > 9999999999) {
                console.error('The value is very long:', value);
                return 0;
            }

            value = $scope.exact(value);

            if (isDown) {
                return Math.floor(value * 100) / 100;
            } else {
                return Math.round(value * 100) / 100;
            }
        };

        $scope.fillRefundFields = function (debtor, refund) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                sponsor = currentAccount.participants[refund.number],
                value = $scope.getRest(sponsor, debtor).rest;

            refund.value = (debtor.meta.fullBalance < 0 && value > 0) ? value : null;
            refund.currency = $scope.getRest(sponsor, debtor).currency;
        };

        $scope.formatDate = function (value, type) {
            var dateReformater = function(reformatValue) {
                return (reformatValue < 10) ? '0' + reformatValue : reformatValue;
            }

            if (value) {
                value = new Date(value);
                switch(type) {
                    case 1:
                        return value.getFullYear();
                    case 2:
                        return (value.getMonth() + 1) + '-' + dateReformater(value.getDate());
                    case 3:
                        return value.getHours() + ':' + dateReformater(value.getMinutes());

                    default:
                        return value.toLocaleString();
                }

            } else {
                return '';
            }
        };

        $scope.isAllRefundsFixed = function (participant) {
            var result = true;

            participant.fixation.whom.forEach(function(refund, i, arr) {
                result = result && refund.isFixed;
            });

            return result;
        };

        $scope.checkRefundFields = function (refund, participant) {
            if (refund.number == null || refund.value == null || refund.currency == null) {
				refund.isFixed = false;
			} else {
				$scope.uploadData();
			}

            $scope.checkAllFixedRefunds(participant);
        };

        $scope.checkPartList = function (partList, extParticipantIndex) {
            var isValid = false;

            partList.forEach(function(checked, i, arr) {
                isValid = isValid || checked;
            });

            if (!isValid) {
                partList[extParticipantIndex] = true;
                alert('Нельзя отменить участие в одном и том же расходе для всех участников');
            } else {
                $scope.uploadData();
            }
        };

        $scope.isExpensesTypeUsed = function (typeIndex) {
            var message, errorAccountTitle, errorParticipantTitle, expensesTypeError;
            var result = '',
                errors = [],
                tempArr = [],
                removableType = $scope.expCalc.settings.expensesTypes[typeIndex].name;

            $scope.expCalc.accounts.forEach(function(account, accountIndex, accountArr) {
                errorAccountTitle = '\n[ ' + account.meta.title + '; ';

                account.participants.forEach(function(participant, participantIndex, participantArr) {
                    errorParticipantTitle = participant.meta.title + ' ]\n';
                    tempArr = [];
                    expensesTypeError = '- Тип "' + removableType + '" используется в расходах:\n';


                    participant.expenses.forEach(function(expense, expenseIndex, expenseArr) {
                        if (expense.type == typeIndex) tempArr.push(expense.title);
                    });

                    if (tempArr.length) {
                        message = errorAccountTitle + errorParticipantTitle + expensesTypeError + tempArr.join('; ');

                        errors.push(message);
                    }
                });

            });

            if (errors.length) {
                result = 'Тип "' + removableType + '" не может быть удален по следующим причинам:\n' + errors.join('\n');
            }

            return result;
        };

        $scope.isCurrencyUsed = function (currencyIndex) {
            var message, errorAccountTitle, errorParticipantTitle, preferredCurrencyError, whomCurrencyError, expensesError;
            var result = '',
                errors = [],
                tempArr = [],
                removeCurrency = $scope.expCalc.settings.currencies.names[currencyIndex].toUpperCase();

                $scope.expCalc.accounts.forEach(function(account, i, arr) {
                if (currencyIndex == account.settings.accountCurrency) tempArr.push(account.meta.title);
            });

            if (tempArr.length) {
                result = 'Валюта ' + removeCurrency + ' используется как основная в расчетах:\n';
                result += tempArr.join('; ');
                result += '\n';
            }

            // Валюта ААА не может быть удалена по следующим причинам:

            // [Расчет 1; Участник 0.0]
            // - Предпочитает валюту ААА
            // - Вернул долг в валюте ААА
            // - Валюта ААА используется в расходах:
            // Расход 0.0.0; Расход 0.0.2;


            // var expensesArr = [];

            $scope.expCalc.accounts.forEach(function(account, accountIndex, accountArr) {
                errorAccountTitle = '\n[ ' + account.meta.title + '; ';

                account.participants.forEach(function(participant, participantIndex, participantArr) {
                    errorParticipantTitle = participant.meta.title + ' ]\n';
                    tempArr = [];
                    preferredCurrencyError = '';
                    whomCurrencyError = '';
                    expensesError = '- Валюта ' + removeCurrency + ' используется в расходах:\n';

                    if (participant.meta.preferredCurrency == currencyIndex) {
                        preferredCurrencyError = '- Предпочитает валюту ' + removeCurrency + '\n';
                    }
                    participant.fixation.whom.forEach(function(whom, whomIndex, whomArr) {
                        if (whom.currency == currencyIndex) {
                            whomCurrencyError = '- Вернул долг напрямую в валюте ' + removeCurrency + '\n';
                        }
                    });
                    participant.expenses.forEach(function(expense, expenseIndex, expenseArr) {
                        if (expense.currency == currencyIndex) {
                            tempArr.push(expense.title);
                        }
                    });

                    if (preferredCurrencyError || whomCurrencyError || tempArr.length) {
                        message = errorAccountTitle + errorParticipantTitle + preferredCurrencyError + whomCurrencyError;

                        if (tempArr.length) message += expensesError + tempArr.join('; ');

                        errors.push(message);
                    }
                });
            });

            if (result || errors.length) {
                result = 'Валюта ' + removeCurrency + ' не может быть удалена по следующим причинам:\n' + result + errors.join('\n');
            }

            return result;
        };

        $scope.werePaymentsFromParticipant = function(verifiableParticipantIndex) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                verifiableParticipant = currentAccount.participants[verifiableParticipantIndex];
            var result = false,
                givenPaymentError = '',
                receivedPaymentError = '',
                calculationByBank = '';

            currentAccount.participants.forEach(function(participant, participantIndex, participantArr) {
                if (participantIndex == verifiableParticipantIndex && participant.fixation.whom.length) {
                    givenPaymentError = '- ' + participant.meta.title + ' сделал взносы (расчет напрямую);\n';
                }
                
                participant.fixation.whom.forEach(function(whom, whomIndex, whomArr) {
                    if (whom.number == verifiableParticipantIndex) {
                        receivedPaymentError += '- ' + verifiableParticipant.meta.title + ' получил взнос от ' + participant.meta.title + ';\n';
                    }
                });
            });

            currentAccount.participants.forEach(function(participant, participantIndex, participantArr) {
                if (participantIndex == verifiableParticipantIndex && participant.fixation.byBank.length) {
                    calculationByBank = '- ' + participant.meta.title + ' участвует в расчетах через общий банк;\n';
                }
            });

            if (givenPaymentError || receivedPaymentError) {
                result = 'Невозможно удалить участника по следующим причинам:\n' + givenPaymentError + receivedPaymentError + calculationByBank;
            }

            return result;
        };

        $scope.updatePaymentsFromParticipant = function(verifiableParticipantIndex) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            currentAccount.participants.forEach(function(participant, participantIndex, participantArr) {
                participant.fixation.whom.forEach(function(whom, whomIndex, whomArr) {
                    if (whom.number > verifiableParticipantIndex) --whom.number;
                });
            });
        };

        $scope.checkPaymentByBank = function (byBankObject) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            if (!byBankObject.isFixed) {
				$scope.uploadData();
				return;
			}

            if (byBankObject.value <= 0) {
                byBankObject.isFixed = false;

                alert('Значение должно быть положительным');
            } else {
				if (byBankObject.token > 0 && byBankObject.value > currentAccount.meta.bank) {
					byBankObject.isFixed = false;

					alert('В банке ' + currentAccount.meta.bank + ' ' + $scope.getAccountCurrency() + ', сейчас вы можете получить только этот максимум');

					byBankObject.value = currentAccount.meta.bank;
				} else {
					$scope.uploadData();
				}
			}
        };

        $scope.today = function () {
            return $scope.formatDate('' + new Date());
        };

        $scope.updateCurrencies = function (tryNumber) {
            var rows, currentCurrencies, exactRate, currenciesNames, currenciesByUSD;
            var surchargePercent = $scope.expCalc.settings.currencies.commonSurcharge;
            var table = document.getElementById('currenciesTable').querySelectorAll('table')[0];

            if (!table) {
                if (tryNumber) { // чтобы сразу загрузить актуальные курсы, когда пользователь впервые зашел
                    if (tryNumber < 20) setTimeout(function() {
                        $scope.updateCurrencies(++tryNumber);
                    }, 500); // попытки через каждые n секунды, но не бесконечно

                    return;
                } else {
                    if (isWebVersion) {
                        alert('Не удалось получить данные. Отсутствует таблица с курсами.\nПопробуйте обновить страницу.');
                    } else {
                        alert('Не удалось получить данные. Отсутствует таблица с курсами.\nПроверьте соединение с интернетом и попробуйте перезапустить приложение.');
                    }
                    return;
                }
            }

            rows = table.querySelectorAll('tr');
            currentCurrencies = $scope.expCalc.settings.currencies;
            currenciesNames = [];
            currenciesByUSD = [];

            currentCurrencies.names.forEach(function(currencyName, i, arr) {
                currenciesNames.push(currencyName.split(' ')[0].toUpperCase());
            });

            forEach(rows, function(row, i) {
                var tds = row.querySelectorAll('td');

                currenciesNames.forEach(function(currency, j) {
                    if (tds[0].innerHTML.indexOf(currency) != -1) {
                        currenciesByUSD.push({
                            name: currency,
                            value: tds[1].innerHTML.replace(',', '.')
                        });
                    }
                });
            });

            currenciesNames.forEach(function(currencyName, i) {
                var baseValue;

                currenciesByUSD.forEach(function(currencyObj, n) {
                    if (currencyObj.name == currencyName) baseValue = currencyObj.value;
                });

                if (baseValue) currenciesNames.forEach(function(comparableCurrency, j) {
                    var byValue, digitsNumber, capacity = 1;

                    currenciesByUSD.forEach(function(currencyObj, n) {
                        if (currencyObj.name == comparableCurrency) byValue = currencyObj.value;
                    });

                    if (byValue) {
                        digitsNumber = (byValue.toString().length > baseValue.toString().length) ? byValue.toString().length : baseValue.toString().length;
                        for (var m = 0; m < digitsNumber; m++) capacity *= 10;

                        exactRate = byValue / baseValue;
                        currentCurrencies.rates[j][i] = (currencyName == comparableCurrency) ?
                            1 : Math.round(capacity * exactRate * (1 + (surchargePercent / 100))) / capacity;
                    }
                });
            });

			$scope.uploadData(true);

        };

        $scope.completedDetails = function (expense) {
            var result = !!expense.details.length;

            expense.details.forEach(function(detail, index, arr) {
                result *= detail.isChecked;
            });

            return result;
        };

        $scope.openCurrentAccount = function (index) {
            if (index === $scope.expCalc.settings.currentAccount) return false;

            $scope.layout.isDataUpdating = true;

            $timeout(function () {
                $scope.expCalc.settings.currentAccount = index;
            }, 10);
        };

        $scope.stopEvents = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };

        $scope.checkAllFixedRefunds = function(participant) {
            var index = 0;
            var areNotAllRefundsFixed = false;

            while(index < participant.fixation.whom.length) {
                if (participant.fixation.whom[index].isFixed) {
                    index++;
                } else {
                    areNotAllRefundsFixed = true;
                    index = participant.fixation.whom.length;
                }
            }

            participant.meta.areNotAllRefundsFixed = areNotAllRefundsFixed;
        };

        $scope.autoPaymentsFixation = function() {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];
            var currentParticipantNumber = 0;
            var currentRefunds = {
                participantIndex: [],
                whomIndex: []
            };
            var hasUncheckedCurrentRefunds = false;
            var qty = 0;
            var delay, refund, whomIndex, checkNextParticipant;

            var uncheckedCurrentRefunds = function() {
                currentRefunds.participantIndex.forEach(function (participantIndex, i, arr) {
                    currentAccount.participants[participantIndex].fixation.whom[currentRefunds.whomIndex[i]].isFixed = false;
                });
            }

            var focusOnRefund = function(participantNumber) {
                var participant = document.getElementById('participant.3.' + participantNumber);
                var items = participant.querySelectorAll('input[type="checkbox"]');
                var focusedItem = items[items.length - 1];

                focusedItem.focus();
            }

            var endProcess = function(hasAlert) {
                uncheckedCurrentRefunds();
                $scope.uploadData();

                $timeout(function () {
                    $scope.layout.isCalcUpdating = false;
                    document.getElementById('autoRefunds').focus();
                    if (hasAlert) alert('Автоматическое распределение возвратов выполнено успешно! Зафиксируйте их после того как должники вернут указанные суммы.');
                }, 200);
            }

            var fixRefund = function(participantIndex) {
                var participant = currentAccount.participants[participantIndex];
                var partRefundSponsorIndex = -1;
                var fullRefundSponsorIndex = -1;

                qty++;
                delay = 200 + (1000 / qty);

                if (qty > 100)  {
                    alert('Слишком большое количество взносов в автоматическом режиме. Пожалуйста, зафиксируйте текущие возвраты, а остальные взносы добавьте самостоятельно.');
                    endProcess(false);
                    return false;
                }

                currentAccount.participants.forEach(function (sponsor, i, arr) {
                    var sponsorRest = $scope.getRest(sponsor, participant).rest;
                    var participantFullBalance = $scope.getParticipantFullBalance(participant, participantIndex, false);

                    if (participantFullBalance < 0 && sponsorRest > 0 && participantIndex != i) {
                        if (-participantFullBalance <= sponsorRest) {
                            fullRefundSponsorIndex = (fullRefundSponsorIndex == -1) ? i : fullRefundSponsorIndex;
                        } else {
                            partRefundSponsorIndex = (partRefundSponsorIndex == -1) ? i : partRefundSponsorIndex;
                        }
                    }
                });

                if (partRefundSponsorIndex != -1 || fullRefundSponsorIndex != -1) {
                    $scope.addNewPayment(participant);
                    whomIndex = participant.fixation.whom.length - 1;
                    refund = participant.fixation.whom[whomIndex];
                    refund.number = (fullRefundSponsorIndex >= 0) ? fullRefundSponsorIndex.toString() : partRefundSponsorIndex.toString();
                    refund.currency = currentAccount.participants[refund.number].meta.preferredCurrency;
                    $scope.fillRefundFields(participant, refund);
                    refund.isFixed = true;

                    currentRefunds.participantIndex.push(participantIndex);
                    currentRefunds.whomIndex.push(whomIndex);

                    $timeout(function () {
                        focusOnRefund(participantIndex);
                    }, 100);
                }

                currentParticipantNumber++;

                checkNextParticipant = true;
                while (checkNextParticipant && currentParticipantNumber < currentAccount.participants.length) {
                    var nextParticipantFullBalance = $scope.getParticipantFullBalance(currentAccount.participants[currentParticipantNumber], currentParticipantNumber, false);

                    if (nextParticipantFullBalance >= 0) {
                        currentParticipantNumber++;

                        if (currentParticipantNumber < currentAccount.participants.length) checkNextParticipant = false;
                    } else {
                        checkNextParticipant = false;
                    }
                }

                if (currentParticipantNumber < currentAccount.participants.length) {
                    $timeout(function () {
                        fixRefund(currentParticipantNumber);
                    }, delay);
                } else {
                    if (currentAccount.meta.negBalance != 0 && currentAccount.meta.posBalance != 0) {
                        currentParticipantNumber = 0;

                        $timeout(function () {
                            fixRefund(currentParticipantNumber);
                        }, delay);
                    } else {
                        endProcess(true);
                    }
                }
            }

            currentAccount.participants.forEach(function (participant, i, arr) {
                hasUncheckedCurrentRefunds = (participant.meta.areNotAllRefundsFixed) ? true : hasUncheckedCurrentRefunds;
            });

            if (hasUncheckedCurrentRefunds) {
                alert('Нельзя воспользоваться автоматическим распределением возвратов. Сперва зафиксируйте текущие взносы.');
                return false;
            }

            $scope.layout.isCalcUpdating = true;

            $scope.layoutControl.collapseAllBodiesView(3, 'window-3');
            currentAccount.participants.forEach(function (participant, i, arr) {
                if ($scope.getParticipantFullBalance(participant, i, false) < 0) $scope.layoutControl.toggleBodyView(3, 'participant.3.' + i);
            });

            fixRefund(currentParticipantNumber);
        }











        $scope.$watch('expCalc', function (newValue, oldValue) {
            if ($scope.layout.isDataUpdating) { // необходимо для показа спиннера пока весь дом не обновится
                $timeout(function () {
                    $scope.layout.isDataUpdating = false;
                }, 100);
            }
        }, true);

        // $scope.$watch('expCalc', function (newValue, oldValue) {
        //    localStorage.setItem('costpanel.info', JSON.stringify(newValue));
        //
        //
			// if (document.getElementById('testing')) {
			// 	document.getElementById('testing').innerHTML = JSON.stringify(newValue)
			// 		.replace(/\[/g, "[<div>").replace(/]/g, "</div>]")
			// 		.replace(/{/g, "{<div>").replace(/}/g, "</div>}")
			// 		.replace(/,/g, ",<hr>").replace(/:/g, ": ")
			// 		.replace(/},<hr>{/g, "},{").replace(/],<hr>\[/g, "],[")
			// 		.replace(/],\[/g, "<ar>],[</ar>").replace(/},{/g, "<arr>},{</arr>")
			// 		.replace(/Участник/g, "<b>Участник</b>")
			// 		.replace(/"participants": \[/g, "<b>\"participants\": [</b>")
			// 		.replace(/"currencies": {<div>/g, "\"currencies\": {<div class='compressed'>")
			// 		.replace(/"expensesTypes": \[<div>/g, "\"expensesTypes\": [<div class='compressed'>");
        //
			// 	// this forEach of querySelectorAll isn't supported on IE10
			// 	document.getElementById('testing').querySelectorAll('div').forEach(function (item, i) {
			// 		item.addEventListener('click', function (e) {
			// 			e.stopPropagation();
			// 			e.target.classList.toggle('compressed');
			// 		});
			// 	});
			// }
        // }, true);

        $scope.copyToBufferByID = function (id, counter) {
            var selectedObject;
            var objectDiv = document.getElementById(id);
            var range = document.createRange();
            range.selectNode(objectDiv);
            var selection = window.getSelection();
            selection.addRange(range);

            counter = (counter) ? counter + 1 : 1;

            try {
                // Теперь, когда мы выбрали текст ссылки, выполним команду копирования
                var successful = document.execCommand('copy');
                var msg = successful ? 'успешно' : 'неудачно';
                selectedObject = selection.toString();

                msg = (selectedObject.length) ? msg : 'неудачно. Повторите попытку копирования';
                console.info('Объект скопировался ' + msg + ': ' + selectedObject);
            } catch(err) {
                alert('Проблема с копированием: попробуйте самостоятельно скопировать текст ссылки');
            }

            // Снятие выделения - ВНИМАНИЕ: вы должны использовать
            // removeRange(range) когда это возможно
            window.getSelection().removeAllRanges();
            // window.getSelection().removeRange(range);
            selection.removeAllRanges();

            if (!selectedObject.length && counter < 4) $scope.copyToBufferByID(id, counter);
        };


        $scope.expCalc = getDataService;

        if (isWebVersion) { // если это сайт, то использовать этот подход:
            $scope.expCalc.meta.userID = userID;
            $scope.expCalc.meta.userKey = userKey;
            $scope.expCalc.meta.userName = getUserNameObject(userName).name;
            $scope.expCalc.meta.userInitials = getUserNameObject(userName).initials;
            $scope.expCalc.meta.isViewMode = !!window.viewModeAccountID;
        }

        if ($scope.expCalc.meta.isViewMode) {
            var onlyAccount;
            var serverDataScript = document.getElementById('serverDataScript');

            serverDataScript.parentNode.removeChild(serverDataScript);

            forEach($scope.expCalc.accounts, function (account, i, arr) {
                if (viewModeAccountID == account.meta.id) {
                    onlyAccount = account;
                }
            });

            $scope.expCalc.settings.currentAccount = 0;
            $scope.expCalc.accounts = [];
            if (onlyAccount) {
                $scope.expCalc.accounts.push(onlyAccount);
                $scope.expCalc = $scope.getEmptyUserDataObject();
            }
        } else {
            if (!$scope.expCalc.accounts.length) {
                $scope.createAccount();
                $scope.updateCurrencies(1);
            }

            if ($scope.expCalc.meta.userID && !fromServerData) { // для правильного сохранения данных (иначе массив accounts пустой)
                $scope.layout.isChangedObject = true;
                $scope.uploadData(true, true);
            }

            if (!isWebVersion && $scope.expCalc.meta.userID > 0) { // если это приложение и userID > 0 то синхронизтровать данные (с сервера или localStorage)
                getUserDataForApp($scope, 'userID=' + $scope.expCalc.meta.userID + '&userKey=' + $scope.expCalc.meta.userKey, true);
            }

            if (isFirstVisit) {
                $scope.layoutControl.openNavMenuFirstSection('aboutService');
                if (isWebVersion) $scope.layout.openGuidePopup(true); // если это сайт, то открывать попап с демо
            }
        }
    }];

    module.controller('calculatorCtrl', calculatorCtrl);

}(angular.module('app')));


(function (module) {

    var getDataService = function () {
        var currencies, expensesTypes, expensesCalc;

		var fromLocalStorage = (localStorage.getItem('costpanel.info')) ? JSON.parse(localStorage.getItem('costpanel.info')) : false;

        try {
            fromServerData = (fromServerData) ? JSON.parse(fromServerData) : false;

            //if (!fromLocalStorage && !fromServerData) window.location.href = '/info';
        } catch (err) {
            fromServerData = false;
            console.error('Данные от сервера повреждены, поэтому используются локальные данные!');
        }

		if (!fromServerData.accounts) {
			fromServerData = false; // если не весь объект сохранился на сервере, то брать надо из localStorage
		}

		if (fromServerData.meta && fromLocalStorage.meta && fromServerData.meta.userID === fromLocalStorage.meta.userID) {
			if (fromServerData.meta.savedDate > fromLocalStorage.meta.savedDate) {
				return fromServerData;
			} else {
				return fromLocalStorage;
			}
		}

		if (fromServerData.meta) return fromServerData;

		if (fromLocalStorage.meta) {
		    if (isWebVersion && fromLocalStorage.meta.userID > 0) { // isWebVersion == true ---> это веб-сайт и если с сервера не пришли данные, значит юзер вылогинился и его данные надо стереть
                return getNewExpensesCalc();
            } else {
                return fromLocalStorage;
            }
        }

        isFirstVisit = true;

        return getNewExpensesCalc(true);
    };

    module.factory('getDataService', getDataService);

}(angular.module('app')));
