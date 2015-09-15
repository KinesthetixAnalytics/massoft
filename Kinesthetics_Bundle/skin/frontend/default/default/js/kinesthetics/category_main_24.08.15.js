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

		$http.post('//'+$location.$$host+'/bundle/conf.json').then(function(r){
			console.log(r);
		})

	})
	
}]).constant("badBrowser",{
	"Modernizr" : Modernizr,
	"Detectizr" : Detectizr
});

		off.directive('offerd',['$rootScope', 'serve_http', function($rootScope, serve_http){
			return{
				template:
						"<form action='{{::action}}' class='bun_let' method='post'><input type='hidden' name='bundle_ob_id'></input><input type='hidden' name='bundle_cat_name'></input>"+
						"<div><h3>Bundle with:<span ng-if='show_bundle_price_category'>?<i>This is where you describe what is all about...</i></span></h3>"+
						"<span class='bundle_reload' ng-if='show_loading'></span>"+
							"<div ng-cloak><span class='bndl_scrl_up' ng-if='ul_height >= 168 || category_size > 2' ng-click='push_up($event)'></span><ul class='bndl_ul'>"+
								"<li ng-repeat='(catName, catDetails) in categories' ng-if='catName !=\"have_more_offers\"' ng-init='$last ? initialize_scroll():null'>"+
									
									"<a ng-click='showHide($event)'>{{catName|limitTo:30}}<span ng-if='catName.length > 30'>...</span></br><i class='bundle_lowest_price'>Starting as low as {{::currency}}: {{catDetails.lowest_price}}</i></a>"+
									"<div class='off_holder' style='display:none;'>"+
									"<div ng-repeat='detail in catDetails' ng-if='$index >1' class='bndl_catdet'>"+
										"<div ng-repeat='det in detail track by $index' class='bndl_off'>"+
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
							"</ul><span class='bndl_scrl_dn' ng-if='category_size > 2 || ul_height >= 168' ng-click='push_dn($event)'></span>"+
							"<span ng-if='categories.have_more_offers !=\"no\" && !show_loading' class='bndl_btn'><a href='' ng-click='show_more_categories($event)'>View More Categories <span class='bundle_reload hidden'></span></a></span></div>"+
						"</form>",
				restrict:"A",
				scope:true,
				controller:function($scope, $rootScope, $compile, serve_http){
					$scope.show_loading = true;
					$scope.show_bundle_price_category = $rootScope.show_bundle_price_category;
					//$scope.action = $rootScope.action;
					$scope.pager = 2;
					

					

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
						$scope.category_size = ds.category_size;
						$scope.show_loading = false;


					});
				},
				link:function($scope, elem, attrs,  $compile){

					var elm = elem;
					var scroll_elem = jQuery(elm).find(".bndl_ul");
					$scope.tot_scrolled=0;

					$scope.push_up = function(ev){
						 scroll_elem.mCustomScrollbar("scrollTo", "-=24");
					};
					$scope.push_dn = function(ev){
						scroll_elem.mCustomScrollbar("scrollTo", "+=24");
					};

					$scope.initialize_scroll = function(){
						if(scroll_elem.find('.mCustomScrollbar')){
							scroll_elem.mCustomScrollbar({
								 theme:"dark",
								 autoHideScrollbar:true,
								 scrollButtons:{ enable: true },
								 setTop: $scope.tot_scrolled + 'px',
								 callbacks:{
							        onScroll:function(){
							            $scope.tot_scrolled = this.mcs.top;
							            console.log($scope.tot_scrolled);
							            $(elm).find('.bndl_scrl_dn').show();
							            $(elem).find('.bndl_scrl_up').show();
							            //console.log('onScroll: '+$scope.tot_scrolled);
							            //scroll_elem.data("last-scroll", $scope.tot_scrolled);
							        },
							        onTotalScrol:function(){
							        	console.log('on the way down!');
							        	//$(elm).find('.bndl_scrl_up').hide();
							        },
							        onTotalScrollBack:function(){
							        	console.log('on the way up!');
							        	//$(elm).find('.bndl_scrl_dn').hide();
							        }
							    }
							})
						}else{
							console.log('have to update')
						}
					};

					$scope.showHide = function(ev){
						ev.stopPropagation();
						var element = (ev.target.localName=='i' || ev.target.localName=="I")?jQuery(ev.target).parent() : ((ev.target.localName=='li' || ev.target.localName=="LI")?jQuery(ev.target).children("a"):jQuery(ev.target));
						//console.log('element', element);

						var $evel = jQuery(element).toggleClass('opened_up');
						
						//console.log($par, $par.find('a.opened_up'), $par.find('a.opened_up').not($evel));
						$par.find('a.opened_up').not($evel).removeClass('opened_up');
						var $targetEl = element.next();
						$par.find('.off_holder').not($targetEl).stop(true, true).slideUp();
						$targetEl.stop(true, true).slideToggle(function(){
							if(jQuery(this).is(":visible")){
								
								scroll_elem.find('.mCustomScrollbar').mCustomScrollbar("scrollTo", jQuery(element));
								$scope.$emit('tot_scroll_updated', jQuery(element));
							}

						});
					};

					elem.bind('mouseleave', function(e){
						elm.find('.opened_up').removeClass('opened_up').next().stop(true, true).slideUp();
						//$scope.tot_scrolled = scroll_elem.mCustomScrollbar().top==undefined?scroll_elem.mCustomScrollbar().top:0;
						//console.log(scroll_elem.mCustomScrollbar().top);
					});

					//var $par = $(elem).closest('ul');
					$scope.show_more_categories = function(ev){
						ev.stopPropagation();

						jQuery(ev.target).children('span').fadeIn();

						serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {cache: true, 'client_id' : $rootScope.client_id, 'client_secret' : $rootScope.client_secret, 'grant_type' : 'client_credentials'})
												.then(function(rep){
													serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategory/', {product_id:$scope.product_id , category_id:$scope.category_id , no_of_category: $rootScope.no_of_categories, price:$scope.actualprice, access_token:rep.data.access_token, page:$scope.pager})
														.then(function(out){
															$scope.pager++;
															$scope.categories = jQuery.extend({},$scope.categories, out.data.raws.dataset.products);
															$scope.category_size = Object.keys($scope.categories).length-1;
															
															$scope.ul_height = $(elem).find('.bndl_ul').height();
															jQuery(ev.target).children('span').fadeOut();

														});
												});
						};

				}
			}
		}]);

		
		/*off.directive('url',[function(){
			return{
				scope:false,
				controller:function($scope){
					//this.action  = $scope.action;
				},
				link:function($scope, elem, attrs){
					$scope.action = attrs.href;
				}
			}
		}])*/

		off.directive('bundle',['$compile', 'serve_http', '$rootScope', '$window', function($compile, serve_http, $rootScope, $window){
			return{
				template:"<div><div class='bundled_offer' ng-if='show_bundle_price_category' ><a href='' ng-mouseenter='set_prev_pos()' ng-mouseover='call_all(catId, prodId, $event)' ng-mouseleave='call_all(catId, prodId, $event)'>{{::prefixtext}}: {{price}} <div class='putup_parent'><div class='putUp' data-offerd></div></div></a><span class='signatured_image'></span></div>     <div class='bundled_offer image_onn' ng-if='!show_bundle_price_category'><span class='signatured_image image_on' ng-click='image_on_clicked($event)'><a href='' ng-mouseover='call_all(catId, prodId, $event)' ng-if='show_anchor' class='disable_sibling'>{{::prefixtext}}: {{price}} <div class='putup_parent'><div class='putUp' data-offerd></div></div></a><span><i>This is where you describe what is all about...</i></span></span></div></div>",
				scope:{
					cat_id:'@',
					prod_id:'@',
					price:'@',
					prefixtext:'@',
					actualprice:'@',
					currency:'@',
					currencyratio:'@',
					productname:'@',
					url:'@'
				},
				/*replace:true,*/
				restrict:'E',
				controller:function($scope, $http, $location, $rootScope, $timeout, $window){

					
					
					$scope.win_width = jQuery($window).innerWidth();
					$scope.win_height = jQuery($window).innerHeight();


					jQuery($window).resize(function(){
						$scope.win_height = jQuery($window).height();
						$scope.win_width = jQuery($window).width();
					});


						$scope.domain = $location.$$host;
						$scope.api_called = false;

						$scope.show_bundle_price_category = $rootScope.show_bundle_price_category;
						//console.log('bundled controller', $scope.show_bundle_price_category, $rootScope.show_bundle_price_category);
						$scope.prefixtext = jQuery.trim($scope.prefixText).length? $scope.prefixText : 'Bundle Price';

						
						var chk_pos;

							$scope.call_all = function(cd, pd, ev){
								
								if(ev.type=='mouseover' && !$scope.api_called){
										ev.stopImmediatePropagation();
										//$scope.setPos(ev.target);					
											serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {cache: true, 'client_id' : $rootScope.client_id, 'client_secret' : $rootScope.client_secret, 'grant_type' : 'client_credentials'})
												.then(function(rep){
													serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategory/', {product_id:$scope.prodId , category_id:$scope.catId , no_of_category: $rootScope.no_of_categories, price:$scope.actualprice, access_token:rep.data.access_token})
														.then(function(out){
															console.log(out);
															$scope.api_called = true;
															out.productname=$scope.productname;
															out.product_id=$scope.prodId;
															out.category_id=$scope.catId;
															out.currency=$scope.currency;
															out.currencyratio=$scope.currencyratio;
															out.actualprice=$scope.actualprice;
															out.category_size = Object.keys(out.data.raws.dataset.products).length-1;
															$scope.$broadcast('offerTempUpdated', out);	
														});
												});
									
								};


								var $targ = jQuery(ev.target);
								var $putupParent = $targ.find('.putup_parent');
								var scroll_elem = jQuery(ev.target).find(".bndl_ul");

								$scope.set_prev_pos = function(){
									//console.log(scroll_elem, $scope.scrollTp);
									setTimeout(function(){
										$scope.scrollTp?scroll_elem.mCustomScrollbar("scrollTo", $scope.scrollTp):null;	
									},50);
								}
								
								$scope.$on("tot_scroll_updated", function(s,t){
									$scope.scrollTp = t;
									//console.log(jQuery(t));
								});

								if(ev.type=='mouseover'){
									//clearInterval(chk_pos);
										console.log('on mouse hover: '+$scope.scrollTp);
									
									










									$putupParent.css({'left':'inherit','right':'inherit','top':'inherit','bottom':'inherit'});
									chk_pos = setInterval(function(){
										$putupParent.is(":visible")?$scope.fix_pos($putupParent):null
									},100)
								};

								if(ev.type=='mouseleave'){
									$putupParent.removeAttr('style');
									clearInterval(chk_pos);
								}
								
							};




							$scope.$on('rootscope_updated', function(rv){
								$scope.show_bundle_price_category = $rootScope.show_bundle_price_category;
								/*$timeout(function() {
									$scope.$digest();
								},0)*/;
							})
						




							$scope.fix_pos = function($telem){

								//console.log(parseInt($telem.css('bottom')), $telem.css('bottom'));


								var $sct;

								$telem.children('div').css('display','block');

								if(Detectizr.browser.engine=='webkit'){
									$sct = jQuery(document);
								}else{
									$sct = jQuery($window);
								}

								//console.log($sct.scrollTop() + 20 >= $telem.children('div').offset().top);

								if($sct.scrollTop() + 20 >= $telem.children('div').offset().top){
									$telem.css({'top':(parseInt($telem.css('top'))?parseInt($telem.css('top')):0)+40+'px', bottom:'auto'});
								}else{

									if($telem.children('div').offset().top + $telem.children('div').height()+40 >= $sct.scrollTop() + $scope.win_height){
										$telem.css({'bottom':(parseInt($telem.css('bottom'))?parseInt($telem.css('bottom')):0)+20+'px', top:'auto'})
									}

								}


								if($telem.children('div').offset().left+$telem.children('div').width()+20 >= $scope.win_width){
									//console.log($telem.children('div').width()+40 , $scope.win_width);
									if($telem.children('div').width()+40 > $scope.win_width){
										$telem.css({'right': 'auto', left:'-80%', 'visibility':'visible'});
									}else{
										$telem.css({'right': (parseInt($telem.css('right'))?parseInt($telem.css('right')):0)+20+'px', left:'auto', 'visibility':'visible'});
									}
								}

								//console.log(parseInt($telem.children('div').offset().top - jQuery($window).scrollTop()));
								//console.log(parseInt($telem.children('div').offset().top));

								/*if(parseInt($telem.width() + $telem.offset().left+20) >= $scope.win_width){
 									console.log('adjusting side');
 								};
								if(parseInt($telem.children('div').height() + ($telem.offset().top-jQuery($window).scrollTop())+20) >= $scope.win_height){
 									console.log('height: '+ $telem.children('div').height() , 'offset: '+$telem.children('div').offset().top, 'scrolltop: '+jQuery($window).scrollTop(), 'window_h:' +$scope.win_height, 'adjusting v');
 								}*/
							}




					
				},
				link:function($scope, elem, attrs, $location, $http, $rootScope){
					$scope.action = $scope.url;
					$scope.prefixText = 'Bundle Price';
					$scope.catId = attrs.catId;
					$scope.prodId = attrs.prodId;
					$scope.price = attrs.price;
					$scope.show_anchor = false;
					$scope.image_on_clicked = function(ev){
						ev.stopPropagation();
						//console.log(ev);
						$scope.show_anchor = !$scope.show_anchor;
						$scope.api_called = false;
						
						//jQuery(ev.target).children().eq(1).toggle();
					};

					
					

					/*$scope.setPos = function(el){
							console.log(el)
							$scope.initialize_edge_detection();
							
						}


					$scope.initialize_edge_detection = function(el){
						console.log(jQuery(elem), jQuery(elem).find('.putup_parent'), jQuery(elem).find('.putup_parent').outerWidth());
					}*/



				}
			}
		}]);

off.directive('putup_parent', [function(){
	return{
		restrict:'C',
		transclude:true,
		scope:true,
		controller:function($scope){

		},
		link:function($scope, elem, attrs){
			
		}
	}
}])

var serve_http = angular.module('serve_http',[]);
	serve_http.factory('serve_http',function($http){
			function get_details(u,p){ return $http.post(u,(p?p:null))};
		return {get_details:get_details};
	});

