 var off = angular.module('off',['serve_http']).run(['$rootScope','$location','$http', function($rootScope, $location, $http){
	$http.post('//'+$location.$$host+'/index.php/bundle/index/getapi', {cache: true}).then(function(resp){
		$rootScope.domain = $location.$$host;
		$rootScope.client_id = resp.data.client_id;
		$rootScope.client_secret = resp.data.client_secret;
		$rootScope.no_of_categories = resp.data.no_of_categories;
		$rootScope.show_bundle_price_category = resp.data.show_bundle_price_category;
		$rootScope.show_bundle_price_product = resp.data.show_bundle_price_product;

		if(!$rootScope.$$phase) {
		  $rootScope.$apply();
		}
	})
	
}]);

		off.directive('offerd',['$rootScope', 'serve_http', function($rootScope, serve_http){
			return{
				template:
						"<form action='{{::action}}' class='bun_let' method='post'><input type='hidden' name='bundle_ob_id'></input><input type='hidden' name='bundle_cat_name'></input>"+
						"<div><h3>Bundle with:<span ng-if='show_bundle_price_category'>?<i>This is where you describe what is all about...</i></span></h3>"+
						"<span class='bundle_reload' ng-if='show_loading'></span>"+
							"<div ng-cloak><ul class='bndl_ul'>"+
								"<li ng-repeat='(catName, catDetails) in categories' ng-if='catName !=\"have_more_offers\"'>"+
									
									"<a ng-click='showHide($event)'>{{catName|limitTo:30}}<span ng-if='catName.length > 30'>...</span></br><i class='bundle_lowest_price'>Starting as low as {{::currency}}: {{catDetails.lowest_price}}</i></a>"+
									"<div class='off_holder' style='display:none;'>"+
									"<div ng-repeat='detail in catDetails' ng-if='$index !=0' class='bndl_catdet'>"+
										"<div ng-repeat='det in detail' class='bndl_off'>"+
											"<a ng-click='redirect_with_offer(det.bundle_object_id, det.product_category, $event)'>"+
												"<img src='{{::det.bundle_object_image_URL}}' ng-if='det.bundle_object_image_URL.length'>"+
												"<h4>Buy this {{::det.bundle_object_name|limitTo:13}}<span ng-if='det.bundle_object_name.length > 13'>...</span></h4>"+
												"<span>in the next {{::det.validity}} days and get an additional discount of {{(det.discount/actualprice)*100 | number:2}}% </span>"+
												"<span>(Discount: {{::currency}} {{::det.discount*currencyratio}}) on {{productname}}</span>"+
											"</a>"+
											"</div>"+
									"</div>"+
									"</div>"+

								"</li>"+
							"</ul>"+
							"<span ng-if='categories.have_more_offers !=\"no\"' class='bndl_btn'><a href='' ng-click='show_more_categories($event)'>View More Categories</a></span></div>"+
						"</form>",
				restrict:"A",
				scope:true,
				controller:function($scope, $rootScope, $compile, serve_http){
					$scope.show_loading = true;
					$scope.show_bundle_price_category = $rootScope.show_bundle_price_category;
					$scope.action = $rootScope.action;
					$scope.pager = 2;

					$scope.show_more_categories = function(){


						serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {cache: true, 'client_id' : $rootScope.client_id, 'client_secret' : $rootScope.client_secret, 'grant_type' : 'client_credentials'})
												.then(function(rep){
													serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategory/', {product_id:$scope.product_id , category_id:$scope.category_id , no_of_category: $rootScope.no_of_categories, price:$scope.actualprice, access_token:rep.data.access_token, page:$scope.pager})
														.then(function(out){
															$scope.pager++;
															$scope.categories = jQuery.extend({},$scope.categories, out.data.raws.dataset.products);															
														});
												});
						
					};
					

					$scope.redirect_with_offer = function(bid, bcname, ev){
						var $frm = jQuery(ev.target).closest('form');
							$frm.find('input[name=bundle_ob_id]').val(bid);
							$frm.find('input[name=bundle_cat_name]').val(bcname);
							$frm.submit();
					}

					$scope.$on('offerTempUpdated', function(s, ds){
						$scope.product_id = ds.product_id;
						$scope.category_id = ds.category_id;
						$scope.actualprice = ds.actualprice;
						$scope.categories = ds.data.raws.dataset.products;
						$scope.show_loading = false;
					});
				},
				link:function($scope, elem, attrs,  $compile){

					var elm = elem;

					$scope.showHide = function(ev){
						var element = (ev.target.localName=='i' || ev.target.localName=="I")?jQuery(ev.target).parent() : ((ev.target.localName=='li' || ev.target.localName=="LI")?jQuery(ev.target).children("a"):jQuery(ev.target));

						var $evel = jQuery(element).toggleClass('opened_up');
						var $par = $evel.parent().parent();
						//console.log($par, $par.find('a.opened_up'), $par.find('a.opened_up').not($evel));
						$par.find('a.opened_up').not($evel).removeClass('opened_up');
						var $targetEl = element.next();
						$par.find('.off_holder').not($targetEl).stop(true, true).slideUp();
						$targetEl.stop(true, true).slideToggle();
					}

					elem.bind('mouseleave', function(e){
						elm.find('.opened_up').removeClass('opened_up').next().stop(true, true).slideUp();
					})

				}
			}
		}]);

		
		off.directive('url',[function(){
			return{
				scope:false,
				controller:function($scope){
					//this.action  = $scope.action;
				},
				link:function($scope, elem, attrs){
					$scope.action = attrs.href;
				}
			}
		}])

		off.directive('bundle',['$compile', 'serve_http', '$rootScope', function($compile, serve_http, $rootScope){
			return{
				scope:{
					cat_id:'@',
					prod_id:'@',
					price:'@',
					prefixtext:'@',
					actualprice:'@',
					currency:'@',
					currencyratio:'@',
					productname:'@'
				},
				restrict:'A',
				controller:function($scope, $http, $location, $rootScope, $timeout){
					//console.log($rootScope, $rootScope.client_id);
						$scope.domain = $location.$$host;
						$scope.api_called = false;
						$scope.show_bundle_price_category = $rootScope.show_bundle_price_category;
						$scope.prefixtext = jQuery.trim($scope.prefixText).length? $scope.prefixText : 'Bundle Price';

						$scope.setPos = function(t){

								if(jQuery(t).attr('ng-mouseover') != undefined){
									$child = jQuery(t).children('.putUp');
											 $child.removeAttr('style');
									var rel_pos = parseInt($child.offset().left) + parseInt($child.width());
									var win_width = parseInt(jQuery(window).width());
									var css_pos = parseInt($child.css('left'));
									if( rel_pos > win_width ){
										//console.log('in', rel_pos, win_width);
										$child.css({'left': css_pos - ((rel_pos - win_width)+20)+'px'});
									}
								}
								
							
						}
						

							$scope.call_all = function(cd, pd, ev){
								$scope.setPos(ev.target);
								if(ev.type=='mouseover' && !$scope.api_called){
										ev.stopImmediatePropagation();					
											serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {cache: true, 'client_id' : $rootScope.client_id, 'client_secret' : $rootScope.client_secret, 'grant_type' : 'client_credentials'})
												.then(function(rep){
													serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategory/', {product_id:$scope.prodId , category_id:$scope.catId , no_of_category: $rootScope.no_of_categories, price:$scope.actualprice, access_token:rep.data.access_token})
														.then(function(out){
															$scope.api_called = true;
															out.productname=$scope.productname;
															out.product_id=$scope.prodId;
															out.category_id=$scope.catId;
															out.currency=$scope.currency;
															out.currencyratio=$scope.currencyratio;
															out.actualprice=$scope.actualprice;
															$scope.$broadcast('offerTempUpdated', out);	
														});
												});
									
								};
								
							};
						
					
				},
				link:function($scope, elem, attrs, $location, $http, $rootScope){

					$scope.prefixText = 'Bundle Price'
					
					$scope.catId = attrs.catId;
					$scope.prodId = attrs.prodId;
					$scope.price = attrs.price;
					console.log($scope.show_bundle_price_category);
					$scope.image_on_clicked = function(ev){
						jQuery(ev.target).children().toggle();
					};
					var compiled = $compile("<div class='bundled_offer' ng-if='show_bundle_price_category' ><a href='' ng-mouseover='call_all(catId, prodId, $event)' >{{::prefixtext}}: {{price}} <div class='putUp' data-offerd></div></a><span class='signatured_image'></span></div>     <div class='bundled_offer image_onn' ng-if='!show_bundle_price_category' ng-click='image_on_clicked($event)'><span class='signatured_image image_on'><span><i>This is where you describe what is all about...</i></span><a href='' ng-mouseover='call_all(catId, prodId, $event)' >{{::prefixtext}}: {{price}} <div class='putUp' data-offerd></div></a></span></div>")($scope);
					elem.append(compiled);

				
				}
			}
		}]);



var serve_http = angular.module('serve_http',[]);
	serve_http.factory('serve_http',function($http){
			function get_details(u,p){ return $http.post(u,(p?p:null))};
		return {get_details:get_details};
	});

