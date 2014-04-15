'use strict';

angular.module('landingPage', [])
    .config(function () {

    })
    .run(function ($window, FacebookConversion) {

        var urlParams = getQueryStringObject();
        var sessionId = window.localStorage.getItem('mp_id') || guid();
        mixpanel.identify(sessionId);

        FacebookConversion.track('6013014078943');
        var siteLoadHash = {};

        if (urlParams.cp) {
            mixpanel.people.set('campaign', urlParams.cp);
            mixpanel.register({ campaign: urlParams.cp});
            siteLoadHash.campaign = urlParams.cp;
        }

        if (urlParams.v) {
            mixpanel.people.set('ad_version', urlParams.v);
            mixpanel.register({ ad_version: urlParams.v});
            siteLoadHash.ad_version = urlParams.v;
        }

        if (urlParams.cid) {
            mixpanel.people.set('campaign_id', urlParams.cid);
            mixpanel.register({ campaign_id: urlParams.cid});
            siteLoadHash.campaign_id = urlParams.cid;
        }


        mixpanel.track('Site loaded', siteLoadHash);

        window.localStorage.setItem('mp_id', sessionId);

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        function guid() {
            return s4() + s4()
        }

        var interval,
            handler,
            el = document.getElementsByTagName('body')[0],
            scrollEvent = 'scroll',
            scrollPosition = {
                x: 0,
                y: 0
            };

        var bindScroll = function () {
            handler = function (event) {
                scrollPosition.x = el.scrollLeft;
                scrollPosition.y = el.scrollTop;

                startInterval(event);
                unbindScroll();
                scrollTrigger(event, false);
            };

            angular.element($window).bind(scrollEvent, handler);
        };

        var startInterval = function (event) {
            interval = $window.setInterval(function () {
                if (scrollPosition.x == el.scrollLeft && scrollPosition.y == el.scrollTop) {
                    $window.clearInterval(interval);
                    bindScroll();
                    scrollTrigger(event, true);
                } else {
                    scrollPosition.x = el.scrollLeft;
                    scrollPosition.y = el.scrollTop;
                }
            }, 150);
        };

        var unbindScroll = function () {
            // be nice to others, don't unbind their scroll handlers
            angular.element($window).unbind(scrollEvent, handler);
        };

        var currentPage = calculatePage(window.scrollY);

        var scrollTrigger = function (event, isEndEvent) {
            var newPage = calculatePage(scrollPosition.y);
            if (isEndEvent && newPage != currentPage) {
                console.log('Scrolled to page: ' + newPage);
                mixpanel.track('Scrolled To', {
                    page: newPage,
                    screenHeight: document.documentElement.clientHeight
                });

                currentPage = newPage;
            }
        };

        function calculatePage(scrollY) {
            return Math.ceil(scrollY / document.documentElement.clientHeight);
        }

        bindScroll();

        function getQueryStringObject() {
            var match,
                pl = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) {
                    return decodeURIComponent(s.replace(pl, " "));
                },
                query = window.location.search.substring(1);

            urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);

            return urlParams
        }

    });

