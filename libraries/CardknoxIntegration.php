<?php

if (!defined('BASEPATH')) {
    exit('No direct script access allowed');
}

class CardknoxIntegration
{
    function __construct()
    {   
        $this->ci =&get_instance();
        $this->ci->load->model('Cardknox_model'); 
		
		$this->cardknox_base_url = ($this->ci->config->item('app_environment') == "development") ? "https://x1.cardknox.com/gatewayform" : "https://x1.cardknox.com/gatewayform";
   
    }

    public function call_api($api_url, $method, $data, $headers, $method_type = 'POST'){

        $url = $api_url . $method;
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
            
        if($method_type == 'GET'){

        } else {
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        }
               
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        $response = curl_exec($curl);
        
        curl_close($curl);
        
        return $response;
    }

    public function get_cardknox_token($xKey, $cardNumber,$cardExpDate,$customerName,$customer_data){

        $api_url = $this->cardknox_base_url;
        $method = '';
        $method_type = 'POST';
		$xStreet = isset($customer_data['data']['0']['address'])?$customer_data['data']['0']['address']:'';
        $xZip = isset($customer_data['data']['0']['postal_code'])?$customer_data['data']['0']['postal_code']:'';
		$xCustom1 = isset($customer_data['data']['0']['phone'])?$customer_data['data']['0']['phone']:'';
		$xCustom2 = isset($customer_data['data']['0']['city'])?$customer_data['data']['0']['city']:'';
		$xCustom3 = isset($customer_data['data']['0']['region'])?$customer_data['data']['0']['region']:'';
		$xCustom4 = isset($customer_data['data']['0']['country'])?$customer_data['data']['0']['country']:'';
		$xCustom5 = isset($customer_data['data']['0']['special_requests'])?$customer_data['data']['0']['special_requests']:'';

		$data = array(
			'xCommand'=>"cc:Save",
			'xExp'=> $cardExpDate,
			'xCardNum'=> $cardNumber,
			"xVendorId"=>getenv('CARDKNOX_XVENDORID'),
			"xName"=>$customerName,
			'xKey'=> $xKey,
			'xVersion'=>"4.5.9",
			'xSoftwareName'=>"Minical",
			'xSoftwareVersion'=>"1.0",
			"xStreet"=>$xStreet,
			"xZip"=>$xZip,
			"xCustom01"=>$xCustom1,
			"xCustom02"=>$xCustom2,
			"xCustom03"=>$xCustom3,
			"xCustom04"=>$xCustom4,
			"xCustom05"=>$xCustom5,
		);
	
        $headers = array(
            "Accept: */*",
			"Accept-Encoding: gzip, deflate, br",
			"Content-Type: multipart/form-data",
        );
	
        $response = $this->call_api($api_url, $method, $data, $headers, $method_type);

        return $response;
    }
	
}
