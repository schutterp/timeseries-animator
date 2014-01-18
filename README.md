Timeseries Animator
===================

Normalizes playback of array(s) of tuples containing seconds and a value into browser animation frames.


Usage
--------------

```javascript
var data = [
    [1, {lat: 30.2, lng: -97.7}],
    [2, {lat: 30.201, lng: -97.701],
    ...
];
var callback = function (position) {
    map.updatePostition(position.lat, position.lng);
};
var animator = new Animator('fast');
animator.run(callback, data);
```


Version
----

0.0.1


License
----
MIT