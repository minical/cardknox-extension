<?php

if (!defined('BASEPATH')) {
    exit('No direct script access allowed');
}

/**
 * Manages gateway operations
 * @property  Currency_model Currency_model
 */
class ProcessPayment
{

    const DEFAULT_CURRENCY = 'usd';

    /**
     * @var CI_Controller
     */
    private $ci;

    private $selected_gateway;

    /**
     * @var array Company gateway settings
     */
    private $company_gateway_settings;

    /**
     * @var array Payer details
     */
    private $payer_details;
    
    /**
     * @var array Customer
     */
    private $customer;

    /**
     * @var string Error message
     */
    private $error_message;

    /**
     * @var string
     */
    private $currency = self::DEFAULT_CURRENCY;

    /**
     *
     * @var string External Id, can only be one per gateway
     */

    public function __construct($params = null)
    {
        $this->ci =& get_instance();
        $this->ci->load->model('Payment_gateway_model');
        $this->ci->load->model('Customer_model');
        $this->ci->load->library('session');
        $this->ci->load->model("Card_model");
        $this->ci->load->library('encrypt');
        $this->ci->load->model('Booking_model');
        // $this->ci->load->model('Cardknox_model'); 
		
		
		$this->cardknox_base_url = ($this->ci->config->item('app_environment') == "development") ? "https://x1.cardknox.com/gatewayform" : "https://x1.cardknox.com/gatewayform";

        $company_id = $this->ci->session->userdata('current_company_id');

        if (isset($params['company_id'])) {
            $company_id = $params['company_id'];
        }

        if(!$company_id){
            $company_id = $this->ci->session->userdata('anonymous_company_id');
        }

        $gateway_settings = $this->ci->Payment_gateway_model->get_payment_gateway_settings($company_id);

        if ($gateway_settings) {
            $this->setCompanyGatewaySettings($gateway_settings);
            $this->setSelectedGateway($this->company_gateway_settings['selected_payment_gateway']);
            $this->populateGatewaySettings();
            $this->setCurrency();
        }
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

    private function populateGatewaySettings()
    {
        switch ($this->selected_gateway) {
			case 'cardknox':
				$gateway_meta_data = json_decode($this->company_gateway_settings['gateway_meta_data'], true);
				
				$this->transaction_key = $this->ci->encrypt->decode($gateway_meta_data['transaction_key']);
				$this->payment_gateway_name = isset($gateway_meta_data['payment_gateway_name']) && $gateway_meta_data['payment_gateway_name'] ? $gateway_meta_data['payment_gateway_name'] : null;

                break;
        }
    }

    private function setCurrency()
    {
        // itodo some gateway currency maybe unavailable
        $this->ci->load->model('Currency_model');
        $currency = $this->ci->Currency_model->get_default_currency($this->company_gateway_settings['company_id']);
        $this->currency = strtolower($currency['currency_code']);
    }

    /**
     * @return string
     */
    public function getSelectedGateway()
    {
        return $this->selected_gateway;
    }

    /**
     * @param string $selected_gateway
     */
    public function setSelectedGateway($selected_gateway)
    {
        $this->selected_gateway = $selected_gateway;
    }

    /**
     * @param $booking_id
     * @param $amount
     * @return bool
     */
    public function createBookingCharge($booking_id, $amount, $customer_id = null, $cvc = null, $is_capture = true)
    {
        $charge_id = null;
        
        if ($this->isGatewayPaymentAvailableForBooking($booking_id, $customer_id)) {
			
            try {
                $this->ci->load->model('Booking_model');
                $this->ci->load->model('Customer_model');
                $this->ci->load->model('Card_model');
                $this->ci->load->library('tokenex');

                $booking = $this->ci->Booking_model->get_booking($booking_id);

                $customer_id = $customer_id ? $customer_id : $booking['booking_customer_id'];

                $customer_info = $this->ci->Card_model->get_customer_cards($customer_id);
                $payer_details = $this->ci->Customer_model->get_customer($customer_id);

                $customer = "";
                if (isset($customer_info) && $customer_info) {

                    foreach ($customer_info as $customer_data) {
                        if (($customer_data['is_primary']) && !$customer_data['is_card_deleted']) {
                            $customer = $customer_data;
                        }
                    }
                }

                $customer = json_decode(json_encode($customer), 1);
                $customer['customer_data'] = $customer_data;
                $customer_meta_data = json_decode($customer['customer_meta_data'], true);

				if (isset($customer_meta_data['cardknox_token']) && $customer_meta_data['cardknox_token']) {
                    $token = $customer_meta_data['cardknox_token'];

                    $currency = $this->ci->Currency_model->get_default_currency($this->company_gateway_settings['company_id']);
                     $currency_code = $currency['currency_code'];

                    $charge = $this->make_payment( $amount, $currency_code, $payer_details, $token);
     
                    $charge_id = null;
                    if (isset($charge['success']) && $charge['success']) {
                        if (isset($charge['charge_id']) && $charge['charge_id']) {
                            $charge_id = $charge['charge_id'];
                        } 
					
                    } else {
                        $charge_id = isset($charge['charge_failed']) && $charge['charge_failed'] ? $charge['charge_failed'] . '-charge_failed' : (isset($charge['message']) && $charge['message'] ? $charge['message'] . '-charge_failed' : '');
                        $this->setErrorMessage($charge['message']);
                    }
                }

            } catch (Exception $e) {
                $error = $e->getMessage();
                $this->setErrorMessage($error);
            }
        }

        return $charge_id;
    }

    /**
     * Can Booking perform payment operations
     *
     * @param $booking_id
     * @return bool
     */
    public function isGatewayPaymentAvailableForBooking($booking_id, $customer_id = null)
    {
        $result = false;
        $this->ci =& get_instance();

        $this->module_name = $this->ci->router->fetch_module();

        if($this->module_name == ''){
            foreach ($this->ci->all_active_modules as $key => $value) {
                if($value['name'] == 'Cardknox Integration'){
                    $this->module_name = $key;
                    break;
                }
            }
        }
        $this->ci->load->model('../extensions/'.$this->module_name.'/models/Cardknox_model');
        $this->ci->load->library('../extensions/'.$this->module_name.'/libraries/CardknoxIntegration');
        $this->ci->load->library('Encrypt');
        $this->ci->load->model('Booking_model');
        $this->ci->load->model('Customer_model');
        
        $booking = $this->ci->Booking_model->get_booking($booking_id);
        $customer_id = $customer_id ? $customer_id : $booking['booking_customer_id'];

        $customer = $this->ci->Customer_model->get_customer($customer_id);
      
        unset($customer['cc_number']);
        unset($customer['cc_expiry_month']);
        unset($customer['cc_expiry_year']);
        unset($customer['cc_tokenex_token']);
        unset($customer['cc_cvc_encrypted']);

        $card_data = $this->ci->Card_model->get_active_card($customer_id, $this->ci->company_id);

        if (isset($card_data) && $card_data) {
            $customer['cc_number'] = $card_data['cc_number'];
            $customer['cc_expiry_month'] = $card_data['cc_expiry_month'];
            $customer['cc_expiry_year'] = $card_data['cc_expiry_year'];
            $customer['cc_tokenex_token'] = $card_data['cc_tokenex_token'];
            $customer['cc_cvc_encrypted'] = $card_data['cc_cvc_encrypted'];
            $customer['meta_data'] = $card_data['customer_meta_data'];
        }

        $token = isset(json_decode($customer['meta_data'])->cardknox_token)?json_decode($customer['meta_data'])->cardknox_token:json_decode($customer['meta_data'])->token;
        $meta_data = json_decode($customer['meta_data'], true);

        if(!isset($meta_data['source'])){

			if (function_exists('send_card_request')) {

				$cardknox_data = $this->ci->Cardknox_model->get_cardknox_detail($this->ci->company_id);
				$cardknox_data = json_decode($cardknox_data['gateway_meta_data'], true);
				$xKey = $this->ci->encrypt->decode($cardknox_data['transaction_key']);
	
				$cardknox_token = json_decode($card_data['customer_meta_data'],true)['token'];
				$xCurrency = 'USD';
				
				$apiUrl = 'https://x1.cardknox.com/gatewayjson';
				
				$body = array(
					'xCardNum'=> "%CARD_NUMBER%",
					'xExp'=> "%EXPIRATION_MM%"."%EXPIRATION_YY%",
					'xCVV'=> "%SERVICE_CODE%",
					'xKey'=> $xKey,
					'xVersion'=>"4.5.9",
					'xSoftwareName'=>"Minical",
					'xSoftwareVersion'=>"1.0",
					'xCommand'=>"cc:Save",
					"xName"=>"%CARDHOLDER_NAME%",
					"xCurrency"=>$xCurrency,
				);
				$body = json_decode(json_encode($body),true);

				$headers = array(
					'Accept: */*',
					'Content-Type: application/json',
					'Accept-Encoding: gzip, deflate, br'
				);
				$response = send_card_request($apiUrl, $token, $body, $headers, $method_type = 'POST');

				$meta['cardknox_token'] = $response['xToken'];
				$meta['source'] = 'cardknox';

				$update_card_data = array(
					'is_primary' => 1,
					'customer_name' => $response['xName'],
					'company_id' =>$customer['company_id'],
					'cc_number' => "XXXX XXXX XXXX".substr($response['xMaskedCardNumber'],12,15),
					'cc_expiry_month' => substr($response['xExp'],0,2),
					'cc_expiry_year' => substr($response['xExp'],2),
					'customer_meta_data' => json_encode($meta),

				);
               
				$this->ci->Card_model->update_customer_primary_card($customer['customer_id'], $update_card_data);

			}
    	}

        
        $customer = json_decode(json_encode($customer), 1);
        $hasTokenexToken = (isset($token) and $token);

        if (!$hasTokenexToken) {
            $customer = $this->ci->Customer_model->get_customer($customer_id);
            $customer = json_decode(json_encode($customer), 1);
            $hasTokenexToken = (isset($token) and $token);
        }

        if (
            $this->areGatewayCredentialsFilled()
            and $customer
            and ($hasTokenexToken)
        ) {
            $result = true;
        }

        return true;
    }

    /**
     * @return string
     */
   

    /**
     * Checks if gateway settings are filled
     *
     * @return bool
     */
    public function areGatewayCredentialsFilled()
    {
        $filled = true;
        $selected_gateway_credentials = $this->getSelectedGatewayCredentials();

        foreach ($selected_gateway_credentials as $credential) {
            if (empty($credential)) {
                $filled = false;
            }
        }

        return $filled;
    }

    /**
     * @param bool $publicOnly
     * @return array
     */
    public function getSelectedGatewayCredentials($publicOnly = false)
    {
        $credentials = $this->getGatewayCredentials($this->selected_gateway, $publicOnly);

        return $credentials;
    }

    /**
     * @param null $filter
     * @param bool $publicOnly
     * @return array
     */
    public function getGatewayCredentials($filter = null, $publicOnly = false)
    {
        $credentials                                     = array();
        $credentials['selected_payment_gateway']         = $this->selected_gateway; // itodo legacy
        
        $meta_data = json_decode($this->company_gateway_settings['gateway_meta_data'], true);

        $credentials['payment_gateway'] = array(
            'transaction_key' => isset($meta_data["transaction_key"]) ? $this->ci->encrypt->decode($meta_data["transaction_key"]) : "",
            'payment_gateway_name' => isset($meta_data["payment_gateway_name"]) ? $meta_data["payment_gateway_name"] : "",
        );

        $result                                = $credentials;

        if ($filter) {
            $result                             = isset($result[$filter]) ? $result[$filter] : $result['payment_gateway'];
            $result['selected_payment_gateway'] = $this->selected_gateway; // itodo legacy
        }

        return $result;
    }

    /**
     * @return string
     */
    public function getErrorMessage()
    {
        return $this->error_message;
    }

    /**
     * @param string $error_message
     */
    public function setErrorMessage($error_message)
    {
        $this->error_message = $error_message;
    }

    /**
     * @param $payment_id
     */
    public function refundBookingPayment($payment_id, $amount, $payment_type, $booking_id = null)
    {
        $result = array("success" => true, "refund_id" => true);
        $this->ci->load->model('Payment_model');
        $this->ci->load->model('Customer_model');

        $payment = $this->ci->Payment_model->get_payment($payment_id);

        try {
            if ($payment['payment_gateway_used'] and $payment['gateway_charge_id']) {
                $customer = $this->ci->Customer_model->get_customer($payment['customer_id']);
                unset($customer['cc_number']);
                unset($customer['cc_expiry_month']);
                unset($customer['cc_expiry_year']);
                unset($customer['cc_tokenex_token']);
                unset($customer['cc_cvc_encrypted']);

                $card_data = $this->ci->Card_model->get_active_card($payment['customer_id'], $this->ci->company_id);
				
                if (isset($card_data) && $card_data) {
                    $customer['cc_number'] = $card_data['cc_number'];
                    $customer['cc_expiry_month'] = $card_data['cc_expiry_month'];
                    $customer['cc_expiry_year'] = $card_data['cc_expiry_year'];
                    $customer['cc_tokenex_token'] = $card_data['cc_tokenex_token'];
                    $customer['cc_cvc_encrypted'] = $card_data['cc_cvc_encrypted'];
                }

                $customer = json_decode(json_encode($customer), 1);
				

                if ($payment_type == 'full') {
                    $amount = abs($payment['amount']); // in cents, only positive
                }

                $currency = $this->ci->Currency_model->get_default_currency($this->company_gateway_settings['company_id']);
                $currency_code = $currency['currency_code'];
                $payer_details = $customer;
                $gateway_charge_id = $payment['gateway_charge_id'];
                $result = $this->refund_payment($amount, $currency_code, $payer_details, $gateway_charge_id);
                // prx($result);
            }
        } catch (Exception $e) {
            $result = array("success" => false, "message" => $e->getMessage());
        }

        return $result;
    }

    public function getCustomerTokenInfo()
    {
        $data = array();
        foreach ($this->getPaymentGateways() as $gateway => $settings) {
            if (isset($this->customer[$settings['customer_token_field']]) and $this->customer[$settings['customer_token_field']]) {
                $data[$gateway] = $this->customer[$settings['customer_token_field']];
            }
        }
        return $data;
    }

    /**
     * @return array
     */
 
    /**
     * @param $payment_type
     * @param $company_id
     * @return array
     */
    public function getPaymentGatewayPaymentType($payment_type, $company_id = null)
    {
        $settings = $this->getCompanyGatewaySettings();
        $company_id = $company_id ?: $settings['company_id'];

        $row = $this->query("select * from payment_type WHERE payment_type = '$payment_type' and company_id = '$company_id'");

        if (empty($row)) {
            // if doesn't exist - create
            $this->createPaymentGatewayPaymentType($payment_type, $company_id);
            $result = $this->getPaymentGatewayPaymentType($payment_type, $company_id);
        } else {
            $result = reset($row);
        }

        return $result;
    }

    /**
     * @return array
     */
    public function getCompanyGatewaySettings()
    {
        return $this->company_gateway_settings;
    }

    /**
     * @param array $company_gateway_settings
     */
    public function setCompanyGatewaySettings($company_gateway_settings)
    {
        $this->company_gateway_settings = $company_gateway_settings;
    }

    private function query($sql)
    {
        return $this->ci->db->query($sql)->result_array();
    }

    /**
     * @param $company_id
     */
    public function createPaymentGatewayPaymentType($payment_type, $company_id)
    {
        $this->ci->db->insert(
            'payment_type',
            array(
                'payment_type' => $payment_type,
                'company_id' => $company_id,
                'is_read_only' => '1',
            )
        );

        return $this->ci->db->insert_id();
    }


    public function make_payment( $amount, $currency_code, $payer_details, $token)
    {
        $api_url = $this->cardknox_base_url;
        $method = '';
        $method_type = 'POST';

        $myref = 'Minical-booking-payment' . strtotime(date('Y-m-d H:i:s'));

        $payer_detail = explode(" ", $payer_details['customer_name']);
        $payer_detail['first_name'] = $payer_detail[0];
        $payer_detail['last_name'] = isset($payer_detail[1]) ? $payer_detail[1] :''; 
     
		$data = array(
			'xKey'=> $this->transaction_key,
			'xVersion'=>"4.5.9",
			'xSoftwareName'=>"Minical",
			'xSoftwareVersion'=>"1.0",
			'xCommand'=>"cc:sale",
			"xToken"=>$token,
			"xAmount"=>$amount,
			"xName"=>$payer_details['customer_name'],
			'xDescription'=>'customer_notes:'.$payer_details['customer_notes'],
			'xCustom01'=>'address:'.$payer_details['address'],
			'xCustom02'=>'city:'.$payer_details['city'],
			'xCustom03'=>'region:'.$payer_details['region'],
			'xCustom04'=>'country:'.$payer_details['country'],
			'xCustom05'=>'postal_code:'.$payer_details['postal_code'],
			'xCustom06'=>'phone:'.$payer_details['phone'],
			'xCustom07'=>'fax:'.$payer_details['fax'],
			'xCustom08'=>'email:'.$payer_details['email'],
			'xCustom09'=>'address2:'.$payer_details['address2'],
			'xCustom10'=>'phone2:'.$payer_details['phone2'],
			'xCustom11'=>'cc_expiry_month_year:'.$payer_details['cc_expiry_month'].'/'.$payer_details['cc_expiry_year'],
		);

        $headers = array(
            "Accept: */*",
			"Accept-Encoding: gzip, deflate, br",
			"Content-Type: multipart/form-data",
        );

        $response = $this->call_api($api_url, $method, $data, $headers, $method_type);

		$response = trim($response,'"');
		$responseArray = array_values(explode("&",$response));
		
		foreach ($responseArray as $key => $value) {
			if (str_contains($responseArray[$key], 'xStatus')) { 
				$responseStatus = explode("=",$responseArray[$key])[1];
			}
			if (str_contains($responseArray[$key], 'xError=')) { 
				$responseError = explode("=",$responseArray[$key])[1];
			}
			if (str_contains($responseArray[$key], 'xRefNum')) { 
				$responseRefNum = explode("=",$responseArray[$key])[1];
			}

		}
		// prx($responseStatus.'==='.$responseError.'==='.$responseRefNum);


       
        if(
            $response && 
            isset($responseStatus) &&
            $responseStatus == 'Approved'
        ) {
            return array('success' => true, 'charge_id' => $responseRefNum);
        } else {
            if(
                $response &&
                isset($responseStatus) &&
                $responseStatus == 'Error' &&
                isset($responseError) &&
                $responseError != ''
            ) {
                return array('charge_failed' => 'error', 'message' => $responseError);
            } 
        }
        // prx($response);
        return $response;
    }


    public function refund_payment($amount, $currency_code, $payer_details, $gateway_charge_id)
    {

        $api_url = $this->cardknox_base_url;
        $method = '';
        $method_type = 'POST';
       
        $myref = 'Minical-booking-payment' . strtotime(date('Y-m-d H:i:s'));

        $payer_detail = explode(" ", $payer_details['customer_name']);
        $payer_detail['first_name'] = $payer_detail[0];
        $payer_detail['last_name'] = isset($payer_detail[1]) ? $payer_detail[1] :''; 

		$data= array(
			'xKey'=> $this->transaction_key,
			'xVersion'=>"4.5.9",
			'xSoftwareName'=>"Minical",
			'xSoftwareVersion'=>"1.0",
			'xCommand'=>"cc:refund",
			"xAmount"=>$amount,
			"xRefNum"=> $gateway_charge_id,
			'xName'=>$payer_details['customer_name'],
			'xDescription'=>'customer_notes:'.$payer_details['customer_notes'],
			'xCustom01'=>'address:'.$payer_details['address'],
			'xCustom02'=>'city:'.$payer_details['city'],
			'xCustom03'=>'region:'.$payer_details['region'],
			'xCustom04'=>'country:'.$payer_details['country'],
			'xCustom05'=>'postal_code:'.$payer_details['postal_code'],
			'xCustom06'=>'phone:'.$payer_details['phone'],
			'xCustom07'=>'fax:'.$payer_details['fax'],
			'xCustom08'=>'email:'.$payer_details['email'],
			'xCustom09'=>'address2:'.$payer_details['address2'],
			'xCustom10'=>'phone2:'.$payer_details['phone2'],
			'xCustom11'=>'cc_expiry_month_year:'.$payer_details['cc_expiry_month'].'/'.$payer_details['cc_expiry_year'],
			// 'xCustom12'=>'cc_number:'.$payer_details['cc_number'],

		);
        
        $headers = array(
            "Accept: */*",
			"Accept-Encoding: gzip, deflate, br",
			"Content-Type: multipart/form-data",
        );

        $response = $this->call_api($api_url, $method, $data, $headers, $method_type);

        $response = trim($response,'"');
		$responseArray = array_values(explode("&",$response));
		
		foreach ($responseArray as $key => $value) {
			if (str_contains($responseArray[$key], 'xStatus')) { 
				$responseStatus = explode("=",$responseArray[$key])[1];
			}
			if (str_contains($responseArray[$key], 'xError=')) { 
				$responseError = explode("=",$responseArray[$key])[1];
			}
			if (str_contains($responseArray[$key], 'xRefNum')) { 
				$responseRefNum = explode("=",$responseArray[$key])[1];
			}

		}

		if(
            $response && 
            isset($responseStatus) &&
            $responseStatus == 'Approved'
        ) {
            return array('success' => true, 'refund_id' => $responseRefNum);
        } else {
            if(
                $response &&
                isset($responseStatus) &&
                $responseStatus == 'Error' &&
                isset($responseError) &&
                $responseError != ''
            ) {
                return array('refund_failed' => 'error', 'message' => $responseError);
            } 
        }
        
        return $response;
    }
}
