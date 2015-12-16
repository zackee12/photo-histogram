/// <reference path="util.ts" />

module PhotoHistogram {
    export module Core {
        export interface HistogramStat {
            red: number,
            green: number,
            blue: number,
            luminance: number,
            rgb: number,
        }

        export interface HistogramData {
            hist: {
                red: Array<number>,
                green: Array<number>,
                blue: Array<number>,
                luminance: Array<number>,
                rgb: Array<number>,
            },
            count: HistogramStat,
            max: HistogramStat,
            mean: HistogramStat,
            median: HistogramStat,
            mode: HistogramStat,
            stddev: HistogramStat,
        }

        /**
         * Calculates the histogram and statistics from a source canvas or image element
         */
        export class Histogram {
            _source: HTMLCanvasElement | HTMLImageElement;
            _canvas: HTMLCanvasElement;
            _ctx: CanvasRenderingContext2D;
            _luminanceWeights: number[];
            data: HistogramData;

            /**
             * Constructor
             * @param source [HTMLCanvasElement | HTMLImageElement] source element
             * @param luminanceWeights [number[]] array of weights to convert rgb to luminance
             */
            constructor(source: HTMLCanvasElement | HTMLImageElement, luminanceWeights: number[] = [0.2126, 0.7152, 0.0722]){
                this._source = source;
                this._canvas = document.createElement('canvas');
                this._ctx = this._canvas.getContext('2d');
                if (luminanceWeights.length != 3) throw new Error('luminance weights must have 3 values that sum to one');
                this._luminanceWeights = luminanceWeights.slice(0);
                this.data = this._calcData();
            }

            /**
             * Red channel histogram
             * @returns {Array<Number>}
             */
            get red(): number[] {
                return this.data.hist.red;
            }

            /**
             * Green channel histogram
             * @returns {Array<Number>}
             */
            get green(): number[] {
                return this.data.hist.green;
            }

            /**
             * Blue channel histogram
             * @returns {Array<Number>}
             */
            get blue(): number[] {
                return this.data.hist.blue;
            }

            /**
             * Luminance histogram
             * @returns {Array<Number>}
             */
            get luminance(): number[] {
                return this.data.hist.luminance;
            }

            /**
             * RGB Histogram
             * @returns {Array<Number>}
             */
            get rgb(): number[] {
                return this.data.hist.rgb;
            }

            get count(): HistogramStat {
                return this.data.count;
            }

            get mean(): HistogramStat {
                return this.data.mean;
            }

            get median(): HistogramStat {
                return this.data.median;
            }

            get mode(): HistogramStat {
                return this.data.mode;
            }

            get std(): HistogramStat {
                return this.data.stddev
            }

            get max(): HistogramStat {
                return this.data.max;
            }

            _calcData(): HistogramData {
                // draw image/canvas source to a new canvas and get pixel data
                this._canvas.width = this._source.width;
                this._canvas.height = this._source.height;
                this._ctx.drawImage(this._source, 0, 0);
                var imageData: ImageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);

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
                var r: number, g: number, b: number, l: number;
                for (var i = 0; i < imageData.data.length; i+=4) {
                    r = imageData.data[i]; g = imageData.data[i+1]; b = imageData.data[i+2];
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
                    if (red[i] > maxRed) maxRed = red[i];
                    if (green[i] > maxGreen) maxGreen = green[i];
                    if (blue[i] > maxBlue) maxBlue = blue[i];
                    if (luminance[i] > maxLuminance) maxLuminance = luminance[i];
                    if (rgb[i] > maxRGB) maxRGB = rgb[i];
                }

                // stats
                var countRed = imageData.data.length / 4;
                var countRGB = countRed*3;

                var meanRed = Util.Histogram.mean(red);
                var meanGreen = Util.Histogram.mean(green);
                var meanBlue = Util.Histogram.mean(blue);
                var meanLuminance = Util.Histogram.mean(luminance);
                // can use average of averages since sizes are equal
                var meanRGB = (meanRed + meanGreen + meanBlue) / 3.0;

                var medianRed = Util.Histogram.median(red);
                var medianGreen = Util.Histogram.median(green);
                var medianBlue = Util.Histogram.median(blue);
                var medianLuminance = Util.Histogram.median(luminance);
                var medianRGB = Util.Histogram.median(rgb);

                var modeRed = Util.Histogram.mode(red);
                var modeGreen = Util.Histogram.mode(green);
                var modeBlue = Util.Histogram.mode(blue);
                var modeLuminance = Util.Histogram.mode(luminance);
                var modeRGB = Util.Histogram.mode(rgb);

                var stddevRed = Util.Histogram.std(red);
                var stddevGreen = Util.Histogram.std(green);
                var stddevBlue = Util.Histogram.std(blue);
                var stddevLuminance = Util.Histogram.std(luminance);
                var stddevRGB = Util.Histogram.std(rgb);

                return {
                    hist: {red, green, blue, luminance, rgb},
                    count: {red: countRed, green: countRed, blue: countRed, luminance: countRed, rgb: countRGB},
                    max: {red: maxRed, green: maxGreen, blue: maxBlue, luminance: maxLuminance, rgb: maxRGB},
                    mean: {red: meanRed, green: meanGreen, blue: meanBlue, luminance: meanLuminance, rgb: meanRGB},
                    median: {red: medianRed, green: medianGreen, blue: medianBlue, luminance: medianLuminance, rgb: medianRGB},
                    mode: {red: modeRed, green: modeGreen, blue: modeBlue, luminance: modeLuminance, rgb: modeRGB},
                    stddev: {red: stddevRed, green: stddevGreen, blue: stddevBlue, luminance: stddevLuminance, rgb: stddevRGB},
                };
            }

            /**
             * Recalculate all data
             */
            refresh() {
                this.data = this._calcData();
            }
        }

    }
}
