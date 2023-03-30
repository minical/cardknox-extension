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
                                '<button type="button" class="btn btn-info" onclick="show_iframe()">Add card Details</button>'+
                            '</div>';
        $('.form-group.form-group-sm.customer_field_12').after(cardknox_button);
    } else {
        $('.cc_field').css('display', 'block');
    }

});



function show_iframe() {
	$('.card_button').remove();

	$.ajax({
        type: "POST",
        url: 'get_cardknox_iframe_token',
        dataType: "json",
        data: {},
        success: function (response) {
         console.log(response)

		 if (response.success) {
		
			            
		    var pci_card_iframe = 
			
			'<div class="" style="">'+
			'<div class="col-sm-3">'+
			'<label for="customer-name" class="">Cardknox Card Details</label>'+
			'</div>'+
			'<div class=" col-sm-9">'+
				'<form id="payment-form" method="POST" style="height: 165px;">'+
					'<input style="display:none;" id="name" name="xName" class="form-control" placeholder="Name On Card" autocomplete="cc-name"></input>'+
					'<br />'+
					
					'<div class="mb-3" style="display:flex;">'+
					
						' <iframe class="form-control mr-4 " id="cc_number_ifields" style="width: 198px !important; height: 36px;"  data-ifields-id="card-number" data-ifields-placeholder="Card Number" src="https://cdn.cardknox.com/ifields/2.6.2006.0102/ifield.htm"></iframe>'+
						' <input class="form-control" data-ifields-id="card-number-token"  name="xCardNum" type="hidden"></input>'+
						'<br />'+
						'<input type="number" min="1"  max="12" class="form-control " id="month" name="xMonth" placeholder="Month" autocomplete="cc-exp-month"></input>'+
						'<br />'+
					'</div>'+
					'<div class="mb-3" style="display:flex;">'+
						'<iframe class="form-control mr-4" id="cvv_ifields" style="width: 198px !important; height: 36px;" data-ifields-id="cvv" data-ifields-placeholder="CVV" src="https://cdn.cardknox.com/ifields/2.6.2006.0102/ifield.htm"></iframe>'+
						'<input class="form-control" data-ifields-id="cvv-token"  name="xCVV" type="hidden"></input>'+
						' <input type="number" min="23"  max="50" class="form-control" id="year" name="xYear" placeholder="Year" autocomplete="cc-exp-year"></input>'+
					'</div>'+

					
					'<br />'+
					'<input class="form-control" style="display:none" id="submit-btn" type="submit" value="Submit"></input>'+
					'<br />'+

					'<label id="transaction-status"></label>'+
					'<br />'+

					'<div class="results" style="display:none; ">'+
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

			$('.form-group.form-group-sm.customer_field_12').after(pci_card_iframe);
			

			enableAutoSubmit('payment-form');

			setAccount(response.iFields_key, 'Minical', '1.0')

			enableAutoFormatting('-');

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
        }
    });  

}

var save_customer_cardknox_card = function( customerId){
	var cardknoxToken = '';
	setTimeout(function(){
		let xName = $("input[name=customer_name]").val();
		let xMonth = document.getElementById("month").value;
		let xYear = document.getElementById("year").value;
	
		let card_number_token = document.querySelector("[data-ifields-id='card-number-token']").value;
		let cvv_token = document.querySelector("[data-ifields-id='cvv-token']").value;

			
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
					
					console.log("cardknoxToken", cardknoxToken );
		
					if (response.success) {
					   console.log('card saved successfully!')
						return true;
						
					} else {
						console.log('card could not be saved!')
						return false;
					}
				}
			});

	
	},2000);

	setTimeout(function(){
		console.log(cardknoxToken);
		$('#customer-token').html(cardknoxToken);
	},8000);

}
