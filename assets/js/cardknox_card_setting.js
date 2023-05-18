var cardknoxGateway = false;

document.addEventListener("post.open_customer_model", function (e) {
	$('.card_button').remove();
                                                                                                                                                                                                                                 
    if (
            (
                e && 
                e.detail && 
                e.detail.customer_id == ''
            ) || 
            (
                $('#cc_number').val() == '' && 
                $('input[name="cc_expiry"]').val() == '' &&
                $('input[name="cvc"]').val() == ''
            ) 
        ){

        $('.cc_field').css('display', 'none');
        var cardknox_button = '<div class="form-group form-group-sm card_button">'+
                            '<label for="cardknox_card_data" class="col-sm-3 control-label">'+
                                'Card Details'+
                            '</label>'+
                            '<div class="col-sm-9">'+
                                '<button type="button" class="btn btn-info" onclick="show_iframe()">Add New Card Details</button>'+
                            '</div>';
        $('.form-group.form-group-sm.customer_field_12').after(cardknox_button);
    } else {
        var cardknox_remove_button = '<button class="btn btn-warning" style="color:white;" id="remove-cardknox-button">Replace Old Card</button>';
        $('.cc_field').css('display', 'block');

		$('.credit_card_cvc').after(cardknox_remove_button)
		$('#custom_form').find('#remove-cardknox-button').closest('.col-sm-3').removeClass('col-sm-3').addClass('col-sm-6').css('display','flex');
		$('#custom_form').find('#remove-cardknox-button').addClass('ml-5');

		$('#remove-cardknox-button').click(function () {
			if (confirm('Are you sure you want to replace the old card ?')) {
				$('.cc_field').css('display', 'none');
				// $('.cc_field').remove();

				var cardknox_button = '<div class="form-group form-group-sm card_button">'+
									'<label for="cardknox_card_data" class="col-sm-3 control-label">'+
										'Card Details'+
									'</label>'+
									'<div class="col-sm-9">'+
										'<button type="button" class="btn btn-info" onclick="show_iframe()">Add New Card Details</button>'+
									'</div>';
				$('.form-group.form-group-sm.customer_field_12').after(cardknox_button);
		    }
		})

    }

});



