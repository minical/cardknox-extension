<?php 
//load js file on controller function
$config['js-files'] = array(
	array(
        "file" => 'assets/js/cardknox.js',
        "location" => array(
            "cardknox_controller/index",
        ),
    ),
	array(
        "file" => 'assets/js/cardknox_card_setting.js',
        "location" => array(
            "booking/index",
			
        ),
    ),
	array(
        "file" => 'assets/js/payment-gateway-invoice-handle.js',
        "location" => array(
			"invoice/show_invoice",
        ),
    ),
	array(
        "file" => 'assets/js/cardknox_bookingengine_setting.js',
        "location" => array(
            "online_reservation/book_reservation",
        ),
    ),
	array(
        "file" => 'https://cdn.cardknox.com/ifields/2.6.2006.0102/ifields.min.js',
        "location" => array(
            "cardknox_controller/index",
            "booking/index",
			"invoice/show_invoice",
            "online_reservation/book_reservation",
        ),
    ),
	
	
);


//load css file for controller function
$config['css-files'] = array(
    array(
        "file" => 'assets/css/extension.css',
		"location" => array(
            "booking/index",
        ),
    ),

);