angular.module('landingPage')
    .controller('FormCtrl', function ($scope, $http, FacebookConversion) {
        $scope.submit = function () {
            if ($scope.lead.$invalid) {
                mixpanel.track('Invalid submission');

                validate();
                if (angular.element(document.getElementsByTagName('html')[0]).hasClass('touch'))
                    showValidationMessage();
                return;
            }

            mixpanel.alias($scope.phone);
            window.localStorage.setItem('mp_id', $scope.phone);

            var formDetails = {
                name: $scope.name,
                zip: $scope.zip,
                phone: $scope.phone,
                loanType: $scope.loanType,
                loanAmount: $scope.loanAmount,
                domain: settings.domain
            };

            mixpanel.track('Form submitted', formDetails);
            FacebookConversion.track('6013014109543', '4.00');

            var result = $http.post(settings.apiUrl + '/lead', formDetails);
            $scope.submitting = true;

            result.success(function () {
                setTimeout(function () {
                    window.location.href = 'thank-you.html'
                }, 100)
            });

            function validate() {
                var form = $scope.lead;
                for (var field in  form) {
                    if (field[0] != '$' && form[field].$pristine) {
                        form[field].$setViewValue(
                            form[field].$modelValue
                        );
                    }
                }
            }

            function showValidationMessage() {
                var validationMessages = [];

                if ($scope.lead.name.$invalid)
                    validationMessages.push('* Name is required.');

                if ($scope.lead.zip.$invalid)
                    validationMessages.push('* Zip is required.');

                if ($scope.lead.phone.$invalid)
                    validationMessages.push('* Phone is required.');

                if ($scope.lead.loanType.$invalid)
                    validationMessages.push('* Loan type is required.');

                if ($scope.lead.loanAmount.$invalid)
                    validationMessages.push('* Loan amount is required.');

                alert('You are missing\n' + validationMessages.join('\n'));
            }
        }
    })
    .controller('ClickToCallCtrl', function ($scope, FacebookConversion) {


        $scope.desktop = false;

        if (angular.element(document.getElementsByTagName('html')).hasClass('no-touch')) {
            var ZingayaConfig = {"buttonLabel": "Click to call Instant Connect", "labelColor": "#13487f", "labelFontSize": 15, "labelTextDecoration": "none", "labelFontWeight": "bold", "labelShadowDirection": "bottom", "labelShadowColor": "#8fd3ec", "labelShadow": 1, "buttonBackgroundColor": "#68c3f0", "buttonGradientColor1": "#68c3f0", "buttonGradientColor2": "#5bbaee", "buttonGradientColor3": "#5fbdef", "buttonGradientColor4": "#62bfef", "buttonShadow": "true", "buttonHoverBackgroundColor": "#69ad26", "buttonHoverGradientColor1": "#30b3f1", "buttonHoverGradientColor2": "#2aa8ef", "buttonHoverGradientColor3": "#2cacf0", "buttonHoverGradientColor4": "#2daef0", "buttonActiveShadowColor1": "", "buttonActiveShadowColor2": "", "buttonCornerRadius": 2, "buttonPadding": 10, "iconColor": "#ffffff", "iconOpacity": 1, "iconDropShadow": 1, "iconShadowColor": "#13487f", "iconShadowDirection": "bottom", "iconShadowOpacity": 0.5, "callme_id": "3cd76f2c465e44d990bd18809b8e8d84", "poll_id": null, "analytics_id": null, "type": "button", "widgetPosition": "right", "save": 1};
            (function (d, t) {
                var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
                g.src = '//cdn.zingaya.com/js/zingayabutton.js';
                g.async = 'true';
                g.onload = g.onreadystatechange = function () {
                    if (this.readyState && this.readyState != 'complete' && this.readyState != 'loaded') return;
                    try {
                        Zingaya.load(ZingayaConfig, 'zingaya3cd76f2c465e44d990bd18809b8e8d84');
                        if (!Zingaya.SVG()) {
                            var p = d.createElement(t);
                            p.src = '//cdn.zingaya.com/PIE.js';
                            p.async = 'true';
                            s.parentNode.insertBefore(p, s);
                            p.onload = p.onreadystatechange = function () {
                                if (this.readyState && this.readyState != 'complete' && this.readyState != 'loaded') return;
                                if (window.PIE) PIE.attach(document.getElementById("zingayaButton" + ZingayaConfig.callme_id));
                            }
                        }
                    } catch (e) {
                    }
                };
                s.parentNode.insertBefore(g, s);
            }(document, 'script'));

            $scope.desktop = true;
        }

        $scope.triggerCall = function (phone) {
            FacebookConversion.track('6013014157743', '11.00');

            setTimeout(function () {
                window.location = 'tel:' + phone;
            }, 250);

        };

        $scope.goToLeadForm = function () {
            window.location.href = 'index.html#leadForm'
        }

    })
    .service('FacebookConversion', function () {
        this.track = function (pixelId, value) {
            value = value || '0.00';
            var trackingImage = new Image();
            trackingImage.src = "https://www.facebook.com/offsite_event.php?id=" + pixelId + "&value=" + value + "&currency=USD";
        }
    })
    .directive('mixpanelTrackLink', function () {
        return function (scope, element, attrs) {
            element.on('click', function () {
                mixpanel.track('Link clicked', {
                    scope: attrs.name,
                    text: element.text() || 'Empty'
                })
            });
        }
    })
    .directive('mixpanelClick', function () {
        return function (scope, element, attrs) {
            element.on('click', function () {
                mixpanel.track(attrs.mixpanelClick)
            });
        }
    })
    .directive('facebookPixel', function (FacebookConversion) {
        return function (scope, element, attrs) {
            element.on('click', function () {
                FacebookConversion.track(attrs.facebookPixel, '3.00');
            });
        }
    })
    .directive('mixpanelInput', function () {
        return function (scope, element, attrs) {
            element.on('focus', function () {
                var hash = {
                    name: attrs.name
                };

                if (element.val())
                    hash.value = element.val();

                mixpanel.track('Focus', hash)
            });

            element.on('blur', function () {
                var hash = {
                    name: attrs.name
                };

                if (element.val())
                    hash.value = element.val();

                mixpanel.track('Blur', hash)
            });
        }
    })
    .directive('mixpanelSelect', function () {
        return function (scope, element, attrs) {
            element.on('change', function () {
                mixpanel.track('Selected', {
                    name: attrs.name,
                    value: element.val()
                })
            });
        }
    });

