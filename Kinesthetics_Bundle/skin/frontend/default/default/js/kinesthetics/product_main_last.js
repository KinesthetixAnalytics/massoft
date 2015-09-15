Detectizr.detect({detectScreen:false});


 var off = angular.module('off',['serve_http']).run(['$rootScope','$location','$http', function($rootScope, $location, $http){
	$http.post('//'+$location.$$host+'/index.php/bundle/index/getapi', {cache: true}).then(function(resp){
		$rootScope.domain = $location.$$host;
		$rootScope.client_id = resp.data.client_id;
		$rootScope.client_secret = resp.data.client_secret;
		$rootScope.no_of_categories = resp.data.no_of_categories;
		$rootScope.show_bundle_price_category = resp.data.show_bundle_price_category;
		$rootScope.show_bundle_price_product = 1;//resp.data.show_bundle_price_product;

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
				attrs.appliedbundle && serve_http.get_details('http://bundledserver.staging-websites.com/api_1_0_0/user/token/', {
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
				                	console.log(out);
				                	$rootScope.all_relevent_offers = out.data.raws.dataset.products;
				                	$scope.categoryname = attrs.catname;
				                	$scope.applied_offers_category = out.data.raws.dataset.products[attrs.catname].details;
				                	$scope.applied_offers_category.thumbnail_image = out.data.raws.dataset.products[attrs.catname].image;
				                	console.log($scope.applied_offers_category.thumbnail_image);

				                	$scope.$broadcast('usedOffer', $scope.applied_offers_category);

				                	

				                });
					});
		});

}]);


off.directive('usedOffer', ['$rootScope', 'serve_http', function($rootScope, serve_http){
	return{
		template:"<div class='bundle-offers bundle-offer-block' id='usedOffer' ng-show='appliedbundle' ng-cloak><h2>Bundle Offers</h2>"+
				"<h4><img src='{{bndlimg}}'/><span>{{cataname?cataname:catname}}</span></h4><ul id='offered_slct'>"+
				"<li ng-repeat='offer in offers'><a href='' class='close_bundle_off' ng-click='deselect_offer(offer, $index, $event)'>close</a><h5 class='bndl_cat_name'>{{offer.bundle_object_name}}</h5>"+
					"<input type='radio' name='uoff_chosen' ng-checked='checkme($index, offer.bundle_object_id)' ng-click='reassignOffer($event, offer)'>"+
					"<span class='bundle-img'><img src='{{proimg}}'></span>"+
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
			productid:'@',
			proimg:'@',
			appliedbundle:'@'
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
			$scope.appliedbundle = attrs.appliedbundle?true:false;

			$scope.deselect_offer = function(o,i,ev){
				ev.stopPropagation();
				$scope.offers.splice(i,1);
				serve_http.get_details('http://magentoshop.staging-websites.com/index.php/bundle/index/unsetsessiondata');
				$rootScope.$broadcast('deleted_offer');
			};

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
				serve_http.get_details('http://magentoshop.staging-websites.com/index.php/bundle/index/setsessiondata', {cat_name:$scope.cataname?$scope.cataname:$scope.catname, bundle_id:$scope.selected_off, discount:offer.discount?offer.discount:offer});
				$rootScope.$broadcast('offer_changed', $scope.currency, $scope.actualprice  - (offer.discount?offer.discount:offer), $scope.selected_off, $scope.actualprice);
				var txt = jQuery(jQuery(elem).find("input[type=radio]:checked")).siblings('.name-wrap').children('.details-wrap').text();
				jQuery(".bundle-offer").val(txt);
			}

			//$scope.choosen 
			$scope.$on('rootscope_updated', function(){
				$scope.$emit('directive_loaded', attrs);
			});

			$scope.$on('usedOffer', function(s, o, cnm, i, discount, bndlid, bndlimg){
				
				console.log(o['thumbnail_image'], o.thumbnail_image, o);
				
				if(o.thumbnail_image){
					$scope.bndlimg = o.thumbnail_image;	
				}else{
				 	$scope.bndlimg = bndlimg;
				};

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
						$rootScope.$broadcast('offer_changed', $scope.currency, $scope.actualprice  - $scope.discount, null, $scope.actualprice);
					}

				});
				//console.log(cnm, $scope.cataname?$scope.cataname:$scope.catname)

				$rootScope.$broadcast('get_all_offers', $scope.cataname?$scope.cataname:$scope.catname);

				setTimeout(function(){
					var txt = jQuery(jQuery(elem).find("input[type=radio]:checked")).siblings('.name-wrap').children('.details-wrap').text();
					jQuery(".bundle-offer").val(txt);
					console.log(txt);
				},10)
				
			});


			//$rootScope.$broadcast('pricetag', $scope.currency, $scope.actualprice  - offer.discount)



		}

	}
}]);

