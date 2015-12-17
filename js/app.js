///<reference path="../../js/util.ts"/>
///<reference path="../../js/histogram.ts"/>
///<reference path="../../js/manager.ts"/>
///<reference path="../../js/ui.ts"/>
///<reference path="../../DefinitelyTyped/jquery.d.ts"/>
///<reference path="../../DefinitelyTyped/jqueryui.d.ts"/>
function rectangleVertices(x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    return new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2
    ]);
}
var WebGLManager = (function () {
    function WebGLManager(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("webgl", { preserveDrawingBuffer: true });
        if (!this.ctx) {
            this.ctx = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true });
            if (!this.ctx) {
                throw new Error('Unable to initialize WebGL.  Your browser may not support it');
            }
            console.log('fell back to experimental-webgl');
        }
        //this.ctx.getExtension('OES_texture_float');
    }
    WebGLManager.prototype.createShader = function (source, type) {
        var shader = this.ctx.createShader(type);
        this.ctx.shaderSource(shader, source);
        this.ctx.compileShader(shader);
        var success = this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS);
        if (!success) {
            throw new Error('could not compile shader: ' + this.ctx.getShaderInfoLog(shader));
        }
        return shader;
    };
    WebGLManager.prototype.createFragmentShader = function (source) {
        return this.createShader(source, this.ctx.FRAGMENT_SHADER);
    };
    WebGLManager.prototype.createVertexShader = function (source) {
        return this.createShader(source, this.ctx.VERTEX_SHADER);
    };
    WebGLManager.prototype.createProgram = function (fragmentShader, vertexShader) {
        var program = this.ctx.createProgram();
        this.ctx.attachShader(program, vertexShader);
        this.ctx.attachShader(program, fragmentShader);
        this.ctx.linkProgram(program);
        var success = this.ctx.getProgramParameter(program, this.ctx.LINK_STATUS);
        if (!success) {
            throw new Error('could not link program: ' + this.ctx.getProgramInfoLog(program));
        }
        this.program = program;
        this.ctx.useProgram(program);
        return program;
    };
    WebGLManager.prototype.createProgramFromSource = function (fragmentSource, vertexSource) {
        var fragmentShader = this.createFragmentShader(fragmentSource);
        var vertexShader = this.createVertexShader(vertexSource);
        return this.createProgram(fragmentShader, vertexShader);
    };
    WebGLManager.prototype.createTexture = function (image) {
        //this.ctx.activeTexture(this.ctx.TEXTURE0);
        var texture = this.ctx.createTexture();
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.MIRRORED_REPEAT);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.MIRRORED_REPEAT);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, image);
        //this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.FLOAT, image);
        return texture;
    };
    WebGLManager.prototype.createTextureNonPow2 = function (image) {
        //this.ctx.activeTexture(this.ctx.TEXTURE0);
        var texture = this.ctx.createTexture();
        // place 1 pixel power of 2 texture so that you can add a non power of two
        // http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, 1, 1, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, image);
        return texture;
    };
    WebGLManager.prototype.setAttribute = function (program, name, value, size) {
        if (size === void 0) { size = 4; }
        var index = this.ctx.getAttribLocation(program, name);
        var buffer = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buffer);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, value, this.ctx.STATIC_DRAW);
        this.ctx.enableVertexAttribArray(index);
        this.ctx.vertexAttribPointer(index, size, this.ctx.FLOAT, false, 0, 0);
    };
    WebGLManager.prototype.setUniform1fv = function (program, name, value) {
        var location = this.ctx.getUniformLocation(program, name);
        this.ctx.uniform1fv(location, value);
    };
    WebGLManager.prototype.setUniform2f = function (program, name, value1, value2) {
        var location = this.ctx.getUniformLocation(program, name);
        this.ctx.uniform2f(location, value1, value2);
    };
    WebGLManager.prototype.setUniform1f = function (program, name, value) {
        var location = this.ctx.getUniformLocation(program, name);
        this.ctx.uniform1f(location, value);
    };
    WebGLManager.prototype.setUniform1i = function (program, name, value) {
        var location = this.ctx.getUniformLocation(program, name);
        this.ctx.uniform1i(location, value);
    };
    WebGLManager.prototype.setVariables = function (program, variables) {
        for (var typeName in variables) {
            if (typeName == 'attribute') {
                for (var attributeName in variables[typeName]) {
                    this.setAttribute(program, attributeName, variables[typeName][attributeName]['value'], variables[typeName][attributeName]['size']);
                }
            }
            else if (typeName == 'uniform2f') {
                for (var uniformName in variables[typeName]) {
                    this.setUniform2f(program, uniformName, variables[typeName][uniformName]['value1'], variables[typeName][uniformName]['value2']);
                }
            }
            else if (typeName == 'uniform1fv') {
                for (var uniformName in variables[typeName]) {
                    this.setUniform1fv(program, uniformName, variables[typeName][uniformName]['value']);
                }
            }
            else if (typeName == 'uniform1f') {
                for (var uniformName in variables[typeName]) {
                    this.setUniform1f(program, uniformName, variables[typeName][uniformName]['value']);
                }
            }
            else if (typeName == 'uniform1i') {
                for (var uniformName in variables[typeName]) {
                    this.setUniform1i(program, uniformName, variables[typeName][uniformName]['value']);
                }
            }
        }
    };
    WebGLManager.prototype.defaultVariables = function (canvas, image) {
        return {
            attribute: {
                'a_textureCoordinate': { size: 2, value: rectangleVertices(0, 0, 1.0, 1.0) },
                'a_texturePosition': { size: 2, value: rectangleVertices(0, 0, image.width, image.height) }
            },
            uniform2f: {
                'u_resolution': { value1: canvas.width, value2: canvas.height },
                'u_textureSize': { value1: image.width, value2: image.height }
            },
        };
    };
    WebGLManager.prototype.draw = function () {
        this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 6);
    };
    return WebGLManager;
})();
var vertexSource = "\n    attribute vec2 a_texturePosition;\n    attribute vec2 a_textureCoordinate;\n    uniform vec2 u_resolution;\n\n    // out to fragment shader\n    varying vec2 v_textureCoordinate;\n\n    vec2 pixel2Clip(vec2 pixel) {\n        // convert the rectangle from pixels to 0.0 to 1.0\n       vec2 zeroToOne = pixel / u_resolution;\n\n       // convert from 0->1 to 0->2\n       vec2 zeroToTwo = zeroToOne * 2.0;\n\n       // convert from 0->2 to -1->+1 (clipspace)\n       return zeroToTwo - 1.0;\n    }\n\n    void main() {\n       vec2 clipSpace = pixel2Clip(a_texturePosition);\n       gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n\n       // pass the a_textureCoordinate to the fragment shader\n       // The GPU will interpolate this value between points\n       v_textureCoordinate = a_textureCoordinate;\n    }\n";
var fragmentSource = "\n    // modified from http://www.chilliant.com/rgb2hsv.html\n\n    #ifdef GL_FRAGMENT_PRECISION_HIGH\n        precision highp float;\n    #else\n        precision mediump float;\n    #endif\n    #define EPSILON 1e-10\n\n    uniform sampler2D u_image;\n\n    uniform float basicEnabled;\n    uniform float rgbEnabled;\n    uniform float hsvEnabled;\n    uniform float customRGBEnabled;\n\n    uniform float basicBrightness;\n    uniform float basicContrast;\n    uniform float basicSaturation;\n    uniform float basicExposure;\n    uniform float basicGamma;\n    uniform float rgbRed;\n    uniform float rgbGreen;\n    uniform float rgbBlue;\n    uniform float hsvHue;\n    uniform float hsvSaturation;\n    uniform float hsvValue;\n    uniform float customrgbRedR;\n    uniform float customrgbRedG;\n    uniform float customrgbRedB;\n    uniform float customrgbGreenR;\n    uniform float customrgbGreenG;\n    uniform float customrgbGreenB;\n    uniform float customrgbBlueR;\n    uniform float customrgbBlueG;\n    uniform float customrgbBlueB;\n\n    // passed from vertex shader\n    varying vec2 v_textureCoordinate;\n\n    const vec3 rgb2Y = vec3(0.299, 0.587, 0.114);\n    const vec3 middleGray = vec3(0.5, 0.5, 0.5);\n\n    vec3 hue2rgb(float hue) {\n        hue = (hue < 0.0) ? hue+1.0 : hue;\n        hue = (hue > 1.0) ? hue-1.0 : hue;\n        float r = abs(hue * 6.0 - 3.0) - 1.0;\n        float g = 2.0 - abs(hue * 6.0 - 2.0);\n        float b = 2.0 - abs(hue * 6.0 - 4.0);\n        return clamp(vec3(r, g, b), 0.0, 1.0);\n    }\n\n    vec3 rgb2hcv(vec3 rgb) {\n        // Based on work by Sam Hocevar and Emil Persson\n        vec4 P = (rgb.g < rgb.b) ? vec4(rgb.bg, -1.0, 2.0/3.0) : vec4(rgb.gb, 0.0, -1.0/3.0);\n        vec4 Q = (rgb.r < P.x) ? vec4(P.xyw, rgb.r) : vec4(rgb.r, P.yzx);\n        float C = Q.x - min(Q.w, Q.y);\n        float H = abs((Q.w - Q.y) / (6.0 * C + EPSILON) + Q.z);\n        return vec3(H, C, Q.x);\n    }\n\n    vec3 hsv2rgb(vec3 hsv) {\n        vec3 rgb = hue2rgb(hsv.x);\n        return ((rgb - 1.0) * hsv.y + 1.0) * hsv.z;\n    }\n\n    vec3 hsl2rgb(vec3 hsl) {\n        vec3 rgb = hue2rgb(hsl.x);\n        float C = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;\n        return (rgb - 0.5) * C + hsl.z;\n    }\n\n    vec3 rgb2hsv(vec3 rgb) {\n        vec3 hcv = rgb2hcv(rgb);\n        float S = hcv.y / (hcv.z + EPSILON);\n        return vec3(hcv.x, S, hcv.z);\n    }\n\n    vec3 rgb2hsl(vec3 rgb) {\n        vec3 hcv = rgb2hcv(rgb);\n        float L = hcv.z - hcv.y * 0.5;\n        float S = hcv.y / (1.0 - abs(L * 2.0 - 1.0) + EPSILON);\n        return vec3(hcv.x, S, L);\n    }\n\n    void main() {\n       // Look up a color from the texture.\n       vec4 color = texture2D(u_image, v_textureCoordinate);\n       vec3 rgb = vec3(color.r, color.g, color.b);\n\n       if (basicEnabled > 0.0) {\n            // brightness (additive)\n            rgb = clamp(rgb + vec3(basicBrightness, basicBrightness, basicBrightness), 0.0, 1.0);\n\n            // contrast\n            rgb = clamp((rgb - middleGray) * basicContrast + middleGray, 0.0, 1.0);\n\n            // saturation mix(x, y, a) = x*(1\u2212a)+y\u00D7a\n            float luminance = dot(rgb, rgb2Y);\n            rgb = mix(vec3(luminance, luminance, luminance), rgb, basicSaturation);\n\n            // exposure\n            rgb = clamp(rgb * pow(2.0, basicExposure), 0.0, 1.0);\n\n            // gamma\n            rgb = clamp(pow(rgb, vec3(1.0/basicGamma, 1.0/basicGamma, 1.0/basicGamma)), 0.0, 1.0);\n       }\n\n       if (rgbEnabled > 0.0) {\n           rgb = clamp(rgb+vec3(rgbRed, rgbGreen, rgbBlue), 0.0, 1.0);\n       }\n\n       if (hsvEnabled > 0.0) {\n            vec3 hsv = rgb2hsv(rgb);\n            hsv.x += hsvHue;\n            hsv.y += hsvSaturation;\n            hsv.z += hsvValue;\n            hsv.y = clamp(hsv.y, 0.0, 1.0);\n            hsv.z = clamp(hsv.z, 0.0, 1.0);\n            rgb = hsv2rgb(hsv);\n       }\n\n       if (customRGBEnabled > 0.0) {\n           float redI = customrgbRedR * rgb.r + customrgbRedG * rgb.g + customrgbRedB * rgb.b;\n           float greenI = customrgbGreenR * rgb.r + customrgbGreenG * rgb.g + customrgbGreenB * rgb.b;\n           float blueI = customrgbBlueR * rgb.r + customrgbBlueG * rgb.g + customrgbBlueB * rgb.b;\n           rgb = vec3(redI, greenI, blueI);\n       }\n\n       color = vec4(rgb.r, rgb.g, rgb.b, color.a);\n       gl_FragColor = color;\n    }\n";
function sliderInit(id, onSlide) {
    var $element = $(id);
    var $label = $('#' + $element.data('label'));
    $element.slider({
        range: 'min',
        min: -1.000,
        max: 1.000,
        step: 0.001,
        value: 0.000,
        slide: function (event, ui) {
            $label.text(ui.value.toFixed(3));
            if (onSlide) {
                onSlide(event, ui);
            }
        },
        change: function (event, ui) {
            $label.text(ui.value.toFixed(3));
            if (onSlide) {
                onSlide(event, ui);
            }
        },
    });
    $label.text((0).toFixed(3));
}
function sliderRGBInit(id, v1, v2, onSlide) {
    var $element = $(id);
    $element.slider({
        range: true,
        min: 0.000,
        max: 1.000,
        step: 0.001,
        values: [v1, v2],
        slide: function (event, ui) {
            var r = ui.values[0], g = ui.values[1] - r, b = 1.0 - g - r;
            if (onSlide) {
                onSlide(ui.handle, r, g, b);
            }
        },
        change: function (event, ui) {
            var r = ui.values[0], g = ui.values[1] - r, b = 1.0 - g - r;
            if (onSlide) {
                onSlide(ui.handle, r, g, b);
            }
        },
    });
}
function toggleInit(id, onClick) {
    var $element = $(id);
    $element.click(function (event) {
        if ($element.hasClass('off')) {
            $element.removeClass('off');
        }
        else {
            $element.addClass('off');
        }
        if (onClick) {
            onClick(event);
        }
    });
}
$(document).ready(function () {
    $('#sidebar-functions').height($(document).height() - 50 - 256 - 24);
    $(window).resize(function () {
        $('#sidebar-functions').height($(document).height() - 50 - 256 - 24);
        $('#sidebar-functions').perfectScrollbar('update');
    });
    $('#sidebar-functions').perfectScrollbar();
    var div = document.getElementById('histContainer');
    var image = new Image();
    image.addEventListener('load', function () {
        var canvas = document.getElementById('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var webgl = new WebGLManager(canvas);
        var program = webgl.createProgramFromSource(fragmentSource, vertexSource);
        var variables = webgl.defaultVariables(canvas, image);
        variables['uniform1f'] = {
            'basicEnabled': { value: 1.0 },
            'rgbEnabled': { value: 1.0 },
            'hsvEnabled': { value: 1.0 },
            'customRGBEnabled': { value: 0.0 },
            'basicBrightness': { value: 0.0 },
            'basicContrast': { value: 1.0 },
            'basicSaturation': { value: 1.0 },
            'basicExposure': { value: 0.0 },
            'basicGamma': { value: 1.0 },
            'rgbRed': { value: 0.0 },
            'rgbGreen': { value: 0.0 },
            'rgbBlue': { value: 0.0 },
            'hsvHue': { value: 0.0 },
            'hsvSaturation': { value: 0.0 },
            'hsvValue': { value: 0.0 },
            'customrgbRedR': { value: 0.299 },
            'customrgbRedG': { value: 0.587 },
            'customrgbRedB': { value: 0.114 },
            'customrgbGreenR': { value: 0.299 },
            'customrgbGreenG': { value: 0.587 },
            'customrgbGreenB': { value: 0.114 },
            'customrgbBlueR': { value: 0.299 },
            'customrgbBlueG': { value: 0.587 },
            'customrgbBlueB': { value: 0.114 },
        };
        webgl.setVariables(program, variables);
        webgl.createTextureNonPow2(image);
        webgl.draw();
        function normalizeWheelSpeed(event) {
            var normalized;
            if (event.wheelDelta) {
                normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
            }
            else {
                var rawAmmount = event.deltaY ? event.deltaY : event.detail;
                normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
            }
            var amount = 50;
            var aspect = canvas.height / canvas.width;
            if (normalized > 0) {
                canvas.width += amount;
                canvas.height = aspect * canvas.width;
                canvas.style.width = '' + canvas.width + 'px';
                canvas.style.height = '' + canvas.height + 'px';
                webgl.ctx.viewport(0, 0, canvas.width, canvas.height);
                webgl.draw();
            }
            else if (normalized < 0 && canvas.width > 2 * amount) {
                canvas.width -= amount;
                canvas.height = aspect * canvas.width;
                canvas.style.width = '' + canvas.width + 'px';
                canvas.style.height = '' + canvas.height + 'px';
                webgl.ctx.viewport(0, 0, canvas.width, canvas.height);
                webgl.draw();
            }
        }
        canvas.addEventListener('mousewheel', normalizeWheelSpeed);
        canvas.addEventListener('DOMMouseScroll', normalizeWheelSpeed);
        canvas.addEventListener('wheel', normalizeWheelSpeed);
        var hist = new PhotoHistogram.Ui(div, canvas);
        sliderInit('#sliderBasicBrightness', function (event, ui) {
            webgl.setUniform1f(program, 'basicBrightness', ui.value);
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderBasicContrast', function (event, ui) {
            webgl.setUniform1f(program, 'basicContrast', ui.value + 1); // [0 2] range
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderBasicSaturation', function (event, ui) {
            webgl.setUniform1f(program, 'basicSaturation', ui.value + 1); // [0 2] range
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderBasicExposure', function (event, ui) {
            webgl.setUniform1f(program, 'basicExposure', ui.value * 3); // [-3 3]
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderBasicGamma', function (event, ui) {
            var val = ui.value + 1; // [0 2]
            if (val > 1)
                val = (val - 1) * 4 + 1; // [0 2] -> [0 1] -> [0 4] -> [1 5]
            webgl.setUniform1f(program, 'basicGamma', val);
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderRGBRed', function (event, ui) {
            webgl.setUniform1f(program, 'rgbRed', ui.value);
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderRGBGreen', function (event, ui) {
            webgl.setUniform1f(program, 'rgbGreen', ui.value);
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderRGBBlue', function (event, ui) {
            webgl.setUniform1f(program, 'rgbBlue', ui.value);
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderHSVHue', function (event, ui) {
            webgl.setUniform1f(program, 'hsvHue', ui.value);
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderHSVSaturation', function (event, ui) {
            webgl.setUniform1f(program, 'hsvSaturation', ui.value);
            webgl.draw();
            hist.refresh();
        });
        sliderInit('#sliderHSVValue', function (event, ui) {
            webgl.setUniform1f(program, 'hsvValue', ui.value);
            webgl.draw();
            hist.refresh();
        });
        sliderRGBInit('#sliderCustomRGBRed', 0.299, 0.886, function (handle, r, g, b) {
            webgl.setUniform1f(program, 'customrgbRedR', r);
            webgl.setUniform1f(program, 'customrgbRedG', g);
            webgl.setUniform1f(program, 'customrgbRedB', b);
            webgl.draw();
            hist.refresh();
        });
        sliderRGBInit('#sliderCustomRGBGreen', 0.299, 0.886, function (handle, r, g, b) {
            webgl.setUniform1f(program, 'customrgbGreenR', r);
            webgl.setUniform1f(program, 'customrgbGreenG', g);
            webgl.setUniform1f(program, 'customrgbGreenB', b);
            webgl.draw();
            hist.refresh();
        });
        sliderRGBInit('#sliderCustomRGBBlue', 0.299, 0.886, function (handle, r, g, b) {
            webgl.setUniform1f(program, 'customrgbBlueR', r);
            webgl.setUniform1f(program, 'customrgbBlueG', g);
            webgl.setUniform1f(program, 'customrgbBlueB', b);
            webgl.draw();
            hist.refresh();
        });
        toggleInit('#toggleBasic', function (event) {
            if ($('#toggleBasic').hasClass('off')) {
                $('#sliderBasicBrightness').slider('value', 0.000);
                $('#sliderBasicContrast').slider('value', 0.000);
                $('#sliderBasicSaturation').slider('value', 0.000);
                $('#sliderBasicExposure').slider('value', 0.000);
                $('#sliderBasicGamma').slider('value', 0.000);
                webgl.setUniform1f(program, 'basicEnabled', 0.0);
            }
            else {
                webgl.setUniform1f(program, 'basicEnabled', 1.0);
            }
            webgl.draw();
            hist.refresh();
        });
        toggleInit('#toggleRGB', function (event) {
            if ($('#toggleRGB').hasClass('off')) {
                $('#sliderRGBRed').slider('value', 0.000);
                $('#sliderRGBGreen').slider('value', 0.000);
                $('#sliderRGBBlue').slider('value', 0.000);
                webgl.setUniform1f(program, 'rgbEnabled', 0.0);
            }
            else {
                webgl.setUniform1f(program, 'rgbEnabled', 1.0);
            }
            webgl.draw();
            hist.refresh();
        });
        toggleInit('#toggleHSV', function (event) {
            if ($('#toggleHSV').hasClass('off')) {
                $('#sliderHSVHue').slider('value', 0.000);
                $('#sliderHSVSaturation').slider('value', 0.000);
                $('#sliderHSVValue').slider('value', 0.000);
                webgl.setUniform1f(program, 'hsvEnabled', 0.0);
            }
            else {
                webgl.setUniform1f(program, 'hsvEnabled', 1.0);
            }
            webgl.draw();
            hist.refresh();
        });
        toggleInit('#toggleCustomRGB', function (event) {
            if ($('#toggleCustomRGB').hasClass('off')) {
                $('#sliderCustomRGBRed').slider('values', [0.299, 0.886]);
                $('#sliderCustomRGBGreen').slider('values', [0.299, 0.886]);
                $('#sliderCustomRGBBlue').slider('values', [0.299, 0.886]);
                webgl.setUniform1f(program, 'customRGBEnabled', 0.0);
            }
            else {
                webgl.setUniform1f(program, 'customRGBEnabled', 1.0);
            }
            webgl.draw();
            hist.refresh();
        });
        $('.function-group-header').click(function (event) {
            if (event.target.classList.contains('function-group-toggle'))
                return;
            var current = event.currentTarget;
            var parent = current.parentElement;
            if (parent.classList.contains('disable')) {
                parent.classList.remove('disable');
                $('i', current).removeClass('fa-caret-right');
                $('i', current).addClass('fa-caret-down');
            }
            else {
                parent.classList.add('disable');
                $('i', current).removeClass('fa-caret-down');
                $('i', current).addClass('fa-caret-right');
            }
        });
        // adblocker must be disabled
        $(canvas).draggable();
    });
    //image.src = "img/lena512.png";
    image.src = "img/florence-1066307_640.jpg";
});
//# sourceMappingURL=app.js.map