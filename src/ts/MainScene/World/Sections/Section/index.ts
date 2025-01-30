import * as THREE from 'three';
import * as ORE from 'ore-three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CameraTransform } from '../../../CameraController';
import { LayerInfo } from 'ore-three';
import { PPParam } from '../../../RenderPipeline';
import { BakuMaterialType } from '../../Baku';


export type BakuTransform = {
	position: THREE.Vector3;
	rotation: THREE.Quaternion;
	scale: THREE.Vector3;
}

export type LightData = {
	position: THREE.Vector3;
	targetPosition: THREE.Vector3;
	intensity: number
}

export type Light3Data = {
	
	intensity: number
}

export type ViewingState = 'ready' | 'viewing' | 'passed'

export class Section extends THREE.Object3D {

	public sectionName: string;

	protected commonUniforms: ORE.Uniforms;

	protected elm: HTMLElement | null = null;

	// animation

	protected animator: ORE.Animator;
	protected animationMixer?: THREE.AnimationMixer;
	protected animationList?: THREE.AnimationClip[];
	protected animationActionList: THREE.AnimationAction[] = [];

	// manager

	protected manager: THREE.LoadingManager;

	// light datas

	public light1Data?: LightData;
	public light2Data?: LightData;
	public light3Data?: Light3Data;
	// transforms

	public cameraTransform: CameraTransform = {
		position: new THREE.Vector3(),
		targetPosition: new THREE.Vector3(),
		fov: 50,
		fovCalculated: 50,
	};

	public bakuTransform: BakuTransform = {
		position: new THREE.Vector3(),
		rotation: new THREE.Quaternion(),
		scale: new THREE.Vector3( 1, 1, 1 )
	};

	// state

	public sectionVisibility: boolean = false;
	protected viewing: ViewingState = 'ready';
	public trailDepth = 0.97;

	// pp param

	public ppParam: PPParam = {
		bloomBrightness: 0,
		vignet: 0,
	};

	// baku material

	public bakuParam: {
		materialType: BakuMaterialType,
		rotateSpeed: number
	} = {
			materialType: 'normal',
			rotateSpeed: 0
			
		};

	// camera weight

	public cameraSPFovWeight: number = 30;
	public cameraRange: THREE.Vector2 = new THREE.Vector2( 0.1, 0.1 );

	constructor( manager: THREE.LoadingManager, sectionName: string, parentUniforms: ORE.Uniforms ) {

		super();

		this.sectionName = sectionName;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.sectionVisibility = false;

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uSectionViewing = this.animator.add( {
			name: 'sectionViewing' + this.sectionName,
			initValue: 0,
			// userData: {
			// 	pane: {
			// 		min: 0,
			// 		max: 2
			// 	}
			// }
		} );

		this.commonUniforms.uSectionVisibility = this.animator.add( {
			name: 'sectionVisibility' + this.sectionName,
			initValue: 0,
			// userData: {
			// 	pane: {
			// 		min: 0,
			// 		max: 1
			// 	}
			// }
		} );

		/*-------------------------------
			Load
		-------------------------------*/

		this.manager = manager;

		this.loadGLTF( this.sectionName );

	}

	protected loadGLTF( gltfName: string ) {

		let loader = new GLTFLoader( this.manager );

		loader.load( './assets/scene/' + gltfName + '.glb', ( gltf ) => {

			// camera transform

			let camera = gltf.scene.getObjectByName( 'Camera' ) as THREE.PerspectiveCamera;

			if ( ! camera.isPerspectiveCamera ) {

				let camera_ = camera.children[ 0 ] as THREE.PerspectiveCamera;
				camera_.position.copy( camera.position );
				camera_.rotation.copy( camera.rotation );
				camera_.scale.copy( camera.scale );

				if ( camera.parent ) {

					camera.parent.add( camera_ );

				}

				camera = camera_;

			}

			if ( camera ) {

				this.cameraTransform.position.copy( camera.position );
				this.cameraTransform.fov = camera.fov;

			}

			let target = gltf.scene.getObjectByName( 'CameraTarget' );

			if ( target ) {

				this.cameraTransform.targetPosition.copy( target.position );

			}


			// baku transform

			let baku = gltf.scene.getObjectByName( 'Baku' ) as THREE.Object3D;

			if ( baku ) {

				this.bakuTransform.position.copy( baku.position );
				this.bakuTransform.rotation.copy( baku.quaternion );
				this.bakuTransform.scale.copy( baku.scale );

			}

			// animations

			this.animationMixer = new THREE.AnimationMixer( gltf.scene );
			this.animations = gltf.animations;

			for ( let i = 0; i < this.animations.length; i ++ ) {

				this.animationActionList.push( this.animationMixer.clipAction( this.animations[ i ] ) );

			}

			this.onLoadedGLTF( gltf );

			// emitevent

			this.dispatchEvent( { type: 'loaded' } );

		} );

	}

	protected onLoadedGLTF( gltf: GLTF ) {
	}

	public switchViewingState( viewing: ViewingState ) {

		this.viewing = viewing;
		this.sectionVisibility = viewing == 'viewing';

		if ( viewing == 'ready' ) {

			this.animator.animate( 'sectionViewing' + this.sectionName, 0 );

		} else if ( viewing == 'viewing' ) {

			this.animator.animate( 'sectionViewing' + this.sectionName, 1 );

		} else if ( viewing == 'passed' ) {

			this.animator.animate( 'sectionViewing' + this.sectionName, 2 );

		}

		if ( this.sectionVisibility ) {

			// this.visible = true;

		}

		this.animator.animate( 'sectionVisibility' + this.sectionName, this.sectionVisibility ? 1 : 0, 1, () => {

			if ( ! this.sectionVisibility ) {

				// this.visible = false;

			}

		} );

		if ( this.elm ) {

			this.elm.setAttribute( 'data-visible', viewing == 'viewing' ? 'true' : 'false' );

		}

	}

	public update( deltaTime: number ) {
	}

	public resize( info: LayerInfo ) {

		this.cameraTransform.fovCalculated = this.cameraTransform.fov + this.cameraSPFovWeight * info.size.portraitWeight;

	}

}
