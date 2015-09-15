<?php
require_once "Mage/Checkout/controllers/CartController.php";  
class Kinesthetics_Bundle_Checkout_CartController extends Mage_Checkout_CartController{
	public function addAction()
    { 
        if (!$this->_validateFormKey()) {
            $this->_goBack();
            return;
        }
        $cart   = $this->_getCart();
        $params = $this->getRequest()->getParams();
        try {
            if (isset($params['qty'])) {
                $filter = new Zend_Filter_LocalizedToNormalized(
                    array('locale' => Mage::app()->getLocale()->getLocaleCode())
                );
                $params['qty'] = $filter->filter($params['qty']);
            }

            $product = $this->_initProduct();
            $related = $this->getRequest()->getParam('related_product');

            /**
             * Check product availability
             */
            if (!$product) {
                $this->_goBack();
                return;
            }


            $disval = Mage::getSingleton('core/session')->getBundleDiscount();
            $distype = $this->getRequest()->getParam('optdiscounttype');
            $burl = $this->getRequest()->getParam('bundle_url');
           

            //if($distype=='fixed'){
               //$addprice = $product->getFinalPrice()-$disval;
            //}
            //elseif($distype=='percent'){
               // $addprice = $product->getPrice() - (($disval/100)*$product->getPrice());
            //}

            $quote = Mage::getModel('checkout/cart')->getQuote();
            $items = $quote->getAllItems();  
            foreach($items as $item1) {  
                $ids[]= $item1->getProduct()->getId();
            }
            if (in_array($product->getId(), $ids)) {
                 $this->_getSession()->addError(Mage::helper('core')->escapeHtml('This item is already in your cart with bundle. Please update quantity.'));
                 $this->_goBack();
                return;
            }


            
            $cart->addProduct($product, $params);
            if (!empty($related)) {
                $cart->addProductsByIds(explode(',', $related));
            }

            $cart->save();

            /* added by sukumar */
            
            
            if($disval>0){
             $_SESSION['discount_'.$product->getId()]= $disval;
             $_SESSION['burl_'.$product->getId()]= $burl;
                /*
            $quote = Mage::getModel('checkout/cart')->getQuote();

                foreach ($quote->getAllItems() as $item) {
                    if($item->getProduct()->getId()==$product->getId()){
                        $item->setCustomPrice($addprice);
                        $item->setOriginalCustomPrice($addprice);
                        $quote->save();
                    }
                    
                }*/
            Mage::getSingleton('core/session')->unsBundleCatName();
            Mage::getSingleton('core/session')->unsBundleObjId();
            Mage::getSingleton('core/session')->unsBundleDiscount();
            }
            /* added by sukumar */

            
            $this->_getSession()->setCartWasUpdated(true);

            /**
             * @todo remove wishlist observer processAddToCart
             */
            Mage::dispatchEvent('checkout_cart_add_product_complete',
                array('product' => $product, 'request' => $this->getRequest(), 'response' => $this->getResponse())
            );

            if (!$this->_getSession()->getNoCartRedirect(true)) {
                if (!$cart->getQuote()->getHasError()) {
                    $message = $this->__('%s was added to your shopping cart.', Mage::helper('core')->escapeHtml($product->getName()));
                    $this->_getSession()->addSuccess($message);
                }
                $this->_goBack();
            }
        } catch (Mage_Core_Exception $e) {
            if ($this->_getSession()->getUseNotice(true)) {
                $this->_getSession()->addNotice(Mage::helper('core')->escapeHtml($e->getMessage()));
            } else {
                $messages = array_unique(explode("\n", $e->getMessage()));
                foreach ($messages as $message) {
                    $this->_getSession()->addError(Mage::helper('core')->escapeHtml($message));
                }
            }

            $url = $this->_getSession()->getRedirectUrl(true);
            if ($url) {
                $this->getResponse()->setRedirect($url);
            } else {
                $this->_redirectReferer(Mage::helper('checkout/cart')->getCartUrl());
            }
        } catch (Exception $e) {
            $this->_getSession()->addException($e, $this->__('Cannot add the item to shopping cart.'));
            Mage::logException($e);
            $this->_goBack();
        }
    }
}
				