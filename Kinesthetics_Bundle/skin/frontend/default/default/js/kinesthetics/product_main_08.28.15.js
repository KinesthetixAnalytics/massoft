Detectizr.detect({detectScreen:false});


 var off = angular.module('off',['serve_http']).run(['$rootScope','$location','$http', function($rootScope, $location, $http){
	$http.post('//'+$location.$$host+'/index.php/bundle/index/getapi', {cache: true}).then(function(resp){
		$rootScope.domain = $location.$$host;
		$rootScope.client_id = resp.data.client_id;
		$rootScope.client_secret = resp.data.client_secret;
		$rootScope.no_of_categories = resp.data.no_of_categories;
		$rootScope.show_bundle_price_category = resp.data.show_bundle_price_category;
		$rootScope.show_bundle_price_product = resp.data.show_bundle_price_product;
		//console.log('runblock', $rootScope.show_bundle_price_category);
		$rootScope.$broadcast('rootscope_updated', $rootScope);	
	})
	
}]).constant("badBrowser",{
	"Modernizr" : Modernizr,
	"Detectizr" : Detectizr
});


off.controller('off_controller', ['$scope', '$rootScope', 'serve_http', function($scope, $rootScope, serve_http){
		$scope.$on("directive_loaded", function(s, attrs){
			console.log(attrs);
					serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {
				        cache: true,
				        'client_id': $rootScope.client_id,
				        'client_secret': $rootScope.client_secret,
				        'grant_type': 'client_credentials'
				    })
				    .then(function(rep) {
				            serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategory/', {
				                    product_id: attrs.productid,
				                    category_id: attrs.catid,
				                    price:attrs.actualprice,
				                    access_token: rep.data.access_token
				                })
				                .then(function(out) {
				                	$rootScope.all_relevent_offers = out.data.raws.dataset.products;
				                	$scope.categoryname = attrs.catname;
				                	$scope.applied_offers_category = out.data.raws.dataset.products[attrs.catname].details;

				                	$scope.$broadcast('usedOffer', $scope.applied_offers_category);

				                	

				                });
					});
		});

}]);


off.directive('usedOffer', ['$rootScope', 'serve_http', function($rootScope, serve_http){
	return{
		template:"<div class='bundle-offers bundle-offer-block' id='usedOffer' ng-cloak>{{offers|json}}<h2>Bundle Offers</h2>"+
				"<h4>{{cataname?cataname:catname}}</h4><ul id='offered_slct'>"+
				"<li ng-repeat='offer in offers'><h5 class='bndl_cat_name'>{{offer.bundle_object_name}}</h5>"+
					"<input type='radio' name='uoff_chosen' ng-checked='checkme($index, offer.bundle_object_id)' ng-click='reassignOffer($event, offer)'>"+
					"<span class='bundle-img'><img src='{{offer.bundle_object_image_URL}}'></span>"+
					"<span class='plus-block'>+</span>"+
					"<span class='name-wrap'>"+
	                    "<span><img width='40' src='{{offer.bundle_object_image_URL}}'></span>"+
	                    "<div class='details-wrap'>"+
	                        "<label>Get {{currency}}{{offer.discount}} discount on purchase of </label>"+
	                        "<p>{{offer.bundle_object_name}}</p>"+
	                        "<label>from {{offer.bundle_URL}}</label>"+
	                    "</div>"+
	                "</span><span class='equal-block'>=</span>"+
	                "<span class='price-sec'>"+
                        "<h6>BUNDLE PRICE</h6>"+
                             "<span class='actual-price'>{{currency}}{{actualprice - offer.discount}}</span>"+
                        "</span>"+
				"</li>"+
				"</ul></div>",
		scope:{
			catname:'@',
			bundleid:'@',
			actualprice:'@',
			currency:'@',
			productid:'@'
		},
		restrict:'E',
		replace:'true',
		link:function($scope, elem, attrs){
			$scope.selected_off=attrs.bundleid;
			$scope.currency = attrs.currency;
			$scope.actualprice = attrs.actualprice;
			$scope.catname = attrs.catname;

			$rootScope.productid = attrs.productid;
			$rootScope.actualprice = attrs.actualprice;
			$rootScope.catname = attrs.catname;
			$rootScope.currency = attrs.currency;
			$rootScope.currencyRatio = attrs.currencyratio;
			$rootScope.proname = attrs.proname;


			$scope.checkme = function(index, boi){
				//console.log($scope.selected_off, boi, $scope.chkd, index,  $scope.chkd==index ||$scope.selected_off==boi);
				//if($scope.chkd==undefined){
					//console.log('$scope.chkd is undefined', $scope.selected_off, boi);
					//return true;
				//}else{
					console.log($scope.chkd, index, $scope.selected_off, boi)
				if($scope.chkd!=undefined){
					//console.log($scope.chkd, index);
					return $scope.chkd==index;
				}else{
					//console.log($scope.selected_off, boi, $scope.selected_off==boi);
					if($scope.selected_off==boi){
						//console.log($scope.selected_off, boi, $scope.selected_off==boi);
						return true;
					}else{
						return false;
					}
				}
			}


			$scope.reassignOffer = function(ev, offer){
				console.log(offer.bundle_object_id, $scope.selected_off);
				$scope.selected_off = offer.bundle_object_id?offer.bundle_object_id : $scope.selected_off;
				console.log($scope.selected_off);
				serve_http.get_details('http://magentoshop.staging-websites.com/index.php/bundle/index/setsessiondata', {cat_name:$scope.cataname?$scope.cataname:$scope.catname, bundle_id:$scope.selected_off, discount:offer.discount?offer.discount:offer});
				$rootScope.$broadcast('offer_changed', $scope.currency, $scope.actualprice  - (offer.discount?offer.discount:offer), $scope.selected_off);
			}

			//$scope.choosen 
			$scope.$on('rootscope_updated', function(){
				$scope.$emit('directive_loaded', attrs);
			});

			$scope.$on('usedOffer', function(s, o, cnm, i, discount, bndlid){
				console.log(bndlid);
				$scope.selected_off = bndlid?bndlid:$scope.selected_off;
				$scope.cataname = cnm;
				$scope.offers = o;
				if(i==0 || i){
					$scope.chkd = i;
				};

				if(discount){
					$scope.discount = discount;
					$scope.reassignOffer(null, discount);
				};

				console.log($scope.chkd, $scope.selected_off, discount)

				angular.forEach(o, function(key, val){
					if(key.bundle_object_id == $scope.bundleid){
						$scope.discount=key.discount;
						$rootScope.$broadcast('offer_changed', $scope.currency, $scope.actualprice  - $scope.discount);
					}

				});
				//console.log(cnm, $scope.cataname?$scope.cataname:$scope.catname)

				$rootScope.$broadcast('get_all_offers', $scope.cataname?$scope.cataname:$scope.catname);
				
			});


			//$rootScope.$broadcast('pricetag', $scope.currency, $scope.actualprice  - offer.discount)
		}

	}
}]);

