import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Displays } from './Displays';
import { Lights } from './Lights';

export class Section3 extends Section {

	private displays?: Displays;
	private lights?: Lights;
	private directionLightList: THREE.DirectionalLight[] = [];

	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_3', ORE.UniformsLib.mergeUniforms( parentUniforms, {
			uEnvMap: {
				value: null
			}
		} ) );

		// params

		this.elm = document.querySelector( '.section3' ) as HTMLElement;

		this.ppParam.bloomBrightness = 1.0;

		// light

		let light = new THREE.DirectionalLight();
		light.position.set( 0.5, 0.0, - 0.9 );
		this.add( light );

		this.directionLightList.push( light );

		light = new THREE.DirectionalLight();
		light.position.set( - 1.5, 0.3, - 1 );
		this.add( light );

		this.directionLightList.push( light );

		/*-------------------------------
			EnvMap
		-------------------------------*/

		let cubemapLoader = new THREE.CubeTextureLoader();
		cubemapLoader.load( [
			'/assets/envmap/sec2/px.png',
			'/assets/envmap/sec2/nx.png',
			'/assets/envmap/sec2/py.png',
			'/assets/envmap/sec2/ny.png',
			'/assets/envmap/sec2/pz.png',
			'/assets/envmap/sec2/nz.png',
		], ( tex ) => {

			this.commonUniforms.uEnvMap.value = tex;

		} );

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		this.add( gltf.scene );

		/*-------------------------------
			Displays
		-------------------------------*/

		this.displays = new Displays( this.getObjectByName( 'Displays' ) as THREE.Object3D, this.commonUniforms );

		/*-------------------------------
			Lights
		-------------------------------*/

		this.lights = new Lights( this.getObjectByName( 'Lights' ) as THREE.Object3D, this.commonUniforms );

	}

	public update( deltaTime: number ) {

		super.update( deltaTime );

		if ( this.animator.isAnimatingVariable( 'sectionVisibility' + this.sectionName ) ) {

			let intensity = this.animator.get<number>( 'sectionVisibility' + this.sectionName ) || 0;

			for ( let i = 0; i < this.directionLightList.length; i ++ ) {

				this.directionLightList[ i ].intensity = 0;

			}

			if ( this.lights ) {

				this.lights.setIntensity( intensity );

			}

		}

	}

	public resize( info: ORE.LayerInfo ) {

		super.resize( info );

	}

}
