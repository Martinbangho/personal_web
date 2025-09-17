(function ($) {
	"use strict";

	/*------------------------------------
			Preloader
		--------------------------------------*/

	$(window).on('load', function () {
		$('#preloader').delay(350).fadeOut('slow');
		$('body').delay(350).css({ 'overflow': 'visible' });
	});



	/*------------------------------------
		Mobile Menu
	--------------------------------------*/

	$('#mobile-menu-active').metisMenu();

	$('#mobile-menu-active .has-dropdown > a').on('click', function (e) {
		e.preventDefault();
	});

	$(".hamburger-menu > a").on("click", function (e) {
		e.preventDefault();
		$(".slide-bar").toggleClass("show");
		$("body").addClass("on-side");
		$('.body-overlay').addClass('active');
		$(this).addClass('active');
	});

	$(".close-mobile-menu > a").on("click", function (e) {
		e.preventDefault();
		$(".slide-bar").removeClass("show");
		$("body").removeClass("on-side");
		$('.body-overlay').removeClass('active');
		$('.hamburger-menu > a').removeClass('active');
	});

	$('.body-overlay').on('click', function () {
		$(this).removeClass('active');
		$(".slide-bar").removeClass("show");
		$("body").removeClass("on-side");
		$('.hamburger-menu > a').removeClass('active');
	});



	//sticky-menu
	$(window).on('scroll', function () {
		var scroll = $(window).scrollTop();
		if (scroll < 200) {
			$(".main-header-area").removeClass("sticky-menu");
		} else {
			$(".main-header-area").addClass("sticky-menu");
		}
	});

	// Add .active class to current navigation based on URL
	var pgurl = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
	$(".navbar-nav > li  a").each(function () {
		if ($(this).attr("href") == pgurl || $(this).attr("href") == '')
			$(this).addClass("active");
		// $(this).parent("li").addClass("active");
	})


	//shopping-cart-bar
	$(".shopping-cart").on("click", function () {
		$(".cart-menu-right").addClass('cart-info');
	});
	$(".close-icon").click(function () {
		$(".cart-menu-right").removeClass('cart-info');

	});

	//brand-slider-one
	$('.brand-slider-one').slick({
		dots: false,
		arrows: false,
		infinite: true,
		loop: true,
		autoplay: true,
		autoplaySpeed: 2000,
		slidesToShow: 6,
		slidesToScroll: 2,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 4,
				}
			},
			{
				breakpoint: 600,
				settings: {
					slidesToShow: 2,
				}
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}
			// You can unslick at a given breakpoint now by adding:
			// settings: "unslick"
			// instead of a settings object
		]
	});


	//feature-slider-active
	$('.feature-slider-active').slick({
		dots: false,
		arrows: true,
		nextArrow: $('.next_f1'),
		prevArrow: $('.prev_f1'),
		infinite: true,
		loop: true,
		autoplay: true,
		autoplaySpeed: 2000,
		slidesToShow: 3,
		slidesToScroll: 1,

		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1,
				}
			},
			{
				breakpoint: 991,
				settings: {
					slidesToShow: 2,
				}
			},
			{
				breakpoint: 575,
				settings: {
					slidesToShow: 1,
				}
			}
		]
	});



	//feedback-active-one
	$('.feedback-active-one').slick({
		dots: false,
		arrows: false,
		infinite: true,
		loop: true,
		autoplay: true,
		autoplaySpeed: 2000,
		// fade: true,
		// speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
	});



	//blog-active-one
	$('.blog-active-one').slick({
		dots: false,
		arrows: true,
		nextArrow: $('.next_b1'),
		prevArrow: $('.prev_b1'),
		infinite: true,
		loop: true,
		autoplay: true,
		autoplaySpeed: 2000,
		slidesToShow: 3,
		slidesToScroll: 1,

		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 2,
				}
			},
			{
				breakpoint: 820,
				settings: {
					slidesToShow: 1,
				}
			}
		]
	});


	//case-slider-one
	$('.case-slider-one').slick({
		dots: false,
		arrows: true,
		nextArrow: $('.next_p1'),
		prevArrow: $('.prev_p1'),
		infinite: true,
		loop: true,
		autoplay: true,
		autoplaySpeed: 2000,
		slidesToShow: 3,
		slidesToScroll: 1,

		responsive: [
			{
				breakpoint: 800,
				settings: {
					slidesToShow: 2,
				}
			},
			{
				breakpoint: 575,
				settings: {
					slidesToShow: 1,
				}
			}
		]
	});



	//video-slider-one
	$('.video-slider-one').slick({
		dots: false,
		arrows: true,
		infinite: true,
		loop: true,
		// autoplay: true,
		// autoplaySpeed: 2000,
		nextArrow: $('.next_v1'),
		prevArrow: $('.prev_v1'),
		fade: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		responsive: [
			{
				breakpoint: 768,
				settings: {
					arrows: false,
				}
			}
		]
	});


	//feedback-slider-two
	$('.feedback-slider-two').slick({
		dots: true,
		arrows: false,
		infinite: true,
		loop: true,
		autoplay: true,
		autoplaySpeed: 2000,
		slidesToShow: 2,
		slidesToScroll: 1,

		responsive: [
			{
				breakpoint: 991,
				settings: {
					slidesToShow: 1,
				}
			}
		]
	});


	//feedback-slider-three
	$('.feedback-slider-three').slick({
		dots: true,
		arrows: false,
		infinite: true,
		loop: true,
		autoplay: true,
		autoplaySpeed: 2000,
		slidesToShow: 3,
		slidesToScroll: 1,

		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 2,
				}
			},
			{
				breakpoint: 767,
				settings: {
					slidesToShow: 1,
				}
			}
		]
	});


	function marquee_line() {
		$('#supermarquee').supermarquee({
			"type": "horizontal",
			"speed": "medium",
			"direction": "ltr",
			"pauseonhover": true,
			"autostart": true,
			"mode": "continuous",
			// "pingPongDelay": 2000,
			"position": "custom",
			"content": "Technology to elevate our human experience. Your Next It Solution Agency & Explore More Technology to elevate our human experience. Your Next It Solution Agency & Explore More",
		});
	}


	//product-slider
	$('.product-item-slider').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		loop: true,
		// fade: true,
		asNavFor: '.product-thumb-slider'
	});
	$('.product-thumb-slider').slick({
		slidesToShow: 4,
		slidesToScroll: 1,
		asNavFor: '.product-item-slider',
		autoplay: true,
		autoplaySpeed: 2000,
		loop: true,
		dots: false,
		arrows: false,
		focusOnSelect: true,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 3,
				}
			},
			{
				breakpoint: 991,
				settings: {
					slidesToShow: 4,
				}
			},
			{
				breakpoint: 767,
				settings: {
					slidesToShow: 2,
				}
			}
		]
	});




	// -------------------- price btn
	$(".price-btn").click(function () {

		var lable = $(".price-btn").text().trim();

		if (lable == "Monthly") {
			$(".price-btn").text("Yearly");
			$(".yearly-price").show();
			$(".monthly-price").hide();
		}
		else {
			$(".price-btn").text("Monthly");
			$(".monthly-price").show();
			$(".yearly-price").hide();
		}

	});

	$(function () {
		$('.chart').easyPieChart({
			animate: {
				duration: 1000,
				enabled: true
			},
			scaleLength: 0,
			size: 132,
			trackColor: '#887878',
			barColor: '#913BFF',
			scaleColor: 'false',
			lineWidth: 10,
			trackWidth: 2,
			lineCap: 'round',
			rotate: 90,
		});
	});


	// -------------------- Remove Placeholder When Focus Or Click
	$("input,textarea").each(function () {
		$(this).data('holder', $(this).attr('placeholder'));
		$(this).on('focusin', function () {
			$(this).attr('placeholder', '');
		});
		$(this).on('focusout', function () {
			$(this).attr('placeholder', $(this).data('holder'));
		});
	});


	/* magnificPopup video view */
	$('.popup-video').magnificPopup({
		type: 'iframe'
	});


	// isotop
	$('.grid').imagesLoaded(function () {
		// init Isotope
		var $grid = $('.grid').isotope({
			itemSelector: '.grid-item',
			percentPosition: true,
			masonry: {
				// use outer width of grid-sizer for columnWidth
				columnWidth: 0,
				gutter: 0
			}
		});
		// filter items on button click
		$('.portfolio-menu').on('click', 'button', function () {
			var filterValue = $(this).attr('data-filter');
			$grid.isotope({ filter: filterValue });
		});
	});

	//for menu active class
	$('.portfolio-menu button').on('click', function (event) {
		$(this).siblings('.active').removeClass('active');
		$(this).addClass('active');
		event.preventDefault();
	});

	//counter
	$('.counter').counterUp({
		delay: 10,
		time: 3000
	});

	/* Cart Plus Minus Js */
	$(".cart-plus-minus").append('<div class="dec qtybutton">-</div><div class="inc qtybutton">+</div>');
	$(".qtybutton").on("click", function () {
		var $button = $(this);
		var oldValue = $button.parent().find("input").val();
		if ($button.text() == "+") {
			var newVal = parseFloat(oldValue) + 1;
		} else {
			// Don't allow decrementing below zero
			if (oldValue > 0) {
				var newVal = parseFloat(oldValue) - 1;
			} else {
				newVal = 0;
			}
		}
		$button.parent().find("input").val(newVal);
	});

	//jquiry-price-slider
	$(function () {
		$("#slider-range").slider({
			range: true,
			min: 0,
			max: 500,
			values: [75, 300],
			slide: function (event, ui) {
				$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
			}
		});
		$("#amount").val("$" + $("#slider-range").slider("values", 0) +
			" - $" + $("#slider-range").slider("values", 1));
	});


	// scrollToTop
	$.scrollUp({
		scrollName: 'scrollUp', // Element ID
		topDistance: '300', // Distance from top before showing element (px)
		topSpeed: 500, // Speed back to top (ms)
		animation: 'fade', // Fade, slide, none
		animationInSpeed: 300, // Animation in speed (ms)
		animationOutSpeed: 300, // Animation out speed (ms)
		scrollText: '<i class="fas fa-chevron-double-up"></i>', // Text for element
		activeOverlay: false, // Set CSS color to display scrollUp active point, e.g '#00FFFF'
	});


	// wow animation - start
	// --------------------------------------------------
	function wowAnimation() {
		new WOW({
			offset: 100,
			mobile: true
		}).init()
	}
	wowAnimation();



	//jquiry-price-slider
	$(function () {
		$("#slider-range").slider({
			range: true,
			min: 0,
			max: 500,
			values: [75, 300],
			slide: function (event, ui) {
				$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
			}
		});
		$("#amount").val("$" + $("#slider-range").slider("values", 0) +
			" - $" + $("#slider-range").slider("values", 1));
	});

	//js-tilt

	// $('.js-tilt').tilt({
	// 	glare: true,
	// 	maxGlare: .1,
	// })




	// //nice-select
	// $(document).ready(function () {
	// 	$('select').niceSelect();
	// });


	AOS.init();
	marquee_line();



})(jQuery);