X.ready('notify', function() {
    X.subscribe("notify/set", function (msg, data) {
        X.poll(function() {
            var $target = X(data.target);
            if (!$target.length) { return false; }
            var $counter = $target.find('.sfx_notification_count');
            if (!$counter.length) {
                $target.prepend('<div class="sfx_notification_count">0</div>');
                $counter = $target.find('.sfx_notification_count');
            }
            var count = +$counter.html() || 0;
            if (typeof data.count != "undefined") {
                count = data.count;
            }
            if (typeof data.increment != "undefined") {
                count++;
            }
            $counter.text(count);
        },500,10);
    });

    X.subscribe("notify/increment", function (msg, data) {
        data.increment = true;
        X.publish("notify/set", data);
    });

    X.subscribe("notify/clear", function (msg, data) {
        var $target = X(data.target);
        $target.find('.sfx_notification_count').remove();
    });
});
