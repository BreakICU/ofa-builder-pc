<template>
    <div class = "page-editor editor-wrapper" v-loading = "loading">
        <!-- 左侧导栏 -->
       <div class="editor-side-bar border-R">
          <el-tabs tab-position="left" v-model="activeSideBar" style="height: 100%;">
            <template v-for="(item, index) in sidebarMenus">
              <el-tab-pane :name="item.value"  :key="index" v-if="!item.pageMode || (item.pageMode && item.pageMode === pageMode)">
                <el-tooltip slot="label" class="item" effect="dark" :content="item.label" placement="right">
                  <i :class="item.elementUiIcon"></i>
                </el-tooltip>
              </el-tab-pane>
            </template>
          </el-tabs>
        </div>
        <!--组件&页面&模板-->
        <div class="editor-page-edit-wrapper">
            <componentLibs v-if="activeSideBar === 'componentLibs'"/>
            <pageManage v-if="activeSideBar === 'pageManage'"/>
            <templateLibs v-if="activeSideBar === 'templateLibs'"/>
        </div>
        <!-- 页面编辑区域 -->
        <div class="editor-main">
          <div class="control-bar-wrapper">
            <controlBar
                :scale.sync="canvasConfig.scale"
                @import-psd-data="importPsdData"
                @showPreview="showPreviewFn"
                @cancel="cancelFn"
                @publish="publishFn"
                @save="saveFn"/>
          </div>
          <editorPan :scale.sync="canvasConfig.scale"/>
        </div>
        <!-- 属性编辑区域-->
        <div class="el-attr-edit-wrapper scrollbar-wrapper">
            <el-tabs v-model="activeAttr" stretch>
              <el-tab-pane label="属性" name="属性">
                <attrEdit></attrEdit>
              </el-tab-pane>
            </el-tabs>
        </div>
        <!--预览-->
    <previewPage
            v-if="showPreview"
            :pageData="projectData"
            :pageId="id"
            @closePreview="showPreview = false"
            @publishFn="publishFn"
            @saveFn="saveFn"></previewPage>
    </div>
</template>

<script>
import componentLibs from './components/left-menu/ComponentLibs'
import pageManage from './components/left-menu/PageManage'
import templateLibs from './components/left-menu/TemplateLibs'
import editorPan from './components/float-tools/EditorPan'
// // 属性编辑相关组件 
import attrEdit from './components/right-editor/AttrEdit'
import controlBar from './components/header-tools/ControlBar'

import previewPage from './preview'

import {mapState, mapGetters} from 'vuex'
import html2canvas from 'html2canvas'