function show_iframe() {
	$('.card_button').remove();
			
	var str=new Date().getFullYear().toString().substr(2, 2);
				
	var pci_card_iframe = 
	
	'<div class="" style="">'+
	'<div class="col-sm-3 text-right">'+
	'<label for="customer-name" class="">Card Details</label>'+
	'</div>'+
	'<div class=" col-sm-9">'+
		'<form id="payment-form" method="POST" style="height: 205px;">'+
			'<input style="display:none;" id="name" name="xName" class="form-control" placeholder="Name On Card" autocomplete="cc-name"></input>'+
			
			'<div class="mb-3" style="display:flex;">'+
			
				'<div class=" col-sm-12"><iframe class="form-control mr-4 " id="cc_number_ifields" style="width: 198px !important; height: 36px;"  data-ifields-id="card-number" data-ifields-placeholder="Card Number" src="https://cdn.cardknox.com/ifields/2.15.2302.0801/ifield.htm"></iframe>'+
				' <input class="form-control" data-ifields-id="card-number-token"  name="xCardNum" type="hidden"></input>'+
				'<span><label data-ifields-id="card-data-error" style="color: red;"></label></span></div>'+
				// '<br />'+
				'<div class=" col-sm-12"><input type="number" min="1"  max="12" class="form-control " id="month" name="xMonth" placeholder="Month" autocomplete="cc-exp-month"></input>'+
				'<span><label data-ifields-id="month-error" style="color: red;"></label></span></div>'+
				// '<br />'+
			'</div>'+
			'<div class="mb-3" style="display:flex;">'+
				'<div class=" col-sm-12"><iframe class="form-control mr-4" id="cvv_ifields" style="width: 198px !important; height: 36px;" data-ifields-id="cvv" data-ifields-placeholder="CVV" src="https://cdn.cardknox.com/ifields/2.15.2302.0801/ifield.htm"></iframe>'+
				'<input class="form-control" data-ifields-id="cvv-token"  name="xCVV" type="hidden"></input>'+
				'<span><label data-ifields-id="cvv-error" style="color: red;"></label></span></div>'+
				'<div class=" col-sm-12"><input type="number" min="'+str+'"  max="50" class="form-control" id="year" name="xYear" placeholder="Year" autocomplete="cc-exp-year"></input>'+
				'<span><label data-ifields-id="year-error" style="color: red;"></label></span></div>'+
			'</div>'+

			
			// '<br />'+
			'<input class="form-control" style="display:none" id="submit-btn" type="submit" value="Submit"></input>'+
			// '<br />'+

			'<label id="transaction-status"></label>'+
			// '<br />'+

			'<div class="results" style="display:none; ">'+
				'<label>Card Token: </label><label id="card-token"></label>'+
				// '<br />'+
				'<label>CVV Token: </label><label id="cvv-token"></label>'+
				// '<br />'+
				'<label>Customer Token: </label><label id="customer-token"></label>'+
				// '<br />'+
				'<label>Customer Error: </label><label id="customer-error"></label>'+
				// '<br />'+
				'<label>Company Id: </label><label id="company_id"></label>'+
			'</div>'+
			// '<br />'+
			// '<br />'+
		'</form>'
	'</div>'+
	'</div>';

	$('.form-group.form-group-sm.customer_field_12').after(pci_card_iframe);
	

	enableAutoSubmit('payment-form');

	setAccount(myVar, 'Minical', '1.0')

	let borderStyle = {
		border: '1px solid white',
	};
	setIfieldStyle('card-number', borderStyle);
	setIfieldStyle('cvv', borderStyle);

	enableAutoFormatting('');

	addIfieldCallback('blur', function(data) {
		console.log(JSON.stringify(data))

		if (data.issuer !== 'amex' && (data.cardNumberIsValid == false || data.cardNumberLength !== 16 || data.cardNumberIsEmpty == true)) {
			document.querySelector("[data-ifields-id='card-data-error']").innerHTML = 'Please enter the 16 digit valid card number!'
			$('#button-update-customer').prop('disabled', 'true');
			return false;
		}
		else if(data.issuer === 'amex' && (data.cardNumberIsValid == false || data.cardNumberLength !== 15 || data.cardNumberIsEmpty === true )){
			document.querySelector("[data-ifields-id='card-data-error']").innerHTML = 'Please enter the 15 digit valid card number!'
			$('#button-update-customer').prop('disabled', 'true');
			return false;
		}
		else{
			document.querySelector("[data-ifields-id='card-data-error']").innerHTML = ''
			$('#button-update-customer').removeProp('disabled');
		}
		
		if (data.issuer !== 'amex' && (data.cvvIsValid || data.cvvLength === 3 || data.cvvIsEmpty === true )) {
			console.log(JSON.stringify(data.cvvIsValid))
			document.querySelector("[data-ifields-id='cvv-error']").innerHTML = ''
			$('#button-update-customer').removeProp('disabled');
		} 
		else if(data.issuer === 'amex' && (data.cvvIsValid || data.cvvLength === 4 || data.cvvIsEmpty === true )){
			console.log(JSON.stringify(data.cvvIsValid))
			document.querySelector("[data-ifields-id='cvv-error']").innerHTML = ''
			$('#button-update-customer').removeProp('disabled');
		}
		else{
			document.querySelector("[data-ifields-id='cvv-error']").innerHTML = 'Please enter the valid cvv!'
			$('#button-update-customer').prop('disabled', 'true');
			return false;
		}

	});

	let checkCardLoaded = setInterval(function() {
		clearInterval(checkCardLoaded);
		focusIfield('card-number');
	}, 1000);


	$("input[name='xMonth']").blur(function () {
		if (this.value.length > 0 && this.value >= 1 && this.value <= 12) {
			$('#button-update-customer').removeProp('disabled');
			$("[data-ifields-id='month-error']").text('')
		} else {
			$('#button-update-customer').prop('disabled', 'true');
			$("[data-ifields-id='month-error']").text('Please enter the correct month')
		}
	});
	$("input[name='xYear']").blur(function () {
		var str=new Date().getFullYear().toString().substr(2, 2);

		if (this.value.length === 1    ) {
			$('#button-update-customer').prop('disabled', 'true');
			$("[data-ifields-id='year-error']").text('Please enter the correct year')
		} else if (this.value >= str && this.value <= 50) {
			$('#button-update-customer').removeProp('disabled');
			$("[data-ifields-id='year-error']").text('');
		} else {
			$('#button-update-customer').prop('disabled', 'true');
			$("[data-ifields-id='year-error']").text('Please enter the correct year')
		}
	});
			
	document.getElementById('payment-form').addEventListener('submit', function(e){
		e.preventDefault();
		document.getElementById('transaction-status').innerHTML = 'Processing Transaction...';
		let submitBtn = this;
		submitBtn.disabled = true;
		getTokens(function() { 
				document.getElementById('transaction-status').innerHTML  = '';
				document.getElementById('card-token').innerHTML = document.querySelector("[data-ifields-id='card-number-token']").value;
				document.getElementById('cvv-token').innerHTML = document.querySelector("[data-ifields-id='cvv-token']").value;
				submitBtn.disabled = false;

			},
			function() {
				document.getElementById('transaction-status').innerHTML = '';
				document.getElementById('card-token').innerHTML = '';
				document.getElementById('cvv-token').innerHTML = '';
				document.getElementById('customer-token').innerHTML = '';
				document.getElementById('customer-error').innerHTML = '';

				submitBtn.disabled = false;
			},
			2000
		);
	});

	$('.card_button').remove();
	

}


var save_customer_cardknox_card = function( customerId){
	var cardknoxToken = '';
	setTimeout(function(){
		let xName = $("input[name=customer_name]").val();
		let xMonth = document.getElementById("month").value;
		let xYear = document.getElementById("year").value;
	
		let card_number_token = document.querySelector("[data-ifields-id='card-number-token']").value;
		// let cvv_token = document.querySelector("[data-ifields-id='cvv-token']").value;
			
		var customer_card_data = [{
			"customer_name": xName,
			"customer_id": customerId ? customerId :'',
			"cc_expiry_month": xMonth,
			"cc_expiry_year": xYear,
			"cc_cvc_encrypted": null,
			"cc_number": card_number_token,
			"token": null,
		}]; 
		console.log(customer_card_data)
	    
	
		var res = $.ajax({
			type: "POST",
			url: 'save_customer_cardknox_card',
			dataType: "json",
			data: { data: customer_card_data },
			success: function (response) {
				console.log("res", response);
				cardknoxToken = response.token;
				cardknoxError = response.error;
				
				console.log("cardknoxToken", cardknoxToken + '== cardknoxError' + cardknoxError  );
	
				if (cardknoxToken) {
					console.log('card saved successfully!')
					
				} else {
					console.log('card could not be saved!')
				}
			}
		});

	
	},2000);

	setTimeout(function(){
		if (cardknoxToken == undefined) {
			console.log(cardknoxError);
		    $('#customer-error').html(cardknoxError);
		} else {
			console.log(cardknoxToken);
		    $('#customer-token').html(cardknoxToken);
		}
		
	},8000);

}
