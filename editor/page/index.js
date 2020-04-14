import { createUUID } from '@utils/utils'
import { cloneDeep } from "lodash";
// 页面配置信息字段
let pageConfig = {
	name: '',
	elements: [],
	commonStyle: {
		backgroundColor: '',
		backgroundImage: '',
		backgroundSize: 'cover'
	},
	config: {}
}

let getPageConfig = function () {
	return {
		uuid: createUUID(),
		...cloneDeep(pageConfig)
	}
}
let copyPage = function(data){
	let pageData = cloneDeep(data);
	pageData.uuid = createUUID();
	pageData.elements = pageData.elements.map(element => {
		return copyElement(element)
	})
	return pageData;
}

export default {
	pageConfig,
	getPageConfig,
	copyPage,
}
