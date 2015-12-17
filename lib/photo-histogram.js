var PhotoHistogram;
(function (PhotoHistogram) {
    var Util;
    (function (Util) {
        var Histogram;
        (function (Histogram) {
            /**
             * Count the number of elements in a histogram
             * @param histogram [number[]] index=bin value and value = count
             * @returns {number}
             */
            function cnt(histogram) {
                var count = 0;
                for (var i = 0; i < histogram.length; i++) {
                    count += histogram[i];
                }
                return count;
            }
            Histogram.cnt = cnt;
            /**
             * Return the middle index of a histogram.  Middle index of histogram with count of 5 == 3, and
             * middle index of 6 == 3.
             * @param histogram [number[]] index=bin value and value = count
             * @returns {number}
             */
            function middleIndex(histogram) {
                var totalCount = cnt(histogram);
                var middleIndex = Math.floor(totalCount / 2);
                if (totalCount > 1 && totalCount % 2 == 1)
                    middleIndex += 1;
                return middleIndex;
            }
            Histogram.middleIndex = middleIndex;
            /**
             * Calculate the mean from a histogram array
             * @param histogram [number[]] index=bin value and value = count
             * @returns {number}
             */
            function mean(histogram) {
                var count = 0;
                var sum = 0;
                for (var i = 0; i < histogram.length; i++) {
                    count += histogram[i];
                    sum += i * histogram[i];
                }
                return sum / count;
            }
            Histogram.mean = mean;
            /**
             * Calculate the mean from a histogram array
             * @param histogram [number[]] index=bin value and value = count
             * @returns {number}
             */
            function median(histogram) {
                var count = 0;
                var i = 0;
                var mi = middleIndex(histogram);
                while (count < mi) {
                    count += histogram[i++];
                }
                return i - 1;
            }
            Histogram.median = median;
            /**
             * Calculate the mode from a histogram array
             * @param histogram [number[]] index=bin value and value = count
             * @returns {number}
             */
            function mode(histogram) {
                var max = 0;
                var bin = 0;
                for (var i = 0; i < histogram.length; i++) {
                    if (histogram[i] > max) {
                        max = histogram[i];
                        bin = i;
                    }
                }
                return bin;
            }
            Histogram.mode = mode;
            /**
             * Calculate the variance of a histogram array
             * @param histogram [number[]] index=bin value and value = count
             * @returns {number}
             */
            function variance(histogram) {
                var average = mean(histogram);
                var sum = 0;
                var count = 0;
                for (var i = 0; i < histogram.length; i++) {
                    count += histogram[i];
                    sum += histogram[i] * Math.pow(i - average, 2);
                }
                return sum / count;
            }
            Histogram.variance = variance;
            /**
             * Calculate the standard deviation of a histogram array
             * @param histogram [number[]] index=bin value and value = count
             * @returns {number}
             */
            function std(histogram) {
                return Math.sqrt(variance(histogram));
            }
            Histogram.std = std;
        })(Histogram = Util.Histogram || (Util.Histogram = {}));
        var Random;
        (function (Random) {
            /**
             * Returns a random integer between min (included) and max (included)
             * @param min [number] lower bound (inclusive)
             * @param max [number] upper bound (inclusive)
             * @returns {number}
             */
            function integer(min, max) {
                // Returns a random integer between min (included) and max (included)
                // Using Math.round() will give you a non-uniform distribution!
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            Random.integer = integer;
            /**
             * Returns a random base string concat with a random integer
             * @param base [string] base string
             * @returns {string}
             */
            function id(base) {
                // append a random int to a string for use in ids
                return base + integer(0, 1e10);
            }
            Random.id = id;
        })(Random = Util.Random || (Util.Random = {}));
        var DOM;
        (function (DOM) {
            /**
             * Create a new element and set attributes
             * @param tagName: [string] type of element
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @param parent [Element] option parent to append element
             * @returns {HTMLElement}
             */
            function createElement(tagName, attributes, parent) {
                var element = document.createElement(tagName);
                if (attributes) {
                    var keys = Object.keys(attributes);
                    for (var i = 0; i < keys.length; i++) {
                        element.setAttribute(keys[i], attributes[keys[i]]);
                    }
                }
                if (parent) {
                    parent.appendChild(element);
                }
                return element;
            }
            DOM.createElement = createElement;
            /**
             * Create a new element with namespace and set attributes
             * @param tagName [string] type of element
             * @param namespace [string] namespace of element
             * @param attributes [{key: value}] key-value string attributes to set on element
             * @param parent [Element] option parent to append element
             * @returns {Element}
             */
            function createElementNS(tagName, namespace, attributes, parent) {
                var element = document.createElementNS(namespace, tagName);
                if (attributes) {
                    var keys = Object.keys(attributes);
                    for (var i = 0; i < keys.length; i++) {
                        element.setAttributeNS(null, keys[i], attributes[keys[i].toString()]);
                    }
                }
                if (parent) {
                    parent.appendChild(element);
                }
                return element;
            }
            DOM.createElementNS = createElementNS;
        })(DOM = Util.DOM || (Util.DOM = {}));
        var Extension;
        (function (Extension) {
            var EnumEx = (function () {
                function EnumEx() {
                }
                /**
                 * Get names of enumeration
                 * @param e [Enum]
                 * @returns {string[]}
                 */
                EnumEx.getNames = function (e) {
                    return Object.keys(e).filter(function (v) { return isNaN(parseInt(v, 10)); });
                };
                /**
                 * Get values of enumeration
                 * @param e [Enum]
                 * @returns {number[]}
                 */
                EnumEx.getValues = function (e) {
                    return Object.keys(e).map(function (v) { return parseInt(v, 10); }).filter(function (v) { return !isNaN(v); });
                };
                /**
                 * Get name/value pairs of enumeration
                 * @param e [Enum]
                 * @returns {{name: *, value: number}[]}
                 */
                EnumEx.getNamesAndValues = function (e) {
                    return EnumEx.getValues(e).map(function (v) { return { name: e[v], value: v }; });
                };
                return EnumEx;
            })();
            Extension.EnumEx = EnumEx;
        })(Extension = Util.Extension || (Util.Extension = {}));
        var Convert;
        (function (Convert) {
            /**
             * Convert clientXY from a mouse event to scaled point on an svg element
             * @param svg [SVGSVGElement] svg element that client is over
             * @param clientX [number] clientX (e.g. mouseEvent.clientX)
             * @param clientY [number] clientY (e.g. mouseEvent.clientY)
             * @returns {SVGPoint}
             */
            function clientXY2SvgPoint(svg, clientX, clientY) {
                var point = svg.createSVGPoint();
                point.x = clientX;
                point.y = clientY;
                return point.matrixTransform(svg.getScreenCTM().inverse());
            }
            Convert.clientXY2SvgPoint = clientXY2SvgPoint;
        })(Convert = Util.Convert || (Util.Convert = {}));
    })(Util = PhotoHistogram.Util || (PhotoHistogram.Util = {}));
})(PhotoHistogram || (PhotoHistogram = {}));
/// <reference path="util.ts" />
var PhotoHistogram;
(function (PhotoHistogram) {
    var Manager;
    (function (Manager) {
        /**
         * Manage creating and removing elements from an svg element
         */
        var Svg = (function () {
            function Svg(element) {
                this.element = element;
            }
            /**
             * Create Svg element and append to parent
             * @param parent [Element] svg element parent
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @returns {PhotoHistogram.Manager.Svg}
             */
            Svg.create = function (parent, attributes) {
                var element = PhotoHistogram.Util.DOM.createElementNS('svg', Svg.xmlns, attributes, parent);
                return new Svg(element);
            };
            /**
             * Remove all children from the svg element
             */
            Svg.prototype.clear = function () {
                while (this.element.firstChild) {
                    this.element.removeChild(this.element.firstChild);
                }
            };
            /**
             * Create and append a rect element
             * @param x
             * @param y
             * @param width
             * @param height
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @returns {SVGRectElement}
             */
            Svg.prototype.rect = function (x, y, width, height, attributes) {
                if (!attributes)
                    attributes = {};
                attributes.x = x.toString(10);
                attributes.y = y.toString(10);
                attributes.width = width.toString(10);
                attributes.height = height.toString(10);
                return PhotoHistogram.Util.DOM.createElementNS('rect', Svg.xmlns, attributes, this.element);
            };
            /**
             * Create and append a line element
             * @param x1
             * @param y1
             * @param x2
             * @param y2
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @returns {SVGLineElement}
             */
            Svg.prototype.line = function (x1, y1, x2, y2, attributes) {
                if (!attributes)
                    attributes = {};
                attributes.x1 = x1.toString(10);
                attributes.y1 = y1.toString(10);
                attributes.x2 = x2.toString(10);
                attributes.y2 = y2.toString(10);
                return PhotoHistogram.Util.DOM.createElementNS('line', Svg.xmlns, attributes, this.element);
            };
            /**
             * Create and append a path element
             * @param d
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @returns {SVGPathElement}
             */
            Svg.prototype.path = function (d, attributes) {
                if (!attributes)
                    attributes = {};
                attributes.d = d;
                return PhotoHistogram.Util.DOM.createElementNS('path', Svg.xmlns, attributes, this.element);
            };
            Svg.xmlns = 'http://www.w3.org/2000/svg';
            return Svg;
        })();
        Manager.Svg = Svg;
        /**
         * Builds d attribute to construct a path element
         */
        var SvgPathBuilder = (function () {
            function SvgPathBuilder(svgManager) {
                this._data = '';
                this._manager = svgManager;
            }
            SvgPathBuilder.prototype.clear = function () {
                this._data = '';
            };
            SvgPathBuilder.prototype.build = function (attributes) {
                return this._manager.path(this._data, attributes);
            };
            SvgPathBuilder.prototype.moveTo = function (x, y) {
                if (this._data == '')
                    this._data = 'M ' + x + ' ' + y;
                else
                    this._data += ' M ' + x + ' ' + y;
                return this;
            };
            SvgPathBuilder.prototype.lineTo = function (x, y) {
                if (this._data == '')
                    this._data = 'L ' + x + ' ' + y;
                else
                    this._data += ' L ' + x + ' ' + y;
                return this;
            };
            return SvgPathBuilder;
        })();
        Manager.SvgPathBuilder = SvgPathBuilder;
    })(Manager = PhotoHistogram.Manager || (PhotoHistogram.Manager = {}));
})(PhotoHistogram || (PhotoHistogram = {}));
/// <reference path="util.ts" />
var PhotoHistogram;
(function (PhotoHistogram) {
    var Core;
    (function (Core) {
        /**
         * Calculates the histogram and statistics from a source canvas or image element
         */
        var Histogram = (function () {
            /**
             * Constructor
             * @param source [HTMLCanvasElement | HTMLImageElement] source element
             * @param luminanceWeights [number[]] array of weights to convert rgb to luminance
             */
            function Histogram(source, luminanceWeights) {
                if (luminanceWeights === void 0) { luminanceWeights = [0.2126, 0.7152, 0.0722]; }
                this._source = source;
                this._canvas = document.createElement('canvas');
                this._ctx = this._canvas.getContext('2d');
                if (luminanceWeights.length != 3)
                    throw new Error('luminance weights must have 3 values that sum to one');
                this._luminanceWeights = luminanceWeights.slice(0);
                this.data = this._calcData();
            }
            Object.defineProperty(Histogram.prototype, "red", {
                /**
                 * Red channel histogram
                 * @returns {Array<Number>}
                 */
                get: function () {
                    return this.data.hist.red;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "green", {
                /**
                 * Green channel histogram
                 * @returns {Array<Number>}
                 */
                get: function () {
                    return this.data.hist.green;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "blue", {
                /**
                 * Blue channel histogram
                 * @returns {Array<Number>}
                 */
                get: function () {
                    return this.data.hist.blue;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "luminance", {
                /**
                 * Luminance histogram
                 * @returns {Array<Number>}
                 */
                get: function () {
                    return this.data.hist.luminance;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "rgb", {
                /**
                 * RGB Histogram
                 * @returns {Array<Number>}
                 */
                get: function () {
                    return this.data.hist.rgb;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "count", {
                get: function () {
                    return this.data.count;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "mean", {
                get: function () {
                    return this.data.mean;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "median", {
                get: function () {
                    return this.data.median;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "mode", {
                get: function () {
                    return this.data.mode;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "std", {
                get: function () {
                    return this.data.stddev;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Histogram.prototype, "max", {
                get: function () {
                    return this.data.max;
                },
                enumerable: true,
                configurable: true
            });
            Histogram.prototype._calcData = function () {
                // draw image/canvas source to a new canvas and get pixel data
                this._canvas.width = this._source.width;
                this._canvas.height = this._source.height;
                this._ctx.drawImage(this._source, 0, 0);
                var imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
                // hist arrays
                var red = new Array(256);
                var green = new Array(256);
                var blue = new Array(256);
                var luminance = new Array(256);
                var rgb = new Array(256);
                // fill arrays with zeros
                for (var i = 0; i < 256; i++) {
                    red[i] = 0;
                    green[i] = 0;
                    blue[i] = 0;
                    luminance[i] = 0;
                    rgb[i] = 0;
                }
                // tally each pixel into its bin where index = bin value
                var r, g, b, l;
                for (var i = 0; i < imageData.data.length; i += 4) {
                    r = imageData.data[i];
                    g = imageData.data[i + 1];
                    b = imageData.data[i + 2];
                    l = Math.floor(this._luminanceWeights[0] * r + this._luminanceWeights[1] * g + this._luminanceWeights[2] * b);
                    red[r] += 1;
                    green[g] += 1;
                    blue[b] += 1;
                    luminance[l] += 1;
                    rgb[r] += 1;
                    rgb[g] += 1;
                    rgb[b] += 1;
                }
                // find max value for normalizing
                var maxRGB = 0, maxRed = 0, maxGreen = 0, maxBlue = 0, maxLuminance = 0;
                for (var i = 0; i < 256; i++) {
                    if (red[i] > maxRed)
                        maxRed = red[i];
                    if (green[i] > maxGreen)
                        maxGreen = green[i];
                    if (blue[i] > maxBlue)
                        maxBlue = blue[i];
                    if (luminance[i] > maxLuminance)
                        maxLuminance = luminance[i];
                    if (rgb[i] > maxRGB)
                        maxRGB = rgb[i];
                }
                // stats
                var countRed = imageData.data.length / 4;
                var countRGB = countRed * 3;
                var meanRed = PhotoHistogram.Util.Histogram.mean(red);
                var meanGreen = PhotoHistogram.Util.Histogram.mean(green);
                var meanBlue = PhotoHistogram.Util.Histogram.mean(blue);
                var meanLuminance = PhotoHistogram.Util.Histogram.mean(luminance);
                // can use average of averages since sizes are equal
                var meanRGB = (meanRed + meanGreen + meanBlue) / 3.0;
                var medianRed = PhotoHistogram.Util.Histogram.median(red);
                var medianGreen = PhotoHistogram.Util.Histogram.median(green);
                var medianBlue = PhotoHistogram.Util.Histogram.median(blue);
                var medianLuminance = PhotoHistogram.Util.Histogram.median(luminance);
                var medianRGB = PhotoHistogram.Util.Histogram.median(rgb);
                var modeRed = PhotoHistogram.Util.Histogram.mode(red);
                var modeGreen = PhotoHistogram.Util.Histogram.mode(green);
                var modeBlue = PhotoHistogram.Util.Histogram.mode(blue);
                var modeLuminance = PhotoHistogram.Util.Histogram.mode(luminance);
                var modeRGB = PhotoHistogram.Util.Histogram.mode(rgb);
                var stddevRed = PhotoHistogram.Util.Histogram.std(red);
                var stddevGreen = PhotoHistogram.Util.Histogram.std(green);
                var stddevBlue = PhotoHistogram.Util.Histogram.std(blue);
                var stddevLuminance = PhotoHistogram.Util.Histogram.std(luminance);
                var stddevRGB = PhotoHistogram.Util.Histogram.std(rgb);
                return {
                    hist: { red: red, green: green, blue: blue, luminance: luminance, rgb: rgb },
                    count: { red: countRed, green: countRed, blue: countRed, luminance: countRed, rgb: countRGB },
                    max: { red: maxRed, green: maxGreen, blue: maxBlue, luminance: maxLuminance, rgb: maxRGB },
                    mean: { red: meanRed, green: meanGreen, blue: meanBlue, luminance: meanLuminance, rgb: meanRGB },
                    median: { red: medianRed, green: medianGreen, blue: medianBlue, luminance: medianLuminance, rgb: medianRGB },
                    mode: { red: modeRed, green: modeGreen, blue: modeBlue, luminance: modeLuminance, rgb: modeRGB },
                    stddev: { red: stddevRed, green: stddevGreen, blue: stddevBlue, luminance: stddevLuminance, rgb: stddevRGB },
                };
            };
            /**
             * Recalculate all data
             */
            Histogram.prototype.refresh = function () {
                this.data = this._calcData();
            };
            return Histogram;
        })();
        Core.Histogram = Histogram;
    })(Core = PhotoHistogram.Core || (PhotoHistogram.Core = {}));
})(PhotoHistogram || (PhotoHistogram = {}));
/// <reference path="util.ts" />
/// <reference path="manager.ts" />
/// <reference path="histogram.ts" />
var PhotoHistogram;
(function (PhotoHistogram) {
    (function (HistogramChannel) {
        HistogramChannel[HistogramChannel["Colors"] = 0] = "Colors";
        HistogramChannel[HistogramChannel["Red"] = 1] = "Red";
        HistogramChannel[HistogramChannel["Green"] = 2] = "Green";
        HistogramChannel[HistogramChannel["Blue"] = 3] = "Blue";
        HistogramChannel[HistogramChannel["Luminance"] = 4] = "Luminance";
        HistogramChannel[HistogramChannel["RGB"] = 5] = "RGB";
    })(PhotoHistogram.HistogramChannel || (PhotoHistogram.HistogramChannel = {}));
    var HistogramChannel = PhotoHistogram.HistogramChannel;
    var Ui = (function () {
        function Ui(parent, source, options) {
            this.viewBoxWidth = 256;
            this.viewBoxHeight = 100;
            if (!options)
                options = {};
            if (!options.colors)
                options.colors = {};
            this.colors = {
                red: options.colors.red || '#c72121',
                green: options.colors.green || '#35a135',
                blue: options.colors.blue || '#3161b9',
                redGreen: options.colors.redGreen || '#c9be28',
                redBlue: options.colors.redBlue || '#e110bf',
                greenBlue: options.colors.greenBlue || '#05b9b9',
                redGreenBlue: options.colors.redGreenBlue || '#949494',
                stroke: options.colors.stroke || '#000000',
                border: options.colors.border || '#000000',
                background: options.colors.background || '#383838',
                backgroundLine: options.colors.backgroundLine || '#949494',
                overlayFill: options.colors.overlayFill || 'rgba(0, 0, 0, 0.5)',
                overlayStroke: options.colors.overlayStroke || '#000',
            };
            this.id = {
                btnRefresh: PhotoHistogram.Util.Random.id('btnRefresh'),
                btnStatsToggle: PhotoHistogram.Util.Random.id('btnStatsToggle'),
                containerControls: PhotoHistogram.Util.Random.id('containerControls'),
                containerHistogram: PhotoHistogram.Util.Random.id('containerHistogram'),
                containerStats: PhotoHistogram.Util.Random.id('containerStats'),
                inputMean: PhotoHistogram.Util.Random.id('inputMean'),
                inputMedian: PhotoHistogram.Util.Random.id('inputMedian'),
                inputMode: PhotoHistogram.Util.Random.id('inputMode'),
                inputStd: PhotoHistogram.Util.Random.id('inputStd'),
                inputPixels: PhotoHistogram.Util.Random.id('inputPixels'),
                inputLevel: PhotoHistogram.Util.Random.id('inputLevel'),
                inputCount: PhotoHistogram.Util.Random.id('inputCount'),
                inputPercentile: PhotoHistogram.Util.Random.id('inputPercentile'),
                rectOverlay: PhotoHistogram.Util.Random.id('rectOverlay'),
                selectChannels: PhotoHistogram.Util.Random.id('selectChannels'),
                textStatus: PhotoHistogram.Util.Random.id('textStatus'),
            };
            this.parent = parent;
            this._createSkeleton(parent);
            var svgParent = document.getElementById(this.id.containerHistogram);
            this.svgManager = PhotoHistogram.Manager.Svg.create(svgParent, {
                viewBox: '0 0 ' + this.viewBoxWidth + ' ' + this.viewBoxHeight,
                width: options.width || '100%',
                height: options.height || '256',
                preserveAspectRatio: 'none',
                style: 'mix-blend-mode: normal',
                'class': 'histogram-svg',
            });
            this.histogram = new PhotoHistogram.Core.Histogram(source);
            this.prevMouseDownPoint = null;
            this._addEventListeners();
            this.render();
        }
        Ui.prototype.selectedChannel = function () {
            return parseInt(document.getElementById(this.id.selectChannels).value, 10);
        };
        Ui.prototype.render = function () {
            var channel = this.selectedChannel();
            this.svgManager.clear();
            this._renderHistogramBackground();
            if (channel == HistogramChannel.Colors) {
                this._renderColorHistogram();
            }
            else {
                this._renderSingleHistogram();
            }
            this.svgManager.rect(0, 0, 0, 0, { 'fill': this.colors.overlayFill, 'stroke': this.colors.overlayStroke, 'stroke-width': 1.0, 'id': this.id.rectOverlay });
            this._updateStats();
        };
        Ui.prototype.refresh = function () {
            this.histogram.refresh();
            this.render();
        };
        Ui.prototype._createContainerControls = function (parent) {
            var container = PhotoHistogram.Util.DOM.createElement('div', { 'class': 'histogram-controls', 'id': this.id.containerControls }, parent);
            var containerChannels = PhotoHistogram.Util.DOM.createElement('div', { 'class': 'histogram-channels' }, container);
            var label = PhotoHistogram.Util.DOM.createElement('label', { 'for': this.id.selectChannels }, containerChannels);
            label.innerHTML = 'Channels:';
            var channels = PhotoHistogram.Util.Extension.EnumEx.getNamesAndValues(HistogramChannel);
            var select = PhotoHistogram.Util.DOM.createElement('select', { 'id': this.id.selectChannels }, containerChannels);
            for (var i = 0; i < channels.length; i++) {
                var option = PhotoHistogram.Util.DOM.createElement('option', { 'value': channels[i].value }, select);
                option.innerHTML = channels[i].name;
            }
            var containerButtons = PhotoHistogram.Util.DOM.createElement('div', { 'class': 'histogram-buttons' }, container);
            var anchorStats = PhotoHistogram.Util.DOM.createElement('a', { 'href': '#', 'class': 'histogram-button', 'id': this.id.btnStatsToggle, 'title': 'Hide Stats Bar' }, containerButtons);
            var iStats = PhotoHistogram.Util.DOM.createElement('i', { 'class': 'fa fa-bars' }, anchorStats);
            var anchorRefresh = PhotoHistogram.Util.DOM.createElement('a', { 'href': '#', 'class': 'histogram-button', 'id': this.id.btnRefresh, 'title': 'Refresh Data' }, containerButtons);
            var iRefres = PhotoHistogram.Util.DOM.createElement('i', { 'class': 'fa fa-refresh' }, anchorRefresh);
        };
        Ui.prototype._createContainerHistogram = function (parent) {
            var container = PhotoHistogram.Util.DOM.createElement('div', { 'class': 'histogram', 'id': this.id.containerHistogram }, parent);
        };
        Ui.prototype._createContainerStats = function (parent) {
            var container = PhotoHistogram.Util.DOM.createElement('div', { 'class': 'histogram-stats', 'id': this.id.containerStats }, parent);
            container = PhotoHistogram.Util.DOM.createElement('div', undefined, container);
            var ul = PhotoHistogram.Util.DOM.createElement('ul', undefined, container);
            var values = [['Mean:', this.id.inputMean], ['Median:', this.id.inputMedian], ['Mode:', this.id.inputMode], ['Std Dev:', this.id.inputStd], ['Pixels:', this.id.inputPixels], ['Level:', this.id.inputLevel], ['Count:', this.id.inputCount], ['Percentile:', this.id.inputPercentile]];
            for (var i = 0; i < values.length; i++) {
                var li = PhotoHistogram.Util.DOM.createElement('li', undefined, ul);
                var label = PhotoHistogram.Util.DOM.createElement('label', { 'for': values[i][1] }, li);
                label.innerHTML = values[i][0];
                PhotoHistogram.Util.DOM.createElement('input', { 'id': values[i][1], 'type': 'text', 'readonly': '', 'value': '' }, li);
            }
        };
        Ui.prototype._createSkeleton = function (parent) {
            var container = PhotoHistogram.Util.DOM.createElement('div', { 'class': 'histogram-container' }, parent);
            this._createContainerControls(container);
            this._createContainerHistogram(container);
            this._createContainerStats(container);
        };
        Ui.prototype._addEventListeners = function () {
            var hist = this;
            var element = document.getElementById(this.id.btnRefresh);
            element.addEventListener('click', function () {
                hist.refresh();
            });
            element = document.getElementById(this.id.btnStatsToggle);
            element.addEventListener('click', function () {
                var stats = document.getElementById(hist.id.containerStats);
                var button = document.getElementById(hist.id.btnStatsToggle);
                var containerHist = document.getElementById(hist.id.containerHistogram);
                var icon = button.firstChild;
                if (stats.classList.contains('hidden')) {
                    stats.classList.remove('hidden');
                    icon.classList.remove('gray');
                    containerHist.classList.remove('nostats');
                    button.title = 'Hide Stats Bar';
                }
                else {
                    stats.classList.add('hidden');
                    icon.classList.add('gray');
                    containerHist.classList.add('nostats');
                    button.title = 'Show Stats Bar';
                }
            });
            element = document.getElementById(this.id.selectChannels);
            // firefox doesn't fire change event on keyboard input until focus is changed
            element.addEventListener('change', function () {
                hist.render();
            });
            this.svgManager.element.addEventListener('mousedown', function (e) {
                var channel = hist.selectedChannel();
                var inputLevel = document.getElementById(hist.id.inputLevel);
                var inputCount = document.getElementById(hist.id.inputCount);
                var inputPercentile = document.getElementById(hist.id.inputPercentile);
                var pt = PhotoHistogram.Util.Convert.clientXY2SvgPoint(hist.svgManager.element, e.clientX, e.clientY);
                var bin = Math.min(255, Math.max(0, Math.round(pt.x)));
                inputLevel.value = bin.toString(10) + '..' + bin.toString(10);
                var count, percent;
                if (channel == HistogramChannel.Red) {
                    count = hist.histogram.red[bin];
                    percent = 100.0 * count / hist.histogram.count.red;
                }
                else if (channel == HistogramChannel.Green) {
                    count = hist.histogram.green[bin];
                    percent = 100.0 * count / hist.histogram.count.green;
                }
                else if (channel == HistogramChannel.Blue) {
                    count = hist.histogram.blue[bin];
                    percent = 100.0 * count / hist.histogram.count.blue;
                }
                else if (channel == HistogramChannel.Luminance) {
                    count = hist.histogram.luminance[bin];
                    percent = 100.0 * count / hist.histogram.count.luminance;
                }
                else if (channel == HistogramChannel.RGB || channel == HistogramChannel.Colors) {
                    count = hist.histogram.rgb[bin];
                    percent = 100.0 * count / hist.histogram.count.rgb;
                }
                inputCount.value = count.toString(10);
                inputPercentile.value = percent.toFixed(2);
                hist.prevMouseDownPoint = pt;
            });
            this.svgManager.element.addEventListener('mousemove', function (e) {
                if (e.buttons > 0 && hist.prevMouseDownPoint != null) {
                    var x1 = hist.prevMouseDownPoint.x;
                    var pt = PhotoHistogram.Util.Convert.clientXY2SvgPoint(hist.svgManager.element, e.clientX, e.clientY);
                    var x2 = pt.x;
                    var x = Math.min(x1, x2);
                    var y = 0;
                    var width = Math.max(x1, x2) - x;
                    var height = hist.viewBoxHeight;
                    var rect = document.getElementById(hist.id.rectOverlay);
                    rect.setAttributeNS(null, 'x', x.toString(10));
                    rect.setAttributeNS(null, 'y', y.toString(10));
                    rect.setAttributeNS(null, 'width', width.toString(10));
                    rect.setAttributeNS(null, 'height', height.toString(10));
                    var channel = hist.selectedChannel();
                    var inputLevel = document.getElementById(hist.id.inputLevel);
                    var inputCount = document.getElementById(hist.id.inputCount);
                    var inputPercentile = document.getElementById(hist.id.inputPercentile);
                    var count = 0, percent;
                    var start = Math.max(0, Math.min(255, Math.round(Math.min(x1, x2))));
                    var stop = Math.max(0, Math.min(255, Math.round(Math.max(x1, x2))));
                    if (channel == HistogramChannel.Red) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.red[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.red;
                    }
                    else if (channel == HistogramChannel.Green) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.green[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.green;
                    }
                    else if (channel == HistogramChannel.Blue) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.blue[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.blue;
                    }
                    else if (channel == HistogramChannel.Luminance) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.luminance[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.luminance;
                    }
                    else if (channel == HistogramChannel.RGB || channel == HistogramChannel.Colors) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.rgb[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.rgb;
                    }
                    inputCount.value = count.toString(10);
                    inputPercentile.value = percent.toFixed(2);
                    inputLevel.value = '' + start + '..' + stop;
                }
            });
            this.svgManager.element.addEventListener('mouseup', function (e) {
                hist.prevMouseDownPoint = null;
                var rect = document.getElementById(hist.id.rectOverlay);
                rect.setAttributeNS(null, 'x', '0');
                rect.setAttributeNS(null, 'y', '0');
                rect.setAttributeNS(null, 'width', '0');
                rect.setAttributeNS(null, 'height', '0');
            });
            this.svgManager.element.addEventListener('mouseleave', function (e) {
                hist.prevMouseDownPoint = null;
                var rect = document.getElementById(hist.id.rectOverlay);
                rect.setAttributeNS(null, 'x', '0');
                rect.setAttributeNS(null, 'y', '0');
                rect.setAttributeNS(null, 'width', '0');
                rect.setAttributeNS(null, 'height', '0');
            });
        };
        Ui.prototype._renderHistogramBackground = function () {
            // background color
            this.svgManager.rect(0, 0, this.viewBoxWidth, this.viewBoxHeight, { 'fill': this.colors.background });
            var smallStep = this.viewBoxWidth / 20;
            var bigStep = this.viewBoxWidth / 5;
            // 20 thin vertical lines
            for (var i = smallStep; i < this.viewBoxWidth; i += smallStep) {
                this.svgManager.line(i, 0, i, this.viewBoxHeight, { 'stroke': this.colors.backgroundLine, 'stroke-width': 0.1 });
            }
            // 20 thin horizontal lines - same size as horizontal
            for (var i = smallStep; i < this.viewBoxHeight; i += smallStep) {
                this.svgManager.line(0, i, this.viewBoxWidth, i, { 'stroke': this.colors.backgroundLine, 'stroke-width': 0.1 });
            }
            // 5 thick vertical lines every 5th thin line
            for (var i = bigStep; i < this.viewBoxWidth; i += bigStep) {
                this.svgManager.line(i, 0, i, this.viewBoxHeight, { 'stroke': this.colors.backgroundLine, 'stroke-width': 0.2 });
            }
        };
        Ui.prototype._renderSingleHistogram = function () {
            var channel = this.selectedChannel();
            var start;
            var step = this.viewBoxWidth / 256;
            var color;
            var offBottom = this.viewBoxHeight + 10;
            var offLeft = -10;
            var offRight = this.viewBoxWidth + 10;
            // increase max so largest is 10% from the top of hist
            var max;
            if (channel == HistogramChannel.Red) {
                max = this.histogram.max.red;
            }
            else if (channel == HistogramChannel.Green) {
                max = this.histogram.max.green;
            }
            else if (channel == HistogramChannel.Blue) {
                max = this.histogram.max.blue;
            }
            else if (channel == HistogramChannel.Luminance) {
                max = this.histogram.max.luminance;
            }
            else if (channel == HistogramChannel.RGB) {
                max = this.histogram.max.rgb;
            }
            else {
                throw new Error('channel not recognized');
            }
            max *= 1.1;
            var dColor = (new PhotoHistogram.Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            for (var i = 0; i < 256; i++) {
                if (channel == HistogramChannel.Red) {
                    color = this.histogram.red[i];
                }
                else if (channel == HistogramChannel.Green) {
                    color = this.histogram.green[i];
                }
                else if (channel == HistogramChannel.Blue) {
                    color = this.histogram.blue[i];
                }
                else if (channel == HistogramChannel.Luminance) {
                    color = this.histogram.luminance[i];
                }
                else if (channel == HistogramChannel.RGB) {
                    color = this.histogram.rgb[i];
                }
                // normalize so data fits in viewbox
                color *= this.viewBoxHeight / max;
                start = i * step;
                if (color <= 0)
                    color = -10;
                dColor.lineTo(i, this.viewBoxHeight - color);
            }
            // return to bottom right corner and then to bottom left
            dColor.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);
            var fill;
            if (channel == HistogramChannel.Red) {
                fill = this.colors.red;
            }
            else if (channel == HistogramChannel.Green) {
                fill = this.colors.green;
            }
            else if (channel == HistogramChannel.Blue) {
                fill = this.colors.blue;
            }
            else if (channel == HistogramChannel.Luminance) {
                fill = this.colors.redGreenBlue;
            }
            else if (channel == HistogramChannel.RGB) {
                fill = this.colors.redGreenBlue;
            }
            dColor.build({ 'fill': fill, 'stroke': this.colors.stroke, 'stroke-width': 1.0 });
        };
        Ui.prototype._renderColorHistogram = function () {
            var start;
            var step = this.viewBoxWidth / 256;
            var r, g, b;
            // increase max so largest is 10% from the top of hist
            var max = Math.max(this.histogram.max.red, this.histogram.max.green, this.histogram.max.blue) * 1.1;
            var dRed = (new PhotoHistogram.Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dGreen = (new PhotoHistogram.Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dBlue = (new PhotoHistogram.Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dRedGreen = (new PhotoHistogram.Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dRedBlue = (new PhotoHistogram.Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dGreenBlue = (new PhotoHistogram.Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dRedGreenBlue = (new PhotoHistogram.Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var offBottom = this.viewBoxHeight + 10;
            var offLeft = -10;
            var offRight = this.viewBoxWidth + 10;
            for (var i = 0; i < 256; i++) {
                r = this.histogram.red[i] * this.viewBoxHeight / max;
                g = this.histogram.green[i] * this.viewBoxHeight / max;
                b = this.histogram.blue[i] * this.viewBoxHeight / max;
                start = i * step;
                if (r >= g && r >= b && g >= b) {
                    if (r <= 0)
                        r = -10;
                    if (g <= 0)
                        g = -10;
                    if (b <= 0)
                        b = -10;
                    dRed.lineTo(i, this.viewBoxHeight - r);
                    dGreen.lineTo(i, offBottom);
                    dBlue.lineTo(i, offBottom);
                    dRedGreen.lineTo(i, this.viewBoxHeight - g);
                    dRedBlue.lineTo(i, offBottom);
                    dGreenBlue.lineTo(i, offBottom);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight - b);
                }
                else if (r >= g && r >= b && g < b) {
                    if (r <= 0)
                        r = -10;
                    if (g <= 0)
                        g = -10;
                    if (b <= 0)
                        b = -10;
                    dRed.lineTo(i, this.viewBoxHeight - r);
                    dGreen.lineTo(i, offBottom);
                    dBlue.lineTo(i, offBottom);
                    dRedGreen.lineTo(i, offBottom);
                    dRedBlue.lineTo(i, this.viewBoxHeight - b);
                    dGreenBlue.lineTo(i, offBottom);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight - g);
                }
                else if (g >= r && g >= b && r >= b) {
                    if (r <= 0)
                        r = -10;
                    if (g <= 0)
                        g = -10;
                    if (b <= 0)
                        b = -10;
                    dRed.lineTo(i, offBottom);
                    dGreen.lineTo(i, this.viewBoxHeight - g);
                    dBlue.lineTo(i, offBottom);
                    dRedGreen.lineTo(i, this.viewBoxHeight - r);
                    dRedBlue.lineTo(i, offBottom);
                    dGreenBlue.lineTo(i, offBottom);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight - b);
                }
                else if (g >= r && g >= b && r < b) {
                    if (r <= 0)
                        r = -10;
                    if (g <= 0)
                        g = -10;
                    if (b <= 0)
                        b = -10;
                    dRed.lineTo(i, offBottom);
                    dGreen.lineTo(i, this.viewBoxHeight - g);
                    dBlue.lineTo(i, offBottom);
                    dRedGreen.lineTo(i, offBottom);
                    dRedBlue.lineTo(i, offBottom);
                    dGreenBlue.lineTo(i, this.viewBoxHeight - b);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight - r);
                }
                else if (b >= r && b >= g && r >= g) {
                    if (r <= 0)
                        r = -10;
                    if (g <= 0)
                        g = -10;
                    if (b <= 0)
                        b = -10;
                    dRed.lineTo(i, offBottom);
                    dGreen.lineTo(i, offBottom);
                    dBlue.lineTo(i, this.viewBoxHeight - b);
                    dRedGreen.lineTo(i, offBottom);
                    dRedBlue.lineTo(i, this.viewBoxHeight - r);
                    dGreenBlue.lineTo(i, offBottom);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight - g);
                }
                else if (b >= r && b >= g && r < g) {
                    if (r <= 0)
                        r = -10;
                    if (g <= 0)
                        g = -10;
                    if (b <= 0)
                        b = -10;
                    dRed.lineTo(i, offBottom);
                    dGreen.lineTo(i, offBottom);
                    dBlue.lineTo(i, this.viewBoxHeight - b);
                    dRedGreen.lineTo(i, offBottom);
                    dRedBlue.lineTo(i, offBottom);
                    dGreenBlue.lineTo(i, this.viewBoxHeight - g);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight - r);
                }
            }
            // return to bottom right corner and then to bottom left
            dRed.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);
            dGreen.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);
            dBlue.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);
            dRedGreen.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);
            dRedBlue.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);
            dGreenBlue.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);
            dRedGreenBlue.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);
            dRed.build({ 'fill': this.colors.red, 'stroke': this.colors.stroke, 'stroke-width': 1.0 });
            dGreen.build({ 'fill': this.colors.green, 'stroke': this.colors.stroke, 'stroke-width': 1.0 });
            dBlue.build({ 'fill': this.colors.blue, 'stroke': this.colors.stroke, 'stroke-width': 1.0 });
            dRedGreen.build({ 'fill': this.colors.redGreen, 'stroke': this.colors.stroke, 'stroke-width': 1.0 });
            dRedBlue.build({ 'fill': this.colors.redBlue, 'stroke': this.colors.stroke, 'stroke-width': 1.0 });
            dGreenBlue.build({ 'fill': this.colors.greenBlue, 'stroke': this.colors.stroke, 'stroke-width': 1.0 });
            dRedGreenBlue.build({ 'fill': this.colors.redGreenBlue, 'stroke': this.colors.stroke, 'stroke-width': 1.0 });
        };
        Ui.prototype._updateStats = function () {
            var channel = this.selectedChannel();
            var inputMean = document.getElementById(this.id.inputMean);
            var inputMedian = document.getElementById(this.id.inputMedian);
            var inputMode = document.getElementById(this.id.inputMode);
            var inputStd = document.getElementById(this.id.inputStd);
            var inputPixels = document.getElementById(this.id.inputPixels);
            var inputLevel = document.getElementById(this.id.inputLevel);
            var inputCount = document.getElementById(this.id.inputCount);
            var inputPercentile = document.getElementById(this.id.inputPercentile);
            if (channel == HistogramChannel.Red) {
                inputMean.value = this.histogram.mean.red.toFixed(2);
                inputMedian.value = this.histogram.median.red.toString(10);
                inputMode.value = this.histogram.mode.red.toString(10);
                inputStd.value = this.histogram.std.red.toFixed(2);
                inputPixels.value = this.histogram.count.red.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.red.toString(10);
                inputPercentile.value = '100.00';
            }
            else if (channel == HistogramChannel.Green) {
                inputMean.value = this.histogram.mean.green.toFixed(2);
                inputMedian.value = this.histogram.median.green.toString(10);
                inputMode.value = this.histogram.mode.green.toString(10);
                inputStd.value = this.histogram.std.green.toFixed(2);
                inputPixels.value = this.histogram.count.green.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.green.toString(10);
                inputPercentile.value = '100.00';
            }
            else if (channel == HistogramChannel.Blue) {
                inputMean.value = this.histogram.mean.blue.toFixed(2);
                inputMedian.value = this.histogram.median.blue.toString(10);
                inputMode.value = this.histogram.mode.blue.toString(10);
                inputStd.value = this.histogram.std.blue.toFixed(2);
                inputPixels.value = this.histogram.count.blue.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.blue.toString(10);
                inputPercentile.value = '100.00';
            }
            else if (channel == HistogramChannel.Luminance) {
                inputMean.value = this.histogram.mean.luminance.toFixed(2);
                inputMedian.value = this.histogram.median.luminance.toString(10);
                inputMode.value = this.histogram.mode.luminance.toString(10);
                inputStd.value = this.histogram.std.luminance.toFixed(2);
                inputPixels.value = this.histogram.count.luminance.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.luminance.toString(10);
                inputPercentile.value = '100.00';
            }
            else if (channel == HistogramChannel.RGB) {
                inputMean.value = this.histogram.mean.rgb.toFixed(2);
                inputMedian.value = this.histogram.median.rgb.toString(10);
                inputMode.value = this.histogram.mode.rgb.toString(10);
                inputStd.value = this.histogram.std.rgb.toFixed(2);
                // red,green,blue counts = numPixels
                inputPixels.value = this.histogram.count.red.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.rgb.toString(10);
                inputPercentile.value = '100.00';
            }
            else if (channel == HistogramChannel.Colors) {
                inputMean.value = this.histogram.mean.rgb.toFixed(2);
                inputMedian.value = this.histogram.median.rgb.toString(10);
                inputMode.value = this.histogram.mode.rgb.toString(10);
                inputStd.value = this.histogram.std.rgb.toFixed(2);
                // red,green,blue counts = numPixels
                inputPixels.value = this.histogram.count.red.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.rgb.toString(10);
                inputPercentile.value = '100.00';
            }
        };
        return Ui;
    })();
    PhotoHistogram.Ui = Ui;
})(PhotoHistogram || (PhotoHistogram = {}));
//# sourceMappingURL=photo-histogram.js.map