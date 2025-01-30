uniform float time;
varying vec2 vUv;
varying vec3 vPos;

void main() {
    // Define your colors
    vec3 color2 = vec3(0.318, 0.51, 0.251);
vec3 color3 = vec3(0.471,0.769,0.475);
vec3 color4 = vec3(0.224,0.369,0.239); 
vec3 color1 = vec3(0.404,0.525,0.361);   
vec3 color6 = vec3(0.761,0.804,0.749);  
vec3 color5 = vec3(0.227,0.247,0.161);   


    // Create position-based transition similar to your original
    float t = (sin(time) * 0.5 + 0.5) * 2.0;  // creates value from 0 to 5
    t = mod(t, 6.0); // Make it cycle through 6 colors
    int index = int(t);
    float blend = fract(t);

    // Select colors based on position and time
    vec3 currentColor, nextColor;
    if(index == 0) { currentColor = color1; nextColor = color2; }
    else if(index == 1) { currentColor = color2; nextColor = color3; }
    else if(index == 2) { currentColor = color3; nextColor = color4; }
    else if(index == 3) { currentColor = color4; nextColor = color5; }
    else if(index == 4) { currentColor = color5; nextColor = color6; }
    else { currentColor = color6; nextColor = color1; }

    vec3 color = mix(currentColor, nextColor, blend);
    gl_FragColor = vec4(color, 1.0);
}