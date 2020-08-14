import * as THREE from "three";
import CommonProps from "./Common";

class Mouse{
    constructor(){
        this.mouseMoved = false;
        this.coords = new THREE.Vector2();
        this.coords_old = new THREE.Vector2();
        this.diff = new THREE.Vector2();
        this.timer = null;
        this.count = 0;
    }

    init(){
        document.body.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );
        document.body.addEventListener( 'touchstart', this.onDocumentTouchStart.bind(this), false );
        document.body.addEventListener( 'touchmove', this.onDocumentTouchMove.bind(this), false );

        // this.debug = document.createElement("p");
        // this.debug.style.position = "relative";
        // this.debug.innerHTML = "a"
        // document.body.appendChild(this.debug);
    }

    setCoords( x, y ) {
        if(this.timer) clearTimeout(this.timer);
        this.coords.set( ( x / CommonProps.width ) * 2 - 1, - ( y / CommonProps.height ) * 2 + 1 );
        this.mouseMoved = true;
        this.timer = setTimeout(() => {
            this.mouseMoved = false;
        }, 100);
        
    }
    onDocumentMouseMove( event ) {
        this.setCoords( event.clientX, event.clientY );
    }
    onDocumentTouchStart( event ) {
        if ( event.touches.length === 1 ) {
            // event.preventDefault();
            this.setCoords( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
        }
    }
    onDocumentTouchMove( event ) {
        if ( event.touches.length === 1 ) {
            // event.preventDefault();

            
            this.setCoords( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
        }
    }
}

export default new Mouse();
