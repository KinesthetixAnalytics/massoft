<?php
class Kinesthetics_Bundle_IndexController extends Mage_Core_Controller_Front_Action
{
    public function indexAction(){
    		echo 'Hello Index!';
    }

    public function getapiAction(){
    	$arr = array(
    				'api_url' => Mage::getStoreConfig('bundle_section/bundle_group/api_url'), 
    				'client_id' => Mage::getStoreConfig('bundle_section/bundle_group/api_client_id'), 
    				'client_secret' => Mage::getStoreConfig('bundle_section/bundle_group/api_client_secret'),
    				'no_of_categories' => Mage::getStoreConfig('bundle_section/bundle_group/no_of_categories'),
    				'show_bundle_price_category' => intval(Mage::getStoreConfig('bundle_section/bundle_group/show_bundle_price_category')),
    				'show_bundle_price_product' => intval(Mage::getStoreConfig('bundle_section/bundle_group/show_bundle_price_product'))
    			);
		echo json_encode($arr);
    }

    public function setsessiondataAction(){
            $inputJSON = file_get_contents('php://input');
            $input= json_decode( $inputJSON, TRUE );
            Mage::getSingleton('core/session')->setBundleCatName($input['cat_name']);
            Mage::getSingleton('core/session')->setBundleObjId($input['bundle_id']);
            Mage::getSingleton('core/session')->setBundleDiscount($input['discount']);
    }

     public function unsetsessiondataAction(){
            Mage::getSingleton('core/session')->unsBundleCatName();
            Mage::getSingleton('core/session')->unsBundleObjId();
            Mage::getSingleton('core/session')->unsBundleDiscount();
    }
}