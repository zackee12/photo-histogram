/// <reference path="util.ts" />
/// <reference path="manager.ts" />
/// <reference path="histogram.ts" />

module PhotoHistogram {
    export enum HistogramChannel {Colors, Red, Green, Blue, Luminance, RGB}

    export interface UiOptions {
        width?: string, // any valid css width in string form (e.g. '100' and '100%')
        height?: string, // any valid css width in string form
        colors?: { // any valid css colors in string form (e.g. '#000', 'rgba(0,0,0,0)', '#FFF000')
            red?: string,
            green?: string,
            blue?: string,
            redGreen?: string,
            redBlue?: string,
            greenBlue?: string,
            redGreenBlue?: string,
            stroke?: string,
            border?: string,
            background?: string,
            backgroundLine?: string,
            overlayFill?: string,
            overlayStroke?: string,
        }
    }

    export class Ui {
        svgManager: Manager.Svg;
        histogram: Core.Histogram;
        parent: Element;
        viewBoxWidth: number = 256;
        viewBoxHeight: number = 100;
        prevMouseDownPoint: SVGPoint;
        colors: {
            red: string,
            green: string,
            blue: string,
            redGreen: string,
            redBlue: string,
            greenBlue: string,
            redGreenBlue: string,
            stroke: string,
            border: string,
            background: string,
            backgroundLine: string,
            overlayFill?: string,
            overlayStroke?: string,
        };
        id: {
            btnRefresh: string,
            btnStatsToggle: string,
            containerControls: string,
            containerHistogram: string,
            containerStats: string,
            inputMean: string,
            inputMedian: string,
            inputMode: string,
            inputStd: string,
            inputPixels: string,
            inputLevel: string,
            inputCount: string,
            inputPercentile: string,
            rectOverlay: string,
            selectChannels: string,
            textStatus: string
        };

        constructor(parent: Element, source: HTMLCanvasElement | HTMLImageElement, options?: UiOptions) {
            if (!options) options = {};
            if (!options.colors) options.colors = {};
            this.colors = {
                red: options.colors.red || '#c72121', //'#E63348',
                green: options.colors.green || '#35a135', //'#4EB240',
                blue: options.colors.blue || '#3161b9',// '#5E7DD8',
                redGreen: options.colors.redGreen || '#c9be28', //'#EFE339',
                redBlue: options.colors.redBlue || '#e110bf', //'#B9009C',
                greenBlue: options.colors.greenBlue || '#05b9b9', //'#41CDCC',
                redGreenBlue: options.colors.redGreenBlue || '#949494', //'#A2A2A2',
                stroke: options.colors.stroke || '#000000',
                border: options.colors.border || '#000000',
                background: options.colors.background || '#383838', //'#393939',
                backgroundLine: options.colors.backgroundLine || '#949494', //'#A2A2A2',
                overlayFill: options.colors.overlayFill || 'rgba(0, 0, 0, 0.5)',
                overlayStroke: options.colors.overlayStroke || '#000',
            };
            this.id = {
                btnRefresh: Util.Random.id('btnRefresh'),
                btnStatsToggle: Util.Random.id('btnStatsToggle'),
                containerControls: Util.Random.id('containerControls'),
                containerHistogram: Util.Random.id('containerHistogram'),
                containerStats: Util.Random.id('containerStats'),
                inputMean: Util.Random.id('inputMean'),
                inputMedian: Util.Random.id('inputMedian'),
                inputMode: Util.Random.id('inputMode'),
                inputStd: Util.Random.id('inputStd'),
                inputPixels: Util.Random.id('inputPixels'),
                inputLevel: Util.Random.id('inputLevel'),
                inputCount: Util.Random.id('inputCount'),
                inputPercentile: Util.Random.id('inputPercentile'),
                rectOverlay: Util.Random.id('rectOverlay'),
                selectChannels: Util.Random.id('selectChannels'),
                textStatus: Util.Random.id('textStatus'),
            };
            this.parent = parent;
            this._createSkeleton(parent);
            var svgParent = document.getElementById(this.id.containerHistogram);
            this.svgManager = Manager.Svg.create(svgParent, {
                viewBox: '0 0 ' + this.viewBoxWidth + ' ' + this.viewBoxHeight,
                width: options.width || '100%',
                height: options.height || '256',
                preserveAspectRatio: 'none',
                style: 'mix-blend-mode: normal',
                'class': 'histogram-svg',
            });
            this.histogram = new Core.Histogram(source);
            this.prevMouseDownPoint = null;
            this._addEventListeners();
            this.render();
        }

