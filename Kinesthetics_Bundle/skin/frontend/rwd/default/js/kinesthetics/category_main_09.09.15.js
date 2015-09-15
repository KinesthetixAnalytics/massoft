

Detectizr.detect({detectScreen:false});

 var off = angular.module('off',['serve_http']).run(['$rootScope','$location','$http', function($rootScope, $location, $http){
 	console.log('run block');
	$http.post('//'+$location.$$host+'/index.php/bundle/index/getapi', {cache: true}).then(function(resp){
		$rootScope.domain = $location.$$host;
		$rootScope.client_id = resp.data.client_id;
		$rootScope.client_secret = resp.data.client_secret;
		$rootScope.no_of_categories = resp.data.no_of_categories;
		$rootScope.show_bundle_price_category = resp.data.show_bundle_price_category;
		$rootScope.show_bundle_price_product = resp.data.show_bundle_price_product;
		//console.log('runblock', $rootScope.show_bundle_price_category);

		console.log('after api call');

		//****************************************//
		$rootScope.pIds=[]




		$rootScope.$broadcast('rootscope_updated', $rootScope);



		/*$http.post('//'+$location.$$host+'/bundle/conf.json').then(function(r){
			console.log(r);
		})*/

	})
	
}]).constant("badBrowser",{
	"Modernizr" : Modernizr,
	"Detectizr" : Detectizr
});


