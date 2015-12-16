# Photo Histogram
JS widget library written in Typescript to create histograms from canvas and image elements with no dependencies.  The design is modeled after Photoshop.

## Screenshots
###Colors Channel with stats bar

![alt text](https://raw.githubusercontent.com/zackee12/photo-histogram/master/resources/colors_stats.png "Colors channel")

###Colors Channel with stats bar hidden

![alt text](https://raw.githubusercontent.com/zackee12/photo-histogram/master/resources/colors_nostats.png "Colors channel")

###Red Channel with options shown

![alt text](https://raw.githubusercontent.com/zackee12/photo-histogram/master/resources/red_stats_channels.png "Red channel")

###Red Channel with a selection

![alt text](https://raw.githubusercontent.com/zackee12/photo-histogram/master/resources/red_stats_selection.png "Red channel")

## Usage
### HTML
```html
<!DOCTYPE html>
<html>
<head>
    ...
    <link rel="stylesheet" type="text/css" href="photo-histogram.css">
</head>
<body>
    ...
    <img id="myimage" src="..."/>
    <canvas id="mycanvas" src="..."/></canvas>
    <div id="histogram1"></div>
    <div id="histogram2"></div>
    <script src="photo-histogram.js"></script>
</body>
</html>
```

### Javascript
```javascript
    // img element source
    var src1 = document.getElementById('myimage');
    var dst1 = document.getElementById('histogram1');
    var histogram1 = new PhotoHistogram.Ui(dst1, src1);
    
    // canvas element source
    var src2 = document.getElementById('mycanvas');
    var dst2 = document.getElementById('histogram2');
    var histogram2 = new PhotoHistogram.Ui(dst2, src2);
```

## Broswer Support
[![Selenium Test Status](https://saucelabs.com/browser-matrix/zackee12.svg)](https://saucelabs.com/u/zackee12)