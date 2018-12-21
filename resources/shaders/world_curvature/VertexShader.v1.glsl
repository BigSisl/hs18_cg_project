#define USE_MAP

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform vec3 uMappingPos;
uniform mat4 uLookAtMatrix;
uniform float uCurvature;

varying vec3 vtransformed;

void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <skinbase_vertex>
	#ifdef USE_ENVMAP
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>

	//transform sphere to always look into camera direction
	vtransformed = transformed;

	//transformed = vec3 ( 0, transformed.y, transformed.z );
	vec3 mappingPos = normalize(uMappingPos) * length(transformed);
	vec3 nTransformed = normalize(transformed);
	vec3 nMappingPos = normalize(mappingPos);
	vec3 nPlaneMappingPos = normalize(vec3(0.0,0.0,0.0) - mappingPos);
	float rad = acos(dot(nMappingPos, nTransformed));
	float deg = degrees(rad);

	float sphereViewable = 10.0 * (1.0 - uCurvature);
	if(deg < 80.0 + sphereViewable || deg > 280.0 - sphereViewable) {
		float t = (dot(nPlaneMappingPos, mappingPos) - dot(nPlaneMappingPos, transformed)) / dot(nPlaneMappingPos, nTransformed);
		transformed += nTransformed * t * uCurvature;
	}

	vec4 mvPosition = modelViewMatrix * uLookAtMatrix * vec4( transformed, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}