        selectedChannel(): HistogramChannel {
            return parseInt((<HTMLSelectElement> document.getElementById(this.id.selectChannels)).value, 10);
        }

        render(): void {
            var channel = this.selectedChannel();
            this.svgManager.clear();
            this._renderHistogramBackground();
            if (channel == HistogramChannel.Colors) {
                this._renderColorHistogram();
            } else {
                this._renderSingleHistogram();
            }
            this.svgManager.rect(0, 0, 0, 0, {'fill': this.colors.overlayFill, 'stroke': this.colors.overlayStroke, 'stroke-width': 1.0, 'id': this.id.rectOverlay});

            this._updateStats();
        }

        refresh(): void {
            this.histogram.refresh();
            this.render();
        }

        _createContainerControls(parent: Element): void {
            var container = Util.DOM.createElement('div', {'class': 'histogram-controls', 'id': this.id.containerControls}, parent);
            var containerChannels = Util.DOM.createElement('div', {'class': 'histogram-channels'}, container);
            var label = Util.DOM.createElement('label', {'for': this.id.selectChannels}, containerChannels);
            label.innerHTML = 'Channels:';
            var channels = Util.Extension.EnumEx.getNamesAndValues(HistogramChannel);
            var select = Util.DOM.createElement('select', {'id': this.id.selectChannels}, containerChannels);
            for (var i = 0; i < channels.length; i++) {
                var option = Util.DOM.createElement('option', {'value': channels[i].value}, select);
                option.innerHTML = channels[i].name;
            }

            var containerButtons = Util.DOM.createElement('div', {'class': 'histogram-buttons'}, container);
            var anchorStats = Util.DOM.createElement('a', {'href': '#', 'class': 'histogram-button', 'id': this.id.btnStatsToggle, 'title': 'Hide Stats Bar'}, containerButtons);
            var iStats = Util.DOM.createElement('i', {'class': 'fa fa-bars'}, anchorStats);
            var anchorRefresh = Util.DOM.createElement('a', {'href': '#', 'class': 'histogram-button', 'id': this.id.btnRefresh, 'title': 'Refresh Data'}, containerButtons);
            var iRefres = Util.DOM.createElement('i', {'class': 'fa fa-refresh'}, anchorRefresh);
        }

        _createContainerHistogram(parent: Element): void {
            var container = Util.DOM.createElement('div', {'class': 'histogram', 'id': this.id.containerHistogram}, parent);
        }

        _createContainerStats(parent: Element): void {
            var container = Util.DOM.createElement('div', {'class': 'histogram-stats', 'id': this.id.containerStats}, parent);
           container = Util.DOM.createElement('div', undefined, container);
            var ul = Util.DOM.createElement('ul', undefined, container);
            var values = [['Mean:', this.id.inputMean],['Median:', this.id.inputMedian],['Mode:', this.id.inputMode],['Std Dev:', this.id.inputStd],['Pixels:', this.id.inputPixels],['Level:', this.id.inputLevel],['Count:', this.id.inputCount],['Percentile:', this.id.inputPercentile]];
            for (var i = 0; i < values.length; i++) {
                var li = Util.DOM.createElement('li', undefined, ul);
                var label = Util.DOM.createElement('label', {'for': values[i][1]}, li);
                label.innerHTML = values[i][0];
                Util.DOM.createElement('input', {'id': values[i][1], 'type': 'text', 'readonly': '', 'value': ''}, li);
            }
        }

        _createSkeleton(parent: Element): void {
            var container = Util.DOM.createElement('div', {'class': 'histogram-container'}, parent);
            this._createContainerControls(container);
            this._createContainerHistogram(container);
            this._createContainerStats(container);
        }

