import { cloneDeep, merge } from "lodash";
import $config from '@src/config'
import Page from '../page'
// 项目配置信息字段
let projectConfig = {
	name: '',
	title: '未命名场景',
	description: '我用夸克可视化编辑器做了一个超酷炫的H5，快来看看吧。',
	coverImage: '',
	auther: '',
	script: '',
	width: $config.canvasH5Width,
	height: $config.canvasH5Height,
	pages: []
}
let getProjectConfig = function () {
	let project = cloneDeep(projectConfig)
	let onePage = Page.getPageConfig()
	project.pages.push({
		...onePage
	})
	return { ...project }
}


export default {
	projectConfig,
	getProjectConfig,
}
