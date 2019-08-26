import { attachShadowDom, validateSelector } from '../utilities';
import { ComponentOptions, CustomElementConstructor, CustomElementRenderRoot } from '../declarations';
import { connectedCallback, disconnectedCallback, getObservedAttributes, attributeChangedCallback, reRender } from '../component';

/**
* Base Component decorator that creates a custom element on the fly.
* Developers must provide a tag name for the component.
*
* @param tag the name of the custom element to define
* @param style inline style
* @param styles multiple inline styles
* @param shadow opt_in for putting shadow dom on true ( default is false )
*
*   Example:
*   @Component({
*       tag: 'example-element',
        style: '.div { display: none; }',
        styles: ['.div { display: none; }', '.logo { display: block }'],
        shadow: true
*   })
*   export class ExampleElement extends HTMLElement {
*
*   }
*/
export const Component = ( options: ComponentOptions ) => {

    // Check if the element tag name is a valid custom element selector
    validateSelector( options.tag );

    return <T extends CustomElementConstructor>( constructor: T ) => {

        const generatedComponent: T = class extends constructor {

            __canAttachShadowDom: boolean;
            __hasShadyPolyfill: boolean;
            __nodeName: string;

            /**
                * Tells the components when it is connected to DOM
            **/
            public connected: boolean;

            /**
                * Node or ShadowRoot into which element DOM should be rendered.
                * Which is being set in the constructor.
            **/
            public renderRoot: CustomElementRenderRoot;

            /**
                * Returns a list of attributes based on the registrated properties.
            **/
            static get observedAttributes() {

                return getObservedAttributes( ( this as any ) );

            }

            constructor( ...args: any[] ) {

                super( args );

                this.connected = false;

                this.__canAttachShadowDom = ( options.shadow ) ? options.shadow : false;
                this.__hasShadyPolyfill = ( window.ShadyCSS && !window.ShadyCSS.nativeShadow );
                this.__nodeName = this.nodeName.toLowerCase();

                attachShadowDom( this );

                this.renderRoot = ( this.__canAttachShadowDom && this.shadowRoot ) ? this.shadowRoot : this;

            }

            /**
                * Is called each time a attribute that is defined in the observedAttributes is changed.
            **/
            attributeChangedCallback(name: string, oldValue: string| null, newValue: string | null) {

                attributeChangedCallback( ( this as any ), name, oldValue, newValue );

            }

            /**
                * ConnectedCallback is fired each time the custom element is appended into a document-connected element.
            **/
            connectedCallback() {

                connectedCallback( this as any, options, constructor.prototype );

            }

            /**
                * DisconnectedCallback is fired each time the custom element is disconnected from the document's DOM.
            **/
            disconnectedCallback() {

                disconnectedCallback( this as any, constructor.prototype );

            }

            componentOnReady() {

                return new Promise(( resolve ) => resolve( this ) );

            }

            /**
                * Rerender function thats being called when a property changes
            */
            reRender() {

                reRender( this as any, options, constructor.prototype );

            }


        };

        /**
        *   Check if custom element is already defined
        *   Create new custom element when element name is not defined;
        */
        if( !customElements.get( options.tag ) ) {

            customElements.define( options.tag, generatedComponent );

        }

        return generatedComponent;

    }

}