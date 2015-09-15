var off = angular.module('off',['serve_http']).run(['$rootScope','$location','$http', function($rootScope, $location, $http){
	$http.post('//'+$location.$$host+'/index.php/bundle/index/getapi', {cache: true}).then(function(resp){
		$rootScope.domain = $location.$$host;
		$rootScope.client_id = resp.data.client_id;
		$rootScope.client_secret = resp.data.client_secret;
	})
	
}]);

		off.directive('offerd',['$rootScope', 'serve_http', function($rootScope, serve_http){
			return{
				template:"<span class='bundle_reload' ng-if='show_loading'></span>"+
						"<form action='{{action}}' class='bun_let' method='post'><input type='hidden' name='bundle_ob_id'></input><input type='hidden' name='bundle_cat_name'></input>"+
							"<ul>"+
								"<li ng-repeat='(catName, catDetails) in categories'>"+
									"<a ng-click='showHide($event)'>{{catName|limitTo:30}}<span ng-if='catName.length > 30'>...</span></a><div class='off_holder' style='display:none;'>"+
									"<div ng-repeat='detail in catDetails'>"+
										"<a ng-click='redirect_with_offer(detail.bundle_object_id, detail.product_category, $event)'>"+
											"<img src='{{detail.bundle_object_image_URL}}' ng-if='detail.bundle_object_image_URL.length'>"+
											"<h4>{{detail.bundle_object_name|limitTo:22}}<span ng-if='detail.bundle_object_name.length > 22'>...</span></h4>"+
											"<span>Discount: ${{detail.discount}}</span>"+
										"</a></div>"+
									"</div>"+
								"</li>"+
							"</ul>"+
						"</form>",
				restrict:"A",
				scope:true,
				controller:function($scope, $rootScope, $compile){
					$scope.show_loading = true;
					$scope.action = $rootScope.action;
					$scope.$on('offerTempUpdated', function(s, ds){
						$scope.product_id = ds.product_id;
						$scope.category_id = ds.category_id;
						$scope.categories = ds.data.raws.dataset.products;
						$scope.show_loading = false;
					});

					$scope.redirect_with_offer = function(bid, bcname, ev){
						var $frm = jQuery(ev.target).closest('form');
							$frm.find('input[name=bundle_ob_id]').val(bid);
							$frm.find('input[name=bundle_cat_name]').val(bcname);
							$frm.submit();
					}
				},
				link:function($scope, elem, attrs,  $compile){

					$scope.showHide = function(ev){
						ev.stopImmediatePropagation();
						var $evel = jQuery(ev.target).toggleClass('opened_up');
						var $par = $evel.parent().parent();
						//console.log($par, $par.find('a.opened_up'), $par.find('a.opened_up').not($evel));
							$par.find('a.opened_up').not($evel).removeClass('opened_up');
						var $targetEl = $evel.next();
						$par.find('.off_holder').not($targetEl).slideUp();
						$targetEl.slideToggle();
					}

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
					price:'@'
				},
				restrict:'A',
				controller:function($scope, $http, $location, $rootScope, $timeout){
					//console.log($rootScope, $rootScope.client_id);
						$scope.domain = $location.$$host;

						

							$scope.call_all = function(cd, pd, ev){
								var prom;
								if(ev.type=='mouseover'){
									prom = $timeout(function(){
										ev.stopImmediatePropagation();					
											serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {cache: true, 'client_id' : $rootScope.client_id, 'client_secret' : $rootScope.client_secret, 'grant_type' : 'client_credentials'})
												.then(function(rep){
													serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategory/', {product_id:$scope.prodId , category_id:$scope.catId , access_token:rep.data.access_token})
														.then(function(out){
															out.product_id=$scope.prodId;
															out.category_id=$scope.catId;
															$scope.$broadcast('offerTempUpdated', out);	

														});
												});
									},1000);
								}else{
									console.log('mouseLeave');
									console.log($timeout.cancel(prom));
								}
							};
						
					
				},
				link:function($scope, elem, attrs, $location, $http, $rootScope){

					$scope.catId = attrs.catId;
					$scope.prodId = attrs.prodId;
					$scope.price = attrs.price;

					var compiled = $compile("<div class='bundled_offer'><a href='' ng-mouseover='call_all(catId, prodId, $event)' ng-mouseleave = 'call_all(catId, prodId, $event)'>{{price}} </a><div class='putUp' data-offerd></div>")($scope);
					elem.append(compiled);
				}
			}
		}]);



var serve_http = angular.module('serve_http',[]);
	serve_http.factory('serve_http',function($http){
			function get_details(u,p){ return $http.post(u,(p?p:null))};
		return {get_details:get_details};
	});