off.directive('bundleOfferPrices',[ function(){
	return{
		scope:true,
		restrict:'C',
		controller:function($scope ){
		},
		link:function($scope, elem, attrs, $compile){

			$scope.$on('offer_changed', function(s,e,f,g,h){
				jQuery(elem).find('.regular-price').addClass('strikethrough');
				jQuery('.discounted_price').show();
				console.log(f,g,h)
				var percent = ((100 - Math.floor((f/parseInt(h))*100)));
				//console.log(f, h,  parseFloat(f/parseInt(h))*100).toFixed(2);
				if(jQuery(elem).find('.discounted_price').length){
					jQuery(elem).find('.discounted_price span').text(e+f);
					jQuery(elem).find('.discounted_price i').text(parseInt(percent)+"%");

				}else{
					//$scope.percent = 100 - ((f/parseInt(h))*100);
					console.log(percent);
					jQuery(elem).append("<span class='discounted_price'><strong>Bundle Price</strong> <span>"+e+f+"</span><i>"+percent+"%</i></span>");
				}
			});

			$scope.$on('deleted_offer', function(){
				jQuery('.strikethrough').removeClass('strikethrough');
				jQuery('.discounted_price').hide();
				jQuery('#options_7_text').val('');
			})
			
		}
	}
}])


off.directive('restCat', ['serve_http', function(serve_http){
	return{//ng-click='change_cat_off($event, catname, catdet.details[0].category_id)'
		template:"<div class='res_cat_holder' ng-show='appliedbundle'>{{appliedbundle}}<h4>Choose a different category to bundle with:</h4><ul><li ng-repeat='(catname, catdet) in offers track by $index' ng-if='(catname != catnm) && $index'><a href='' ><img ng-src='{{catdet.image}}' width='50' alt='{{catname}}'><h4><span>Change bundle product to </span>{{catname}}</h4></a>"+
					"<ul>"+
						"<li ng-repeat='det in catdet.details track by $index'>"+
							"<a id='det.category_id' ng-click='redirect_with_offer(det.bundle_object_id, det.product_category, det.category_id, $index, det.discount, catdet.image, $event)'>"+
								"<img src='{{::det.bundle_object_image_URL}}' ng-if='det.bundle_object_image_URL.length'>"+
								"<h4>Buy this {{::det.bundle_object_name|limitTo:13}}<span ng-if='det.bundle_object_name.length > 13'>...</span></h4>"+
								"<span>in the next {{::det.validity}} days and get an additional discount of {{(det.discount/actualprice)*100 | number:2}}% </span>"+
								"<span>(Discount: {{::currency}} {{::det.discount*currencyratio}}) on {{proname}}</span>"+
							"</a>"+
						"</li>"+
					"</ul>"+
				 "</li></ul></div>",
		restrict:'E',
/*		replace:true,
*/		scope:true,
		controller:function($scope, $rootScope){
			$scope.currency = $rootScope.currency;
			$scope.currencyratio = $rootScope.currencyRatio;
			$scope.redirect_with_offer = function(bndlid, catnm, catid, index, discount, bndlimg, ev){
				console.log(bndlimg);

				$rootScope.$broadcast('get_all_offers', catnm, catid, index, discount, bndlid, bndlimg);
			};

			$scope.$on('rootscope_updated', function(){
				$scope.appliedbundle=true;
				
				$scope.offers = $rootScope.all_relevent_offers;
				$scope.catnm = cnm;

				if(catid){
					$scope.change_cat_off(null, cnm, catid, i, discount, bndlid, bndlimg);
				}
			})
			
			$scope.$on('get_all_offers', function(s, cnm, catid, i, discount, bndlid, bndlimg){
				console.log($rootScope.all_relevent_offers);
				$scope.offers = $rootScope.all_relevent_offers;
				$scope.catnm = cnm;

				if(catid){
					$scope.change_cat_off(null, cnm, catid, i, discount, bndlid, bndlimg);
				}
			});

			var catn;
			$scope.change_cat_off = function(e, catname, catid, i, discount, bndlid, bndlimg){
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
				                	$rootScope.$broadcast('usedOffer', $scope.applied_offers_category, catname, i, discount, bndlid, bndlimg);
				                	
				                	console.log(catname);
				                	//setTimeout(function(){$rootScope.$apply()},1);
				                });
					});
			}

		},
		link:function($scope, elem, attrs){
			$scope.appliedbundle = attrs.appliedbundle.length?true:false;
			console.log($scope.appliedbundle);
		}
	}
}])
	

var serve_http = angular.module('serve_http',[]);
	serve_http.factory('serve_http',function($http){
			function get_details(u,p){ return $http.post(u,(p?p:null))};
		return {get_details:get_details};
});





/******************************/
/******************************/
/*****COPIED FROM CATEGORY*****/
/******************************/
/******************************/


