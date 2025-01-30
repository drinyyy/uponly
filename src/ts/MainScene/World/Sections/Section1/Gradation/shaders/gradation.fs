uniform float time;
varying vec2 vUv;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )
#pragma glslify: random = require('./random.glsl' )

void main( void ) {
	
	vec3 color = hsv2rgb(vec3( 
    0.28 + 0.05 * sin(time) - vUv.x * 0.2 + random(gl_FragCoord.xy * 0.01) * 0.01, 
    1.0, 
    0.1 
));
	gl_FragColor = vec4( color, 1.0 );

}