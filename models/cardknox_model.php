<?php

class Cardknox_model extends CI_Model {

	function __construct()
    {
        parent::__construct();
    }


    function save_api_key($data)
    {
        $data = (object)$data;
        $this->db->insert("company_payment_gateway", $data);

        if ($this->db->_error_message())
		{
            show_error($this->db->_error_message());
		}
      
      	$query = $this->db->query('select LAST_INSERT_ID( ) AS last_id');
      	$result = $query->result_array();
      	if(isset($result[0]))
      	{  
        	return $result[0]['last_id'];
      	}
      	else
      	{  
        	return null;
      	}
    }

    function update_api_key($data)
    {
        $this->db->where('company_id', $data['company_id']);
        $this->db->update("company_payment_gateway", $data);
    }
   
    function get_cardknox_data($company_id){
        $this->db->select('cpg.*');
        $this->db->from('company_payment_gateway as cpg');

        $this->db->where('company_id', $company_id);

        $query = $this->db->get();

        $result = $query->row_array();
        
        if ($this->db->_error_message())
        {
            show_error($this->db->_error_message());
        }
        
        if ($query->num_rows >= 1)
        {
            return $result;
        }
        return null;
    }
     

    function get_cardknox_detail($company_id){
        $this->db->select('cpg.*');
        $this->db->from('company_payment_gateway as cpg');
        $this->db->where('company_id', $company_id);
        $this->db->where('selected_payment_gateway', 'cardknox');

        $query = $this->db->get();

        $result = $query->row_array();
        
        if ($this->db->_error_message())
        {
            show_error($this->db->_error_message());
        }
        
        if ($query->num_rows >= 1)
        {
            return $result;
        }
        return null;
    }

	function deconfigure_cardknox_apikey($company_id){

        $this->db->where('company_id', $company_id);
        $this->db->where('selected_payment_gateway', 'cardknox');
        $this->db->delete('company_payment_gateway');
    }

}
