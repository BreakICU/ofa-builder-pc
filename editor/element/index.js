import { createUUID, deepClone } from '@utils/utils'
import { cloneDeep, merge } from "lodash";
import $config from '@src/config'
// 元素配置信息字段
let elementConfig = {
	elName: '', // 组件名
	animations: [], // 动画
	commonStyle: {
		position: 'absolute',
		width: $config.canvasH5Width,
		height: 30,
		top: 200,
		left: 0,
		rotate: 0,
		paddingTop: 0,
		paddingLeft: 0,
		paddingRight: 0,
		paddingBottom: 0,
		marginTop: 0,
		marginLeft: 0,
		marginRight: 0,
		marginBottom: 0,
		borderWidth: 0,
		borderColor: '',
		borderStyle: 'solid',
		borderRadius: 0,
		boxShadow: '',
		fontSize: 16,
		fontWeight: 500,
		lineHeight: 1.4,
		letterSpacing: 0,
		textAlign: 'center',
		color: '#000000',
		backgroundColor: '',
		backgroundImage: '',
		backgroundSize: 'cover',
		opacity: 1,
		zIndex: 1
	}, // 公共样式
	events: [], // 事件
	propsValue: {}, // 属性参数
	value: '', // 绑定值
	valueType: 'String' // 值类型
}
let createElement = function (element, extendStyle = {}) {
	let elementData = cloneDeep(element)
	let type = elementData.valueType || 'String' // 默认string类型
	let dict = {
		'Sting': '',
		'Array': [],
		'Object': {},
		'Boolean': false,
		'Number': 0
		// 待扩展数据类型
	}
	let elementConfigData = cloneDeep(elementConfig)
	let config = {
		uuid: createUUID(),
		...elementConfigData,
		elName: elementData.elName,
		propsValue: deepClone(elementData.needProps || {})
	}
	// 样式
	config.commonStyle = merge(config.commonStyle, elementData.defaultStyle)
	config.commonStyle = merge(config.commonStyle, extendStyle)

	config.value = element.defaultValue || dict[type];
	config.valueType = type;
	config.isForm = !!element.isForm;
	return config;
}
let copyElement = function(element, extendStyle = {}){
	element = cloneDeep(element)
	element.uuid = createUUID();
	element.commonStyle = merge(element.commonStyle, extendStyle)
	// 加上一点偏移量，以作区分
	element.commonStyle.top = element.commonStyle.top + 10
	element.commonStyle.left = element.commonStyle.left + 10
	return element
}

/**
 * 获取元素样式
 * @param styleObj
 * @param scalePoint 缩放比例
 */
let getCommonStyle = function (styleObj, scalingRatio = 1) {
	let needUnitStr = ['width', 'height','top', 'left', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom', 'borderWidth','fontSize', 'borderRadius', 'letterSpacing']
	let style ={}

	for (let key in styleObj){
		if(needUnitStr.includes(key)){
			style[key] = (styleObj[key] * scalingRatio) + 'px'
		}else{
			style[key] = styleObj[key]
		}
	}
	style.transform = `rotate(${style.rotate}deg)`
	style.backgroundImage = style.backgroundImage ? `url(${style.backgroundImage})` : '';
	return style;
}


export default {
	elementConfig,
	createElement,
	copyElement,
	getCommonStyle
}
