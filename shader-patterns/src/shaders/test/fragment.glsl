varying vec2 vUv;

void main()
{
    // Pattern 4
    // float strength = vUv.x;


    // Pattern 5
    // float strength = 1.0 - vUv.y;

    //Pattern 1
    // gl_FragColor = vec4(vUv, 1.0, 1.0);

    // Pattern 2
    // gl_FragColor = vec4(vUv, 0, 1.0);

    // Pattern 3
    // gl_FragColor = vec4(vUv.x, vUv.x, vUv.x, 1.0);

    // Pattern white black gradient
    // gl_FragColor = vec4(vec3(strength), 1.0);
}