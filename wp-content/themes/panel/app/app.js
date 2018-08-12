var uploadData, loadData, layoutControl;

function forEach(elements, callback) {
	Array.prototype.forEach.call(elements, callback);
};



(function () {
    'use strict';
    angular.module('app', []);
})();

(function (module) {

    var calculatorCtrl = ['$scope', 'getDataService', function ($scope, getDataService) {

        // WORKING WITH LAYOUT ==============================

		$scope.layout = {
			isOpenMenu: false,
			isOpenAside: false,
			isEditAccountsMode: false,
            isRemoveMode: false,
            isPrintMode: false,
			activeWindow: 3,

            openMenu: function() {
                this.isOpenMenu = true;
                this.isOpenAside = false;
            },
			openAside: function() {
				this.isOpenAside = !this.isOpenAside;

				if (this.isOpenAside) {
					this.isOpenMenu = false;
					this.isEditAccountsMode = false;
				}
			}
		};

		layoutControl = {
			navBody: document.getElementById('navBody'),

			init: function () {
				this.navMenuInit();
			},
			navMenuInit: function() {
				var self = this;
				var dataNextButtons = self.navBody.querySelectorAll('[data-next]');
				var dataPreviousButtons = self.navBody.querySelectorAll('[data-previous]');

				var activateMenu = function(menu) {
					self.navBody.querySelectorAll('.active')[0].classList.remove('active');
					menu.classList.add('active');
				}

				forEach(dataNextButtons, function(button, i, arr) {
					button.addEventListener('click', function() {
						var section = button.nextElementSibling;

						if (section) {
							section.classList.add('open');
							activateMenu(section);

							setTimeout(function() {
								var firstButton = section.querySelectorAll('button')[0];

								if (firstButton) firstButton.focus();
							}, 220);
						}
					});
				});

				forEach(dataPreviousButtons, function(button, i, arr) {
					button.addEventListener('click', function() {
						var activeSection = button.parentNode.parentNode;

						activateMenu(activeSection);
						forEach(activeSection.querySelectorAll('.open'), function(section, i, arr) {
							section.classList.remove('open');
						});
					});
				});
			},
            collapseAllBodiesView: function(elm) {
                var bodyArr = elm.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.open-body');   //.classList.remove('open-body');

                forEach(bodyArr, function(body, i, arr) {
                    body.classList.remove('open-body');
                });
            },
            toggleBodyView: function(elm) {
                elm.parentNode.parentNode.parentNode.parentNode.classList.toggle('open-body');
            },
            toggleDetailsView1: function(elm) {
                elm.parentNode.parentNode.parentNode.parentNode.classList.toggle('open-details');
            }
		};

        layoutControl.init();







		// WORKING WITH DATA TO UPLOAD/DOWNLOAD ==============================

        var updateUploadStatus = function(status) {
            // 0 - pending
            // 1 - success
            // 2 - failure
            document.getElementById('body').setAttribute('data-upload-status', status);
        };

        loadData = function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function(event) {
                try {
                    var newExpCalc = JSON.parse(event.target.result);
                    var question = confirm('Загружаемые данные были созданы: ' + $scope.formatDate(newExpCalc.meta.savedDate) +
                    '\nВы действительно хотите заменить текущие данные на новые?');

                    if (question) {
                        $scope.expCalc = newExpCalc;
                        $scope.$apply();
                        alert('Новые данные загружены успешно!');
                    }
                } catch (err) {
                    alert('ОШИБКА: Файл данных повреждён!');
                }
            };

            reader.readAsText(file);

            event.target.value = '';
        };

		uploadData = function (isFullObject) {
			var xhr, localStringJSON, serverStringAccountJSON, currentAccountNumber;

			currentAccountNumber = $scope.expCalc.settings.currentAccount;

			xhr = new XMLHttpRequest();
			localStringJSON = JSON.stringify($scope.expCalc);
			serverStringAccountJSON = JSON.stringify($scope.expCalc.accounts[currentAccountNumber]);

			localStorage.setItem('expensesCalc', localStringJSON);
console.log('Именно здесь поставить setTimeout на отправку данных');
			updateUploadStatus(0);

			xhr.open("POST", '/send.php', true);
			xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

			xhr.onreadystatechange = function() {
				if (this.readyState != 4) return;

				if (xhr.status != 200) {
					console.error( '!!! We have a problem: ' + xhr.status + ': ' + xhr.statusText );
                    updateUploadStatus(2);
				} else {
					console.info( 'We have received a response: ' + xhr.responseText ); // responseText -- текст ответа.
                    updateUploadStatus(1);
				}
			};

			xhr.send( (isFullObject) ? localStringJSON : serverStringAccountJSON );
		};

		$scope.downloadData = function () {
            var blob = new Blob([JSON.stringify($scope.expCalc)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "CostPanel-" + $scope.expCalc.meta.savedDate + ".txt");
        };










        // METHODS OF CREATING ==============================
        $scope.createAccount = function () {
            var accounts = $scope.expCalc.accounts;
            var accountIndex = accounts.length;
            var newAccount = {
                settings: {
                    accountCurrency: $scope.expCalc.settings.baseCurrency,
                    fixationDirectly: true
                },
                meta: {
					index: accountIndex,
                    title: 'Новый расчет ' + accountIndex,
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
                    title: 'Участник ' + $scope.expCalc.settings.currentAccount + '.' + participantIndex,
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
                    byBank: [], // it will be added objects: { value: null, reserve: null, date: null} (participants can return money by some parts)
                    reserve: 0
                }
            };

            currentAccount.participants.push(newParticipant);

            $scope.addParticipantToPartList();

			uploadData(updateFullDataOnServer);
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

				uploadData(true);
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

				uploadData(true);
            }
        };

        $scope.removeCurrentAccount = function (removedAccountIndex) {
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

			uploadData(true);
        };

        $scope.removeParticipant = function (participantIndex) {
            var accountIndex = $scope.expCalc.settings.currentAccount,
                error = $scope.werePaymentsFromParticipant(participantIndex);

            if (error) {
                alert(error);
            } else {
                $scope.expCalc.accounts[accountIndex].participants.splice(participantIndex, 1);
                $scope.removeParticipantFromPartList(participantIndex);

				uploadData();
            }
        };

        $scope.removeExpense = function (participantIndex, expenseIndex) {
            var accountIndex = $scope.expCalc.settings.currentAccount;

            $scope.expCalc.accounts[accountIndex].participants[participantIndex].expenses.splice(expenseIndex, 1);

			uploadData();
        };

        $scope.removeDetailsFromExpense = function (expense, detailIndex) {
            expense.details.splice(detailIndex, 1);

            uploadData();
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

			uploadData();
        };

        $scope.removePaymentByBank = function (participant, byBankObjectIndex) {
            participant.fixation.byBank.splice(byBankObjectIndex, 1);

			uploadData();
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
                rateArr.push(null);
                newRateArr.push(null);
            });
            newRateArr.push(null);

            $scope.expCalc.settings.currencies.rates.push( newRateArr );
        };

        $scope.addNewExpense = function (participant, participantIndex) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];
            var accountIndex = $scope.expCalc.settings.currentAccount;
            var expenseIndex = participant.expenses.length;
            var newExpense = {
                title: 'Расход ' + accountIndex + '.' + participantIndex + '.' + expenseIndex,
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

            return $scope.expCalc.settings.currencies.names[currentAccount.settings.accountCurrency].toUpperCase();
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
            currentAccount.participants[extParticipantIndex].meta.share = $scope.exact(participantShare);

            return participantShare;
        };

        $scope.getShareTotal = function () {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                shareTotal = 0;

            currentAccount.participants.forEach(function (participant, i, arr) {
                shareTotal += currentAccount.participants[i].meta.share;
            });

            return shareTotal;
        };

        $scope.getFullRefund = function () {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];
            var balance, fullRefund = 0;

            currentAccount.participants.forEach(function (participant, i, arr) {
                balance = participant.meta.total - participant.meta.share;
                fullRefund += (balance < 0) ? balance : 0;
            });

            currentAccount.meta.fullRefund = $scope.exact(fullRefund);

            return fullRefund;
        };

        $scope.getBalance = function (participant) {
            participant.meta.balance = $scope.exact(participant.meta.total - participant.meta.share);

            return participant.meta.balance;
        };

        $scope.getParticipantOption = function (sponsor, debtor) {
            var currencyNumber, option = sponsor.meta.title;
            var rest = $scope.getRest(sponsor, debtor).rest;

            // if (debtor.meta.balance < 0 &&
            //     $scope.roundOff(sponsor.meta.balance - sponsor.meta.receivedSum) > 0 &&
            //     $scope.roundOff(debtor.meta.balance + debtor.meta.givenSum) < 0) {
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
                        participant.meta.receivedSum += $scope.roundOff($scope.getMoneyByAccountCurrency(refund.value, refund.currency), true);
                    }
                });
            });

            participant.meta.receivedSum = $scope.roundOff(participant.meta.receivedSum);

            return participant.meta.receivedSum;
        };

        $scope.getGivenSum = function (participant) {
            participant.meta.givenSum = 0;

            participant.fixation.whom.forEach(function(refund, i, arr) {
                if (refund.isFixed && refund.number !== null && refund.currency !== null) {
                    participant.meta.givenSum += $scope.roundOff($scope.getMoneyByAccountCurrency(refund.value, refund.currency), true);
                }
            });

            participant.meta.givenSum = $scope.roundOff(participant.meta.givenSum);

            return participant.meta.givenSum;
        };

        $scope.getRest = function (sponsor, debtor) {
            var sponsorWillReceive, debtorWillGive, preferredCurrencyRest, accountCurrencyRest;
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount],
                accountCurrency = currentAccount.settings.accountCurrency,
                isRoundDown = (sponsor.meta.preferredCurrency != accountCurrency);

            // sponsorWillReceive = sponsor.meta.balance - sponsor.meta.receivedSum;
            // debtorWillGive = Math.abs(debtor.meta.balance + debtor.meta.givenSum);
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
            if (value) {
                value = new Date(value);

                switch(type) {
                    case 1:
                        return value.getFullYear();
                    case 2:
                        return (value.getMonth() + 1) + '-' + value.getDate();
                    case 3:
                        return value.getHours() + ':' + value.getMinutes();

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

        $scope.checkRefundFields = function (refund) {
            if (refund.number == null || refund.value == null || refund.currency == null) {
				refund.isFixed = false;
			} else {
				uploadData();
			}
        };

        $scope.checkPartList = function (partList, extParticipantIndex) {
            var isValid = false;

            partList.forEach(function(checked, i, arr) {
                isValid = isValid || checked;
            });

            if (!isValid) {
                partList[extParticipantIndex] = true;
                alert('Нельзя отменить участие в одном и том же расходе для всех участников');
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

        $scope.checkPaymentByBank = function (byBankObject) {
            var currentAccount = $scope.expCalc.accounts[$scope.expCalc.settings.currentAccount];

            if (!byBankObject.isFixed) {
				uploadData();
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
					uploadData();
				}
			}
        };

        $scope.today = function () {
            return $scope.formatDate('' + new Date());
        };

        $scope.updateCurrencies = function () {
            var rows, currentCurrencies, exactRate;
            var surchargePercent = $scope.expCalc.settings.currencies.commonSurcharge;
            var table = document.getElementById('currenciesTable').querySelectorAll('table')[0];

            if (!table) {
                alert('Не удалось получить данные');
                return;
            }

            rows = table.querySelectorAll('tr');
            currentCurrencies = $scope.expCalc.settings.currencies;
            currenciesNames = [];
            currenciesByUSD = [];

            currentCurrencies.names.forEach(function(currencyName, i, arr) {
                currenciesNames.push(currencyName.split(' ')[0].toUpperCase());
            });

            rows.forEach(function(row, i) {
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

			uploadData(true);
        };

        $scope.completedDetails = function (expense) {
            var result = !!expense.details.length;

            expense.details.forEach(function(detail, index, arr) {
                result *= detail.isChecked;
            });

            return result;
        };









        // $scope.$watch('expCalc', function (newValue, oldValue) {
        //    localStorage.setItem('expensesCalc', JSON.stringify(newValue));
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

        // $scope.copyObjectToBuffer = function () {
        //     var objectDiv = document.getElementById('angularObject');
        //     var range = document.createRange();
        //     range.selectNode(objectDiv);
        //     var selection = window.getSelection();
        //     selection.addRange(range);
        //
        //     try {
        //         // Теперь, когда мы выбрали текст ссылки, выполним команду копирования
        //         var successful = document.execCommand('copy');
        //         var msg = successful ? 'УСПЕШНО' : 'ПЛОХО!!!';
        //         var selectedObject = selection.toString();
        //
        //         msg = (selectedObject.length) ? msg : 'неудачно. Повторите попытку копирования';
        //         alert('Объект скопировался ' + msg + ': ' + selectedObject);
        //     } catch(err) {
        //         alert('Проблема с копированием');
        //     }
        //
        //     // Снятие выделения - ВНИМАНИЕ: вы должны использовать
        //     // removeRange(range) когда это возможно
        //     window.getSelection().removeAllRanges();
        //     // window.getSelection().removeRange(range);
        //     selection.removeAllRanges();
        // };


        $scope.expCalc = getDataService;

        if (!$scope.expCalc.accounts.length) $scope.createAccount();
    }];

    module.controller('calculatorCtrl', calculatorCtrl);

}(angular.module('app')));


(function (module) {

    var getDataService = function () {
        var currencies, expensesTypes, expensesCalc;

		var fromLocalStorage = (localStorage.getItem('expensesCalc')) ? JSON.parse(localStorage.getItem("expensesCalc")) : false;
		fromServerData = (fromServerData) ? JSON.parse(fromServerData) : false;

		if (!fromServerData.accounts) {
			fromServerData = false; // если не весь объект сохранился на сервере, то брать надо из localStorage
		}

		if (fromServerData.meta && fromLocalStorage.meta) {
			if (fromServerData.meta.savedDate > fromLocalStorage.meta.savedDate) {
				return fromServerData;
			} else {
				return fromLocalStorage;
			}
		}

		if (fromServerData.meta) return fromServerData;

		if (fromLocalStorage.meta) return fromLocalStorage;

		currencies = {
			names: ['usd', 'eur', 'rub', 'byn'], // The currency number of 0, 1, 2 and 3
			rates: [ // Banks sell by these rates
				[1,1.1934,0.0174,0.5186], // rates of the currency number 0
				[0.8379,1,0.0146,0.4345], // rates of the currency number 1
				[57.322,68.4158,1,29.7271], // rates of the currency number 2
				[1.928,2.2963,0.0336,1] // rates of the currency number 3
			],
			commonSurcharge: 0.4
		};
		expensesTypes = [
			{name: 'Общие расходы', icon: 'donate'},
			{name: 'Продукты питания', icon: 'utensils'},
			{name: 'Жильё', icon: 'home'},
			{name: 'Машина', icon: 'car'},
			{name: 'Развлечение', icon: 'theater-masks'},
			{name: 'Другое', icon: 'shopping-cart'}
		];

		expensesCalc = {
			meta: {
				savedDate: 0
			},
			settings: {
				currentAccount: 0,
				currencies: currencies,
				baseCurrency: '3', // String type is necessary for select elements - we can see a selected option by default
				expensesTypes: expensesTypes
			},
			accounts: []
		};

		localStorage.setItem('expensesCalc', JSON.stringify(expensesCalc));


        return expensesCalc;
    };

    module.factory('getDataService', getDataService);

}(angular.module('app')));