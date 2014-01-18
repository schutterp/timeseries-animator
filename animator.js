(function (window, _, af) {

    var rAF = _.bind(af.request, af);

    // Runs through an array of tuples at the inverse of playback_speed speed, calling a callback with the value
    //  at the 'current' time during playback

    var speeds = {
        slow: 50,
        normal: 25,
        fast: 5
    };
    // playback_speed. optional. string. one of 'fast', 'slow' or 'normal'
    window.Animator = function (playback_speed) {
        var speed_str = typeof speeds[playback_speed] !== 'undefined' ? playback_speed : 'normal';
        this.speed_setting = speeds[speed_str];
    };

    // callback will be called during playback with the 'current' values for each of the timeserieses in the order provided
    // second thru n args should be timeseries. Each ts should follow this format: [[seconds, value], ... ]
    window.Animator.prototype.run = function (callback) {
        // accept one or more timeseries streams
        var streams = Array.prototype.slice.call(arguments, 1);
        // create a shallow copy of each of the timeseries streams
        streams = _.map(streams, function (ts) {
            return ts.slice(0);
        });

        // given a delta in milliseconds (1000ths) return seconds into the timeseries
        var getProgress = _.bind(function (milliseconds_since_start) {
            return milliseconds_since_start / this.speed_setting;
        }, this);

        var start = null;
        var progress = 0;

        // init current results
        var curr_results = [];
        _.each(streams, function (ts) {
            // keeps the value at zero until progress is within a second of the first data point
            curr_results.push([ts[0][0] - 1, 0]);
        });

        var animLoop = function (timestamp) {
            // timestamp is thousandths of a second
            if (start === null) {
                start = timestamp;
            }
            progress = getProgress(timestamp - start);

            _.each(curr_results, function (curr, idx, results) {
                var t = curr[0];
                if (progress > t) {
                    // progress is now greater than t so pop off t until it is gt progress
                    while (
                        streams[idx].length &&
                        progress > t
                    ) {
                        results[idx] = streams[idx].shift();
                        t = results[idx][0];
                    }
                }
            });

            // call callback with some data ...
            callback.apply(this, _.map(curr_results, function (curr) { return curr[1]; }));

            if (_.any(streams, function (ts) { return ts.length; })) {
                rAF(animLoop);
            }
        };
        rAF(animLoop);
    };

})(window, _, new AnimationFrame());