off.directive('offerd',['$rootScope', 'serve_http', function($rootScope, serve_http){
			return{
				template:
						"<form class='bun_let' method='post'><input type='hidden' name='bundle_ob_id'></input><input type='hidden' name='bundle_cat_name'></input>"+
						"<div><h3>Bundle with:<span ng-if='show_bundle_price_category'>?<i>This is where you describe what is all about...</i></span></h3>"+
						"<span class='bundle_reload' ng-if='show_loading'></span>"+
							"<div ng-cloak><span class='bndl_scrl_up' ng-if='ul_height && (ul_height >= 168 || category_size > 2)' ng-click='push_up($event)'></span><ul class='bndl_ul'>"+
								"<li ng-repeat='(catName, catDetails) in categories' ng-if='catName !=\"have_more_offers\"' ng-init='$last ? initialize_scroll():null'>"+
									
									"<a ng-click='showHide($event)'>{{catName|limitTo:30}}<span ng-if='catName.length > 30'>...</span></br><i class='bundle_lowest_price'>Starting as low as {{::currency}}: {{actualprice - catDetails.max_discount}}</i></a>"+
									"<div class='off_holder' style='display:none;'>"+
									"<div ng-repeat='detail in catDetails' ng-if='$index >1' class='bndl_catdet'>"+
										"<div ng-repeat='det in detail track by $index' class='bndl_off'>"+
											"<a ng-click='redirect_with_off(det.bundle_object_id, det.product_category, det.discount, $event)'>"+
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
					$rootScope.show_bundle_price_product = $rootScope.show_bundle_price_category;
					//$scope.action = $rootScope.action;
					$scope.pager = 2;
					

					
					$scope.reassignOffer = function(e, offer, ev){
						console.log($scope.cataname, $scope.catname)
						$scope.selected_off = offer.bundle_object_id | $scope.selected_off;

						$rootScope.catname=offer.catname;

						$rootScope.bundle_id=$scope.selected_off;

						$rootScope.$broadcast('rootscope_updated',  $rootScope );

						/*serve_http.get_details('http://magentoshop.staging-websites.com/index.php/bundle/index/setsessiondata', {cat_name:offer.catname, bundle_id:$scope.selected_off, discount:offer.discount?offer.discount:offer})
							.then(function(){
								jQuery(ev.target).closest('form').submit();
							})*/
					}

					

					$scope.redirect_with_off = function(bid, bcname, discount, ev){
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
					$scope.appliedbundle = attrs.appliedbundle;



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




						$scope.$on('rootscope_updated', function(e){
								console.log($scope.prodId)
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
											out.category = out.data.raws.dataset.products;
											out.category_size = Object.keys(out.data.raws.dataset.products).length-1;
											$scope.$broadcast('offerTempUpdated', out);	
										});
								});
						});
					

					$scope.$on('offerTempUpdated', function(s, ds){
						console.log(ds.category);
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

	
















		off.directive('bundle',['$compile', 'serve_http', '$rootScope', '$window', function($compile, serve_http, $rootScope, $window){
			return{
				template:"<div class='bndl_all' ng-show='!appliedbundle' ng-cloak> <div class='bundled_offer' ng-if='show_bundle_price_category' ><a href='' ng-mouseenter='set_prev_pos()' ng-mouseover='call_all(catId, prodId, $event)' ng-mouseleave='call_all(catId, prodId, $event)'>{{::prefixtext}}: {{price}} <div class='putup_parent'><div class='putUp' data-offerd></div></div></a><span class='signatured_image'></span></div>"+
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
					url:'@',
					appliedbundle:'@'
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

						$scope.prefixtext = jQuery.trim($scope.prefixText).length? $scope.prefixText : 'Bundle Price';


							$scope.fix_pos = function($telem){

								var $sct;

								$telem.children('div').css('display','block');

								if(Detectizr.browser.engine=='webkit'){
									$sct = jQuery(document);
								}else{
									$sct = jQuery($window);
								}

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

							}




					
				},
				link:function($scope, elem, attrs, $location, $http){
					$rootScope.prodId = attrs.prodId;
					$rootScope.catId = attrs.catId;
					$scope.action = $scope.url;
					$scope.prefixText = 'Bundle Price';
					$scope.catId = attrs.catId;
					$scope.prodId = attrs.prodId;
					$scope.price = attrs.price;
					$scope.show_anchor = false;
					$scope.appliedbundle = attrs.appliedbundle?true:false;

					$scope.image_on_clicked = function(ev){
						ev.stopPropagation();
						$scope.show_anchor = !$scope.show_anchor;
						$scope.api_called = false;
					};

					
					var chk_pos;

							$scope.call_all = function(cd, pd, ev){
								var $targ = jQuery(ev.target);
								var $putupParent = $targ.find('.putup_parent');
								var scroll_elem = jQuery(ev.target).find(".bndl_ul");
					

								$scope.set_prev_pos = function(){
									setTimeout(function(){
										$scope.scrollTp?scroll_elem.mCustomScrollbar("scrollTo", $scope.scrollTp):null;	
									},50);
								}
								
								$scope.$on("tot_scroll_updated", function(s,t){
									$scope.scrollTp = t;
								});

								if(ev.type=='mouseover'){									
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



					/*jQuery(elem).parent().bind('inview', function(event, isInView, visiblePartX, visiblePartY){
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
					})*/

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