off.controller('off_controller',['$scope', '$window', 'serve_http', '$rootScope', function($scope, $window, serve_http, $rootScope){

	console.log('from controller');
	$scope.prodIds =[];
	var timt;


	$scope.$on('event_singularity', function(s,o){
		console.log('singularity');
		$scope.prodIds.indexOf(o.pId)==-1?$scope.prodIds.push(o.pId):null;
		clearTimeout(timt);
		timt = setTimeout(function(){
			$scope.catId = o.cId;
				serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {
			        cache: true,
			        'client_id': $rootScope.client_id,
			        'client_secret': $rootScope.client_secret,
			        'grant_type': 'client_credentials'
			    })
			    .then(function(rep) {
			            serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategoryGroupByProductId/', {
			                    product_id: $scope.prodIds.join(),
			                    category_id: $scope.catId,
			                    no_of_category: $rootScope.no_of_categories,
			                    access_token: rep.data.access_token
			                })
			                .then(function(out) {
			                        var data = out;
			                        $scope.$broadcast('update_offers', data);
			                });
			    });
		},300);
	});





	$scope.$on('event_readofit', function(s,o){
		$scope.prodIds.splice($scope.prodIds.indexOf(o.pId),1);
		//console.log($scope.prodIds.join());
	});

	//console.log($window, document, jQuery.event.special.scrollstop);

	/*jQuery(function(){
		jQuery(window)
		  .on("scrollstart", function() {
		    // Paint the world yellow when scrolling starts.
		    jQuery(document.body).css({background: "yellow"});
		 })
	});*/
	  
}]);

		off.directive('offerd',['$rootScope', 'serve_http', '$window', function($rootScope, serve_http, $window){
			return{
				template:
						"<form action='{{::action}}' class='bun_let' method='post'><input type='hidden' name='bundle_ob_id'></input><input type='hidden' name='bundle_cat_name'></input>"+
						"<div><h3><span class='signatured_image' ng-if='show_bundle_price_category'></span>Bundle with:<span ng-if='show_bundle_price_category'>?<i>This is where you describe what is all about...</i></span></h3>"+
						"<span class='bundle_reload' ng-if='show_loading'></span>"+
							"<div ng-cloak><span class='bndl_scrl_up' ng-if='ul_height && (ul_height >= 168 || category_size > 2)' ng-click='push_up($event)'></span><ul class='bndl_ul'>"+
								"<li ng-repeat='(catName, catDetails) in categories' ng-if='catName !=\"have_more_offers\"' ng-init='$last ? initialize_scroll():null'>"+
									
									"<a ng-click='showHide($event)'>{{catName|limitTo:30}}<span ng-if='catName.length > 30'>...</span></br><i class='bundle_lowest_price'>Starting as low as {{::currency}}: {{actualprice - catDetails.max_discount}}</i></a>"+
									"<div class='off_holder' style='display:none;'>"+
									"<div ng-repeat='detail in catDetails' ng-if='$index >1' class='bndl_catdet'>"+
										"<div ng-repeat='det in detail track by $index' class='bndl_off'>"+
											"<a ng-click='redirect_with_offer(det.bundle_object_id, det.product_category, det.discount, $event)'>"+
												"<img src='{{::det.bundle_object_image_URL}}' ng-if='det.bundle_object_image_URL.length'>"+
												"<h4>Buy this {{::det.bundle_object_name|limitTo:13}}<span ng-if='det.bundle_object_name.length > 13'>...</span></h4>"+
												"<span>in the next {{::det.validity}} days and get an additional discount of {{(det.discount/actualprice)*100 | number:2}}% </span>"+
												"<span>(Discount: {{::currency}} {{::det.discount*currencyratio}}) on {{productname}}</span>"+
											"</a>"+
											"</div>"+
									"</div>"+
									"</div>"+

								"</li>"+
							"</ul><span class='bndl_scrl_dn' ng-if='ul_height && (category_size > 2 || ul_height >= 168)' ng-click='push_dn($event)'></span>"+
							"<span ng-if='categories.have_more_offers !=\"no\" && !show_loading' class='bndl_btn'><a href='' ng-click='show_more_categories($event)'>View More Categories</a></span></div>"+
						"</form>",
				restrict:"A",
				scope:true,
				controller:function($scope, $rootScope, $compile, serve_http){
					$scope.show_loading = true;
					$scope.show_bundle_price_category = $rootScope.show_bundle_price_category;
					//$scope.action = $rootScope.action;
					$scope.pager = 2;
					

					
					$scope.reassignOffer = function(e, offer, ev){
						console.log($scope.cataname, $scope.catname)
						$scope.selected_off = offer.bundle_object_id | $scope.selected_off;
						serve_http.get_details('http://magentoshop.staging-websites.com/index.php/bundle/index/setsessiondata', {cat_name:offer.catname, bundle_id:$scope.selected_off, discount:offer.discount?offer.discount:offer})
							.then(function(){
								window.location.href =jQuery(ev.target).closest('form').attr('action');
							})
					}

					

					$scope.redirect_with_offer = function(bid, bcname, discount, ev){
						var z={}; 
							z.bundle_object_id = bid;
							z.catname = bcname;
							z.discount = discount;
						$scope.reassignOffer(null, z, ev)
						/*var $frm = jQuery(ev.target).closest('form');
							$frm.find('input[name=bundle_ob_id]').val(bid);
							$frm.find('input[name=bundle_cat_name]').val(bcname);
							$frm.submit();*/
					}


				},
				link:function($scope, elem, attrs,  $compile){

					var elm = elem;
					var scroll_elem = jQuery(elm).find(".bndl_ul");
					$scope.tot_scrolled=0;


					$scope.show_more_categories = function(ev){
						ev.stopPropagation();
						var $par = jQuery(elem).closest('ul');
						serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {cache: true, 'client_id' : $rootScope.client_id, 'client_secret' : $rootScope.client_secret, 'grant_type' : 'client_credentials'})
												.then(function(rep){
													serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/getProductDetailsAccordingProductCategory/', {product_id:$scope.product_id , category_id:$scope.category_id , no_of_category: $rootScope.no_of_categories, price:$scope.actualprice, access_token:rep.data.access_token, page:$scope.pager})
														.then(function(out){
															$scope.pager++;
															$scope.categories = jQuery.extend({},$scope.categories, out.data.raws.dataset.products);
															$scope.category_size = Object.keys($scope.categories).length-1;
															$scope.ul_height = $par.height();
														});
												});
						};


					

					$scope.$on('offerTempUpdated', function(s, ds){
						//console.log(ds);
						$scope.product_id = ds.product_id;
						$scope.category_id = ds.category_id;
						$scope.actualprice = ds.actualprice;
						$scope.categories = ds.category;
						$scope.category_size = ds.category_size;
						$scope.show_loading = false;
						
					});





					$scope.push_up = function(ev){
						ev.preventDefault();
						ev.stopPropagation();
						 scroll_elem.mCustomScrollbar("scrollTo", "+=115");
						
					};
					$scope.push_dn = function(ev){
						ev.preventDefault();
						ev.stopPropagation();
						scroll_elem.mCustomScrollbar("scrollTo", "-=115");
					};

					$scope.initialize_scroll = function(){
						if(scroll_elem.find('.mCustomScrollbar')){
							scroll_elem.mCustomScrollbar({
								 theme:"dark",
								 autoHideScrollbar:true,
								 scrollButtons:{ enable: true },
								 setTop: $scope.tot_scrolled + 'px',
								 advanced:{
								 	updateOnContentResize:true,
								 	updateOnContentResize:true
								 },
								 callbacks:{
							        onScroll:function(){
							            $scope.tot_scrolled = this.mcs.top;
							            //console.log('onScroll: '+$scope.tot_scrolled);
							            //scroll_elem.data("last-scroll", $scope.tot_scrolled);
							            
							        }
							    }
							})
						}else{
							//console.log('have to update')
						}
					};

					$scope.showHide = function(ev){
						ev.stopPropagation();
						var element = (ev.target.localName=='i' || ev.target.localName=="I")?jQuery(ev.target).parent() : ((ev.target.localName=='li' || ev.target.localName=="LI")?jQuery(ev.target).children("a"):jQuery(ev.target));
						//console.log('element', element);

						var $evel = jQuery(element).toggleClass('opened_up');
						var $par = $evel.closest('ul');
						//console.log($par, $par.find('a.opened_up'), $par.find('a.opened_up').not($evel));
						$par.find('a.opened_up').not($evel).removeClass('opened_up');
						var $targetEl = element.next();
						$par.find('.off_holder').not($targetEl).stop(true, true).slideUp();
						$targetEl.stop(true, true).slideToggle(function(){

							//console.log(jQuery(element).parent().index(), scroll_elem.find('li').eq(jQuery(element).parent().index()));
							console.log(jQuery(scroll_elem).find('li:eq(1)'));
							if(jQuery(this).is(":visible")){
								scroll_elem.mCustomScrollbar('update');
								scroll_elem.mCustomScrollbar("scrollTo", jQuery(element));
								$scope.$emit('tot_scroll_updated', jQuery(element));
							}

						});
					}

					elem.bind('mouseleave', function(e){
						elm.find('.opened_up').removeClass('opened_up').next().stop(true, true).slideUp();
						//$scope.tot_scrolled = scroll_elem.mCustomScrollbar().top==undefined?scroll_elem.mCustomScrollbar().top:0;
						//console.log(scroll_elem.mCustomScrollbar().top);
					})

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
				template:"<div class='bndl_all'><div class='bundled_offer' ng-if='show_bundle_price_category' ><a href='' ng-mouseenter='set_prev_pos()' ng-mouseover='call_all(catId, prodId, $event)' ng-mouseleave='call_all(catId, prodId, $event)'>{{::prefixtext}}: {{price}} <div class='putup_parent'><div class='putUp' data-offerd></div></div></a><span class='signatured_image'></span></div>"+
				"<div class='bundled_offer image_onn' ng-if='!show_bundle_price_category'><span class='signatured_image image_on' ng-click='image_on_clicked($event)'><a href='' ng-show='show_anchor' class='disable_sibling'>{{::prefixtext}}: {{price}} <div class='putup_parent'><div class='putUp' data-offerd></div></div></a><span><i>This is where you describe what is all about...</i></span></span></div></div>",
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
				replace:true,
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
				link:function($scope, elem, attrs, $location, $http){
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

					
					
					var chk_pos;

							$scope.call_all = function(cd, pd, ev){
								var $targ = jQuery(ev.target);
								var $putupParent = $targ.find('.putup_parent');
								var scroll_elem = jQuery(ev.target).find(".bndl_ul");
								
								/*if(ev.type=='mouseover' && !$scope.api_called){
										ev.stopImmediatePropagation();
										$targ.data('done_ajax', true);				
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
															out.category_size = Object.keys(out.data.raws.dataset.products).length-1;
															$scope.$broadcast('offerTempUpdated', out);	
														});
												});
									
								};*/

								


								

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



							$scope.$on('update_offers', function(s, out){
								//console.log(out.data.raws.dataset);
									//ds[attrs.prodId] && ds[attrs.prodId].length? $scope.api_called = true:null;
									//console.log(elem, attrs);
									if(!$scope.api_called){
										//out.data.raws.dataset.products
										var $details = jQuery(elem).data();
										if(out.data.raws.dataset.products[$details.prod_id]){
											var send = out.data.raws.dataset.products[$details.prod_id];

											$scope.api_called = true;
											send.productname=$details.productname;
											send.product_id = $details.prod_id;
											send.category_id = $details.cat_id;
											send.currency=$details.currency;
											send.currencyratio=$details.currencyratio;
											send.actualprice = $details.actualprice;
											//send.categories = out.data.raws.dataset.products[out.product_id];
											send.show_loading = false;
											send.category_size = Object.keys(send).length-1;

											$scope.$broadcast('offerTempUpdated', send);
										}
			
									}

								});


					var $parentel = jQuery(elem).parent();
					//console.log(parseInt($parentel.offset().top), $parentel.outerHeight()*2, jQuery(window).innerHeight());
					$scope.$on('rootscope_updated', function(){
						if(parseInt($parentel.offset().top) <= jQuery(window).innerHeight()*2){
							jQuery(elem).data('done_ajax',true);
							$scope.$emit('event_singularity', {pId:$scope.prodId, cId:$scope.catId});	
						}
					});



					jQuery(elem).parent().bind('inview', function(event, isInView, visiblePartX, visiblePartY){
						//console.log(jQuery(elem).parent());
						var $data = jQuery(elem).data()
						if (isInView && !$data.done_ajax) {
							jQuery(elem).data('done_ajax',true);

							$scope.$emit('event_singularity', {pId:$scope.prodId, cId:$scope.catId});

							//console.log(attrs, 'into the viewport');

							
						}else{
							if(!isInView && $data.done_ajax && !$data.done_out_of_viewport){
								jQuery(elem).data('done_out_of_viewport',true);
								$scope.$emit('event_readofit', {pId:$scope.prodId, cId:$scope.catId});
								//console.log(elem, attrs, 'out of the viewport');
							}
						}
					})

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
}]);


var serve_http = angular.module('serve_http',[]);
	serve_http.factory('serve_http',function($http){
			function get_details(u,p){ return $http.post(u,(p?p:null))};
		return {get_details:get_details};
	});