off.directive('bundleOfferPrices',[ function(){
	return{
		scope:true,
		restrict:'C',
		controller:function($scope){
		},
		link:function($scope, elem, attrs, $compile){

			$scope.$on('offer_changed', function(s,e,f){
				if(jQuery(elem).find('.discounted_price').length){
					jQuery(elem).find('.discounted_price').text(e+f);
				}else{
					jQuery(elem).append("<span class='discounted_price'>"+e+f+"</span>");
				}
			});
			
		}
	}
}])


off.directive('restCat', ['serve_http', function(serve_http){
	return{//ng-click='change_cat_off($event, catname, catdet.details[0].category_id)'
		template:"<div class='res_cat_holder'><h4>Choose a different category to bundle with:</h4><ul><li ng-repeat='(catname, catdet) in offers track by $index' ng-if='(catname != catnm) && $index'><a href='' ><img ng-src='{{catdet.image}}' width='50' alt='{{catname}}'><h4>{{catname}}</h4></a>"+
					"<ul>"+
						"<li ng-repeat='det in catdet.details track by $index'>"+
							"<a id='det.category_id' ng-click='redirect_with_offer(det.bundle_object_id, det.product_category, det.category_id, $index, det.discount, $event)'>"+
								"{{det.bundle_object_id}}<img src='{{::det.bundle_object_image_URL}}' ng-if='det.bundle_object_image_URL.length'>"+
								"<h4>Buy this {{::det.bundle_object_name|limitTo:13}}<span ng-if='det.bundle_object_name.length > 13'>...</span></h4>"+
								"<span>in the next {{::det.validity}} days and get an additional discount of {{(det.discount/actualprice)*100 | number:2}}% </span>"+
								"<span>(Discount: {{::currency}} {{::det.discount*currencyratio}}) on {{proname}}</span>"+
							"</a>"+
						"</li>"+
					"</ul>"+
				 "</li></ul></div>",
		restrict:'E',
		replace:true,
		scope:true,
		controller:function($scope, $rootScope){
			$scope.currency = $rootScope.currency;
			$scope.currencyratio = $rootScope.currencyRatio;
			$scope.redirect_with_offer = function(bndlid, catnm, catid, index, discount, ev){
				console.log(bndlid);

				$rootScope.$broadcast('get_all_offers', catnm, catid, index, discount, bndlid);
			};
			
			$scope.$on('get_all_offers', function(s, cnm, catid, i, discount, bndlid){
				//console.log($rootScope.all_relevent_offers);
				$scope.offers = $rootScope.all_relevent_offers;
				$scope.catnm = cnm;

				if(catid){
					$scope.change_cat_off(null, cnm, catid, i, discount, bndlid);
				}
			});

			var catn;
			$scope.change_cat_off = function(e, catname, catid, i, discount, bndlid){
					serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {
				        cache: true,
				        'client_id': $rootScope.client_id,
				        'client_secret': $rootScope.client_secret,
				        'grant_type': 'client_credentials'
				    })
				    .then(function(rep) {				    	
				            serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategory/', {
				                    product_id: $rootScope.productid,
				                    category_id: catid,//////////////////////////////////////////////
				                    price:$rootScope.actualprice,
				                    access_token: rep.data.access_token
				                })
				                .then(function(out) {
				                	$rootScope.all_relevent_offers = out.data.raws.dataset.products;
				                	$scope.categoryname = catname;
				                	$scope.applied_offers_category = out.data.raws.dataset.products[catname].details;
				                	console.log(bndlid);
				                	$rootScope.$broadcast('usedOffer', $scope.applied_offers_category, catname, i, discount, bndlid);
				                	
				                	console.log(catname);
				                	//setTimeout(function(){$rootScope.$apply()},1);
				                });
					});
			}

		}
	}
}])
	

var serve_http = angular.module('serve_http',[]);
	serve_http.factory('serve_http',function($http){
			function get_details(u,p){ return $http.post(u,(p?p:null))};
		return {get_details:get_details};
});

