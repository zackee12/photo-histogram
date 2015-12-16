# Photo Histogram
JS widget library written in Typescript to create histograms from canvas and image elements with no dependencies.

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