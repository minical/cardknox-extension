<?php
class Cardknox_controller extends MY_Controller
{
    public $module_name;

	function __construct()
	{
        parent::__construct();
        $this->module_name = $this->router->fetch_module();

        $this->load->model('../extensions/'.$this->module_name.'/models/Cardknox_model');
        $this->load->model('../extensions/'.$this->module_name.'/models/Card_model');
		
        $this->load->library('../extensions/'.$this->module_name.'/libraries/CardknoxIntegration');
        $this->load->helper('url'); // for redirect
		$this->load->library('encrypt');
        
		$view_data['menu_on'] = true;

		$this->load->vars($view_data);
	}  

	function save_customer_cardknox_card(){

		$cardknox_data = $this->Cardknox_model->get_cardknox_detail($this->company_id);
		$cardknox_data = json_decode($cardknox_data['gateway_meta_data'], true);
		$xKey = $this->encrypt->decode($cardknox_data['transaction_key']);

		$customer_data =  $this->input->post();
		// prx($customer_data); die;
        $cardNumber = $customer_data['data']['0']['cc_number'];
        $cardExpDate = $customer_data['data']['0']['cc_expiry_month'].$customer_data['data']['0']['cc_expiry_year'];
        $customerName = $customer_data['data']['0']['customer_name'];
        // $customerCvc = $customer_data['data']['0']['cvc'];
   
		$result = $this->cardknoxintegration->get_cardknox_token($xKey, $cardNumber,$cardExpDate,$customerName,$customer_data);

		$result = trim($result,'"');
		$resultArray = array_values(explode("&",$result));
		$resultToken = '';
		$resultStatus = '';
		$resultError = '';
		
		foreach ($resultArray as $key => $value) {

			if (str_contains($resultArray[$key], 'xToken')) { 
				$resultToken = explode("=",$resultArray[$key])[1];
			}else{
				if (str_contains($resultArray[$key], 'xStatus')) { 
					$resultStatus = explode("=",$resultArray[$key])[1];
				}
				if (str_contains($resultArray[$key], 'xError=')) { 
					$resultError = explode("=",$resultArray[$key])[1];
				}
			}

		}

		$resultError = str_replace("+", " ", $resultError);

		if ($resultStatus == 'Error') {
			echo json_encode(array('failed' => true, 'company_id' => $this->company_id , 'error'=> $resultError));

		} else {
			echo json_encode(array('success' => true, 'company_id' => $this->company_id , 'token' => $resultToken));
		}
		

	}

    function index()
    {
        $data['menu_on'] = TRUE;
        $files = get_asstes_files($this->module_assets_files, $this->module_name, $this->controller_name, $this->function_name);
		
		$cardknox_data = $this->Cardknox_model->get_cardknox_data($this->company_id);

		if(isset($cardknox_data)){
			$data['transaction_key'] =	isset(json_decode($cardknox_data['gateway_meta_data'],true)['transaction_key']) ? $this->encrypt->decode(json_decode($cardknox_data['gateway_meta_data'],true)['transaction_key']) :'';
			// $data['iFields_key'] =  isset(json_decode($cardknox_data['gateway_meta_data'],true)['iFields_key']) ? $this->encrypt->decode(json_decode($cardknox_data['gateway_meta_data'],true)['iFields_key']) :'' ;
			$data['selected_payment_gateway'] =	isset($cardknox_data['selected_payment_gateway']) ? $cardknox_data['selected_payment_gateway'] :'';
		    $data['all_payment_gateways_detail'] = 'cardknox';
    	}
        $data['main_content'] = '../extensions/'.$this->module_name.'/views/cardknox_key';
        $this->template->load('bootstrapped_template', null , $data['main_content'], $data);
    }

	function signin_cardknox(){
	
     	$this->Cardknox_model->deconfigure_cardknox_apikey($this->company_id);

		$cardknox_data = $this->Cardknox_model->get_cardknox_data($this->company_id);
			
		$transaction_key = $this->input->post('transaction_key');
		// $iFields_key = $this->input->post('iFields_key');

		$meta['transaction_key'] = $this->encrypt->encode($transaction_key);
		// $meta['iFields_key'] = $this->encrypt->encode($iFields_key);
			
		$data = array(
					'company_id' => $this->company_id,
					'gateway_meta_data' => json_encode($meta),
					'selected_payment_gateway' => 'cardknox'
				);

		$this->Cardknox_model->save_api_key($data);
		echo json_encode(array('success' => true));
    }	

	function deconfigure_cardknox_apikey(){
			
		$this->Cardknox_model->deconfigure_cardknox_apikey($this->company_id);
		
	}

}
