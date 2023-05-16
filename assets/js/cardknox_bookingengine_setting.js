$(document).ready(function show_cardknox_iframe(){

	var str=new Date().getFullYear().toString().substr(2, 2);
				
	var pci_card_iframe = 
	
	'<div class="row" style="">'+
	'<div class="col-sm-3 text-right">'+
	'<label for="customer-name" class="">Card Details</label>'+
	'</div>'+
	'<div class=" col-sm-9" >'+
		'<form id="payment-form" method="POST" min-height="140px !important" style="overflow:hidden;">'+
			'<input style="display:none;" id="name" name="xName" class="form-control" placeholder="Name On Card" autocomplete="cc-name"></input>'+

			'<div class="mb-3" style="display:flex;">'+
				'<div class=" col-sm-12"> <iframe class="form-control mr-4 " id="cc_number_ifields" style="width: 198px !important; height: 36px;"  data-ifields-id="card-number" data-ifields-placeholder="Card Number" src="https://cdn.cardknox.com/ifields/2.15.2302.0801/ifield.htm"></iframe>'+
				' <input style="border: none !important;" class="form-control" data-ifields-id="card-number-token"  name="xCardNum" type="hidden"></input>'+
				'<span><label data-ifields-id="card-data-error" style="color: red;"></label></span></div>'+
				'<br />'+

				'<div class=" col-sm-12"><input type="number" min="1"  max="12" class="form-control " id="month" name="xMonth" placeholder="Ex. Month July = 07" autocomplete="cc-exp-month"></input>'+
				'<span><label data-ifields-id="month-error" style="color: red;"></label></span></div>'+
				'<br />'+
			'</div>'+
			'<div class="mb-3" style="display:flex;">'+
				'<div class=" col-sm-12"><iframe class="form-control mr-4" id="cvv_ifields" style="width: 198px !important; height: 36px;" data-ifields-id="cvv" data-ifields-placeholder="CVV" src="https://cdn.cardknox.com/ifields/2.15.2302.0801/ifield.htm"></iframe>'+
				'<input class="form-control" data-ifields-id="cvv-token"  name="xCVV" type="hidden"></input>'+
				'<span><label data-ifields-id="cvv-error" style="color: red;"></label></span></div>'+
				'<div class=" col-sm-12"><input type="number" min="'+str+'" max="50" class="form-control" id="year" name="xYear" placeholder="Ex. Year 2029 = 29" autocomplete="cc-exp-year"></input>'+
				'<span><label data-ifields-id="year-error" style="color: red;"></label></span></div>'+
			'</div>'+
			
			'<input class="form-control" style="display:none" id="submit-btn" type="submit" value="Submit"></input>'+

			'<label id="transaction-status"></label>'+

			'<div class="results" style="display:none; ">'+
				'<label>Card Token: </label><label id="card-token"></label>'+
				'<label>CVV Token: </label><label id="cvv-token"></label>'+
				'<label>Customer Token: </label><label id="customer-token"></label>'+
				'<label>Customer Error: </label><label id="customer-error"></label>'+
			'</div>'+
		'</form>'
	'</div>'+
	'</div>';

	$('.add_cardknox_details ').hide();
	$('.add_cardknox_details').after(pci_card_iframe);
	
	// enableAutoSubmit('payment-form');

	const d = new Date();
	const timeWithDate = d.toISOString();

	setAccount(ifieldKey, 'Minical', '1.0')
	
	let style = {
		border: '1px solid white',
	};
	setIfieldStyle('card-number', style);
	setIfieldStyle('cvv', style);
	
	enableAutoFormatting('');


		addIfieldCallback('blur', function(data) {
		console.log(JSON.stringify(data))
		if (data.issuer !== 'amex' && (data.cardNumberIsValid == false || data.cardNumberLength !== 16 || data.cardNumberIsEmpty == true)) {
				document.querySelector("[data-ifields-id='card-data-error']").innerHTML = 'Please enter the 16 digit valid card number!'
				$('.book_now').prop('disabled', 'true');
				return false;
		}
		else if(data.issuer === 'amex' && (data.cardNumberIsValid == false || data.cardNumberLength !== 15 || data.cardNumberIsEmpty === true )){
			document.querySelector("[data-ifields-id='card-data-error']").innerHTML = 'Please enter the 15 digit valid card number!'
			$('.book_now').prop('disabled', 'true');
			return false;
		}
		else{
			document.querySelector("[data-ifields-id='card-data-error']").innerHTML = ''
			$('.book_now').removeProp('disabled');
		}
		
		if (data.issuer !== 'amex' && (data.cvvIsValid || data.cvvLength === 3 || data.cvvIsEmpty === true )) {
			console.log(JSON.stringify(data.cvvIsValid))
			document.querySelector("[data-ifields-id='cvv-error']").innerHTML = ''
			$('.book_now').removeProp('disabled');
		} 
		else if(data.issuer === 'amex' && (data.cvvIsValid || data.cvvLength === 4 || data.cvvIsEmpty === true )){
			console.log(JSON.stringify(data.cvvIsValid))
			document.querySelector("[data-ifields-id='cvv-error']").innerHTML = ''
			$('.book_now').removeProp('disabled');
		}
		else{
			document.querySelector("[data-ifields-id='cvv-error']").innerHTML = 'Please enter the valid cvv!'
			$('.book_now').prop('disabled', 'true');
			return false;
		}

	});


	let checkCardLoaded = setInterval(function() {
		clearInterval(checkCardLoaded);
		focusIfield('card-number');
	}, 1000);

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

				submitBtn.disabled = false;
				
			},
			30000
		);
	});


	$("input[name='xMonth']").blur(function () {
		if (this.value.length > 0 && this.value >= 1 && this.value <= 12) {
		  $('.book_now').removeProp('disabled');
		  $("[data-ifields-id='month-error']").text('')
		} else {
		  $('.book_now').prop('disabled', 'true');
		  $("[data-ifields-id='month-error']").text('Please enter the correct month')
		}
	});
	$("input[name='xYear']").blur(function () {
		var str=new Date().getFullYear().toString().substr(2, 2);

		if (this.value.length === 1    ) {
			$('.book_now').prop('disabled', 'true');
			$("[data-ifields-id='year-error']").text('Please enter the correct year')
		} else if (this.value >= str && this.value <= 50) {
		  $('.book_now').removeProp('disabled');
		  $("[data-ifields-id='year-error']").text('');
		} else {
		  $('.book_now').prop('disabled', 'true');
		  $("[data-ifields-id='year-error']").text('Please enter the correct year')
		}
	});



	$(".book_now").click(function saveCustomerCardData(e) {
			e.preventDefault();
        var current_url = $(location).attr('href');
		var parts = current_url.split("/");
        var company_id = parts[parts.length - 1]; 

		var customer_email = $("input[name='customer_email']").val();
		var customer_name = $("input[name='customer_name']").val();
		var phone = $("input[name='phone']").val();
		var address = $("input[name='address']").val();
		var city = $("input[name='city']").val();
		var region = $("input[name='region']").val();
		var country = $("input[name='country']").val();
		var postal_code = $("input[name='postal_code']").val();
		var special_requests = $("textarea[name='special_requests']").val();
	
		var customerData = {};	
		

		if ($('#payment-form').html()) {
			
            // set session storage for customer information in  online_reservation

			sessionStorage.setItem("ls_customer_email", $("input[name=customer_email]").val());
			sessionStorage.setItem("ls_customer_name", $("input[name=customer_name]").val());
			sessionStorage.setItem("ls_phone", $("input[name=phone]").val());
			sessionStorage.setItem("ls_address", $("input[name=address]").val());
			sessionStorage.setItem("ls_city", $("input[name=city]").val());
			sessionStorage.setItem("ls_region", $("input[name=region]").val());
			sessionStorage.setItem("ls_country", $("input[name=country]").val());
			sessionStorage.setItem("ls_postal_code", $("input[name=postal_code]").val());
			sessionStorage.setItem("ls_special_requests", $("input[name=special_requests]").val());


			$('#submit-btn').click();

			$(this).val('Processing....');
			$(this).prop('disabled',true);

			var save_customer_cardknox_card = function( ){
				var cardknoxToken = '';
				var cardknoxError = '';
			
				setTimeout(function(){
					let xName = $("input[name=customer_name]").val();
					let xMonth = document.getElementById("month").value;
					let xYear = document.getElementById("year").value;
					

					let card_number_token = document.querySelector("[data-ifields-id='card-number-token']").value;
					// let cvv_token = document.querySelector("[data-ifields-id='cvv-token']").value;
					// let last_four_card_number = card_number_token.substring(0, 17).substring(12, 16);


						var customer_card_data = [{
							"company_id":company_id,
							"customer_name": xName,
							"cc_expiry_month": xMonth,
							"cc_expiry_year": xYear,
							"cc_cvc_encrypted": null,
							"cc_number": card_number_token,
							"token": null,
							"customer_email": customer_email,
							"phone": phone,
							"address": address,
							"city": city,
							"region": region,
							"country": country,
							"postal_code": postal_code,
							"special_requests": special_requests,
						}]; 
						console.log(customer_card_data)
					
						var res =$.ajax({
							type: "POST",
							url: getBaseURL() + 'save_customer_cardknox_card',
							dataType: "json",
							data: { data: customer_card_data },
							success: function (response) {
								cardknoxToken = response.token;
								cardknoxError = response.error;
			
								console.log("cardknoxToken", cardknoxToken + '== cardknoxError' + cardknoxError + '==company_id' + company_id );
					
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

			save_customer_cardknox_card();

			var timeout_success = setTimeout(function(){
				let xName = $("input[name=customer_name]").val();
				let xMonth = document.getElementById("month").value;
				let xYear = document.getElementById("year").value;
				let card_number_token = document.querySelector("[data-ifields-id='card-number-token']").value;
				let last_four_card_number = card_number_token.substring(0, 17).substring(12, 16);

				let cardknoxToken = $('#customer-token').text();
				let cardknoxError = $('#customer-error').text();
				let customerCvvToken = $('#cvv-token').text();



				if (cardknoxToken == ''|| cardknoxToken == null|| cardknoxToken == undefined) {
					
					console.log(cardknoxError)
					alert(cardknoxError);
					location.reload();
					
				} else {
					customerData.customerCvvToken = customerCvvToken;
					customerData.cc_number = "XXXX XXXX XXXX " + last_four_card_number;
					customerData.cvc = null;
					customerData.cc_token = cardknoxToken;
					customerData.cc_expiry_month = xMonth;
					customerData.cc_expiry_year = xYear;
					customerData.customer_name = customer_name;
					console.log(customerData)
					// update customer
					$.ajax({
						type: "POST",
						url: getBaseURL() + "online_reservation/book_reservation/"+company_id,
						data: {
							customer_data: customerData,
							customer_name: customer_name,
							customer_email: customer_email,
							phone: phone,
							address: address,
							city: city,
							region: region,
							country: country,
							postal_code: postal_code,
							special_requests: special_requests,
						},
						dataType: "json",
						success: function(res) {
								
							console.log(res)
					
							if (res.error && res.error_msg) {
								console.log(res.error_msg);
								
							} else {
								
								// location.reload();
								// $(location).attr('href', getBaseURL() + "online_reservation/reservation_success/"+company_id);
								$.ajax({ 
									type: "POST",
									url: $(location).attr('href', getBaseURL() + "online_reservation/reservation_success/"+company_id),
									data: {},
									// dataType: "json",
									success: function(res) {
										console.log(res)
									}
								});
							}
						}
					});
				}
				

			},10000);

			// if (timeout_success) {
			// 	$.ajax({
			// 		type: "POST",
			// 		url: getBaseURL() + "online_reservation/reservation_success/"+company_id,
			// 		data: {},
			// 		// dataType: "json",
			// 		success: function(res) {
			// 			console.log(res)
			// 		}
			// 	});
			// }

		}
				
	});

});

// session for customer information in  online_reservation

$(document).ready(function () {
    	$("input[name='customer_name']").val(sessionStorage.getItem("ls_customer_name")); 
		$("input[name='customer_email']").val(sessionStorage.getItem("ls_customer_email"));
		$("input[name='phone']").val(sessionStorage.getItem("ls_phone"));
		$("input[name='address']").val(sessionStorage.getItem("ls_address"));
		$("input[name='city']").val(sessionStorage.getItem("ls_city"));
		$("input[name='region']").val(sessionStorage.getItem("ls_region"));
		$("input[name='country']").val(sessionStorage.getItem("ls_country"));
		$("input[name='postal_code']").val(sessionStorage.getItem("ls_postal_code"));
		$("input[name='special_requests']").val(sessionStorage.getItem("ls_special_requests"));


	    var  myTimeout_session = setTimeout(function () {
		sessionStorage.removeItem("ls_customer_name")
		sessionStorage.removeItem("ls_customer_email")
		sessionStorage.removeItem("ls_phone")
		sessionStorage.removeItem("ls_address")
		sessionStorage.removeItem("ls_city")
		sessionStorage.removeItem("ls_region")
		sessionStorage.removeItem("ls_country")
		sessionStorage.removeItem("ls_postal_code")
		sessionStorage.removeItem("ls_special_requests")
	    }, 3000);
	// myTimeout_session()
	clearTimeout(myTimeout_session);
})
