<?php
class Card_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
    }

    function get_customer_cards($customer_id)
    {
        $this->db->select('cc.*, c.stripe_customer_id');
        $this->db->where('cc.customer_id', $customer_id);
        $this->db->where('cc.is_card_deleted', 0);
        $this->db->from('customer_card_detail as cc');
        $this->db->join('customer as c', 'cc.customer_id = c.customer_id', 'left');
        $query = $this->db->get();

        if ($this->db->_error_message()) {
            show_error($this->db->_error_message());
        }

        if ($query->num_rows >= 1) {
            return $query->result_array();
        }
        return null;
    }

    function get_active_card($customer_id, $company_id)
    {
        $this->db->where('customer_id', $customer_id);
        $this->db->where('company_id', $company_id);
        $this->db->where('is_primary', 1);
        $this->db->where('is_card_deleted', 0);
        $this->db->from('customer_card_detail');
        $query = $this->db->get();
        $result = $query->result_array();

        if ($this->db->_error_message()) {
            show_error($this->db->_error_message());
        }
        $customer = "";
        if ($query->num_rows >= 1) {
            $customer = $result[0];
        }

        return $customer;
    }

    function update_customer_primary_card($customer_id, $data)
    {
        $data = (object) $data;
        $this->db->where('is_primary', 1);
        $this->db->where('customer_id', $customer_id);
        $this->db->update("customer_card_detail", $data);
        if ($this->db->affected_rows() > 0) {
            return true;
        } else {
            return false;
        }
    }

    function create_customer_card_info($data)
    {
        $data = (object) $data;
        $this->db->insert("customer_card_detail", $data);
        if ($this->db->_error_message()) {
            show_error($this->db->_error_message());
        }
    }
}
