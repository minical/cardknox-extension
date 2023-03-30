$(document).ready(function show_cardknox_iframe(){

	$.ajax({
		type: "POST",
		url: getBaseURL() + 'get_cardknox_iframe_token',
		dataType: "json",
		data: {},
		success: function (response) {

		if (response.success) {
						
			var pci_card_iframe = 
			
			'<div class="" style="">'+
			'<div class="col-sm-3">'+
			'<label for="customer-name" class="">Cardknox Card Details</label>'+
			'</div>'+
			'<div class=" col-sm-9">'+
				'<form id="payment-form" method="POST">'+
					'<input id="name" name="xName" class="form-control" placeholder="Name On Card" autocomplete="cc-name"></input>'+
					'<br />'+
					
					'<div class="mb-3" style="display:flex;">'+
					
						' <iframe class="form-control mr-4 " id="cc_number_ifields" style="width: 198px !important; height: 36px;"  data-ifields-id="card-number" data-ifields-placeholder="Card Number" src="https://cdn.cardknox.com/ifields/2.6.2006.0102/ifield.htm"></iframe>'+
						' <input class="form-control" data-ifields-id="card-number-token"  name="xCardNum" type="hidden"></input>'+
						'<br />'+
						'<input type="number" min="1"  max="12" class="form-control " id="month" name="xMonth" placeholder="Ex. Month July = 07" autocomplete="cc-exp-month"></input>'+
						'<br />'+
					'</div>'+
					'<div class="mb-3" style="display:flex;">'+
						'<iframe class="form-control mr-4" id="cvv_ifields" style="width: 198px !important; height: 36px;" data-ifields-id="cvv" data-ifields-placeholder="CVV" src="https://cdn.cardknox.com/ifields/2.6.2006.0102/ifield.htm"></iframe>'+
						'<input class="form-control" data-ifields-id="cvv-token"  name="xCVV" type="hidden"></input>'+
						// '<br />'+
						' <input type="number" min="23"  max="50" class="form-control" id="year" name="xYear" placeholder="Ex. Year 2029 = 29" autocomplete="cc-exp-year"></input>'+
					'</div>'+

					
					'<br />'+
					'<input class="form-control" style="display:none" id="submit-btn" type="submit" value="Submit"></input>'+
					'<br />'+

					'<label id="transaction-status"></label>'+
					'<br />'+

					'<div class="results" style="display:none; ">'+
					// color:white;height:2px;
						'<label>Card Token: </label><label id="card-token"></label>'+
						'<br />'+
						'<label>CVV Token: </label><label id="cvv-token"></label>'+
						'<br />'+
						'<label>Customer Token: </label><label id="customer-token"></label>'+
						'<br />'+
						'<label>Company Id: </label><label id="company_id"></label>'+
					'</div>'+
					'<br />'+
					'<br />'+
				'</form>'
			'</div>'+
			'</div>';

			$('.add_cardknox_details ').hide();
			$('.add_cardknox_details').after(pci_card_iframe);

			enableAutoSubmit('payment-form');

			const d = new Date();
			const timeWithDate = d.toISOString();

			setAccount(response.iFields_key, 'Minical'+timeWithDate, '1.0')

			enableAutoFormatting();

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

			$('.card_button').remove();
		} else {
			return false;
		}


		$(".book_now").click(function saveCustomerCardData() {
			

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


				var inputMonthValue = $('input[name="xMonth"]').val();
				var inputYearValue = $('input[name="xYear"]').val();

					
				if (inputMonthValue == undefined || inputMonthValue == '' || inputMonthValue > 12 || inputMonthValue < 1) {
					alert('Please enter correct number for month')
					return false;
				}else if (inputYearValue == undefined || inputYearValue == '' || inputYearValue > 50 || inputYearValue < 23) {
					alert('Please enter correct number for year')
					return false;
				} else {
				
					$('#submit-btn').click();

					$(this).val('Processing..');
					$(this).prop('disabled',true);

					var save_customer_cardknox_card = function( ){
						var cardknoxToken = '';
					
						setTimeout(function(){
							let xName = document.getElementById("name").value;
							let xMonth = document.getElementById("month").value;
							let xYear = document.getElementById("year").value;
						
							let card_number_token = document.querySelector("[data-ifields-id='card-number-token']").value;
							let cvv_token = document.querySelector("[data-ifields-id='cvv-token']").value;
							if (card_number_token == undefined || card_number_token == '' || cvv_token == undefined || cvv_token == '' ) {
								alert('Please enter card-number & cvv')
								$(this).val('Book Now');
					            $(this).prop('disabled',false);
								return false;
							} else {

							// let last_four_card_number = card_number_token.substring(0, 17).substring(12, 16);
							// console.log(card_number_token);

								// cardknoxGateway = true;
								
								var customer_card_data = [{
									"customer_name": xName,
									// "customer_id": customerId ? customerId :'',
									"cc_expiry_month": xMonth,
									"cc_expiry_year": xYear,
									"cc_cvc_encrypted": null,
									"cc_number": card_number_token,
									"token": null,
							
								}]; 
								console.log(customer_card_data)
							
							
								var res =$.ajax({
									type: "POST",
									url: getBaseURL() + 'save_customer_cardknox_card',
									dataType: "json",
									data: { data: customer_card_data },
									success: function (response) {
										// console.log("res", response);
										cardknoxToken = response.token;
										company_id = response.company_id;
						
										if (response.success) {
											console.log('card saved successfully!')
											return true;
											
										} else {
											console.log('Error ! card could not be saved!')
											alert('Error ! card could not be saved!')

											return false;
										}
									}
								});
							}
					
						
						},2000);
					
						setTimeout(function(){
							// console.log(cardknoxToken);
							$('#customer-token').html(cardknoxToken);
							$('#company_id').html(company_id);
						},8000);
					
					}

					save_customer_cardknox_card();

					setTimeout(function(){
						// let xName = document.getElementById("name").value;
						let xMonth = document.getElementById("month").value;
						let xYear = document.getElementById("year").value;
						let card_number_token = document.querySelector("[data-ifields-id='card-number-token']").value;
						
						let last_four_card_number = card_number_token.substring(0, 17).substring(12, 16);

						let cardknoxToken = $('#customer-token').text();
						let company_id = $('#company_id').text();
						
						if(cardknoxToken ){
							customerData.cc_number = "XXXX XXXX XXXX " + last_four_card_number;
							customerData.cvc = null;
							customerData.cc_token = cardknoxToken;
							customerData.cc_expiry_month = xMonth;
							customerData.cc_expiry_year = xYear;
							customerData.customer_name = customer_name;
						}

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
									// alert('Please wait for a while, till the process complete & the page redirect to the success page!');
									
									location.reload();
									$(location).attr('href', getBaseURL() + "online_reservation/reservation_success/"+company_id);
								}
							}
						});
					},12000);

			    }


			}
					
		});


		// success end
		}
	});  
});