        _addEventListeners(): void {
            var hist = this;
            var element = document.getElementById(this.id.btnRefresh);
            element.addEventListener('click', function() {
                hist.refresh();
            });

            element = document.getElementById(this.id.btnStatsToggle);
            element.addEventListener('click', function() {
                var stats = document.getElementById(hist.id.containerStats);
                var button = document.getElementById(hist.id.btnStatsToggle);
                var containerHist = document.getElementById(hist.id.containerHistogram);
                var icon = <Element> button.firstChild;
                if (stats.classList.contains('hidden')) {
                    stats.classList.remove('hidden');
                    icon.classList.remove('gray');
                    containerHist.classList.remove('nostats');
                    button.title = 'Hide Stats Bar';
                } else {
                    stats.classList.add('hidden');
                    icon.classList.add('gray');
                    containerHist.classList.add('nostats');
                    button.title = 'Show Stats Bar';
                }
            });

            element = document.getElementById(this.id.selectChannels);
            // firefox doesn't fire change event on keyboard input until focus is changed
            element.addEventListener('change', function() {
                hist.render();
            });

            this.svgManager.element.addEventListener('mousedown', function(e: MouseEvent) {
                var channel = hist.selectedChannel();
                var inputLevel = <HTMLInputElement> document.getElementById(hist.id.inputLevel);
                var inputCount = <HTMLInputElement> document.getElementById(hist.id.inputCount);
                var inputPercentile = <HTMLInputElement> document.getElementById(hist.id.inputPercentile);

                var pt: SVGPoint = Util.Convert.clientXY2SvgPoint(<SVGSVGElement>hist.svgManager.element, e.clientX, e.clientY);
                var bin = Math.min(255, Math.max(0, Math.round(pt.x)));
                inputLevel.value = bin.toString(10) + '..' + bin.toString(10);

                var count: number, percent: number;
                if (channel == HistogramChannel.Red) {
                    count = hist.histogram.red[bin];
                    percent = 100.0 * count / hist.histogram.count.red;
                } else if (channel == HistogramChannel.Green) {
                    count = hist.histogram.green[bin];
                    percent = 100.0 * count / hist.histogram.count.green;
                } else if (channel == HistogramChannel.Blue) {
                    count = hist.histogram.blue[bin];
                    percent = 100.0 * count / hist.histogram.count.blue;
                } else if (channel == HistogramChannel.Luminance) {
                    count = hist.histogram.luminance[bin];
                    percent = 100.0 * count / hist.histogram.count.luminance;
                } else if (channel == HistogramChannel.RGB || channel == HistogramChannel.Colors) {
                    count = hist.histogram.rgb[bin];
                    percent = 100.0 * count / hist.histogram.count.rgb;
                }
                inputCount.value = count.toString(10);
                inputPercentile.value = percent.toFixed(2);
                hist.prevMouseDownPoint = pt;
            });

            this.svgManager.element.addEventListener('mousemove', function(e: MouseEvent) {
                if (e.buttons > 0 && hist.prevMouseDownPoint != null) {
                    var x1 = hist.prevMouseDownPoint.x;
                    var pt = Util.Convert.clientXY2SvgPoint(<SVGSVGElement>hist.svgManager.element, e.clientX, e.clientY);
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
                    var inputLevel = <HTMLInputElement> document.getElementById(hist.id.inputLevel);
                    var inputCount = <HTMLInputElement> document.getElementById(hist.id.inputCount);
                    var inputPercentile = <HTMLInputElement> document.getElementById(hist.id.inputPercentile);

                    var count = 0, percent: number;
                    var start = Math.max(0, Math.min(255, Math.round(Math.min(x1, x2))));
                    var stop = Math.max(0, Math.min(255, Math.round(Math.max(x1, x2))));
                    if (channel == HistogramChannel.Red) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.red[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.red;
                    } else if (channel == HistogramChannel.Green) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.green[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.green;
                    } else if (channel == HistogramChannel.Blue) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.blue[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.blue;
                    } else if (channel == HistogramChannel.Luminance) {
                        for (var i = start; i <= stop; i++) {
                            count += hist.histogram.luminance[i];
                        }
                        percent = 100.0 * count / hist.histogram.count.luminance;
                    } else if (channel == HistogramChannel.RGB || channel == HistogramChannel.Colors) {
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

            this.svgManager.element.addEventListener('mouseup', function(e: MouseEvent) {
                hist.prevMouseDownPoint = null;
                var rect = document.getElementById(hist.id.rectOverlay);
                rect.setAttributeNS(null, 'x', '0');
                rect.setAttributeNS(null, 'y', '0');
                rect.setAttributeNS(null, 'width', '0');
                rect.setAttributeNS(null, 'height', '0');
            });

            this.svgManager.element.addEventListener('mouseleave', function(e: MouseEvent) {
                hist.prevMouseDownPoint = null;
                var rect = document.getElementById(hist.id.rectOverlay);
                rect.setAttributeNS(null, 'x', '0');
                rect.setAttributeNS(null, 'y', '0');
                rect.setAttributeNS(null, 'width', '0');
                rect.setAttributeNS(null, 'height', '0');
            });
        }

        _renderHistogramBackground(): void {
            // background color
            this.svgManager.rect(0, 0, this.viewBoxWidth, this.viewBoxHeight, {'fill': this.colors.background});
            var smallStep = this.viewBoxWidth/20;
            var bigStep = this.viewBoxWidth/5;
            // 20 thin vertical lines
            for (var i = smallStep; i < this.viewBoxWidth; i += smallStep) {
                this.svgManager.line(i, 0, i, this.viewBoxHeight, {'stroke': this.colors.backgroundLine, 'stroke-width': 0.1});
            }
            // 20 thin horizontal lines - same size as horizontal
            for (var i = smallStep; i < this.viewBoxHeight; i += smallStep) {
                this.svgManager.line(0, i, this.viewBoxWidth, i, {'stroke': this.colors.backgroundLine, 'stroke-width': 0.1});
            }
            // 5 thick vertical lines every 5th thin line
            for (var i = bigStep; i < this.viewBoxWidth; i += bigStep) {
                this.svgManager.line(i, 0, i, this.viewBoxHeight, {'stroke': this.colors.backgroundLine, 'stroke-width': 0.2});
            }
        }

        _renderSingleHistogram(): void {
            var channel = this.selectedChannel();
            var start: number;
            var step = this.viewBoxWidth / 256;
            var color: number;
            var offBottom = this.viewBoxHeight+10;
            var offLeft = -10;
            var offRight = this.viewBoxWidth+10;

            // increase max so largest is 10% from the top of hist
            var max: number;
            if (channel == HistogramChannel.Red) {
                max = this.histogram.max.red;
            } else if (channel == HistogramChannel.Green) {
                max = this.histogram.max.green;
            } else if (channel == HistogramChannel.Blue) {
                max = this.histogram.max.blue;
            } else if (channel == HistogramChannel.Luminance) {
                max = this.histogram.max.luminance;
            } else if (channel == HistogramChannel.RGB) {
                max = this.histogram.max.rgb;
            } else {
                throw new Error('channel not recognized');
            }
            max *= 1.1;

            var dColor = (new Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            for (var i = 0; i < 256; i++) {
                if (channel == HistogramChannel.Red) {
                    color = this.histogram.red[i];
                } else if (channel == HistogramChannel.Green) {
                    color = this.histogram.green[i];
                } else if (channel == HistogramChannel.Blue) {
                    color = this.histogram.blue[i];
                } else if (channel == HistogramChannel.Luminance) {
                    color = this.histogram.luminance[i];
                } else if (channel == HistogramChannel.RGB) {
                    color = this.histogram.rgb[i];
                }
                // normalize so data fits in viewbox
                color *= this.viewBoxHeight / max;
                start = i * step;
                if (color <= 0) color = -10;
                dColor.lineTo(i, this.viewBoxHeight - color);
            }
            // return to bottom right corner and then to bottom left
            dColor.lineTo(offRight, offBottom).lineTo(offLeft, offBottom);

            var fill: string;
            if (channel == HistogramChannel.Red) {
                fill = this.colors.red;
            } else if (channel == HistogramChannel.Green) {
                fill = this.colors.green;
            } else if (channel == HistogramChannel.Blue) {
                fill = this.colors.blue;
            } else if (channel == HistogramChannel.Luminance) {
                fill = this.colors.redGreenBlue;
            } else if (channel == HistogramChannel.RGB) {
                fill = this.colors.redGreenBlue;
            }

            dColor.build({'fill': fill, 'stroke': this.colors.stroke, 'stroke-width': 1.0});
        }

        _renderColorHistogram(): void {
            var start: number;
            var step = this.viewBoxWidth / 256;
            var r: number, g: number, b: number;
            // increase max so largest is 10% from the top of hist
            var max = Math.max(this.histogram.max.red, this.histogram.max.green, this.histogram.max.blue) * 1.1;

            var dRed = (new Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dGreen = (new Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dBlue = (new Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dRedGreen = (new Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dRedBlue = (new Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dGreenBlue = (new Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);
            var dRedGreenBlue = (new Manager.SvgPathBuilder(this.svgManager)).moveTo(0, this.viewBoxHeight);

            var offBottom = this.viewBoxHeight+10;
            var offLeft = -10;
            var offRight = this.viewBoxWidth+10;

            for (var i = 0; i < 256; i++) {
                r = this.histogram.red[i] * this.viewBoxHeight / max;
                g = this.histogram.green[i] * this.viewBoxHeight / max;
                b = this.histogram.blue[i] * this.viewBoxHeight / max;
                start = i * step;

                if (r >= g && r >= b && g >= b) {
                    if (r <= 0) r = -10;
                    if (g <= 0) g = -10;
                    if (b <= 0) b = -10;
                    dRed.lineTo(i, this.viewBoxHeight-r);
                    dGreen.lineTo(i, offBottom);
                    dBlue.lineTo(i, offBottom);
                    dRedGreen.lineTo(i, this.viewBoxHeight-g);
                    dRedBlue.lineTo(i, offBottom);
                    dGreenBlue.lineTo(i, offBottom);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight-b);
                } else if (r >= g && r >= b && g < b) {
                    if (r <= 0) r = -10;
                    if (g <= 0) g = -10;
                    if (b <= 0) b = -10;
                    dRed.lineTo(i, this.viewBoxHeight-r);
                    dGreen.lineTo(i, offBottom);
                    dBlue.lineTo(i, offBottom);
                    dRedGreen.lineTo(i, offBottom);
                    dRedBlue.lineTo(i, this.viewBoxHeight-b);
                    dGreenBlue.lineTo(i, offBottom);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight-g);
                } else if (g >= r && g >= b && r >= b) {
                    if (r <= 0) r = -10;
                    if (g <= 0) g = -10;
                    if (b <= 0) b = -10;
                    dRed.lineTo(i, offBottom);
                    dGreen.lineTo(i, this.viewBoxHeight-g);
                    dBlue.lineTo(i, offBottom);
                    dRedGreen.lineTo(i, this.viewBoxHeight-r);
                    dRedBlue.lineTo(i, offBottom);
                    dGreenBlue.lineTo(i, offBottom);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight-b);
                } else if (g >= r && g >= b && r < b) {
                    if (r <= 0) r = -10;
                    if (g <= 0) g = -10;
                    if (b <= 0) b = -10;
                    dRed.lineTo(i, offBottom);
                    dGreen.lineTo(i, this.viewBoxHeight-g);
                    dBlue.lineTo(i, offBottom);
                    dRedGreen.lineTo(i, offBottom);
                    dRedBlue.lineTo(i, offBottom);
                    dGreenBlue.lineTo(i, this.viewBoxHeight-b);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight-r);
                } else if (b >= r && b >= g && r >= g) {
                    if (r <= 0) r = -10;
                    if (g <= 0) g = -10;
                    if (b <= 0) b = -10;
                    dRed.lineTo(i, offBottom);
                    dGreen.lineTo(i, offBottom);
                    dBlue.lineTo(i, this.viewBoxHeight-b);
                    dRedGreen.lineTo(i, offBottom);
                    dRedBlue.lineTo(i, this.viewBoxHeight-r);
                    dGreenBlue.lineTo(i, offBottom);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight-g);
                } else if (b >= r && b >= g && r < g) {
                    if (r <= 0) r = -10;
                    if (g <= 0) g = -10;
                    if (b <= 0) b = -10;
                    dRed.lineTo(i, offBottom);
                    dGreen.lineTo(i, offBottom);
                    dBlue.lineTo(i, this.viewBoxHeight-b);
                    dRedGreen.lineTo(i, offBottom);
                    dRedBlue.lineTo(i, offBottom);
                    dGreenBlue.lineTo(i, this.viewBoxHeight-g);
                    dRedGreenBlue.lineTo(i, this.viewBoxHeight-r);
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

            dRed.build({'fill': this.colors.red, 'stroke': this.colors.stroke, 'stroke-width': 1.0});
            dGreen.build({'fill': this.colors.green, 'stroke': this.colors.stroke, 'stroke-width': 1.0});
            dBlue.build({'fill': this.colors.blue, 'stroke': this.colors.stroke, 'stroke-width': 1.0});
            dRedGreen.build({'fill': this.colors.redGreen, 'stroke': this.colors.stroke, 'stroke-width': 1.0});
            dRedBlue.build({'fill': this.colors.redBlue, 'stroke': this.colors.stroke, 'stroke-width': 1.0});
            dGreenBlue.build({'fill': this.colors.greenBlue, 'stroke': this.colors.stroke, 'stroke-width': 1.0});
            dRedGreenBlue.build({'fill': this.colors.redGreenBlue, 'stroke': this.colors.stroke, 'stroke-width': 1.0});
        }

        _updateStats(): void {
            var channel = this.selectedChannel();
            var inputMean = <HTMLInputElement> document.getElementById(this.id.inputMean);
            var inputMedian = <HTMLInputElement> document.getElementById(this.id.inputMedian);
            var inputMode = <HTMLInputElement> document.getElementById(this.id.inputMode);
            var inputStd = <HTMLInputElement> document.getElementById(this.id.inputStd);
            var inputPixels = <HTMLInputElement> document.getElementById(this.id.inputPixels);
            var inputLevel = <HTMLInputElement> document.getElementById(this.id.inputLevel);
            var inputCount = <HTMLInputElement> document.getElementById(this.id.inputCount);
            var inputPercentile = <HTMLInputElement> document.getElementById(this.id.inputPercentile);


            if (channel == HistogramChannel.Red) {
                inputMean.value = this.histogram.mean.red.toFixed(2);
                inputMedian.value = this.histogram.median.red.toString(10);
                inputMode.value = this.histogram.mode.red.toString(10);
                inputStd.value = this.histogram.std.red.toFixed(2);
                inputPixels.value = this.histogram.count.red.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.red.toString(10);
                inputPercentile.value = '100.00';
            } else if (channel == HistogramChannel.Green) {
                inputMean.value = this.histogram.mean.green.toFixed(2);
                inputMedian.value = this.histogram.median.green.toString(10);
                inputMode.value = this.histogram.mode.green.toString(10);
                inputStd.value = this.histogram.std.green.toFixed(2);
                inputPixels.value = this.histogram.count.green.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.green.toString(10);
                inputPercentile.value = '100.00';
            } else if (channel == HistogramChannel.Blue) {
                inputMean.value = this.histogram.mean.blue.toFixed(2);
                inputMedian.value = this.histogram.median.blue.toString(10);
                inputMode.value = this.histogram.mode.blue.toString(10);
                inputStd.value = this.histogram.std.blue.toFixed(2);
                inputPixels.value = this.histogram.count.blue.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.blue.toString(10);
                inputPercentile.value = '100.00';
            } else if (channel == HistogramChannel.Luminance) {
                inputMean.value = this.histogram.mean.luminance.toFixed(2);
                inputMedian.value = this.histogram.median.luminance.toString(10);
                inputMode.value = this.histogram.mode.luminance.toString(10);
                inputStd.value = this.histogram.std.luminance.toFixed(2);
                inputPixels.value = this.histogram.count.luminance.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.luminance.toString(10);
                inputPercentile.value = '100.00';
            } else if (channel == HistogramChannel.RGB) {
                inputMean.value = this.histogram.mean.rgb.toFixed(2);
                inputMedian.value = this.histogram.median.rgb.toString(10);
                inputMode.value = this.histogram.mode.rgb.toString(10);
                inputStd.value = this.histogram.std.rgb.toFixed(2);
                // red,green,blue counts = numPixels
                inputPixels.value = this.histogram.count.red.toString(10);
                inputLevel.value = '0..255';
                inputCount.value = this.histogram.count.rgb.toString(10);
                inputPercentile.value = '100.00';
            } else if (channel == HistogramChannel.Colors) {
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
        }
    }


}
