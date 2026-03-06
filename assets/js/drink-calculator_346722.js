(function($) {
	window.drinkCalculator = {
    	calculatedResults: {
    		wine: '750ml bottle{0} of Wine',
    		spirit: '750ml bottle{0} of Spirit',
    		'beer': '6-pack{0} of Beer',
    		'champagne': '750ml bottle{0} of Champagne/Sparkling Wine',
    		'per_guest': 'drinks per guest',
    		'total': 'total drinks'
    	},
    	init: function() {
    		var $form = $('form#calculator'),
    			$wineSlider = $form.find('#wineSlider'),
		    	$beerSlider = $form.find('#beerSlider'),
		    	$spiritSlider = $form.find('#spiritSlider'),		    	
		    	$wine = $form.find('input#uxWine'),
		    	$beer = $form.find('input#uxBeer'),
		    	$spirit = $form.find('input#uxSpirits'),
		    	$winePercent = $form.find('input#wine-percent'),
		    	$beerPercent = $form.find('input#beer-percent'),
		    	$spiritPercent = $form.find('input#spirit-percent'),
		    	$wineLastValue = $form.find('input#wineLastValue'),
		    	$beerLastValue = $form.find('input#beerLastValue'),
		    	$spiritLastValue = $form.find('input#spiritsLastValue');		    	

		    $wineSlider.slider({
		        value: $winePercent.val(),
		        min: 0,
		        max: 100,
		        step: 1,
		        stop: function (event, ui) {
					// if ((parseInt($wine.val()) + parseInt($beer.val()) + parseInt($spirit.val())) < 100)
					// {
					// 	$wine.val(parseInt($wine.val()) + 1);
					// }
		        },
		        slide: function(event, ui) {
					var difference = ui.value - $winePercent.val(),
						remainder = adjustSlider("beer",difference,2,0);

					remainder = adjustSlider("spirit",difference-(remainder*2),2,0,true);
					$winePercent.val(ui.value);
					$wineLastValue.val(Math.ceil(ui.value));
					$wine.val(Math.ceil(ui.value));

					if (remainder != 0)
					{
						remainder = adjustSlider("wine",-remainder,1,1,true);
						return false;
					}
				}
			});

			$beerSlider.slider({
			    value:$beerPercent.val(),
			    min: 0,
			    max: 100,
			    step: 1,
			    stop: function (event, ui) {
				    // if (parseInt($wine.val()) + parseInt($beer.val()) + parseInt($spirit.val()) < 100)
				    // {
				    //     $beer.val(parseInt($beer.val()) + 1);
				    // }
				},
				slide: function( event, ui ) {
				    var difference = ui.value - $beerPercent.val();
				    var remainder = adjustSlider("wine",difference,2,0);
				    
				    remainder = adjustSlider("spirit",difference-(remainder*2),2,0,true);
				    $beerPercent.val(ui.value);
				    $beerLastValue.val(Math.ceil(ui.value));
				    $beer.val(Math.ceil(ui.value));
				    
				    if (remainder != 0)
				    {
				        remainder = adjustSlider("beer",-remainder,1,1,true);
				        return false;
				    }
			}});

			$spiritSlider.slider({
			    value:$spiritPercent.val(),
			    min: 0,
			    max: 100,
			    step: 1,
			    stop: function (event, ui) {
				    // if (parseInt($wine.val()) + parseInt($beer.val()) + parseInt($spirit.val()) < 100)
				    // {
				    //     $spirit.val(parseInt($spirit.val()) + 1);
				    // }
				},
				slide: function( event, ui ) {
				    var difference = ui.value - $spiritPercent.val();
				    var remainder = adjustSlider("wine",difference,2,0);
				    
				    remainder = adjustSlider("beer",difference-(remainder*2),2,0,true);
				    $spiritPercent.val(ui.value);
				    $spiritLastValue.val(Math.ceil(ui.value));
				    $spirit.val(Math.ceil(ui.value));
				    
				    if (remainder != 0)
				    {
				        remainder = adjustSlider("spirit",-remainder,1,1,true);
				        return false;
				    }
				}});

			$form.on('submit', function(event) {
                event.preventDefault();
                $form.find('.error').hide();

                submitCalculation();
            });

			function submitCalculation(){
				var numberOfGuests = $form.find('#guests').val(),
					eventLength = parseInt($form.find('#length').val()),
					errors = [];
					
				if(!eventLength || eventLength > 4 || eventLength < 1) errors.push({key: 'length', value: 'Must be between 1 and 4 hours'});
				
				if(!parseInt(numberOfGuests) || !this.drinkCalculator.isWholeNumber(numberOfGuests)) errors.push({key: 'guests', value: 'Must be between 1 and 2000 people'});
				else numberOfGuests = parseInt(numberOfGuests);

				if(errors.length > 0) {
					_.each(errors, function(item){
						var $errorInput = $form.find('#' + item.key).next();
						$errorInput.html(item.value).show();
					});

					if(!window.isSmall) $("html, body").animate({ scrollTop: 0 }, "slow");
					return;
				}
				else $form.find('.error').hide();

				var $results = $('body').find('.calculations-container').addClass('has-results'),
					$resultCalc = $results.find('#calulations-placeholder'),
					$resultRecommend = $results.find('#recommendations-placeholder'),
					resultCalcHTML = '<ul>',
					drinksPerHour = eventLength + 1,
					drinksTotal = numberOfGuests * drinksPerHour,
					winePercent = parseInt($wine.val()) / 100,
					beerPercent = parseInt($beer.val()) / 100,
					spiritPercent = parseInt($spirit.val()) / 100,
					wineCount = Math.ceil(numberOfGuests * drinksPerHour * winePercent / 5),
					beerCount = Math.ceil((numberOfGuests * drinksPerHour * beerPercent)/ 6),
					spiritCount = Math.ceil(numberOfGuests * drinksPerHour * spiritPercent / 16),
					champagneCount = 0,
					champagneVal = $form.find('input[name=champagne]:checked').val();
					
				if(champagneVal == 'true') {
					champagneCount = Math.ceil(numberOfGuests / 5);
					drinksTotal = drinksTotal + numberOfGuests;
					drinksPerHour = drinksPerHour + 1;
				}

				resultCalcHTML += '<li>' + drinksTotal + ' ' + this.drinkCalculator.calculatedResults.total + '</li>';
			    resultCalcHTML += '<li>' + drinksPerHour + ' ' + this.drinkCalculator.calculatedResults.per_guest + '</li>';
			    resultCalcHTML += '</ul>';
			    $resultCalc.html(resultCalcHTML);

			    resultCalcHTML = '<ul>';			    
			    if(wineCount > 0) resultCalcHTML += '<li>' + wineCount + ' x ' + this.drinkCalculator.calculatedResults.wine.replace('{0}', wineCount > 1 ? 's' : '') + '</li>';
			    if(spiritCount > 0) resultCalcHTML += '<li>' + spiritCount + ' x ' + this.drinkCalculator.calculatedResults.spirit.replace('{0}', spiritCount > 1 ? 's' : '') + '</li>';
			    if(beerCount > 0) resultCalcHTML += '<li>' + beerCount + ' x ' + this.drinkCalculator.calculatedResults.beer.replace('{0}', beerCount > 1 ? 's' : '') + '</li>';
			    if(champagneCount > 0) resultCalcHTML += '<li>' + champagneCount + ' x ' + this.drinkCalculator.calculatedResults.champagne.replace('{0}', champagneCount > 1 ? 's' : '') + '</li>';
			    resultCalcHTML += '</ul>';

			    $resultRecommend.html(resultCalcHTML);

			    if(!window.isSmall) $("html, body").animate({ scrollTop: 0 }, "slow");
			    else window.location.href = "#results";
			}

			function enableCalcKeyUp(){
				$beer.keyup(function(event) {
				    if (($beer.val() > -1) && ($beer.val()< 101))
				    {
				        var difference = ($beer.val() - 100)/2;
				        $beerLastValue.val($beer.val())
				        $beerPercent.val($beer.val())
				        $beerSlider.slider( "value", $beer.val() );
				        
				        var remainder = adjustSlider("wine",(parseInt(difference) + parseInt($wineLastValue.val())),1,0);
				        remainder = adjustSlider("spirit",(parseInt(difference) + parseInt($spiritLastValue.val()) - (remainder)),1,0);
				        
				        if (remainder != 0)
				        {
				            remainder = adjustSlider("wine",-remainder,1,0);
				            if (remainder != 0)
				            {
				                remainder = adjustSlider("beer",-remainder,1,1);
				            }
				        }
				    }
				    else
				    {
				        $beer.val($beerLastValue.val());
				    }
				});

				$wine.keyup(function(event) {
				    if (($wine.val() > -1) && ($wine.val()< 101))
				    {
				        var difference = ($wine.val() - 100)/2;

				        $wineLastValue.val($wine.val())
				        $winePercent.val($wine.val())
				        $wineSlider.slider( "value", $wine.val());

				        var remainder = adjustSlider("beer",(parseInt(difference) + parseInt($beerLastValue.val())),1,0);
				        remainder = adjustSlider("spirit",(parseInt(difference) + parseInt($spiritLastValue.val()) - (remainder)),1,0);

				        if (remainder != 0)
				        {
				            remainder = adjustSlider("beer",-remainder,1,0);
				            if (remainder != 0)
				            {
				                remainder = adjustSlider("wine",-remainder,1,1);
				            }
				        }
				    }
				    else
				    {
				        $wine.val($wineLastValue.val());
				    }

				});

				$spirit.keyup(function(event) {
				    if (($spirit.val() > -1) && ($spirit.val()< 101))
				    {
				        var difference = ($spirit.val() - 100)/2;
				        
				        $spiritLastValue.val($spirit.val())
				        $spiritPercent.val($spirit.val())
				        $spiritSlider.slider( "value", $spirit.val() );
				        
				        var remainder = adjustSlider("wine",(parseInt(difference) + parseInt($wineLastValue.val())),1,0);
				        remainder = adjustSlider("beer",(parseInt(difference) + parseInt($beerLastValue.val()) - (remainder)),1,0);
				        
				        if (remainder != 0)
				        {
				            remainder = adjustSlider("wine",-remainder,1,0);
				            if (remainder != 0)
				            {
				                remainder = adjustSlider("spirit",-remainder,1,1);
				            }
				        }
				    }
				    else
				    {
				        $spirit.val($spiritLastValue.val());
				    }
				});
			}

			function adjustSlider(sliderName, amount, divisor, force,isActive){
			    var resultValue,
			    	fixedamount,
			    	remainder = 0,
			    	$lockedElement,
			    	$selectedSlider,
			    	$selectedPercent,
			    	$selectedLastValue,
			    	$selectedVal;

			    fixedamount = (amount / divisor);

			    switch(sliderName) {
			    	case 'beer':
			    		$lockedElement = $('#beer-lock:checked');
			    		$selectedSlider = $beerSlider;
				    	$selectedPercent = $beerPercent;
				    	$selectedLastValue = $beerLastValue;
				    	$selectedVal = $beer;
			    		break;
			    	case 'spirit':
			    		$lockedElement = $('#spirit-lock:checked');
			    		$selectedSlider = $spiritSlider;
				    	$selectedPercent = $spiritPercent;
				    	$selectedLastValue = $spiritLastValue;
				    	$selectedVal = $spirit;
			    		break;
			    	case 'wine':
			    		$lockedElement = $('#wine-lock:checked:checked');
			    		$selectedSlider = $wineSlider;
				    	$selectedPercent = $winePercent;
				    	$selectedLastValue = $wineLastValue;
				    	$selectedVal = $wine;
			    		break;
			    	default:
			    		break;
			    }

			    if (($lockedElement.val() == undefined) || (force == 1))
		        {
		            if ($selectedPercent.val() - (fixedamount) < 0)
		            {
		                remainder = $selectedPercent.val() - (fixedamount)
		                resultValue = 0
		            }
		            else
		            {
		                resultValue = $selectedPercent.val() - (fixedamount);
		            }

		            $selectedSlider.slider("value",resultValue);
		            $selectedPercent.val(resultValue);

		            if(isActive) {
		            	$selectedLastValue.val(Math.ceil(resultValue));
		            	$selectedVal.val(Math.ceil(resultValue));
		            }
		            else {
		            	$selectedLastValue.val(Math.floor(resultValue));
		            	$selectedVal.val(Math.floor(resultValue));
		            }
		        }
		        else
		        {
		            remainder = -fixedamount;
		        }
			    
			    if (remainder != 0) {}
				
				return remainder;
			}
		},
		isWholeNumber: function(n) {
  			return /^\d+$/.test(n);
  		}
	}

	$(document).ready(function() {
		if(wpConfig.enableDrinkCalculator) {
	    	if($('body').hasClass('drink-calculator')) window.drinkCalculator.init();
	    }
	});

})(jQuery);
