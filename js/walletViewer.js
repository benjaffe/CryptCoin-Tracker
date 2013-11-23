
var sampleWallet = {
	'BTC':[
		{
			'buyDate': '2013-11-11T18:15:00.956Z',
			'amount': 1,
			'purchasePriceInUSD': 349.97,
			'notes': 'The first transaction'
		},
		{
			'buyDate': '2013-11-17T19:13:00.956Z',
			'amount': 2,
			'purchasePriceInUSD': 500.94,
			'notes': 'The second transaction!'
		},
		{
			'buyDate': '2013-11-20T9:19:00.956Z',
			'amount': 1,
			'purchasePriceInUSD': 622.17,
			'notes': 'The first part of the big transaction'
		},
		{
			'buyDate': '2013-11-20T9:19:30.956Z',
			'amount': 6.5003,
			'purchasePriceInUSD': 626.02,
			'notes': 'The rest of the big transaction!'
		}
	]
};

var storage = function(key, value) {
	//make a wallet storage if none exists
	if (!localStorage.walletSettings) {
		localStorage.walletSettings = JSON.stringify({});
		console.log('no wallet - creating one');
		return false;
	}
	
	//get storage
	var storage = JSON.parse(localStorage.walletSettings);

	//set key if applicable
	if (value !== undefined) {
		storage[key] = value;
		localStorage.walletSettings = JSON.stringify(storage);
		// console.log(key + ' set to ' + value);
	}

	//return key if it exists
	if (!!storage[key]) {
		// console.log('key returning');
		return storage[key];
	} else {
		return false
	}
};



function WalletCtrl($scope) {
	$scope.wallet = sampleWallet;
	$scope.priceHistory = {};
	$scope.coinExchangeRates = {
		'USD':1,
		'BTC':{},
		'mBTC':{}
	};
	$scope.selectedExchange = storage('selectedExchange') || 'BTCEUSD';
	$scope.selectedCoin = storage('selectedCoin') || 'BTC';

	$scope.$watch('selectedExchange', function(newValue, oldValue) {
		console.log('hi!');
		storage('selectedExchange',newValue);
	});

	var exchangeList = ['BITSTAMPUSD','BTCEUSD','CBXUSD','MTGOXUSD'];
	// exchangeList = ['MTGOXUSD'];

	for (var i = 0; i < exchangeList.length; i++) {
		(function() {
			var exchange = exchangeList[i];
			$.getJSON('http://www.quandl.com/api/v1/datasets/BITCOIN/'+exchange+'.json?auth_token=pu9tbsQcPqrtdqtUcfi9')
				.success(function(json, textStatus) {
					$scope.$apply(function(){
						$scope.priceHistory[json.code] = json.data;
						$scope.coinExchangeRates['mBTC'][exchange] = 1000/json.data[0][7];
						$scope.coinExchangeRates['BTC'][exchange] = 1/json.data[0][7];
						// console.log($scope.coinExchangeRates['BTC']);
				});
			});
		}());
	}
	
	var refreshExchangeRates = function() {
		$.getJSON('https://coinbase.com/api/v1/prices/sell?callback=?', function(json, textStatus) {
			$scope.$apply(function(){
				// $scope.coinExchangeRates['mBTC'] = 1000/json.amount;
				// $scope.coinExchangeRates['BTC'] = 1/json.amount;
			});
		});
		setTimeout(function(){
			console.log(new Date().toTimeString().split(' ')[0] + ' - $' + $scope.totalMarketValueInUSD());
			refreshExchangeRates();
		},30000);
	};

	refreshExchangeRates();

	$scope.totalCoins = function(){
		var wallet = $scope.wallet;
		var totalCoins = 0;
		var coins;
		for (var coinType in wallet) {
			coins = wallet[coinType];
			for (var i = 0; i < coins.length; i++) {
				totalCoins += coins[i].amount;
			}
		}
		return totalCoins;
	};

	$scope.valuePerCoinInUSD = function() {
		return $scope.coinExchangeRates['USD'] / $scope.coinExchangeRates['BTC'][$scope.selectedExchange];
	};

	$scope.totalMarketValueInUSD = function(){
		// console.log($scope.coinExchangeRates[$scope.selectedCoin]);
		return $scope.totalCoins() * $scope.coinExchangeRates['USD'] / $scope.coinExchangeRates[$scope.selectedCoin][$scope.selectedExchange];
	};

	$scope.totalSpent = function() {
		var wallet = $scope.wallet;
		var totalSpent = 0;
		var coins;
		
		for (var coinType in wallet) {
			coins = wallet[coinType];
			for (var i = 0; i < coins.length; i++) {
				totalSpent += coins[i].purchasePriceInUSD * coins[i].amount;
			}
		}
		return round(totalSpent,2);
	};
}

var round = function(num, numDigits) {
	return Math.round(num * Math.pow(10,numDigits)) / Math.pow(10,numDigits);
};

