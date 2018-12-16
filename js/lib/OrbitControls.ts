// This is the OrbitControls.js from the examples converted to typescript
//
// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move
import * as THREE from "three";

export class OrbitControls extends THREE.EventDispatcher {

    // Set to false to disable this control
    public enabled = true;

    // "target" sets the location of focus, where the object orbits around
    public target = new THREE.Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    public minDistance = 0;
    public maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    public minZoom = 0;
    public maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    public minPolarAngle = 0; // radians
    public maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    public minAzimuthAngle = - Infinity; // radians
    public maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    public enableDamping = false;
    public dampingFactor = 0.25;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    public enableZoom = true;
    public zoomSpeed = 1.0;

    // Set to false to disable rotating
    public enableRotate = true;
    public rotateSpeed = 1.0;

    // Set to false to disable panning
    public enablePan = true;
    public panSpeed = 1.0;
    public screenSpacePanning = false; // if true, pan in screen-space
    public keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    public autoRotate = false;
    public autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    public enableKeys = true;

    // The four arrow keys
    public keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    public mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };

    public target0;
    public position0;
    public zoom0;

    //
    // internals
    //

    private scope = this;

    private changeEvent = { type: 'change' };
    private startEvent = { type: 'start' };
    private endEvent = { type: 'end' };

    private STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };

    private state = this.STATE.NONE;

    private EPS = 0.000001;

    // current position in spherical coordinates
    private spherical = new THREE.Spherical();
    private sphericalDelta = new THREE.Spherical();

    private scale = 1;
    private panOffset = new THREE.Vector3();
    private zoomChanged = false;

    private rotateStart = new THREE.Vector2();
    private rotateEnd = new THREE.Vector2();
    private rotateDelta = new THREE.Vector2();

    private panStart = new THREE.Vector2();
    private panEnd = new THREE.Vector2();
    private panDelta = new THREE.Vector2();

    private dollyStart = new THREE.Vector2();
    private dollyEnd = new THREE.Vector2();
    private dollyDelta = new THREE.Vector2();

    constructor( private object: THREE.Camera, private domElement: HTMLCanvasElement = <any>document) {
        super()
        // for reset
        this.zoom0 = this.object.zoom;
        this.position0 = this.object.position.clone();
        this.target0 = this.target.clone();
        //

        this.domElement.addEventListener( 'contextmenu', this.onContextMenu, false );

        this.domElement.addEventListener( 'mousedown', this.onMouseDown, false );
        this.domElement.addEventListener( 'wheel', this.onMouseWheel, false );

        this.domElement.addEventListener( 'touchstart', this.onTouchStart, false );
        this.domElement.addEventListener( 'touchend', this.onTouchEnd, false );
        this.domElement.addEventListener( 'touchmove', this.onTouchMove, false );

        window.addEventListener( 'keydown', this.onKeyDown, false );

        // force an update at start

        this.update();

    }

    //
    // public methods
    //

    public getPolarAngle() {
        return this.spherical.phi;
    }

    public getAzimuthalAngle() {
        return this.spherical.theta;
    }

    public saveState() {

        this.scope.target0.copy( this.scope.target );
        this.scope.position0.copy( this.scope.object.position );
        this.scope.zoom0 = this.scope.object.zoom;

    };

    public reset() {

        this.scope.target.copy( this.scope.target0 );
        this.scope.object.position.copy( this.scope.position0 );
        this.scope.object.zoom = this.scope.zoom0;

        this.scope.object.updateProjectionMatrix();
        this.scope.dispatchEvent( this.changeEvent );

        this.scope.update();

        this.state = this.STATE.NONE;

    };

    // this method is exposed, but perhaps it would be better if we can make it private...
    public update = (() => {
        var offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors( this.object.up, new THREE.Vector3( 0, 1, 0 ) );
        var quatInverse = quat.clone().inverse();

        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();

        var self = this;

        return function() {
            var position = self.scope.object.position;

            offset.copy( position ).sub( self.scope.target );

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion( quat );

            // angle from z-axis around y-axis
            self.spherical.setFromVector3( offset );

            if ( self.scope.autoRotate && self.state === self.STATE.NONE ) {
                self.rotateLeft( self.getAutoRotationAngle() );
            }

            self.spherical.theta += self.sphericalDelta.theta;
            self.spherical.phi += self.sphericalDelta.phi;

            // restrict theta to be between desired limits
            self.spherical.theta = Math.max( self.scope.minAzimuthAngle, Math.min( self.scope.maxAzimuthAngle, self.spherical.theta ) );

            // restrict phi to be between desired limits
            self.spherical.phi = Math.max( self.scope.minPolarAngle, Math.min( self.scope.maxPolarAngle, self.spherical.phi ) );

            self.spherical.makeSafe();

            self.spherical.radius *= self.scale;

            // restrict radius to be between desired limits
            self.spherical.radius = Math.max( self.scope.minDistance, Math.min( self.scope.maxDistance, self.spherical.radius ) );

            // move target to panned location
            self.scope.target.add( self.panOffset );

            offset.setFromSpherical( self.spherical );

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion( quatInverse );

            position.copy( self.scope.target ).add( offset );

            self.scope.object.lookAt( self.scope.target );

            if ( self.scope.enableDamping === true ) {
                self.sphericalDelta.theta *= ( 1 - self.scope.dampingFactor );
                self.sphericalDelta.phi *= ( 1 - self.scope.dampingFactor );

                self.panOffset.multiplyScalar( 1 - self.scope.dampingFactor );
            } else {
                self.sphericalDelta.set( 0, 0, 0 );

                self.panOffset.set( 0, 0, 0 );
            }

            self.scale = 1;

            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8

            if (
                self.zoomChanged ||
                lastPosition.distanceToSquared( self.scope.object.position ) > self.EPS ||
                8 * ( 1 - lastQuaternion.dot( self.scope.object.quaternion ) ) > self.EPS
            ) {
                self.scope.dispatchEvent( self.changeEvent );

                lastPosition.copy( self.scope.object.position );
                lastQuaternion.copy( self.scope.object.quaternion );
                self.zoomChanged = false;

                return true;
            }

            return false;
        };
    })()

    public dispose() {
        this.scope.domElement.removeEventListener( 'contextmenu', this.onContextMenu, false );
        this.scope.domElement.removeEventListener( 'mousedown', this.onMouseDown, false );
        this.scope.domElement.removeEventListener( 'wheel', this.onMouseWheel, false );

        this.scope.domElement.removeEventListener( 'touchstart', this.onTouchStart, false );
        this.scope.domElement.removeEventListener( 'touchend', this.onTouchEnd, false );
        this.scope.domElement.removeEventListener( 'touchmove', this.onTouchMove, false );

        document.removeEventListener( 'mousemove', this.onMouseMove, false );
        document.removeEventListener( 'mouseup', this.onMouseUp, false );

        window.removeEventListener( 'keydown', this.onKeyDown, false );

        //this.scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    };


    public getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.scope.autoRotateSpeed;
    }

    public getZoomScale() {
        return Math.pow( 0.95, this.scope.zoomSpeed );
    }

    public rotateLeft( angle ) {
        this.sphericalDelta.theta -= angle;
    }

    public rotateUp( angle ) {
        this.sphericalDelta.phi -= angle;
    }

    public panLeft = (() => {
        var v = new THREE.Vector3();
        var self = this;

        return function( distance, objectMatrix ) {
            v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
            v.multiplyScalar( - distance );

            self.panOffset.add( v );
        };
    })()

    public panUp = (() => {
        var v = new THREE.Vector3();
        var self = this;

        return function( distance, objectMatrix ) {

            if ( self.scope.screenSpacePanning === true ) {
                v.setFromMatrixColumn( objectMatrix, 1 );
            } else {
                v.setFromMatrixColumn( objectMatrix, 0 );
                v.crossVectors( self.scope.object.up, v );
            }

            v.multiplyScalar( distance );

            self.panOffset.add( v );
        };
    })()

    // deltaX and deltaY are in pixels; right and down are positive
    public pan  = (() => {
        var offset = new THREE.Vector3();
        var self = this;

        return function( deltaX, deltaY ) {

            var element = self.domElement === document ? self.domElement.body : self.domElement;

            if ( self.object.isPerspectiveCamera ) {
                // perspective
                var position = self.object.position;
                offset.copy( position ).sub( self.target );
                var targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan( ( self.object.fov / 2 ) * Math.PI / 180.0 );

                // we use only clientHeight here so aspect ratio does not distort speed
                self.panLeft( 2 * deltaX * targetDistance / element.clientHeight, self.object.matrix );
                self.panUp( 2 * deltaY * targetDistance / element.clientHeight, self.object.matrix );
            } else if ( self.object.isOrthographicCamera ) {
                // orthographic
                self.panLeft( deltaX * ( self.object.right - self.object.left ) / self.object.zoom / element.clientWidth, self.object.matrix );
                self.panUp( deltaY * ( self.object.top - self.object.bottom ) / self.object.zoom / element.clientHeight, self.object.matrix );
            } else {
                // camera neither orthographic nor perspective
                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
                self.enablePan = false;
            }
        };
    })()


    public dollyIn( dollyScale ) {

        if ( this.scope.object.isPerspectiveCamera ) {

            this.scale /= dollyScale;

        } else if ( this.scope.object.isOrthographicCamera ) {

            this.scope.object.zoom = Math.max( this.scope.minZoom, Math.min( this.scope.maxZoom, this.scope.object.zoom * dollyScale ) );
            this.scope.object.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
            this.scope.enableZoom = false;

        }

    }

    public dollyOut( dollyScale ) {

        if ( this.scope.object.isPerspectiveCamera ) {

            this.scale *= dollyScale;

        } else if ( this.scope.object.isOrthographicCamera ) {

            this.scope.object.zoom = Math.max( this.scope.minZoom, Math.min( this.scope.maxZoom, this.scope.object.zoom / dollyScale ) );
            this.scope.object.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
            this.scope.enableZoom = false;

        }
    }

    //
    // event callbacks - update the object state
    //

    public handleMouseDownRotate( event ) {
        // console.log( 'handleMouseDownRotate' );
        this.rotateStart.set( event.clientX, event.clientY );
    }

    public handleMouseDownDolly( event ) {
        // console.log( 'handleMouseDownDolly' );
        this.dollyStart.set( event.clientX, event.clientY );
    }

    public handleMouseDownPan( event ) {
        // console.log( 'handleMouseDownPan' );
        this.panStart.set( event.clientX, event.clientY );
    }

    public handleMouseMoveRotate( event ) {
        console.log( 'handleMouseMoveRotate' );

        this.rotateEnd.set( event.clientX, event.clientY );

        this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart ).multiplyScalar( this.scope.rotateSpeed );

        var element = this.scope.domElement === document ? this.scope.domElement.body : this.scope.domElement;

        this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientHeight ); // yes, height

        this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight );

        this.rotateStart.copy( this.rotateEnd );

        this.scope.update();
    }

    public handleMouseMoveDolly( event ) {
        console.log( 'handleMouseMoveDolly' );

        this.dollyEnd.set( event.clientX, event.clientY );

        this.dollyDelta.subVectors( this.dollyEnd, this.dollyStart );

        if ( this.dollyDelta.y > 0 ) {
            this.dollyIn( this.getZoomScale() );
        } else if ( this.dollyDelta.y < 0 ) {
            this.dollyOut( this.getZoomScale() );
        }

        this.dollyStart.copy( this.dollyEnd );

        this.scope.update();
    }

    public handleMouseMovePan( event ) {
        console.log( 'handleMouseMovePan' );

        this.panEnd.set( event.clientX, event.clientY );

        this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.scope.panSpeed );

        this.pan( this.panDelta.x, this.panDelta.y );

        this.panStart.copy( this.panEnd );

        this.scope.update();
    }

    public handleMouseUp( event ) {
        // console.log( 'handleMouseUp' );
    }

    public handleMouseWheel( event ) {
        // console.log( 'handleMouseWheel' );

        if ( event.deltaY < 0 ) {
            this.dollyOut( this.getZoomScale() );
        } else if ( event.deltaY > 0 ) {
            this.dollyIn( this.getZoomScale() );
        }

        this.scope.update();
    }

    public handleKeyDown( event ) {
        //console.log( 'handleKeyDown' );

        switch ( event.keyCode ) {
            case this.scope.keys.UP:
                this.pan( 0, this.scope.keyPanSpeed );
                this.scope.update();
                break;

            case this.scope.keys.BOTTOM:
                this.pan( 0, - this.scope.keyPanSpeed );
                this.scope.update();
                break;

            case this.scope.keys.LEFT:
                this.pan( this.scope.keyPanSpeed, 0 );
                this.scope.update();
                break;

            case this.scope.keys.RIGHT:
                this.pan( - this.scope.keyPanSpeed, 0 );
                this.scope.update();
                break;

        }
    }

    public handleTouchStartRotate( event ) {
        //console.log( 'handleTouchStartRotate' );

        this.rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    }

    public handleTouchStartDollyPan( event ) {
        //console.log( 'handleTouchStartDollyPan' );

        if ( this.scope.enableZoom ) {
            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

            var distance = Math.sqrt( dx * dx + dy * dy );

            this.dollyStart.set( 0, distance );
        }

        if ( this.scope.enablePan ) {
            var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
            var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );

            this.panStart.set( x, y );
        }
    }

    public handleTouchMoveRotate( event ) {
        //console.log( 'handleTouchMoveRotate' );

        this.rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

        this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart ).multiplyScalar( this.scope.rotateSpeed );

        var element = this.scope.domElement === document ? this.scope.domElement.body : this.scope.domElement;

        this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientHeight ); // yes, height

        this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight );

        this.rotateStart.copy( this.rotateEnd );

        this.scope.update();
    }

    public handleTouchMoveDollyPan( event ) {
        //console.log( 'handleTouchMoveDollyPan' );

        if ( this.scope.enableZoom ) {
            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

            var distance = Math.sqrt( dx * dx + dy * dy );

            this.dollyEnd.set( 0, distance );

            this.dollyDelta.set( 0, Math.pow( this.dollyEnd.y / this.dollyStart.y, this.scope.zoomSpeed ) );

            this.dollyIn( this.dollyDelta.y );

            this.dollyStart.copy( this.dollyEnd );
        }

        if ( this.scope.enablePan ) {
            var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
            var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );

            this.panEnd.set( x, y );

            this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.scope.panSpeed );

            this.pan( this.panDelta.x, this.panDelta.y );

            this.panStart.copy( this.panEnd );
        }

        this.scope.update();
    }

    public handleTouchEnd( event ) {
        //console.log( 'handleTouchEnd' );
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    public onMouseDown = (() => {
        var self = this;
        return function ( event ) {
            if ( self.enabled === false ) return;

            event.preventDefault();

            switch ( event.button ) {
                case self.mouseButtons.LEFT:
                    if ( event.ctrlKey || event.metaKey || event.shiftKey ) {
                        if ( self.enablePan === false ) return;

                        self.handleMouseDownPan( event );

                        self.state = self.STATE.PAN;

                    } else {
                        if ( self.enableRotate === false ) return;

                        self.handleMouseDownRotate( event );

                        self.state = self.STATE.ROTATE;
                    }

                    break;

                case self.mouseButtons.MIDDLE:
                    if ( self.enableZoom === false ) return;

                    self.handleMouseDownDolly( event );

                    self.state = self.STATE.DOLLY;

                    break;

                case self.mouseButtons.RIGHT:
                    if ( self.enablePan === false ) return;

                    self.handleMouseDownPan( event );

                    self.state = self.STATE.PAN;

                    break;

            }

            if ( self.state !== self.STATE.NONE ) {
                document.addEventListener( 'mousemove', self.onMouseMove, false );
                document.addEventListener( 'mouseup', self.onMouseUp, false );

                self.dispatchEvent( self.startEvent );
            }
        }
    })()

    public onMouseMove = (() => {
        var self = this;
        return function( event ) {
            if ( self.enabled === false ) return;

            event.preventDefault();

            switch ( self.state ) {

                case self.STATE.ROTATE:
                    if ( self.enableRotate === false ) return;

                    self.handleMouseMoveRotate( event );

                    break;

                case self.STATE.DOLLY:
                    if ( self.enableZoom === false ) return;

                    self.handleMouseMoveDolly( event );

                    break;

                case self.STATE.PAN:

                    if ( self.enablePan === false ) return;

                    self.handleMouseMovePan( event );

                    break;
            }
        }
    })()

    public onMouseUp = (()=> {
        var self = this;
        return ( event ) => {
            if ( self.enabled === false ) return;

            self.handleMouseUp( event );

            document.removeEventListener( 'mousemove', self.onMouseMove, false );
            document.removeEventListener( 'mouseup', self.onMouseUp, false );

            self.dispatchEvent( self.endEvent );

            self.state = self.STATE.NONE;
        }
    })()

    public onMouseWheel = (() => {
        var self = this;
        return function( event ) {
            if ( self.scope.enabled === false || self.scope.enableZoom === false || ( self.state !== self.STATE.NONE && self.state !== self.STATE.ROTATE ) ) return;

            event.preventDefault();
            event.stopPropagation();

            self.scope.dispatchEvent( self.startEvent );

            self.handleMouseWheel( event );

            self.scope.dispatchEvent( self.endEvent );
        }
    })()

    public onKeyDown = (() => {
        var self = this;
        return ( event ) => {
            if ( self.scope.enabled === false || self.scope.enableKeys === false || self.scope.enablePan === false ) return;

            self.handleKeyDown( event );
        }
    })()

    public onTouchStart = (() => {
        var self = this;
        return ( event ) => {
            if ( self.scope.enabled === false ) return;

            event.preventDefault();

            switch ( event.touches.length ) {

                case 1:	// one-fingered touch: rotate

                    if ( self.scope.enableRotate === false ) return;

                    self.handleTouchStartRotate( event );

                    self.state = self.STATE.TOUCH_ROTATE;

                    break;

                case 2:	// two-fingered touch: dolly-pan

                    if ( self.scope.enableZoom === false && self.scope.enablePan === false ) return;

                    self.handleTouchStartDollyPan( event );

                    self.state = self.STATE.TOUCH_DOLLY_PAN;

                    break;

                default:

                    self.state = self.STATE.NONE;

            }

            if ( self.state !== self.STATE.NONE ) {

                self.scope.dispatchEvent( self.startEvent );

            }

        }
    })()

    public onTouchMove = (() => {
        var self = this;
        return ( event ) => {
            if ( self.scope.enabled === false ) return;

            event.preventDefault();
            event.stopPropagation();

            switch ( event.touches.length ) {

                case 1: // one-fingered touch: rotate

                    if ( self.scope.enableRotate === false ) return;
                    if ( self.state !== self.STATE.TOUCH_ROTATE ) return; // is this needed?

                    self.handleTouchMoveRotate( event );

                    break;

                case 2: // two-fingered touch: dolly-pan

                    if ( self.scope.enableZoom === false && self.scope.enablePan === false ) return;
                    if ( self.state !== self.STATE.TOUCH_DOLLY_PAN ) return; // is this needed?

                    self.handleTouchMoveDollyPan( event );

                    break;

                default:

                    self.state = self.STATE.NONE;

            }

        }
    })()

    public onTouchEnd = (() => {
        var self = this;
        return ( event ) => {
            if ( self.scope.enabled === false ) return;

            self.handleTouchEnd( event );

            self.scope.dispatchEvent( self.endEvent );

            self.state = self.STATE.NONE;

        }
    })()

    public onContextMenu = (() => {
        var self = this;
        return ( event ) => {
            if ( self.scope.enabled === false ) return;

            event.preventDefault();
        }
    })()

}