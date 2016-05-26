(function ($) {
    $.fn.eventManager = function () {
        this.each(function () {
            var plugin = {
                init: function ($element, options) {
                    var module = this;
                    if (!($element instanceof jQuery)) {
                        $element = $($element);
                    }
                    module.initialize.call(module, $element, options);
                },
                initialize: function ($element, options) {
                    var module = this;
                    module.container = $element;
                    module.opts = jQuery.extend({
                        url: {}
                    }, $element.data(), options);

                    module.speed = 300;
                    module.$header = $element.find('header');
                    module.$headerBtn = module.$header.find('.header-button span');
                    module.$article = $element.find('article');
                    module.$thumbnail = module.$article.find('.event-thumbnail');
                    module.$description = module.$article.find('.event-description');
                    module.$map = module.$article.find('.event-map');
                    module.$iframe = module.$map.find('iframe');
                    module.details = (module.$thumbnail.length || module.$description.length);

                    module.registerEventHandlers();
                },
                registerEventHandlers: function () {
                    var module = this;

                    module.$header.on('click', function () {
                        module.articleToggle();
                        module.$headerBtn.toggleClass('hide');
                    });
                },
                articleToggle: function (open) {
                    var module = this;
                    if (typeof open == 'undefined') {
                        open = !module.$article.is(':visible');
                    }
                    if (open) {
                        module.$article.slideDown(module.speed);
                    } else {
                        module.$article.slideUp(module.speed);
                    }
                }
            };
            plugin.init(this);
        });
        return this;
    };

    $().ready(function () {
        var $body = $('body'),
            floaterToggle = function (reset) {
                var $self = $(this),
                    $floater = $self.closest('section.floater'),
                    $header = $floater.find('header'),
                    $article = $floater.find('article'),
                    $waiting = $floater.find('.waiting'),
                    $icon = $header.find('.icon-open, .icon-close'),
                    speed = 250;
                if ($article.is(':visible')) {
                    $article.slideUp(speed, function () {
                        $icon.toggleClass('hide');
                        $waiting.show();
                        if (reset) {
                            $article.empty();
                            $.ajax({
                                url: '/send',
                                type: 'GET',
                                dataType: 'html',
                                success: function (content) {
                                    $article
                                        .html(content)
                                        .find('input').eq(0).focus();
                                    $waiting.hide();
                                }
                            });
                        }
                    });
                } else {
                    $article
                        .slideDown(speed, function () {
                            $article.find('input').eq(0).focus();
                        });
                    $icon.toggleClass('hide');
                }
            },
            floaterReset = function () {
                floaterToggle.call(this, true);
            },
            floaterSubmit = function (event) {
                event.preventDefault();
                var $form = $(this),
                    $floater = $form.closest('section.floater'),
                    $article = $floater.find('article'),
                    $waiting = $floater.find('.waiting').show();
                $.ajax({
                    url: '/send_email',
                    type: 'GET',
                    data: $form.serializeJSON(),
                    dataType: 'html',
                    success: function (content) {
                        $article.html(content);
                        $waiting.hide();
                    }
                });
            },
            updateSunset = function () {
                var $self = $(this),
                    data = $body.data();
                $.ajax({
                    url: 'http://api.sunrise-sunset.org/json',
                    type: 'GET',
                    data: {
                        date: 'today',
                        lat: data.position.lat,
                        lng: data.position.lng,
                        formatted: 0
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (res && res.results) {
                            var sunset = res.results.sunset;
                            sunset = moment(sunset)
                                .locale('en')
                                .utcOffset(-400)
                                .format('LT');
                            $self.html(sunset);
                        }
                    }
                });
            },
            updateTemp = function () {
                var $self = $(this);
                $.ajax({
                    url: '/temperature',
                    type: 'GET',
                    dataType: 'html',
                    success: function (content) {
                        $self.html(content);
                    }
                });
            };
        $body
            .on('click', 'section.floater header', floaterToggle)
            .on('submit', 'section.floater form', floaterSubmit)
            .on('click', 'section.floater .close-floater', floaterReset)
            .find('.sunsetTime .infoText').each(updateSunset).end()
            .find('.sunsetTemp .infoText').each(updateTemp).end()
            .find('section.event').eventManager().end()
        ;
    });
})(jQuery);
