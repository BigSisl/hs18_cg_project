#define USE_MAP

uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform mat4 uLookAtMatrix;
uniform vec3 uMappingPos;
uniform float yRotation;
uniform float xzRotation;
uniform mat4 uLookAtMatrixYInv;

varying vec3 vtransformed;

void main() {
	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );

	#include <logdepthbuf_fragment>

	// calculate offset from lookAt rotation
	vec3 yNMappingPos = uMappingPos;
	vec3 yNTransformed = vec3(0.0,0.0,1.0);
	yNMappingPos.y = 0.0;
	yNTransformed.y = 0.0;
	float rad = acos(dot(normalize(yNTransformed), normalize(yNMappingPos)));
	float deg = degrees(rad);

	float xRot = mod(atan(uLookAtMatrix[2][3], uLookAtMatrix[3][3]), PI2);
	float yRot2 = mod(atan(-uLookAtMatrix[3][1], sqrt(exp2(uLookAtMatrix[3][2]) + exp2(uLookAtMatrix[3][3]))), PI2);
	float zRot = mod(atan(uLookAtMatrix[2][1], uLookAtMatrix[1][1]), PI2);

	float yOffset = yRotation == 0.0 ? 0.0 : PI / yRotation;

	float rotWeigth = 1.0 - abs(yRotation / PI2);

	vec2 offset = vec2(xzRotation / PI /* xzRotation / PI * rotWeigth */, yRotation / PI);
	float mapRot = xzRotation;
//	float mapRot = PI_HALF;

	// create rotation matrix
	mat3 rotMatrix = mat3(
		vec3(cos(mapRot), -sin(mapRot), 0.0),
		vec3(sin(mapRot), cos(mapRot), 0.0),
		vec3(0.0,0.0,1.0)
	);
	mat3 transCenter = mat3(
		vec3(1.0,0.0,-0.5),
		vec3(0.0,1.0,-0.5),
		vec3(0.0,0.0,1.0)
	);
	mat3 transCenterInv = mat3(
		vec3(1.0,0.0,0.5),
		vec3(0.0,1.0,0.5),
		vec3(0.0,0.0,1.0)
	);

	vec3 hUvO = vec3(offset + vUv, 1.0);
//	vec3 hUvO = transCenterInv * rotMatrix * transCenter * vec3(vUv, 1.0);
	vec2 vUvO = vec2(mod(hUvO.x / hUvO.z, 1.0), mod(hUvO.y / hUvO.z, 1.0));

	// create mirrored version, so it finishes on all sides
//	vUvO = abs(vUvO * 2.0 - 1.0);

	vec4 texelColor = texture2D( map, vUvO );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;

	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	// accumulation (baked indirect lighting only)
	#ifdef USE_LIGHTMAP
		reflectedLight.indirectDiffuse += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	// modulation
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <premultiplied_alpha_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}