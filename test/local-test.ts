///<reference path="../js/util.ts"/>
///<reference path="../js/histogram.ts"/>
///<reference path="../js/manager.ts"/>
///<reference path="../js/ui.ts"/>
///<reference path="../DefinitelyTyped/qunit.d.ts"/>
///<reference path="../DefinitelyTyped/jquery.d.ts"/>

function runTests() {
    QUnit.module('Util', function() {
        QUnit.test('Histogram.cnt', function(assert) {
            var hist = [1, 2, 3, 4, 5, 6, 7];
            var r = PhotoHistogram.Util.Histogram.cnt(hist);
            assert.equal(r, 28);
        });

        QUnit.test('Histogram.middleIndex', function(assert) {
            var hist = [2, 2, 2];
            var r = PhotoHistogram.Util.Histogram.middleIndex(hist);
            assert.equal(r, 3);
            hist = [2, 1, 2];
            r = PhotoHistogram.Util.Histogram.middleIndex(hist);
            assert.equal(r, 3);
        });

        QUnit.test('Histogram.mean', function(assert) {
            var hist = [1, 2, 3, 4, 5, 6, 7];
            var r = PhotoHistogram.Util.Histogram.mean(hist);
            assert.equal(r, (1*0+2*1+3*2+4*3+5*4+6*5+7*6)/28);
        });

        QUnit.test('Histogram.median', function(assert) {
            var hist = [1, 2, 3, 4, 5, 6, 7];
            var r = PhotoHistogram.Util.Histogram.median(hist);
            assert.equal(r, 4);
            hist = [2, 2, 2];
            r = PhotoHistogram.Util.Histogram.median(hist);
            assert.equal(r, 1);
            hist = [3, 1, 2];
            r = PhotoHistogram.Util.Histogram.median(hist);
            assert.equal(r, 0);
            hist = [2, 1, 2];
            r = PhotoHistogram.Util.Histogram.median(hist);
            assert.equal(r, 1);
        });

        QUnit.test('Histogram.mode', function(assert) {
            var hist = [1, 2, 3, 4, 5, 6, 7];
            var r = PhotoHistogram.Util.Histogram.mode(hist);
            assert.equal(r, 6);
            hist = [1, 2, 3, 4, 5, 6, 6];
            r = PhotoHistogram.Util.Histogram.mode(hist);
            assert.equal(r, 5);
        });

        QUnit.test('Histogram.variance', function(assert) {
            var hist = [2, 2, 2];
            var r = PhotoHistogram.Util.Histogram.variance(hist);
            assert.equal(r, 2/3);
        });

        QUnit.test('Histogram.std', function(assert) {
            var hist = [2, 2, 2];
            var r = PhotoHistogram.Util.Histogram.std(hist);
            assert.equal(r, Math.sqrt(2/3));
        });

        QUnit.test('Random.integer', function(assert) {
            for (var i = 0; i < 10; i++) {
                var r = PhotoHistogram.Util.Random.integer(0, 1);
                assert.ok(r == 0 || r == 1);
                r = PhotoHistogram.Util.Random.integer(1, 1);
                assert.equal(r, 1);
            }
        });

        QUnit.test('Random.id', function(assert) {
            for (var i = 0; i < 10; i++) {
                var r = PhotoHistogram.Util.Random.id('mybase');
                assert.equal(r.indexOf('mybase'), 0);
                assert.ok(r.length > 'mybase'.length);
            }
        });

        QUnit.test('Random.id', function(assert) {
            for (var i = 0; i < 10; i++) {
                var r = PhotoHistogram.Util.Random.id('mybase');
                assert.equal(r.indexOf('mybase'), 0);
                assert.ok(r.length > 'mybase'.length);
            }
        });

        QUnit.test('DOM.createElement - no parent', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var div = PhotoHistogram.Util.DOM.createElement('div');
            assert.equal( $( "div", fixture ).length, 0);
            assert.equal(div.attributes.length, 0);
            assert.equal(div.tagName, 'DIV');
            div = PhotoHistogram.Util.DOM.createElement('div', {'class': 'myclassname'});
            assert.equal( $( "div", fixture ).length, 0);
            assert.equal(div.attributes.length, 1);
            assert.ok(div.classList.contains('myclassname'));
        });

        QUnit.test('DOM.createElement - parent', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var div = PhotoHistogram.Util.DOM.createElement('div', undefined, fixture[0]);
            assert.equal( $( "div", fixture ).length, 1);
            assert.equal(div.attributes.length, 0);
            assert.equal(div.tagName, 'DIV');
            div = PhotoHistogram.Util.DOM.createElement('div', {'class': 'myclassname'}, fixture[0]);
            assert.equal( $( "div", fixture ).length, 2);
            assert.equal(div.attributes.length, 1);
            assert.ok(div.classList.contains('myclassname'));
        });

        QUnit.test('DOM.createElementNS - no parent', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var svg = PhotoHistogram.Util.DOM.createElementNS('SVG', 'http://www.w3.org/2000/svg');
            assert.equal( $( "SVG", fixture ).length, 0);
            assert.equal(svg.attributes.length, 0);
            assert.equal(svg.tagName, 'SVG');
            svg = PhotoHistogram.Util.DOM.createElementNS('SVG', 'http://www.w3.org/2000/svg', {'class': 'myclassname'});
            assert.equal( $( "SVG", fixture ).length, 0);
            assert.equal(svg.attributes.length, 1);

            // ie 11 doesn't have classlist on svg
            if (svg.classList) {
                assert.ok(svg.classList.contains('myclassname'));
            }
        });

        QUnit.test('DOM.createElementNS - parent', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var svg = PhotoHistogram.Util.DOM.createElementNS('SVG', 'http://www.w3.org/2000/svg', undefined, fixture[0]);
            assert.equal( $( "SVG", fixture ).length, 1);
            assert.equal(svg.attributes.length, 0);
            assert.equal(svg.tagName, 'SVG');
            svg = PhotoHistogram.Util.DOM.createElementNS('SVG', 'http://www.w3.org/2000/svg', {'class': 'myclassname'}, fixture[0]);
            assert.equal( $( "SVG", fixture ).length, 2);
            assert.equal(svg.attributes.length, 1);

            // ie 11 doesn't have classlist on svg
            if (svg.classList) {
                assert.ok(svg.classList.contains('myclassname'));
            }
        });

        QUnit.test('Extension.EnumEx.getNames', function(assert) {
            var names = PhotoHistogram.Util.Extension.EnumEx.getNames(PhotoHistogram.HistogramChannel);
            assert.deepEqual(names, ['Colors', 'Red', 'Green', 'Blue', 'Luminance', 'RGB'])
        });

        QUnit.test('Extension.EnumEx.getValues', function(assert) {
            var names = PhotoHistogram.Util.Extension.EnumEx.getValues(PhotoHistogram.HistogramChannel);
            assert.deepEqual(names, [0, 1, 2, 3, 4, 5])
        });

        QUnit.test('Extension.EnumEx.getValues', function(assert) {
            var names = PhotoHistogram.Util.Extension.EnumEx.getNamesAndValues(PhotoHistogram.HistogramChannel);
            assert.deepEqual(names, [{name: 'Colors', value: 0}, {name: 'Red', value: 1}, {name: 'Green', value: 2}, {name: 'Blue', value: 3}, {name: 'Luminance', value: 4}, {name: 'RGB', value: 5}])
        });
    });

    QUnit.module('Histogram', function() {
        QUnit.test('Core.Histogram.constructor', function(assert) {
            var hist = new PhotoHistogram.Core.Histogram(image);
            assert.ok(hist.data != null);
            assert.ok(hist.data.count != null);
            assert.ok(hist.data.hist != null);
            assert.ok(hist.data.max != null);
            assert.ok(hist.data.mean != null);
            assert.ok(hist.data.median != null);
            assert.ok(hist.data.mode != null);
            assert.ok(hist.data.stddev != null);
            assert.equal(hist.data.count.red, 65536);
            assert.equal(hist.data.count.green, 65536);
            assert.equal(hist.data.count.blue, 65536);
            assert.equal(hist.data.count.luminance, 65536);
            assert.equal(hist.data.count.rgb, 65536*3);
        });

        QUnit.test('Core.Histogram.refresh', function(assert) {
            var hist = new PhotoHistogram.Core.Histogram(image);
            hist.refresh();
            assert.ok(hist.data != null);
            assert.ok(hist.data.count != null);
            assert.ok(hist.data.hist != null);
            assert.ok(hist.data.max != null);
            assert.ok(hist.data.mean != null);
            assert.ok(hist.data.median != null);
            assert.ok(hist.data.mode != null);
            assert.ok(hist.data.stddev != null);
            assert.equal(hist.data.count.red, 65536);
            assert.equal(hist.data.count.green, 65536);
            assert.equal(hist.data.count.blue, 65536);
            assert.equal(hist.data.count.luminance, 65536);
            assert.equal(hist.data.count.rgb, 65536*3);
        });
    });

    QUnit.module('Manager', function() {
        QUnit.test('Svg.create', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var svg = PhotoHistogram.Manager.Svg.create(fixture[0], {
                viewBox: '0 0 100 100',
                width: '100',
                height: '100',
                preserveAspectRatio: 'none',
            });

            assert.equal(svg.element.tagName, 'svg');
            assert.equal(svg.element.childElementCount, 0);
        });

        QUnit.test('Svg.rect', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var svg = PhotoHistogram.Manager.Svg.create(fixture[0], {
                viewBox: '0 0 100 100',
                width: '100',
                height: '100',
                preserveAspectRatio: 'none',
            });

            var rect = svg.rect(0, 0, 50, 50);
            assert.equal(rect.tagName, 'rect');
            assert.equal(svg.element.childElementCount, 1);
            rect = svg.rect(0, 0, 50, 50, {'stroke': 'black'});
            assert.equal(rect.getAttributeNS(null, 'stroke'), 'black');
            assert.equal(svg.element.childElementCount, 2);
        });

        QUnit.test('Svg.line', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var svg = PhotoHistogram.Manager.Svg.create(fixture[0], {
                viewBox: '0 0 100 100',
                width: '100',
                height: '100',
                preserveAspectRatio: 'none',
            });

            var line = svg.line(0, 0, 50, 50);
            assert.equal(line.tagName, 'line');
            assert.equal(svg.element.childElementCount, 1);
            line = svg.line(0, 0, 50, 50, {'stroke': 'black'});
            assert.equal(line.getAttributeNS(null, 'stroke'), 'black');
            assert.equal(svg.element.childElementCount, 2);
        });

        QUnit.test('Svg.path', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var svg = PhotoHistogram.Manager.Svg.create(fixture[0], {
                viewBox: '0 0 100 100',
                width: '100',
                height: '100',
                preserveAspectRatio: 'none',
            });

            var path = svg.path('M 0 0 L 10 10');
            assert.equal(path.tagName, 'path');
            assert.equal(svg.element.childElementCount, 1);
            path = svg.path('M 0 0 L 10 10', {'stroke': 'black'});
            assert.equal(path.getAttributeNS(null, 'stroke'), 'black');
            assert.equal(svg.element.childElementCount, 2);
        });

        QUnit.test('SvgPathBuilder.build', function(assert) {
            var fixture = $( "#qunit-fixture" );
            var svg = PhotoHistogram.Manager.Svg.create(fixture[0], {
                viewBox: '0 0 100 100',
                width: '100',
                height: '100',
                preserveAspectRatio: 'none',
            });

            var builder = new PhotoHistogram.Manager.SvgPathBuilder(svg);
            var path = builder.moveTo(0, 0).lineTo(10, 10).build();
            assert.equal(builder._manager, svg);
            assert.equal(builder._data, 'M 0 0 L 10 10');
            assert.equal(path.tagName, 'path');
            assert.equal(path.getAttributeNS(null, 'd'), 'M 0 0 L 10 10');
            assert.equal(svg.element.childElementCount, 1);

            builder.clear();
            path = builder.moveTo(0, 0).lineTo(10, 10).build({'stroke': 'black'});
            assert.equal(builder._manager, svg);
            assert.equal(builder._data, 'M 0 0 L 10 10');
            assert.equal(path.tagName, 'path');
            assert.equal(path.getAttributeNS(null, 'd'), 'M 0 0 L 10 10');
            assert.equal(path.getAttributeNS(null, 'stroke'), 'black');
            assert.equal(svg.element.childElementCount, 2);
        });
    });

    QUnit.module('Ui', function() {
        QUnit.test('Ui.constructor', function(assert) {
            var fixture = $("#qunit-fixture");
            var ui = new PhotoHistogram.Ui(fixture[0], image);
            assert.ok(true);
        });
    });
}

var image = new Image();
image.addEventListener('load', function() {
    runTests();
});
image.src = 'lena256.png';
