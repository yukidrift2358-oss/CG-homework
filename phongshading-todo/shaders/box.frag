#version 300 es
precision mediump float;

out vec4 FragColor;

uniform float ambientStrength, specularStrength, diffuseStrength,shininess;
in vec3 Normal;//法向量
in vec3 FragPos;//相机观察的片元位置
in vec2 TexCoord;//纹理坐标
in vec4 FragPosLightSpace;//光源观察的片元位置

uniform vec3 viewPos;//相机位置
uniform vec4 u_lightPosition; //光源位置	
uniform vec3 lightColor;//入射光颜色

uniform sampler2D diffuseTexture;
uniform sampler2D depthTexture;
uniform samplerCube cubeSampler;//盒子纹理采样器


float shadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir)
{
    float shadow=0.0;
//非阴影
    /*TODO3: 添加阴影计算，返回1表示是阴影，返回0表示非阴影*/
    
// 1. 进行透视除法
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
// 2. 将 NDC 坐标从 [-1, 1] 映射到 [0, 1] 纹理坐标
    vec2 texCoord = projCoords.xy * 0.5 + 0.5;
// 3. 检查是否在光源视锥体之外 (可选)
    if (projCoords.z > 1.0) {
        return 0.0;
// 在视锥体外，非阴影
    }

    // 4. 采样 Shadow Map 中存储的最近深度
    float closestDepth = texture(depthTexture, texCoord).r;
// 5. 当前片段深度
    float currentDepth = projCoords.z;
// 6. 深度比较 (带偏置 bias)
    float bias = 0.005;
// 如果当前片段深度 > Shadow Map 中记录的深度，则在阴影中
    if (currentDepth - bias > closestDepth) {
        shadow = 1.0;
}

    return shadow;
   
}       

void main()
{
    
    //采样纹理颜色
    vec3 TextureColor = texture(diffuseTexture, TexCoord).xyz;
//计算光照颜色
 	vec3 norm = normalize(Normal);
	vec3 lightDir;
	if(u_lightPosition.w==1.0) 
        lightDir = normalize(u_lightPosition.xyz - FragPos);
else lightDir = normalize(u_lightPosition.xyz);
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 halfDir = normalize(viewDir + lightDir);
/*TODO2:根据phong shading方法计算ambient,diffuse,specular*/
    vec3  ambient,diffuse,specular;
  
    // A. 环境光 (Ambient)
    // Ambient = Ka * Ia
    ambient = ambientStrength * lightColor;
// B. 漫反射 (Diffuse)
    // Diffuse = Kd * Id * max(N·L, 0)
    float diffFactor = max(dot(norm, lightDir), 0.0);
diffuse = diffuseStrength * lightColor * diffFactor;

    // C. 镜面反射 (Specular) - 使用 Blinn-Phong 模型
    // Specular = Ks * Is * (N·H)^shininess
    float specFactor = pow(max(dot(norm, halfDir), 0.0), shininess);
specular = specularStrength * lightColor * specFactor;
  
  	vec3 lightReflectColor=(ambient +diffuse + specular);
//判定是否阴影，并对各种颜色进行混合
    float shadow = shadowCalculation(FragPosLightSpace, norm, lightDir);
	
    //vec3 resultColor =(ambient + (1.0-shadow) * (diffuse + specular))* TextureColor;
vec3 resultColor=(1.0-shadow/2.0)* lightReflectColor * TextureColor;
    
	// ****************************** 【修改开始】 ******************************
	// 设置透明度 (Alpha) 为 0.5
	FragColor = vec4(resultColor, 0.5f);
	// ****************************** 【修改结束】 ******************************
}