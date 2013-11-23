$(function(){
	Crypto.wallet = {
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
	}
	Crypto.init();
	// Crypto.getExchange('USD','BTC', function(data){
	// 	console.log(data.exchangeRate);
	// });
	Crypto.getCurrValue('BTC','USD');
});

var Crypto = {
	'coinValue': {

	},

	'init': function() {

		//check for stored wallet values
		if (localStorage.wallet) {
			Crypto.wallet = JSON.parse(localStorage.wallet);
		}

		var supportedCoins = ['BTC','LTC'];
		for (var i = 0; i < supportedCoins.length; i++) {
			Crypto.coinValue[supportedCoins[i]] = undefined;
		};
		Crypto.coinValue.USD = 1;
		
		//load coinbase
		$.getJSON('https://coinbase.com/api/v1/prices/sell?callback=?', function(json, textStatus) {
			Crypto.coinValue.BTC = 1/json.amount;
		});

		//load btc-e
		// $.getJSON('https://btc-e.com/api/2/btc_usd/ticker?callback=?', function(json, textStatus) {
		// 	console.log(json);
		// 	console.log(1/json.ticker.sell);
		// 	Crypto.coinValue.BTC = 1/json.ticker.sell;
		// });

		// $.ajax({
		// 	type: 'GET',
		// 	url: 'https://btc-e.com/api/2/btc_usd/ticker?callback=?',
		// 	dataType: 'jsonp',
		// 	success: function(json, textStatus) {
		// 		console.log(json);
		// 		console.log(1/json.ticker.sell);
		// 		Crypto.coinValue.BTC = 1/json.ticker.sell;
		// 	}
		// });

	},

	'getExchange': function(curr1, curr2, callback) {
		var defer = false;
		// console.error('-------------')
		// console.error(callback);
		if (!Crypto.coinValue[curr1]) {
			console.warn(curr1 + ' data is not yet loaded');
			defer = true;
		}

		if (!Crypto.coinValue[curr2]) {
			console.warn(curr2 + ' data is not yet loaded');
			defer = true;
		}
		if (defer) {
			(function(){
				var curr1Inner = curr1;
				var curr2Inner = curr2;
				var callbackInner = callback;
				console.log('deferring');
				// console.error('----!!!!!----')
				// console.error(callback);
		
				setTimeout(function(){
					// console.error('----!!!!!----')
					// console.error(callbackInner);
		
					Crypto.getExchange(curr1Inner, curr2Inner, callbackInner);
				},500);			
			}());
		} else {
			data = {
				'exchangeRate': Crypto.coinValue[curr2] / Crypto.coinValue[curr1],
				'curr1': curr1,
				'curr2': curr2,
				'supplier': 'Coinbase'
			}
			console.log('not deferring');
			// console.error(callback);
			callback.call(this, data);
		}
	},

	'getCurrValue': function(currToGet, currToGetValueIn) {
		Crypto.getExchange(currToGet,currToGetValueIn, function(data){
			var currentExchangeRate = data.exchangeRate;
			var walletContents = Crypto.getTotalWallet(currToGet);
			console.log('\nYour wallet is worth ' + (walletContents * currentExchangeRate) + ' ' + data.curr2);
		});
	},

	'getTotalWallet': function(curr) {
		var walletCoinTransactions = Crypto.wallet[curr];
		var coins = 0;
		for (transaction in walletCoinTransactions) {
			coins += walletCoinTransactions[transaction].amount;
		}
		return coins;
	}
}












