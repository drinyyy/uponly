import * as THREE from 'three';
import * as ORE from 'ore-three';

import { GlobalManager } from './GlobalManager';
import { RenderPipeline } from './RenderPipeline';
import { CameraController } from './CameraController';
import { World } from './World';
import { Scroller } from './Scroller';

import { Header } from './Header';
import { Footer } from './Footer';
import { Loading } from './Loading';

import { Lethargy } from 'lethargy';
import { Scroll } from './Scroll';

export class MainScene extends ORE.BaseLayer {

	private gManager?: GlobalManager;
	private animator?: ORE.Animator;
	private renderPipeline?: RenderPipeline;
	private cameraController?: CameraController;
	private scroller: Scroller;

	// content

	private world?: World;

	private header: Header;
	private footer: Footer;
	private loading: Loading;

	// wheel

	private lethargy: any;
	private memDelta: number = 0.0;
	private riseDelta: boolean = false;

	// wrapper

	private contentWrapperElm: HTMLElement;

	// scroll

	private scroll: Scroll;

	// state

	private raycasterWorldPos: THREE.Vector3 = new THREE.Vector3();

	constructor( param: ORE.LayerParam ) {

		super( param );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			uTimeMod: {
				value: 0
			}
		} );

		/*-------------------------------
			ContentWrapper
		-------------------------------*/

		this.contentWrapperElm = document.querySelector( '.content-wrapper' )!;

		/*-------------------------------
			Scroller
		-------------------------------*/

		this.scroller = new Scroller();

		this.scroller.addListener( 'changeSelectingSection', ( sectionIndex: number ) => {

			if ( this.world ) {

				let section = this.world.changeSection( sectionIndex );

			

				if ( this.cameraController ) this.cameraController.changeRange( section.cameraRange );

				if ( this.renderPipeline ) this.renderPipeline.updateParam( section.ppParam );

				if ( this.animator ) this.animator.animate( 'trailCursorDepth', section.trailDepth );

				this.footer.changeTimelineSection( sectionIndex + 1 );

				document.body.setAttribute( 'data-section', ( sectionIndex + 1 ).toString() );

				window.gManager.emitEvent( 'sectionChange', [ section.sectionName ] );

			}

			if ( sectionIndex > 0 ) {

				this.scroll.switchVisible( false );

			}


		} );

		this.lethargy = new Lethargy();

		//  scroll button

		this.scroll = new Scroll();

		this.scroll.addListener( 'click', () => {

			this.scroll.switchVisible( false );
			this.scroller.move( 1 );

		} );

		/*-------------------------------
			Subtitles
		-------------------------------*/


		/*-------------------------------
			Header
		-------------------------------*/

		this.header = new Header();

		/*-------------------------------
			Footer
		-------------------------------*/

		this.footer = new Footer();

		this.footer.addListener( 'clickTimeline', ( section: number ) => {

			this.scroller.move( section - 1.0, 2.0 );

		} );

		/*-------------------------------
			Loading
		-------------------------------*/

		this.loading = new Loading();

	}

	onBind() {

		super.onBind( );

		this.gManager = new GlobalManager();

		this.gManager.assetManager.load( { assets: [
			{ name: 'commonScene', path: './assets/scene/common.glb', type: "gltf", timing: 'must' },
			{ name: 'logo', path: './assets/textures/junni_logo.png', type: 'tex', timing: 'must' },
			{ name: 'sec2BGText', path: './assets/textures/sec2-bg-text.png', type: 'tex', timing: 'must', onLoad( value: THREE.Texture ) {

				value.wrapS = THREE.RepeatWrapping;
				value.wrapT = THREE.RepeatWrapping;

			} },
			{ name: 'introText', path: './assets/textures/intro-text.png', type: 'tex', timing: 'must' },
			{ name: 'topLogo', path: './assets/textures/top_logo.png', type: 'tex', timing: 'must' },
			{ name: 'matCap', path: './assets/textures/matcap.png', type: 'tex', timing: 'must' },
			{ name: 'matCapOrange', path: './assets/textures/matcap_orange.png', type: 'tex', timing: 'must' },
			{ name: 'noise', path: './assets/textures/noise.png', type: 'tex', timing: 'sub', onLoad( value: THREE.Texture ) {

				value.wrapS = THREE.RepeatWrapping;
				value.wrapT = THREE.RepeatWrapping;

			}, },
			{ name: 'display', path: './assets/textures/display.png', type: 'tex', timing: 'sub' },
			{ name: 'human', path: './assets/textures/humans/human.png', type: 'tex', timing: 'sub' },
			{ name: 'outro', path: './assets/textures/outro-text.png', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;

			} },
			{ name: 'lensDirt', path: './assets/textures/lens-dirt.png', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;

			} },
			{ name: 'groundIllust', path: './assets/textures/illust.jpg', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			} },
			{ name: 'groundGrid', path: './assets/textures/grid.jpg', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			} },
			{ name: 'random', path: './assets/textures/random.png', type: 'tex', timing: 'sub', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				tex.minFilter = THREE.NearestFilter;
				tex.magFilter = THREE.NearestFilter;

			} },
			{ name: 'signpen', path: './assets/textures/signpen.png', type: 'tex', timing: 'sub' },
			{ name: 'sec3Particle', path: './assets/textures/pattern.jpg', type: 'tex', timing: 'sub' },
		] } );

		this.gManager.assetManager.addEventListener( 'loadMustAssets', ( e ) => {

			let gltf = window.gManager.assetManager.getGltf( 'commonScene' );

			if ( gltf ) {

				this.scene.add( gltf.scene );

			}

			this.initScene();

			this.onResize();


		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = this.gManager.animator;

		this.animator.add( {
			name: 'trailCursorDepth',
			initValue: 0.97
		} );

		/*-------------------------------
			CameraController
		-------------------------------*/

		this.cameraController = new CameraController( this.camera );
		window.cameraController = this.cameraController;

		/*-------------------------------
			Raycaster
		-------------------------------*/

		this.gManager.eRay.addEventListener( 'hover', ( e ) => {

			this.raycasterWorldPos.copy( e.intersection.point );

		} );

	}

	private initScene() {

		/*-------------------------------
			RenderPipeline
		-------------------------------*/

		if ( this.renderer ) {	

			this.renderer.shadowMap.enabled = true;
			
			this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

		}

		/*-------------------------------
			World
		-------------------------------*/

		if ( this.renderer ) {

			this.world = new World( this.renderer, this.scene, this.commonUniforms );
			this.scene.add( this.world );

			this.world.changeSection( 0 );
			this.world.addEventListener( 'load', () => {

				this.loading.switchVisibility( false );

			} );

			this.world.intro.addListener( 'showImaging', () => {

				this.header.switchLogoVisibility( true );

			} );

			this.world.intro.addListener( 'finish', () => {

				this.splash();

			} );

			this.scroller.changeSectionNum( this.world.sections.length );

		}

	}

	public animate( deltaTime: number ) {

		deltaTime = Math.min( 0.1, deltaTime );

		this.commonUniforms.uTimeMod.value = this.time % 1;

		this.scroller.update( deltaTime );

		if ( this.gManager ) {

			this.gManager.update( deltaTime );

		}

		if ( this.cameraController ) {

			this.cameraController.update( deltaTime );

		}

		if ( this.world ) {

			let transform = this.world.updateTransform( this.scroller.value );

			this.world.update( deltaTime );

			if ( this.cameraController ) {

				this.cameraController.updateTransform( transform.cameraTransform );

			}

		}

		if ( this.renderPipeline ) {

			if ( this.world && ! this.world.intro.finished ) {

				this.renderPipeline.render( this.world.intro.scene, this.world.intro.camera );
				return;

			}

			this.renderPipeline.render( this.scene, this.camera );

		}

	}

	public onResize() {

		this.contentWrapperElm.style.height = window.innerHeight + 'px';

		super.onResize();

		if ( this.cameraController ) {

			this.cameraController.resize( this.info );

		}

		if ( this.renderPipeline ) {

			this.renderPipeline.resize( this.info );

		}

		if ( this.world ) {

			this.world.resize( this.info );

		}

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( args.position.x != args.position.x ) return;

		if ( this.gManager ) {

			this.gManager.eRay.update( args.screenPosition, this.camera );

		}

		if ( this.cameraController ) {

			this.cameraController.updateCursor( args.screenPosition );

		}

		if ( this.world ) {

			let depth = 0.97;

			if ( this.animator ) depth = this.animator.get( 'trailCursorDepth' )!;

			let cursorWorldPos = new THREE.Vector3( args.screenPosition.x, args.screenPosition.y, depth ).unproject( this.camera );

			if ( cursorWorldPos.x != cursorWorldPos.x ) return;

			this.world.intro.hover( args );
			this.world.section1.hover( args, this.camera );
			this.world.section2.hover( args, this.camera );
			this.world.section3.hover( args );

			if ( this.world.trail ) this.world.trail.updateCursorPos( cursorWorldPos, this.raycasterWorldPos );

		}

	}

	private optimizedWheel( event: WheelEvent ) {

		if ( this.world && this.world.splashed ) {

			this.scroller.addVelocity( event.deltaY * 0.00005 );
			this.world.section6.wheel( event );

		}

	}

	public onWheel( event: WheelEvent ): void {

		if ( this.lethargy.check( event ) !== false ) {

			this.optimizedWheel( event );

		} else {

			let d = event.deltaY - this.memDelta;

			if ( Math.abs( d ) > 50 ) {

				this.memDelta = d;
				this.optimizedWheel( event );
				this.riseDelta = true;

			} else if ( d == 0 ) {

				if ( this.riseDelta ) {

					this.optimizedWheel( event );

				}

			} else if ( d < 0 ) {

				this.riseDelta = false;

			}


			this.memDelta = ( event.deltaY );

		}

	}

	public onTouchStart( args: ORE.TouchEventArgs ) {

		if ( this.world && this.world.splashed ) {

			this.scroller.catch();

		}

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

		if ( this.world && this.world.splashed ) {

			this.scroller.drag( args.delta.y );

		}

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

		if ( this.world && this.world.splashed ) {

			this.scroller.release( args.delta.y * 2.0 );

		}

	}

	private splash() {

		if ( this.world ) {

			this.world.splash( this.camera );

		}

		this.showHeaderFooter();

		setTimeout( () => {

			this.scroll.switchVisible( true );

		}, 1000 );

	}

	private showHeaderFooter() {

		this.header.switchLogoVisibility( true );
		this.footer.switchCopyVisibility( true );
		this.footer.switchTimelineVisibility( true );

	}


}
