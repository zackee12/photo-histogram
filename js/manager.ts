/// <reference path="util.ts" />

module PhotoHistogram {
    export module Manager {
        export interface SvgCreateAttributes {
            'id'?: string,
            'class'?: string,
            'viewBox'?: string,
            'width'?: string,
            'height'?: string,
            'style'?: string,
            'preserveAspectRatio'?: string
        }

        /**
         * Manage creating and removing elements from an svg element
         */
        export class Svg {
            static xmlns: string = 'http://www.w3.org/2000/svg';
            element: SVGSVGElement;

            constructor(element: SVGSVGElement) {
                this.element = element;
            }

            /**
             * Create Svg element and append to parent
             * @param parent [Element] svg element parent
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @returns {PhotoHistogram.Manager.Svg}
             */
            static create(parent: Element, attributes?: SvgCreateAttributes): Svg {
                var element = <SVGSVGElement> Util.DOM.createElementNS('svg', Svg.xmlns, attributes, parent);
                return new Svg(element);
            }

            /**
             * Remove all children from the svg element
             */
            clear(): void {
                while (this.element.firstChild) {
                    this.element.removeChild(this.element.firstChild);
                }
            }

            /**
             * Create and append a rect element
             * @param x
             * @param y
             * @param width
             * @param height
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @returns {SVGRectElement}
             */
            rect(x: number, y: number, width: number, height: number, attributes?: any): SVGRectElement {
                if (!attributes) attributes = {};
                attributes.x = x.toString(10);
                attributes.y = y.toString(10);
                attributes.width = width.toString(10);
                attributes.height = height.toString(10);
                return <SVGRectElement> Util.DOM.createElementNS('rect', Svg.xmlns, attributes, this.element);
            }

            /**
             * Create and append a line element
             * @param x1
             * @param y1
             * @param x2
             * @param y2
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @returns {SVGLineElement}
             */
            line(x1: number, y1: number, x2: number, y2: number, attributes?: any): SVGLineElement {
                if (!attributes) attributes = {};
                attributes.x1 = x1.toString(10);
                attributes.y1 = y1.toString(10);
                attributes.x2 = x2.toString(10);
                attributes.y2 = y2.toString(10);
                return <SVGLineElement> Util.DOM.createElementNS('line', Svg.xmlns, attributes, this.element);
            }

            /**
             * Create and append a path element
             * @param d
             * @param attributes [{key: value}] optional key-value string attributes to set on element
             * @returns {SVGPathElement}
             */
            path(d: string, attributes?: any): SVGPathElement {
                if (!attributes) attributes = {};
                attributes.d = d;
                return <SVGPathElement> Util.DOM.createElementNS('path', Svg.xmlns, attributes, this.element);
            }
        }

        /**
         * Builds d attribute to construct a path element
         */
        export class SvgPathBuilder {
            _data: string;
            _manager: Svg;

            constructor(svgManager: Svg) {
                this._data = '';
                this._manager = svgManager;
            }

            clear(): void {
                this._data = '';
            }

            build(attributes?: any): SVGPathElement {
                return this._manager.path(this._data, attributes);
            }

            moveTo(x: number, y: number): SvgPathBuilder {
                if (this._data == '') this._data = 'M ' + x + ' ' + y;
                else this._data += ' M ' + x + ' ' + y;
                return this;
            }

            lineTo(x: number, y: number): SvgPathBuilder {
                if (this._data == '') this._data = 'L ' + x + ' ' + y;
                else this._data += ' L ' + x + ' ' + y;

                return this;
            }
        }
    }
}