export default {
    components: {
      componentLibs,
		  pageManage,
		  templateLibs,
		  editorPan,
		  attrEdit,
		  controlBar,
	  	previewPage
    },
    data(){
        return {
            id: '', // 当前页面id 
            uuid: '',
            loading: false,
            showPreview: false,
				    activeAttr: '属性',
            activeSideBar: 'componentLibs',
            sidebarMenus:[
               {
                   label: "组件列表",
                   value:'componentLibs',
                   elementUiIcon: 'el-icon-s-operation'

               },{
                   label: "页面管理",
                   value:'pageManage',
                   pageMode: 'h5',
                   elementUiIcon: 'el-icon-document'
               },{
                   label: "模板库",
                   value:'templateLibs',
                   elementUiIcon: 'el-icon-files'
               }
            ],
            canvasConfig: {
					    scale: 1
				    }
        }
    },
    computed: {
      ...mapState({
        projectData: state => state.editor.projectData,
        activePageUUID: state => state.editor.activePageUUID,
        activeElementUUID: state => state.editor.activeElementUUID
      }),
      ...mapGetters([
        'pageMode'
      ])
    },
    created() {
			this.$store.dispatch('setProjectData')
			this.id = this.$route.query.id;
			this.initPageData();
    },
    methods: {
			/**
			 * 初始化页面数据
			 */
			initPageData() {
				this.loading = true;
				this.$axios.get('/page/detail/' + this.id).then(res => {
					this.loading = false;
					this.$store.dispatch('setProjectData', {
						...res.body
					})
				}).catch(() => {
					this.loading = false;
				})
			},
			/**
			 * 保存
			 */
			async saveFn() {
				// await this.screenshots()
				// 提交数据再预览 
				this.$axios.post('/page/update/' + this.id, this.projectData).then(() => {
					this.$message.success('保存成功!')
					this.showPreview = false
				})
			},
			/**
			 * 保存
			 */
			async publishFn() {
				// await this.screenshots()
				// 提交数据再预览
				this.$axios.post('/page/publish/' + this.id, this.projectData).then(() => {
					this.$message.success('发布成功!')
					this.showPreview = false
					this.$router.push({path: 'page-list', query: {previewId: this.id}})
				})
			},
			async showPreviewFn() {
				// await this.screenshots()
				// 提交数据再预览
				this.$axios.post('/page/update/' + this.id, this.projectData).then(() => {
					this.showPreview = true
				})
			},
			/**
			 * 退出
			 */
			cancelFn() {
				this.$confirm('确认退出编辑?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
          this.$router.push('/page-list')
				}).catch(() => {})
			},
			/**
			 * 提供截屏作为项目主图
			 */
			screenshots() {
				const el = document.querySelector("#canvas-panel")
				return new Promise((resolve, reject) => {
					html2canvas(el, {proxy: `${this.$config.baseURL}/common/html2canvas/corsproxy`}).then(canvas => {
						const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
						const blob = this.$mUtils.dataURItoBlob(dataUrl)
						const file = new window.File([blob], +new Date() + '.png', {type: 'image/png'})
						let params = new FormData()
						params.append('file', file);
						this.$axios.post('/common/uploadFile', params).then(res => {
							// 替换主图链接
							this.projectData.coverImage = res.body;
							resolve(res.body)
						}).catch(err => {
							reject(err)
						})
					})
				})
			},
			/**
			 *
			 * @param dataList
			 */
			importPsdData(psdData) {
				let elementsList = psdData.elements
        let psdWidth = psdData.document.width;
				let scalingRatio = this.projectData.width / psdWidth
				elementsList.forEach(item => {
					let {width, height, top, left, imageSrc, opacity, zIndex} = item;
					setTimeout(() => {
						this.$store.dispatch('addElement', {
							elName: 'qk-image',
							defaultStyle: {
								width: width * scalingRatio,
								height: height * scalingRatio,
								top: top * scalingRatio,
								left: left * scalingRatio,
								zIndex: zIndex,
								opacity
							},
							needProps: {
								imageSrc: imageSrc
							}
						})
					}, 10)
				})
			}
		}
}
</script>

<style lang="scss" scoped>
  .editor-wrapper {
    display: flex;
    height: 100%;
    position: relative;
    .editor-side-bar {
      width: 55px;
    }
    .editor-page-edit-wrapper {
      width: 120px;
      padding: 0 1px;
    }
    .editor-main {
      flex: 1;
      background: #f0f2f5;
      position: relative;
    }
    .el-attr-edit-wrapper {
      width: 340px;
      padding: 0;
    }
  }

  .control-bar-wrapper {
    position: absolute;
    top: -44px;
    left: 0;
    width: 100%;
    text-align: center;
    z-index: 1000;
  }
</style>
<style lang="scss">
  .editor-side-bar {
    .el-tabs__item.is-active {
      background: #409EFF;
      color: white;
    }
  }
  .el-attr-edit-wrapper {
    .el-tabs {
      height: 100%;
      padding-left: 16px;
      padding-right: 16px;
      padding-bottom: 10px;
    }
    .el-tabs__content {
      height: calc(100% - 55px);
      & > div {
        height: 100%;
      }
      .attr-edit-inner {
        padding-left: 16px;
        padding-right: 16px;
      }
    }
  }
</style>