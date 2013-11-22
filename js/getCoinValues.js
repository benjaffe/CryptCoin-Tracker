$(function(){
	Crypto.init();
	console.log(Crypto.convert('USD','BTC'));
});

var Crypto = {
	'coinValue': {

	},

	'init': function() {

		var supportedCoins = ['BTC','LTC'];
		for (var i = 0; i < supportedCoins.length; i++) {
			Crypto.coinValue[supportedCoins[i]] = undefined;
		};
		Crypto.coinValue.USD = 1;
		

		$.getJSON('https://coinbase.com/api/v1/prices/sell?callback=?', function(json, textStatus) {
			Crypto.coinValue.BTC = 1/json.amount;
			Crypto.convert('USD','BTC')
		});

	},

	'convert': function(curr1, curr2) {
		if (!Crypto.coinValue[curr1]) {
			console.warn(curr1 + ' data is not yet loaded');
		}

		if (!Crypto.coinValue[curr2]) {
			console.warn(curr2 + ' data is not yet loaded');
		}

		console.log(Crypto.coinValue);
	}
}