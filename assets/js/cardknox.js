$('body').on('click','.login-cardknox',function(){
	var transaction_key = $('input[name="transaction_key"]').val();
	var iFields_key = $('input[name="iFields_key"]').val();

   
	if(transaction_key == '' || iFields_key == ''){
		alert(l('Please enter Transaction Key', true));
	} 
	else {
			
			$.ajax({
				type    : "POST",
				dataType: 'json',
				url     : getBaseURL() + 'signin_cardknox', 
				data: { transaction_key : transaction_key,iFields_key:iFields_key},
				success: function( data ) {
					if(data.success){
						window.location.reload();
					} else {
						alert(data.msg);
					}
				}
			});
		
	}
});


$('body').on('click','.deconfigure-cardknox',function(e){
	if (confirm('Are you sure to deconfigure Payment Gateway Settings ?')) {
			
		$.ajax({
			url     : getBaseURL() + 'deconfigure_cardknox_apikey', 
			type    : "POST",
			success: function(response) {
			console.log(response);
			window.location.reload();

			}
		});

	}

});
